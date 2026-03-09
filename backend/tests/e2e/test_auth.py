
import pytest
from httpx import AsyncClient
from sqlalchemy import text

@pytest.mark.asyncio
async def test_auth_flow(client: AsyncClient, db_session):
    # 1. Register a new user
    register_mut = """
    mutation Register($data: RegisterInput!) {
        register(data: $data) {
            user {
                id
                email
            }
            tokens {
                accessToken
                refreshToken
                accessTokenExpire
                refreshTokenExpire
            }
        }
    }
    """
    
    email = "test_auth_user@example.com"
    password = "StrongPassword123!"
    
    register_vars = {
        "data": {
            "email": email,
            "password": password
        }
    }
    
    resp = await client.post("/graphql", json={"query": register_mut, "variables": register_vars})
    assert resp.status_code == 200
    data = resp.json()
    assert "errors" not in data, data["errors"]
    
    user_data = data["data"]["register"]["user"]
    tokens = data["data"]["register"]["tokens"]
    
    assert user_data["email"] == email
    assert user_data["id"] is not None
    assert tokens["accessToken"] is not None
    assert tokens["refreshToken"] is not None
    
    user_id = user_data["id"]

    # 2. Login with the same credentials
    login_mut = """
    mutation Login($data: LoginInput!) {
        login(data: $data) {
            user {
                id
                email
            }
            tokens {
                accessToken
                refreshToken
            }
        }
    }
    """
    
    login_vars = {
        "data": {
            "email": email,
            "password": password
        }
    }
    
    resp = await client.post("/graphql", json={"query": login_mut, "variables": login_vars})
    assert resp.status_code == 200
    data = resp.json()
    assert "errors" not in data, data["errors"]
    
    login_user = data["data"]["login"]["user"]
    login_tokens = data["data"]["login"]["tokens"]
    
    assert login_user["id"] == user_id
    assert login_user["email"] == email
    assert login_tokens["accessToken"] is not None
    
    # 3. Verify duplicate registration fails
    resp = await client.post("/graphql", json={"query": register_mut, "variables": register_vars})
    data = resp.json()
    assert "errors" in data
    # Exact error message might vary, but should contain something about already existing
    # Checking for typically expected behavior
    
    # Cleanup
    try:
        await db_session.execute(text("DELETE FROM users WHERE id = :id"), {"id": user_id})
        await db_session.commit()
    except Exception as e:
        print(f"Cleanup failed (might be ok if user wasn't created): {e}")
