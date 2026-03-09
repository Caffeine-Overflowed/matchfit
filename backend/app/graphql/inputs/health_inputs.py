import strawberry


@strawberry.input(description="Параметры для эхо-запроса")
class EchoInput:
    message: str = strawberry.field(description="Сообщение для эхо")
