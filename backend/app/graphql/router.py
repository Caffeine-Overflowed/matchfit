from typing import Optional

from strawberry.fastapi import GraphQLRouter
from strawberry.types.unset import UnsetType, UNSET

from app.graphql.context.context import GQLContext
from app.utils.auth import extract_bearer, verify_access_token
from app.utils.observability import get_logger

log = get_logger()


class AuthGraphQLRouter(GraphQLRouter):
    async def on_ws_connect(
        self, context: GQLContext
    ) -> UnsetType | None | dict[str, object]:
        token = _token_from_connection_params(context.connection_params)
        if not token:
            log.debug("ws.auth.token.missing")
            return UNSET

        auth_context = verify_access_token(token)
        if auth_context:
            context.auth_context = auth_context
            log.info(
                "ws.auth.token.verified",
                user_id=auth_context.user_id,
                session_id=auth_context.session_id,
            )
        else:
            log.warning("ws.auth.token.verify_failed")

        return UNSET


def _token_from_connection_params(params: object) -> Optional[str]:
    if not isinstance(params, dict):
        return None
    value = params.get("Authorization") or params.get("authorization")
    return extract_bearer(value)
