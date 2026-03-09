from __future__ import annotations

import strawberry

from app.graphql.types.profile import ProfileType


@strawberry.type(description="Match")
class UnstartedMatchType:
    matcher_profile: ProfileType = strawberry.field(description="профиль пользователя, с которым произошел match")
    chat_id: str = strawberry.field(description="айди чата")
