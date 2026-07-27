// Live-Dashboard der KI-Agenten-Agentur swissROI.
// Liest bei jedem Aufruf direkt aus der Datenbank — kein Token-Verbrauch.
// Zugriff nur mit ?key=<dashboard_key aus der settings-Tabelle>.
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const AGENT_COLORS: Record<string, string> = {
  manager: "#c8281e",
  "seo-agent": "#1f5f96",
  "content-agent": "#b0691c",
  "strategie-agent": "#6b4fa1",
  "daten-agent": "#2f7d4f",
};

// Ausgabe ist XHTML (siehe unten) — esc muss darum auch XML-unzulässige Steuerzeichen entfernen.
const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleString("de-CH", { timeZone: "Europe/Zurich", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

const fmtTokens = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} Mio.` : n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const { data: keyRow } = await supabase.from("settings").select("value").eq("key", "dashboard_key").maybeSingle();
  if (!keyRow || url.searchParams.get("key") !== keyRow.value) {
    return new Response("Zugriff verweigert — gültiger ?key= nötig.", { status: 401 });
  }

  const [goals, tasks, runs, decisions, content, keywords, heartbeats] = await Promise.all([
    supabase.from("goals").select("*").order("priority").order("created_at"),
    supabase.from("tasks").select("*").order("created_at"),
    supabase.from("agent_runs").select("*").order("started_at", { ascending: false }).limit(15),
    supabase.from("decisions").select("*").eq("status", "offen").order("created_at"),
    supabase.from("content_items").select("id,type,title,status,channel,created_at").order("created_at", { ascending: false }).limit(10),
    supabase.from("seo_keywords").select("keyword,database,volume,difficulty,collected_at").order("collected_at", { ascending: false }).limit(15),
    supabase.from("heartbeat_reports").select("*").order("report_date", { ascending: false }).limit(7),
  ]);

  const g = goals.data ?? [], t = tasks.data ?? [], r = runs.data ?? [];
  const d = decisions.data ?? [], c = content.data ?? [], k = keywords.data ?? [], h = heartbeats.data ?? [];

  const tokIn = r.reduce((s, x) => s + (x.input_tokens_est ?? 0), 0);
  const tokOut = r.reduce((s, x) => s + (x.output_tokens_est ?? 0), 0);
  const failed = r.filter((x) => x.status === "failed").length;
  const running = r.filter((x) => x.status === "running").length;
  const activeGoals = g.filter((x) => x.status === "aktiv");

  const goalRows = activeGoals.length === 0
    ? `<p class="empty">Keine aktiven Ziele. Gib dem Manager ein Ziel — z.&#160;B. «Neues Ziel: 100 relevante Keywords aufbauen» — und der tägliche Takt arbeitet automatisch daran.</p>`
    : activeGoals.map((goal) => {
      const gt = t.filter((x) => x.goal_id === goal.id);
      const done = gt.filter((x) => x.status === "erledigt").length;
      const pct = gt.length ? Math.round((done / gt.length) * 100) : 0;
      const taskList = gt.map((x) =>
        `<li class="task ${esc(x.status)}"><span class="dot" style="background:${AGENT_COLORS[x.agent] ?? "#888"}"></span>${esc(x.title)} <em>· ${esc(x.agent)} · ${esc(x.status)}</em></li>`).join("");
      return `<article class="goal">
        <header><h3>P${goal.priority} · ${esc(goal.title)}</h3><span class="pct">${done}/${gt.length} Aufgaben (${pct}%)</span></header>
        <div class="bar"><div style="width:${pct}%"></div></div>
        ${goal.description ? `<p class="desc">${esc(goal.description)}</p>` : ""}
        <ul class="tasks">${taskList || "<li class='task'><em>Noch keine Aufgaben geplant — passiert beim nächsten Takt.</em></li>"}</ul>
      </article>`;
    }).join("");

  const runRows = r.map((x) => `<tr>
      <td><span class="dot" style="background:${AGENT_COLORS[x.agent] ?? "#888"}"></span>${esc(x.agent)}</td>
      <td>${esc(x.task)}${x.result_summary ? `<div class="sub">${esc(x.result_summary)}</div>` : ""}</td>
      <td><span class="pill ${esc(x.status)}">${esc(x.status)}</span></td>
      <td class="num">${fmtTokens((x.input_tokens_est ?? 0) + (x.output_tokens_est ?? 0))}</td>
      <td class="num">${fmtDate(x.started_at)}</td>
    </tr>`).join("");

  const decisionRows = d.length === 0
    ? `<p class="empty">Keine offenen Entscheidungen — nichts wartet auf dich.</p>`
    : `<ul class="dec">${d.map((x) => `<li><strong>${esc(x.topic)}</strong><br/>${esc(x.description)}${x.options ? `<div class="sub">Optionen: ${esc(x.options)}</div>` : ""}</li>`).join("")}</ul>`;

  const kwRows = k.map((x) => `<tr><td>${esc(x.keyword)}</td><td>${esc(x.database)}</td><td class="num">${x.volume ?? "—"}</td><td class="num">${x.difficulty ?? "—"}</td></tr>`).join("");
  const contentRows = c.map((x) => `<tr><td>${esc(x.title)}</td><td>${esc(x.type)}</td><td><span class="pill">${esc(x.status)}</span></td><td class="num">${fmtDate(x.created_at)}</td></tr>`).join("");
  const hbRows = h.map((x) => `<tr><td>${esc(x.report_date)}</td><td class="num">${x.runs_total}</td><td class="num">${x.runs_failed}</td><td class="num">${fmtTokens((x.input_tokens_est ?? 0) + (x.output_tokens_est ?? 0))}</td></tr>`).join("");

  // XHTML statt HTML: Supabase Edge Functions schreiben text/html bei GET zwingend
  // auf text/plain um (Browser zeigt Quelltext) — application/xhtml+xml nicht.
  // Das Markup muss darum wohlgeformtes XML bleiben (Tags schliessen, nur XML-Entities).
  const html = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="de">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta http-equiv="refresh" content="300"/>
<title>swissROI — Live-Dashboard</title>
<style>
  :root { --paper:#fafaf8; --ink:#1a1a1c; --soft:#55555c; --line:#e3e2dd; --card:#fff; --accent:#c8281e; --chip:#f1f0ec; --ok:#2f7d4f; --warn:#8a6d1f; }
  @media (prefers-color-scheme: dark) { :root { --paper:#161618; --ink:#ecebe7; --soft:#a3a2a9; --line:#2e2e33; --card:#1f1f23; --accent:#e0554b; --chip:#2a2a2f; --ok:#6fbe8f; --warn:#d4b04a; } }
  * { box-sizing: border-box; }
  body { margin:0; padding:2rem 1.25rem 4rem; background:var(--paper); color:var(--ink); font-family:"Helvetica Neue",Helvetica,Arial,sans-serif; line-height:1.5; }
  .wrap { max-width:1060px; margin:0 auto; }
  header.top { border-bottom:3px solid var(--ink); padding-bottom:1.1rem; margin-bottom:1.8rem; }
  .eyebrow { text-transform:uppercase; letter-spacing:.14em; font-size:.72rem; color:var(--accent); font-weight:700; margin:0 0 .35rem; }
  h1 { font-size:clamp(1.6rem,4vw,2.3rem); font-weight:800; letter-spacing:-.02em; margin:0; }
  .stand { color:var(--soft); font-size:.82rem; margin-top:.4rem; }
  h2 { font-size:1rem; text-transform:uppercase; letter-spacing:.1em; border-bottom:1px solid var(--line); padding-bottom:.45rem; margin:2.2rem 0 1rem; }
  .kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:1px; background:var(--line); border:1px solid var(--line); }
  .kpi { background:var(--card); padding:.8rem .9rem; }
  .kpi b { display:block; font-size:1.45rem; font-variant-numeric:tabular-nums; }
  .kpi span { font-size:.68rem; text-transform:uppercase; letter-spacing:.1em; color:var(--soft); }
  .goal { background:var(--card); border:1px solid var(--line); padding:1rem 1.1rem; margin-bottom:1rem; }
  .goal header { display:flex; justify-content:space-between; align-items:baseline; gap:1rem; flex-wrap:wrap; }
  .goal h3 { margin:0; font-size:1rem; }
  .pct { font-size:.78rem; color:var(--soft); font-variant-numeric:tabular-nums; }
  .bar { height:6px; background:var(--chip); margin:.6rem 0; }
  .bar div { height:100%; background:var(--ok); }
  .desc { font-size:.85rem; color:var(--soft); margin:.3rem 0 .5rem; }
  ul.tasks { list-style:none; margin:.4rem 0 0; padding:0; display:flex; flex-direction:column; gap:.3rem; }
  .task { font-size:.85rem; } .task em { color:var(--soft); font-style:normal; font-size:.75rem; }
  .task.erledigt { text-decoration:line-through; color:var(--soft); }
  .dot { display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:.45rem; }
  .tbl { overflow-x:auto; border:1px solid var(--line); background:var(--card); }
  table { width:100%; border-collapse:collapse; font-size:.83rem; }
  th { text-align:left; font-size:.66rem; text-transform:uppercase; letter-spacing:.1em; color:var(--soft); padding:.55rem .8rem; border-bottom:2px solid var(--ink); }
  td { padding:.5rem .8rem; border-bottom:1px solid var(--line); vertical-align:top; }
  tr:last-child td { border-bottom:none; }
  td.num { font-variant-numeric:tabular-nums; text-align:right; white-space:nowrap; }
  .sub { font-size:.75rem; color:var(--soft); margin-top:.15rem; }
  .pill { font-size:.68rem; text-transform:uppercase; letter-spacing:.06em; background:var(--chip); padding:.15rem .5rem; border-radius:2px; font-weight:700; }
  .pill.done { color:var(--ok); } .pill.failed { color:var(--accent); } .pill.running { color:var(--warn); }
  .empty { color:var(--soft); font-size:.88rem; background:var(--card); border:1px dashed var(--line); padding:.9rem 1rem; max-width:65ch; }
  ul.dec { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:.7rem; }
  ul.dec li { background:var(--card); border-left:3px solid var(--accent); border-top:1px solid var(--line); border-right:1px solid var(--line); border-bottom:1px solid var(--line); padding:.7rem .9rem; font-size:.88rem; }
  footer { margin-top:2.5rem; padding-top:.9rem; border-top:1px solid var(--line); font-size:.76rem; color:var(--soft); max-width:72ch; }
</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <p class="eyebrow">krisensicher.ch · KI-Agenten-Agentur · LIVE</p>
    <h1>swissROI — Live-Dashboard</h1>
    <p class="stand">Direkt aus der Datenbank gelesen · ${esc(new Date().toLocaleString("de-CH", { timeZone: "Europe/Zurich" }))} · aktualisiert sich alle 5 Min. automatisch, F5 für sofort</p>
  </header>

  <div class="kpis">
    <div class="kpi"><b>${activeGoals.length}</b><span>Aktive Ziele</span></div>
    <div class="kpi"><b>${t.filter((x) => x.status === "offen" || x.status === "in_arbeit").length}</b><span>Offene Aufgaben</span></div>
    <div class="kpi"><b>${r.length}${running ? ` (${running} läuft)` : ""}</b><span>Letzte Einsätze</span></div>
    <div class="kpi"><b>${failed}</b><span>Fehler</span></div>
    <div class="kpi"><b>${d.length}</b><span>Warten auf dich</span></div>
    <div class="kpi"><b>≈ ${fmtTokens(tokIn + tokOut)}</b><span>Tokens (Schätzung)</span></div>
  </div>

  <h2>Ziele &amp; Fortschritt</h2>
  ${goalRows}

  <h2>Offene Entscheidungen</h2>
  ${decisionRows}

  <h2>Letzte Agent-Einsätze</h2>
  <div class="tbl"><table>
    <thead><tr><th>Agent</th><th>Aufgabe</th><th>Status</th><th style="text-align:right">Tokens ≈</th><th style="text-align:right">Wann</th></tr></thead>
    <tbody>${runRows || `<tr><td colspan="5"><em>Noch keine Einsätze.</em></td></tr>`}</tbody>
  </table></div>

  <h2>Second Brain — Wissen</h2>
  <h2 style="border:none;font-size:.8rem;margin:1.2rem 0 .5rem">Keywords (neueste)</h2>
  <div class="tbl"><table>
    <thead><tr><th>Keyword</th><th>DB</th><th style="text-align:right">Volumen</th><th style="text-align:right">Difficulty</th></tr></thead>
    <tbody>${kwRows || `<tr><td colspan="4"><em>Noch keine Keywords — beauftrage den SEO-Agent.</em></td></tr>`}</tbody>
  </table></div>
  <h2 style="border:none;font-size:.8rem;margin:1.2rem 0 .5rem">Content-Pipeline (neueste)</h2>
  <div class="tbl"><table>
    <thead><tr><th>Titel</th><th>Typ</th><th>Status</th><th style="text-align:right">Erstellt</th></tr></thead>
    <tbody>${contentRows || `<tr><td colspan="4"><em>Noch keine Inhalte — beauftrage den Content-Agent.</em></td></tr>`}</tbody>
  </table></div>
  <h2 style="border:none;font-size:.8rem;margin:1.2rem 0 .5rem">Arbeits-Takt (letzte 7 Tage)</h2>
  <div class="tbl"><table>
    <thead><tr><th>Datum</th><th style="text-align:right">Läufe</th><th style="text-align:right">Fehler</th><th style="text-align:right">Tokens ≈</th></tr></thead>
    <tbody>${hbRows || `<tr><td colspan="4"><em>Erster Takt: morgen 07:00 Uhr.</em></td></tr>`}</tbody>
  </table></div>

  <footer>Diese Seite wird von einer Supabase Edge Function direkt aus der Datenbank erzeugt — jeder Aufruf zeigt den echten Live-Stand und verbraucht keine Claude-Tokens. Token-Zahlen sind Schätzungen des Managers. Adresse mit ?key=… geheim halten.</footer>
</div>
</body>
</html>`;

  return new Response(html, { headers: { "Content-Type": "application/xhtml+xml; charset=utf-8" } });
});
