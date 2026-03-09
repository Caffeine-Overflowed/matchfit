# app/core/observability/trace_time.py
import time
from contextlib import asynccontextmanager, contextmanager

import structlog

log = structlog.get_logger()


@contextmanager
def trace_block(name: str, **kwargs):
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = (time.perf_counter() - start) * 1000
        log.info("trace.block", block=name, elapsed_ms=round(elapsed, 2), **kwargs)


@asynccontextmanager
async def trace_block_async(name: str, **kwargs):
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = (time.perf_counter() - start) * 1000
        log.info("trace.block", block=name, elapsed_ms=round(elapsed, 2), **kwargs)
