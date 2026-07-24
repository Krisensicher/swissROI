---
name: heartbeat
description: Täglicher Arbeits-Takt der KI-Agenten-Agentur — prüft die aktiven Ziele, lässt die Spezial-Agents daran weiterarbeiten und protokolliert einen kurzen Ergebnis-Report. Ohne aktive Ziele bricht er sofort tokensparend ab. Läuft automatisch täglich um 07:00 Schweizer Zeit, manuell jederzeit mit /heartbeat.
---

# Arbeits-Takt (Heartbeat)

Du arbeitest **zielgesteuert und tokensparend**: erst prüfen, ob es etwas zu tun gibt — nur dann arbeiten. Sprache: Deutsch (Schweiz, «ss» statt «ß»).

## Schritt 1 — Mini-Prüfung (immer, bewusst billig)

Supabase-Tools via ToolSearch laden (`execute_sql`; Projekt `ahrammvkqgpmagyfggmi`, falls `INACTIVE` → `restore_project`, kurz warten). Eine einzige Abfrage:

```sql
select
  (select count(*) from goals where status = 'aktiv') as ziele,
  (select count(*) from tasks where status in ('offen','in_arbeit')) as aufgaben,
  (select count(*) from decisions where status = 'offen') as entscheidungen,
  (select count(*) from agent_runs where status = 'running'
     and started_at < now() - interval '2 hours') as haenger;
```

**Abbruchregel:** Sind `ziele = 0` und `haenger = 0` → Mini-Report in `heartbeat_reports` upserten (content: «Keine aktiven Ziele — nichts zu tun», Zahlen 0) und **sofort beenden**. Keine Agents starten, keine langen Analysen. Das ist der Normalfall-Spar-Modus.

## Schritt 2 — Arbeiten (nur wenn aktive Ziele existieren)

1. Aktive Ziele + offene Aufgaben laden (`goals` nach priority, zugehörige `tasks`).
2. **Fehlen Aufgaben zu einem aktiven Ziel:** zuerst planen — 3–7 konkrete Aufgaben in `tasks` anlegen (agent, title, details), passend zum Ziel.
3. **Die 1–3 wichtigsten offenen Aufgaben ausführen:** an den zuständigen Spezial-Agent delegieren (Agent-Tool). Vorher `tasks.status = 'in_arbeit'` und Zeile in `agent_runs` (status `running`); nachher `erledigt`/`blockiert` + `result_summary` + Token-Schätzung in `agent_runs`.
   - **Tokensparend delegieren:** eng umrissener Auftrag, nötigen Kontext (z. B. vorhandene Keywords) mitgeben statt neu recherchieren lassen. Maximal 3 Delegate pro Takt.
4. **Eskalationsregeln gelten auch hier:** Geld, Publikation, Löschen, Strategie → nicht ausführen, sondern als `decisions`-Eintrag (status `offen`) hinterlegen; erscheint im Dashboard und wartet auf den Nutzer.
5. Ziel komplett? → `goals.status = 'erreicht'`.

## Schritt 3 — Kurz-Report

In `heartbeat_reports` upserten (report_date = heute; runs/failed/tokens aus den agent_runs der letzten 24 h):

```sql
insert into heartbeat_reports
  (report_date, content, runs_total, runs_failed, input_tokens_est, output_tokens_est)
values (current_date, $CONTENT, $RUNS, $FAILED, $IN, $OUT)
on conflict (report_date) do update set
  content = excluded.content, runs_total = excluded.runs_total,
  runs_failed = excluded.runs_failed, input_tokens_est = excluded.input_tokens_est,
  output_tokens_est = excluded.output_tokens_est, created_at = now();
```

Der Report ist **kurz** (max. ~10 Zeilen): Was wurde erreicht (pro Ziel 1 Zeile), was kommt als Nächstes, was wartet auf den Nutzer, Token-Schätzung. Als Abschlussnachricht ausgeben — Details stehen im Live-Dashboard, nicht im Report.
