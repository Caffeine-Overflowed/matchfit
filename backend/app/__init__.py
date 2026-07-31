from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from .config import Config
from .graphql.context.context_getter import get_context
from .graphql.router import AuthGraphQLRouter
from .graphql.middlewares.auth_context import AuthContextMiddleware
from .graphql.middlewares.request_id import RequestIdMiddleware
from .graphql.middlewares.user_info import UserInfoMiddleware
from .graphql.schema import schema
from .utils.lifespan import lifespan
from .utils.observability import setup_logging
from .utils.observability.ulog import set_app_identity

setup_logging(Config.app.log_level, dev_pretty_errors=Config.app.IS_DEV)
set_app_identity(name="bff")

app = FastAPI(lifespan=lifespan)

cors_origins = Config.cors.origins_list
app.add_middleware(
    CORSMiddleware,  # type: ignore
    allow_origins=cors_origins,
    # Авторизация через Bearer-заголовок, cookies не используются — при любом
    # wildcard credentials запрещены (иначе Starlette отражает любой Origin)
    allow_credentials="*" not in cors_origins,
    allow_methods=["POST"],
    allow_headers=["*", "Apollo-Require-Preflight", "x-apollo-operation-name"],
)

app.add_middleware(RequestIdMiddleware)
app.add_middleware(AuthContextMiddleware)
app.add_middleware(UserInfoMiddleware)

graphql_app = AuthGraphQLRouter(
    schema=schema,
    context_getter=get_context,
    multipart_uploads_enabled=True,
    graphql_ide="graphiql" if Config.app.IS_DEV else None,
)

app.include_router(graphql_app, prefix="/graphql")
