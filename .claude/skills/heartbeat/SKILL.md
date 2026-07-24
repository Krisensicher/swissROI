---
name: heartbeat
description: Täglicher Status-Report der KI-Agenten-Agentur — Token-Verbrauch, Agent-Läufe, offene Entscheidungen, Content-Pipeline. Läuft automatisch täglich um 07:00 Schweizer Zeit, kann aber jederzeit manuell mit /heartbeat ausgelöst werden.
---

# Heartbeat-Report

Erzeuge den täglichen Status-Report der Agentur. Sprache: Deutsch (Schweiz, «ss» statt «ß»).

## Schritte

1. **Supabase-Tools laden** (ToolSearch: `mcp__Supabase__execute_sql`, ggf. `mcp__Supabase__get_project`/`restore_project`). Projekt-ID: `ahrammvkqgpmagyfggmi`. Falls das Projekt `INACTIVE` ist: reaktivieren, 1–2 Minuten warten, dann fortfahren.

2. **Daten der letzten 24 h abfragen** (bzw. seit dem letzten Report in `heartbeat_reports`):

   ```sql
   -- Läufe & Token
   select agent, count(*) as laeufe,
          count(*) filter (where status = 'failed') as fehler,
          coalesce(sum(input_tokens_est), 0)  as tokens_in,
          coalesce(sum(output_tokens_est), 0) as tokens_out
   from agent_runs
   where started_at > now() - interval '24 hours'
   group by agent order by agent;

   -- Hängende Läufe (running seit > 2 h = vermutlich abgebrochen)
   select id, agent, task, started_at from agent_runs
   where status = 'running' and started_at < now() - interval '2 hours';

   -- Offene Entscheidungen
   select topic, description, created_at from decisions
   where status = 'offen' order by created_at;

   -- Content-Pipeline
   select status, count(*) from content_items group by status;
   ```

3. **Report schreiben** mit diesen Abschnitten:
   - **Status:** 🟢 alles normal / 🟡 Auffälligkeiten / 🔴 Fehler — mit einem Satz Begründung
   - **Token-Verbrauch (Schätzung):** Summe in/out gesamt und pro Agent; ausdrücklich als Schätzung kennzeichnen
   - **Agent-Läufe:** Anzahl pro Agent, Fehler, hängende Läufe
   - **Offene Entscheidungen:** Liste, oder «keine»
   - **Content-Pipeline:** Anzahl pro Status
   - **Empfehlung:** max. 2 konkrete nächste Schritte, falls sinnvoll

4. **Report speichern** (upsert, damit ein manueller Lauf den Tagesreport aktualisiert statt zu kollidieren):

   ```sql
   insert into heartbeat_reports
     (report_date, content, runs_total, runs_failed, input_tokens_est, output_tokens_est)
   values (current_date, $CONTENT, $RUNS, $FAILED, $IN, $OUT)
   on conflict (report_date) do update set
     content = excluded.content,
     runs_total = excluded.runs_total,
     runs_failed = excluded.runs_failed,
     input_tokens_est = excluded.input_tokens_est,
     output_tokens_est = excluded.output_tokens_est,
     created_at = now();
   ```

5. **Report ausgeben:** Den vollständigen Report als Abschlussnachricht ausgeben — er ist das Deliverable. Bei leerer Datenlage (keine Läufe): kurzer Report mit Status 🟢 und Hinweis «keine Aktivität».
