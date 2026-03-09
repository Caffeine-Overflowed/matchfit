# app/bff/graphql/extensions/mask_errors.py
from __future__ import annotations

from typing import List

from graphql import GraphQLError
from strawberry.extensions import SchemaExtension

from app.extensions.errors.base import BaseDomainError
from app.extensions.errors.common import InternalServerError
from app.utils.observability import get_logger

log = get_logger()


class ErrorMaskExtension(SchemaExtension):
    """
    Нормализует ошибки:
      - message: строковый код (enum.value)
      - НИКАКИХ extensions/meta
      - data не трогаем
    """

    def on_request_end(self):
        result = self.execution_context.result
        if not result or not result.errors:
            return

        processed: List[GraphQLError] = []

        for err in result.errors:
            orig = err.original_error

            # 1) парсинг/схема (нет path) -> BAD_REQUEST
            if isinstance(err, GraphQLError) and orig is None and err.path is None:
                processed.append(err)

                continue

            if orig is None:
                processed.append(GraphQLError(message=InternalServerError.CODE, path=err.path))
                continue

            # 3) наши исключения через реестр
            if isinstance(orig, BaseDomainError):
                log.warning(
                    "gql.error",
                    code=orig.CODE,
                    path=err.path,
                )
                processed.append(GraphQLError(message=orig.CODE, path=err.path))
            else:
                log.error("gql.mask.mapper_failed", path=err.path, exc_info=orig)
                processed.append(GraphQLError(message=InternalServerError.CODE, path=err.path))

        result.errors = processed
