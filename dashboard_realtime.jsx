import React, { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

const initialFeedback = {
  channel: "web",
  resolved: true,
  response_time_seconds: 45,
  customer_sentiment: 0.8,
  csat_score: 4.2,
  escalated: false,
  conversation_turns: 7,
  metadata: {},
};

const agentCards = [
  {
    icon: "⚡",
    name: "GPT-4o",
    tags: ["GPT", "producción"],
    accent: "#34d399",
  },
  {
    icon: "💎",
    name: "Gemini 2.5",
    tags: ["Gema", "investigación"],
    accent: "#60a5fa",
  },
  {
    icon: "🔐",
    name: "Mixtral 8x22",
    tags: ["Open Source", "local"],
    accent: "#fb923c",
  },
  {
    icon: "🤖",
    name: "Hermes 3",
    tags: ["Open Source", "fine-tuned"],
    accent: "#f472b6",
  },
];

const scoreWeights = [
  ["CSAT", "30%", "Satisfacción directa del cliente (0–100%)", "#5eead4"],
  ["Precisión", "25%", "Calidad del output del agente (0–100%)", "#93c5fd"],
  ["Velocidad", "15%", "UX y costo operacional — ms promedio", "#fde047"],
  ["Completitud", "15%", "% de tareas resueltas sin abandono", "#f9a8d4"],
  ["Anti-Alucinación", "10%", "% sin alucinaciones", "#fb923c"],
  ["No-Escalación", "5%", "% sin escalar a humano", "#a78bfa"],
];

const formatPct = (value) => `${Math.round(value * 100)}%`;

function AgentCard({ icon, name, tags, accent, flash }) {
  return (
    <article className={`agent-card ${flash ? "flash" : ""}`}>
      <div className="agent-head">
        <span className="agent-icon">{icon}</span>
        <div>
          <h3>{name}</h3>
          <div className="chip-row">
            {tags.map((tag) => (
              <span key={tag} className="chip" style={{ borderColor: `${accent}40`, color: accent }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="agent-empty">Sin evaluación</div>
      <button className="evaluate-btn" type="button">
        📊 Evaluar
      </button>
    </article>
  );
}

export default function DashboardRealtime() {
  const [metrics, setMetrics] = useState(null);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/metrics`)
      .then((r) => r.json())
      .then(setMetrics)
      .catch(console.error);

    const source = new EventSource(`${API_BASE}/events`);
    source.addEventListener("metrics", (event) => {
      const next = JSON.parse(event.data);
      setMetrics(next);
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
    });

    return () => source.close();
  }, []);

  const counters = useMemo(() => {
    const total = metrics?.total_interactions ?? 0;
    const evaluated = Math.max(0, Math.round(total * (metrics?.resolution_rate ?? 0)));

    return {
      agents: agentCards.length,
      evaluated,
      resolution: formatPct(metrics?.resolution_rate ?? 0),
      escalated: formatPct(metrics?.escalation_rate ?? 0),
    };
  }, [metrics]);

  const submitFeedback = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE}/interactions/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedback),
    });
  };

  return (
    <main className="dashboard-root">
      <header className="hero">
        <div>
          <p className="eyebrow">ENTERPRISE AI EVAL • 2025–2026</p>
          <h1>Agent Performance Dashboard</h1>

          <div className="tabs">
            <button className="tab active" type="button">
              📄 Agentes
            </button>
            <button className="tab" type="button">
              📈 Comparativa
            </button>
            <button className="tab" type="button">
              🚀 Deploy
            </button>
          </div>
        </div>

        <div className="stat-group">
          <div className="stat-box">
            <strong>{counters.agents}</strong>
            <span>agentes</span>
          </div>
          <div className="stat-box">
            <strong>{counters.evaluated}</strong>
            <span>evaluados</span>
          </div>
          <button className="add-agent" type="button">
            + Agente
          </button>
        </div>
      </header>

      <section className="filters">
        <button className="filter active" type="button">
          Todos ({agentCards.length})
        </button>
        <button className="filter" type="button">
          ⚡ GPT (1)
        </button>
        <button className="filter" type="button">
          💎 Gema (1)
        </button>
        <button className="filter" type="button">
          🔐 Open Source (2)
        </button>
      </section>

      <section className="agent-grid">
        {agentCards.map((card) => (
          <AgentCard key={card.name} {...card} flash={flash} />
        ))}
      </section>

      <section className="weights-box">
        <h2>PESOS DEL SCORE PONDERADO — ENTERPRISE 2025–2026</h2>
        <div className="weights-grid">
          {scoreWeights.map(([title, weight, desc, color]) => (
            <article key={title} className="weight-item" style={{ borderLeftColor: color }}>
              <h4>
                {title} <span>{weight}</span>
              </h4>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tester-box">
        <h3>🧪 API Tester (real-time)</h3>
        <form className="tester-grid" onSubmit={submitFeedback}>
          <label>
            Canal
            <select
              value={feedback.channel}
              onChange={(e) => setFeedback({ ...feedback, channel: e.target.value })}
            >
              <option value="web">web</option>
              <option value="whatsapp">whatsapp</option>
              <option value="slack">slack</option>
            </select>
          </label>

          <label>
            Resuelto
            <input
              type="checkbox"
              checked={feedback.resolved}
              onChange={(e) => setFeedback({ ...feedback, resolved: e.target.checked })}
            />
          </label>

          <label>
            Tiempo respuesta (s)
            <input
              type="number"
              min="0"
              value={feedback.response_time_seconds}
              onChange={(e) =>
                setFeedback({ ...feedback, response_time_seconds: Number(e.target.value) })
              }
            />
          </label>

          <label>
            Sentimiento (0-1)
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={feedback.customer_sentiment}
              onChange={(e) =>
                setFeedback({ ...feedback, customer_sentiment: Number(e.target.value) })
              }
            />
          </label>

          <label>
            CSAT (0-5)
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={feedback.csat_score}
              onChange={(e) => setFeedback({ ...feedback, csat_score: Number(e.target.value) })}
            />
          </label>

          <label>
            Escalado
            <input
              type="checkbox"
              checked={feedback.escalated}
              onChange={(e) => setFeedback({ ...feedback, escalated: e.target.checked })}
            />
          </label>

          <label>
            Turnos conversación
            <input
              type="number"
              min="1"
              value={feedback.conversation_turns}
              onChange={(e) =>
                setFeedback({ ...feedback, conversation_turns: Number(e.target.value) })
              }
            />
          </label>

          <button type="submit">Enviar feedback</button>
        </form>
      </section>

      <style>{`
        .dashboard-root {
          min-height: 100vh;
          padding: 28px;
          color: #dbeafe;
          background: radial-gradient(circle at 15% -10%, #132446 0%, #020b27 45%, #01061c 100%);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        }
        .hero {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
          border-bottom: 1px solid #1e3057;
          padding-bottom: 18px;
        }
        .eyebrow {
          margin: 0;
          letter-spacing: 0.35em;
          font-size: 11px;
          color: #67e8f9;
        }
        h1 {
          margin: 10px 0 16px;
          font-size: clamp(28px, 3.2vw, 40px);
          color: #9ee8ff;
        }
        .tabs, .filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .tab, .filter {
          border: 1px solid #2a406d;
          color: #a9c5ff;
          background: #0a1a3d;
          border-radius: 12px;
          padding: 9px 14px;
          font-weight: 600;
        }
        .tab.active, .filter.active {
          background: linear-gradient(120deg, #0f264e, #1f3f76);
          color: white;
          border-color: #3e66a8;
        }
        .stat-group {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .stat-box {
          min-width: 84px;
          text-align: center;
          border: 1px solid #20365f;
          border-radius: 14px;
          padding: 10px 12px;
          background: #0b1735;
        }
        .stat-box strong {
          display: block;
          color: #5eead4;
          font-size: 24px;
        }
        .stat-box span {
          font-size: 12px;
          color: #84a8db;
        }
        .add-agent {
          border: 0;
          border-radius: 14px;
          padding: 12px 18px;
          color: #06203f;
          font-weight: 800;
          background: linear-gradient(120deg, #5eead4, #60a5fa);
        }
        .filters {
          margin: 18px 0;
        }
        .agent-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
        }
        .agent-card {
          border: 1px solid #213a63;
          border-radius: 18px;
          background: linear-gradient(140deg, #101f43, #0a1734);
          padding: 18px;
          transition: border-color 220ms ease, box-shadow 220ms ease;
        }
        .agent-card.flash {
          border-color: #34d399;
          box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.35);
        }
        .agent-head {
          display: flex;
          gap: 12px;
        }
        .agent-icon {
          font-size: 28px;
          line-height: 1;
        }
        .agent-card h3 {
          margin: 0;
          color: white;
        }
        .chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }
        .chip {
          border: 1px solid #35507f;
          border-radius: 999px;
          padding: 3px 8px;
          font-size: 12px;
          background: #11254d;
        }
        .agent-empty {
          margin: 16px 0 14px;
          border-radius: 10px;
          background: #1a2b4d;
          color: #6f8dbd;
          text-align: center;
          padding: 14px;
          font-weight: 600;
        }
        .evaluate-btn {
          width: 100%;
          border-radius: 10px;
          border: 1px solid #2c4f86;
          color: #6cf3d7;
          background: linear-gradient(120deg, #163653, #173669);
          padding: 10px 12px;
          font-size: 20px;
          font-weight: 700;
        }
        .weights-box,
        .tester-box {
          margin-top: 24px;
          border: 1px solid #1e3159;
          border-radius: 16px;
          background: #0b1634;
          padding: 20px;
        }
        .weights-box h2 {
          margin: 0 0 16px;
          font-size: 20px;
          letter-spacing: 0.08em;
          color: #9fb8e9;
        }
        .weights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }
        .weight-item {
          border-left: 3px solid #67e8f9;
          padding-left: 12px;
        }
        .weight-item h4 {
          margin: 0 0 5px;
          color: #ecfeff;
        }
        .weight-item h4 span {
          color: #67e8f9;
          font-size: 14px;
          margin-left: 4px;
        }
        .weight-item p {
          margin: 0;
          color: #8caad7;
          font-size: 14px;
        }
        .tester-box h3 {
          margin-top: 0;
        }
        .tester-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
        }
        .tester-grid label {
          display: grid;
          gap: 5px;
          color: #a7c3ee;
          font-weight: 600;
          font-size: 14px;
        }
        .tester-grid input,
        .tester-grid select,
        .tester-grid button {
          border: 1px solid #314f82;
          border-radius: 9px;
          padding: 9px;
          color: #dbeafe;
          background: #12244b;
        }
        .tester-grid button {
          font-weight: 700;
          cursor: pointer;
          background: linear-gradient(120deg, #0f3f5b, #174880);
        }
      `}</style>
    </main>
  );
}
