import strawberry
from strawberry.types import Info

from app.graphql.context.context import GQLContext
from app.graphql.inputs.auth_inputs import (
    GoogleAuthInput,
    LoginInput,
    RefreshInput,
    RegisterInput,
)
from app.graphql.types.auth import AuthResult, GoogleAuthUrlResult, TokensType
from app.graphql.types.user import UserType
from app.services.auth_service import AuthService
from app.services.google_auth_service import GoogleAuthService
from app.utils.database import Database


@strawberry.type
class AuthMutations:
    @strawberry.mutation(description="Регистрация нового пользователя")
    async def register(self, info: Info[GQLContext, None], data: RegisterInput) -> AuthResult:
        async with Database.get_session() as session:
            user, access_token, refresh_token, access_expire, refresh_expire = await AuthService.register(
                session, data.email, data.password
            )
            return AuthResult(
                tokens=TokensType(
                    access_token=access_token,
                    refresh_token=refresh_token,
                    access_token_expire=access_expire,
                    refresh_token_expire=refresh_expire,
                ),
                user=UserType.from_model(user),
            )

    @strawberry.mutation(description="Вход в систему")
    async def login(self, info: Info[GQLContext, None], data: LoginInput) -> AuthResult:
        async with Database.get_session() as session:
            user, access_token, refresh_token, access_expire, refresh_expire = await AuthService.login(
                session, data.email, data.password
            )
            return AuthResult(
                user=UserType.from_model(user),
                tokens=TokensType(
                    access_token=access_token,
                    refresh_token=refresh_token,
                    access_token_expire=access_expire,
                    refresh_token_expire=refresh_expire,
                ),
            )

    @strawberry.mutation(description="Обновление токенов")
    async def refresh_tokens(self, data: RefreshInput) -> TokensType:
        access_token, refresh_token, access_expire, refresh_expire = await AuthService.refresh_tokens(
            data.refresh_token
        )
        return TokensType(
            access_token=access_token,
            refresh_token=refresh_token,
            access_token_expire=access_expire,
            refresh_token_expire=refresh_expire,
        )

    @strawberry.mutation(description="Получить URL для авторизации через Google")
    async def google_auth_url(self) -> GoogleAuthUrlResult:
        url, state = await GoogleAuthService.get_auth_url()
        return GoogleAuthUrlResult(url=url, state=state)

    @strawberry.mutation(description="Авторизация через Google")
    async def auth_google(self, info: Info[GQLContext, None], data: GoogleAuthInput) -> AuthResult:
        async with Database.get_session() as session:
            user, access_token, refresh_token, access_token_expire, refresh_token_expire = await GoogleAuthService.authenticate(
                session, data.code, data.state
            )
            return AuthResult(
                user=UserType.from_model(user),
                tokens=TokensType(
                    access_token=access_token,
                    refresh_token=refresh_token,
                    access_token_expire=access_token_expire,
                    refresh_token_expire=refresh_token_expire,
                )
            )
