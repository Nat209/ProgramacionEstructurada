# Integración API + Dashboard en tiempo real

## Flujo

1. Tu agente completa una conversación con cliente.
2. Tu backend/agente hace `POST /interactions/feedback`.
3. La API recalcula métricas globales.
4. La API emite evento SSE en `/events`.
5. El dashboard React recibe el evento y se actualiza sin recargar.

## Backend (FastAPI)

```bash
pip install -r requirements.txt
uvicorn api_main:app --reload --port 8000
```

Endpoints:

- `GET /health`
- `GET /metrics`
- `POST /interactions/feedback`
- `GET /events` (Server-Sent Events)

## Snippet Python

```python
import requests

payload = {
  "channel": "whatsapp",
  "resolved": True,
  "response_time_seconds": 38,
  "customer_sentiment": 0.87,
  "csat_score": 4.6,
  "escalated": False,
  "conversation_turns": 6,
  "metadata": {"agent": "v1"}
}

requests.post("https://TU_API/interactions/feedback", json=payload, timeout=10)
```

## Snippet Node.js

```js
await fetch("https://TU_API/interactions/feedback", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    channel: "web",
    resolved: true,
    response_time_seconds: 25,
    customer_sentiment: 0.92,
    csat_score: 4.8,
    escalated: false,
    conversation_turns: 5,
    metadata: { source: "support-bot" }
  }),
});
```

## Snippet WhatsApp webhook

```python
# cuando finalice la conversación:
requests.post(API + "/interactions/feedback", json={
    "channel": "whatsapp",
    "resolved": final_state.resolved,
    "response_time_seconds": final_state.first_response_seconds,
    "customer_sentiment": final_state.sentiment,
    "csat_score": final_state.csat,
    "escalated": final_state.escalated,
    "conversation_turns": final_state.turns,
    "metadata": {"contact_id": contact_id},
})
```

## Frontend

Usa el componente `dashboard_realtime.jsx` en tu app Vite/React y define:

```bash
VITE_API_BASE=https://TU_API
```

## Railway

Sube este repo a GitHub y crea servicio en Railway.
`railway.toml` levanta automáticamente la API.
