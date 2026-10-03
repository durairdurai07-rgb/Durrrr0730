import time
from collections import defaultdict, deque
from fastapi import HTTPException, Request

_hits: dict[str, deque] = defaultdict(deque)


def limit(name: str, max_calls: int, per_seconds: int):
    """Per-IP sliding window. In-memory: fine for one process; use Redis behind several workers."""
    def dep(request: Request):
        key = f"{name}:{request.client.host if request.client else 'unknown'}"
        now, q = time.monotonic(), _hits[key]
        while q and now - q[0] > per_seconds:
            q.popleft()
        if len(q) >= max_calls:
            raise HTTPException(429, "Too many attempts. Please wait a few minutes and try again.")
        q.append(now)
    return dep


def reset_limits():
    _hits.clear()
