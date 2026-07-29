// Daten-Endpunkt des Live-Dashboards der KI-Agenten-Agentur swissROI.
// Liefert die Agentur-Daten als JSON — die Anzeige übernimmt der lokale Viewer
// (docs/dashboard-viewer.html). HTML kann nicht direkt ausgeliefert werden:
// Supabase erzwingt auf der supabase.co-Domain für HTML-Antworten content-type
// text/plain + nosniff (Functions-Gateway UND Storage), Browser zeigen dann Quelltext.
// Zugriff nur mit ?key=<dashboard_key aus der settings-Tabelle>.
//
// Zwei Betriebsarten:
//   ?key=…                     → Gesamt-Payload für das Dashboard (inkl. stats)
//   ?key=…&detail=content:<id> → Volltext eines content_items für das Detail-Overlay
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// CORS offen: der Viewer läuft als lokale Datei (Origin "null") oder auf beliebigem Host;
// geschützt wird der Zugriff durch den ?key=-Parameter, nicht durch die Origin.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "no-store",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });

const STATS_TAGE = 90;

// Verdichtet die Läufe der letzten 90 Tage zu Tages-Buckets je Agent. Bewusst
// serverseitig und nicht im Browser: die Antwort bleibt klein, der Viewer einfach.
function verdichte(rows: Array<Record<string, unknown>>) {
  const tage = new Map<string, Record<string, number>>();
  const summen: Record<string, { tokens: number; laeufe: number }> = {};

  for (const row of rows) {
    const agent = String(row.agent ?? "unbekannt");
    // Tagesgrenze in Schweizer Zeit, damit die Balken zum Dashboard-Datum passen.
    const tag = new Date(String(row.started_at)).toLocaleDateString("en-CA", { timeZone: "Europe/Zurich" });
    const tokens = Number(row.input_tokens_est ?? 0) + Number(row.output_tokens_est ?? 0);

    if (!tage.has(tag)) tage.set(tag, {});
    const bucket = tage.get(tag)!;
    bucket[agent] = (bucket[agent] ?? 0) + tokens;

    summen[agent] ??= { tokens: 0, laeufe: 0 };
    summen[agent].tokens += tokens;
    summen[agent].laeufe += 1;
  }

  return {
    tage_anzahl: STATS_TAGE,
    tage: [...tage.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([tag, agenten]) => ({ tag, agenten })),
    summen,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  const url = new URL(req.url);
  const { data: keyRow } = await supabase.from("settings").select("value").eq("key", "dashboard_key").maybeSingle();
  if (!keyRow || url.searchParams.get("key") !== keyRow.value) {
    return json({ error: "Zugriff verweigert — gültiger ?key= nötig." }, 401);
  }

  // Detail-Zweig für das Overlay: einzelner Volltext statt Gesamt-Payload.
  const detail = url.searchParams.get("detail");
  if (detail) {
    const trenner = detail.indexOf(":");
    const art = trenner > -1 ? detail.slice(0, trenner) : "";
    const id = trenner > -1 ? detail.slice(trenner + 1) : "";
    if (art !== "content" || !id) {
      return json({ error: "Unbekannter detail-Parameter — erwartet wird content:<id>." }, 400);
    }
    const { data, error } = await supabase.from("content_items")
      .select("id,type,title,body,channel,status,created_at,updated_at").eq("id", id).maybeSingle();
    if (error) return json({ error: error.message }, 400);
    if (!data) return json({ error: "Nicht gefunden." }, 404);
    return json({ detail: data });
  }

  const seit = new Date(Date.now() - STATS_TAGE * 864e5).toISOString();

  const [goals, tasks, runs, decisions, decisionsDone, content, keywords, heartbeats, statsRows] = await Promise.all([
    supabase.from("goals").select("*").order("priority").order("created_at"),
    supabase.from("tasks").select("*").order("created_at"),
    supabase.from("agent_runs").select("*").order("started_at", { ascending: false }).limit(100),
    supabase.from("decisions").select("*").eq("status", "offen").order("created_at"),
    supabase.from("decisions").select("*").neq("status", "offen").order("decided_at", { ascending: false, nullsFirst: false }).limit(10),
    // 40 statt 10: die Projektmappe zeigt die Texte je Projekt an.
    supabase.from("content_items").select("id,type,title,status,channel,created_at").order("created_at", { ascending: false }).limit(40),
    supabase.from("seo_keywords").select("keyword,database,volume,difficulty,collected_at").order("collected_at", { ascending: false }).limit(15),
    supabase.from("heartbeat_reports").select("*").order("report_date", { ascending: false }).limit(7),
    // Nur die vier Felder, die die Verdichtung braucht — nicht die vollen Läufe.
    supabase.from("agent_runs").select("agent,started_at,input_tokens_est,output_tokens_est").gte("started_at", seit),
  ]);

  return json({
    stand: new Date().toISOString(),
    goals: goals.data ?? [],
    tasks: tasks.data ?? [],
    runs: runs.data ?? [],
    decisions: decisions.data ?? [],
    decisions_entschieden: decisionsDone.data ?? [],
    content: content.data ?? [],
    keywords: keywords.data ?? [],
    heartbeats: heartbeats.data ?? [],
    stats: verdichte(statsRows.data ?? []),
  });
});
