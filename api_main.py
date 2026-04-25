from __future__ import annotations

import asyncio
import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from starlette.responses import StreamingResponse


app = FastAPI(title="Interaction Metrics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class InteractionFeedback(BaseModel):
    channel: str = Field(..., examples=["whatsapp", "web", "slack"])
    resolved: bool
    response_time_seconds: float = Field(..., ge=0)
    customer_sentiment: float = Field(..., ge=0, le=1)
    csat_score: float = Field(..., ge=0, le=5)
    escalated: bool = False
    conversation_turns: int = Field(..., ge=1)
    metadata: dict[str, Any] = Field(default_factory=dict)


@dataclass
class InMemoryStore:
    interactions: list[InteractionFeedback] = field(default_factory=list)
    subscribers: list[asyncio.Queue[str]] = field(default_factory=list)

    def metrics(self) -> dict[str, Any]:
        total = len(self.interactions)
        if total == 0:
            return {
                "total_interactions": 0,
                "resolution_rate": 0.0,
                "avg_response_time_seconds": 0.0,
                "avg_sentiment": 0.0,
                "avg_csat": 0.0,
                "escalation_rate": 0.0,
                "avg_conversation_turns": 0.0,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }

        resolved = sum(1 for i in self.interactions if i.resolved)
        escalated = sum(1 for i in self.interactions if i.escalated)

        return {
            "total_interactions": total,
            "resolution_rate": resolved / total,
            "avg_response_time_seconds": sum(i.response_time_seconds for i in self.interactions) / total,
            "avg_sentiment": sum(i.customer_sentiment for i in self.interactions) / total,
            "avg_csat": sum(i.csat_score for i in self.interactions) / total,
            "escalation_rate": escalated / total,
            "avg_conversation_turns": sum(i.conversation_turns for i in self.interactions) / total,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }


store = InMemoryStore()


def _sse_event(event: str, payload: dict[str, Any]) -> str:
    return f"event: {event}\ndata: {json.dumps(payload)}\n\n"


async def _broadcast_metrics() -> None:
    message = _sse_event("metrics", store.metrics())
    dead: list[asyncio.Queue[str]] = []
    for queue in store.subscribers:
        try:
            queue.put_nowait(message)
        except asyncio.QueueFull:
            dead.append(queue)
    for queue in dead:
        store.subscribers.remove(queue)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/metrics")
def get_metrics() -> dict[str, Any]:
    return store.metrics()


@app.post("/interactions/feedback")
async def receive_feedback(payload: InteractionFeedback) -> dict[str, Any]:
    store.interactions.append(payload)
    await _broadcast_metrics()
    return {"ok": True, "metrics": store.metrics()}


@app.get("/events")
async def events() -> StreamingResponse:
    queue: asyncio.Queue[str] = asyncio.Queue(maxsize=100)
    store.subscribers.append(queue)

    async def stream():
        try:
            yield _sse_event("connected", {"ok": True})
            yield _sse_event("metrics", store.metrics())
            while True:
                message = await queue.get()
                yield message
        finally:
            if queue in store.subscribers:
                store.subscribers.remove(queue)

    return StreamingResponse(stream(), media_type="text/event-stream")
