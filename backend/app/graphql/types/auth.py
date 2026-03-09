import strawberry

from app.graphql.types.user import UserType

@strawberry.type(description="Результат токенов")
class TokensType:
    access_token: str = strawberry.field(description="Новый JWT access token")
    refresh_token: str = strawberry.field(description="Новый refresh token")
    access_token_expire: int = strawberry.field(description="время в unix истекания")
    refresh_token_expire: int = strawberry.field(description="время в unix истекания")

@strawberry.type(description="Результат аутентификации")
class AuthResult:
    tokens: TokensType = strawberry.field(description="токены")
    user: UserType = strawberry.field(description="Данные пользователя")




@strawberry.type(description="URL для авторизации через Google")
class GoogleAuthUrlResult:
    url: str = strawberry.field(description="URL для редиректа на Google OAuth")
    state: str = strawberry.field(description="State для верификации (сохранить для callback)")
