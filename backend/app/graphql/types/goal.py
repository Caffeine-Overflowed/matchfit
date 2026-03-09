import strawberry
from typing import Optional

@strawberry.type(description="Цель пользователя")
class GoalType:
    id: int
    name: str
    icon_url: str
    description: Optional[str] = None

