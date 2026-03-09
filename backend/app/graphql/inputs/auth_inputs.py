import strawberry


@strawberry.input(description="Данные для регистрации")
class RegisterInput:
    email: str = strawberry.field(description="Email пользователя")
    password: str = strawberry.field(description="Пароль (минимум 8 символов)")


@strawberry.input(description="Данные для входа")
class LoginInput:
    email: str = strawberry.field(description="Email пользователя")
    password: str = strawberry.field(description="Пароль")


@strawberry.input(description="Данные для обновления токенов")
class RefreshInput:
    refresh_token: str = strawberry.field(description="Refresh token")


@strawberry.input(description="Данные для Google OAuth")
class GoogleAuthInput:
    code: str = strawberry.field(description="Authorization code от Google")
    state: str = strawberry.field(description="State для верификации")
