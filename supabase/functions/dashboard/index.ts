// Daten-Endpunkt des Live-Dashboards der KI-Agenten-Agentur swissROI.
// Liefert die Agentur-Daten als JSON — die Anzeige übernimmt der lokale Viewer
// (docs/dashboard-viewer.html). HTML kann nicht direkt ausgeliefert werden:
// Supabase erzwingt auf der supabase.co-Domain für HTML-Antworten content-type
// text/plain + nosniff (Functions-Gateway UND Storage), Browser zeigen dann Quelltext.
// Zugriff nur mit ?key=<dashboard_key aus der settings-Tabelle>.
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  const url = new URL(req.url);
  const { data: keyRow } = await supabase.from("settings").select("value").eq("key", "dashboard_key").maybeSingle();
  if (!keyRow || url.searchParams.get("key") !== keyRow.value) {
    return new Response(JSON.stringify({ error: "Zugriff verweigert — gültiger ?key= nötig." }), {
      status: 401,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const [goals, tasks, runs, decisions, decisionsDone, content, keywords, heartbeats] = await Promise.all([
    supabase.from("goals").select("*").order("priority").order("created_at"),
    supabase.from("tasks").select("*").order("created_at"),
    supabase.from("agent_runs").select("*").order("started_at", { ascending: false }).limit(100),
    supabase.from("decisions").select("*").eq("status", "offen").order("created_at"),
    supabase.from("decisions").select("*").neq("status", "offen").order("decided_at", { ascending: false, nullsFirst: false }).limit(10),
    supabase.from("content_items").select("id,type,title,status,channel,created_at").order("created_at", { ascending: false }).limit(10),
    supabase.from("seo_keywords").select("keyword,database,volume,difficulty,collected_at").order("collected_at", { ascending: false }).limit(15),
    supabase.from("heartbeat_reports").select("*").order("report_date", { ascending: false }).limit(7),
  ]);

  const payload = {
    stand: new Date().toISOString(),
    goals: goals.data ?? [],
    tasks: tasks.data ?? [],
    runs: runs.data ?? [],
    decisions: decisions.data ?? [],
    decisions_entschieden: decisionsDone.data ?? [],
    content: content.data ?? [],
    keywords: keywords.data ?? [],
    heartbeats: heartbeats.data ?? [],
  };

  return new Response(JSON.stringify(payload), {
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
});
