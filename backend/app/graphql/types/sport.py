import strawberry


@strawberry.type(description="Вид спорта")
class SportType:
    id: int
    name: str
    icon_url: str