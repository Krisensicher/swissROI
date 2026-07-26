# Setup abschliessen — offene Schritte

**Für den Manager-Agent:** Sagt der Nutzer «Setup abschliessen» (oder beim nächsten `/heartbeat`), führe die folgenden Schritte aus. Alle sind idempotent — bereits Erledigtes einfach überspringen. Danach diese Datei löschen (Repo) und dem Nutzer die Dashboard-Adresse inkl. Schlüssel nennen.

Supabase-Projekt: `ahrammvkqgpmagyfggmi`.

## 1. Migration `ziel_engine` anwenden

Prüfen: existiert die Tabelle `goals` schon (`list_tables`)? Falls nein: `apply_migration` mit dem Inhalt von `supabase/migrations/20260724000002_ziel_engine.sql`.

## 2. Dashboard-Schlüssel setzen

Prüfen: `select value from settings where key = 'dashboard_key'`. Falls leer: neuen Schlüssel erzeugen (`openssl rand -hex 20`) und einfügen:

```sql
insert into settings (key, value) values ('dashboard_key', '<SCHLUESSEL>')
on conflict (key) do nothing;
```

Schlüssel **niemals** committen — nur in `settings` und in der Antwort an den Nutzer.

## 3. Edge Function `dashboard` deployen

`deploy_edge_function` mit name `dashboard`, entrypoint `index.ts`, Inhalt aus `supabase/functions/dashboard/index.ts`, **`verify_jwt: false`** (die Funktion prüft selbst den `?key=`-Parameter gegen `settings.dashboard_key`; ohne gültigen Schlüssel liefert sie 401).

Danach testen: `curl` auf `https://ahrammvkqgpmagyfggmi.supabase.co/functions/v1/dashboard?key=<SCHLUESSEL>` → muss HTML mit «swissROI» liefern; ohne key → 401.

## 4. Routine aktualisieren

`update_trigger` für `trig_01WHuydveyjqxZuiVaq2MVBT` (claude-code-remote MCP): Name «Arbeits-Takt swissROI», Prompt auf den zielgesteuerten Takt umstellen (Kurzfassung: /heartbeat ausführen; ohne aktive Ziele Spar-Abbruch; mit Zielen max. 3 Delegate; Eskalationspflichtiges nur als offene decisions-Zeile). Zeitplan bleibt `0 5 * * *` UTC.

## 5. Protokoll nachtragen

```sql
insert into decisions (agent, topic, description, options, status, decision, decided_at)
values ('manager', 'Umbau: Ziel-Engine & Live-Dashboard',
  'Nutzer wünscht zielgesteuertes, tokensparendes System mit Live-Übersicht.',
  'A) Ziel-Engine, B) Live-Dashboard (Edge Function), C) beides',
  'entschieden', 'C) beides; Arbeits-Takt 1× täglich 07:00', now());

insert into agent_runs (agent, task, status, result_summary, input_tokens_est, output_tokens_est, finished_at)
values ('manager', 'Umbau auf Ziel-Engine + Live-Dashboard', 'done',
  'goals/tasks/settings migriert, Dashboard-Edge-Function deployt, Routine auf Arbeits-Takt umgestellt.', 40000, 15000, now());
```
