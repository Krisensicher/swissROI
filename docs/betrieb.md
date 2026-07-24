# Betriebshandbuch — KI-Agenten-Agentur swissROI

## Wie die Agentur läuft

Jede Claude-Code-Session in diesem Repo wird durch die `CLAUDE.md` automatisch zum **Manager-Agent**. Der Manager delegiert an die Spezial-Agents (`.claude/agents/`), protokolliert alles in Supabase und eskaliert nur wichtige Entscheidungen.

## Ziel-Engine & Arbeits-Takt (Heartbeat)

Das System arbeitet zielgesteuert:

1. **Ziel setzen:** Dem Manager sagen «Neues Ziel: …». Er legt es in `goals` an und zerlegt es in Aufgaben (`tasks`), je mit zuständigem Agent.
2. **Arbeits-Takt:** Täglich 07:00 Schweizer Sommerzeit (05:00 UTC; nach Umstellung auf Winterzeit = 06:00 Lokalzeit, bei Bedarf Routine auf `0 6 * * *` ändern) startet die Routine «Heartbeat swissROI» eine frische Session und führt `/heartbeat` aus: aktive Ziele prüfen → wichtigste Aufgaben (max. 3 Delegate) abarbeiten → Kurz-Report in `heartbeat_reports`.
3. **Spar-Modus:** Ohne aktive Ziele bricht der Takt nach einer Mini-Abfrage sofort ab — kein Leerlauf-Verbrauch.
4. **Eskalation bleibt:** Geld/Publikation/Löschen/Strategie landet als offene Entscheidung in `decisions` (sichtbar im Dashboard), nicht in der Ausführung.
5. **Manuell:** In jeder Session `/heartbeat` eingeben. Routine verwalten (Zeit ändern, pausieren): einfach den Manager bitten (`update_trigger`).

## Live-Dashboard

- **Was:** Supabase Edge Function `dashboard` — wird bei jedem Aufruf direkt aus der Datenbank erzeugt: Ziele + Fortschritt, offene Entscheidungen, letzte Agent-Einsätze, Second Brain (Keywords, Content, Reports), Token-Schätzungen. **Immer live, null Token-Kosten pro Ansicht.** Seite lädt alle 5 Minuten automatisch neu.
- **Adresse:** `https://ahrammvkqgpmagyfggmi.supabase.co/functions/v1/dashboard?key=<dashboard_key>` — der Schlüssel steht in der Tabelle `settings` (`dashboard_key`) und gehört **nicht** ins Repo. Schlüssel verloren? Den Manager fragen, er liest ihn aus `settings` bzw. rotiert ihn.
- **Code:** `supabase/functions/dashboard/index.ts` (Änderungen dort committen und per `deploy_edge_function` neu deployen).
- Das frühere statische Artifact-Dashboard (claude.ai/code/artifacts) ist durch diese Live-Version ersetzt.

## Token-Verbrauch

Exakte Token-Zahlen sind aus einer Session heraus nicht programmatisch auslesbar. Deshalb gilt:

- Der Manager protokolliert pro Delegat **Schätzungen** in `agent_runs` (`input_tokens_est`, `output_tokens_est`).
- Der Heartbeat summiert diese Schätzungen und kennzeichnet sie als Schätzung.
- Verbindliche Verbrauchszahlen: Claude-Abrechnung bzw. `/usage` in der App.

## Eskalation — was wird gefragt, was läuft durch?

| Läuft automatisch | Wird dir vorgelegt |
|---|---|
| Recherchen, Analysen | Alles, was Geld kostet |
| Text-Entwürfe | Publikationen (Blog live, Social-Post absenden, E-Mail an Externe) |
| Datenbank-Lesezugriffe, Logging | Löschen/Überschreiben von Daten |
| Reports, interne Auswertungen | Strategie-Änderungen (Positionierung, Zielgruppen, Preise) |
| Neue Tabellen/Spalten (additiv) | Neue externe Integrationen oder Zugänge |

Offene Entscheidungen stehen in der Tabelle `decisions` (status `offen`) und erscheinen in jedem Heartbeat, bis sie entschieden sind.

## Supabase

- **Projekt:** `ahrammvkqgpmagyfggmi` («Krisensicher's Project», Region eu-north-1)
- **Schema:** `supabase/migrations/20260724000001_agentur_schema.sql` (angewendet)
- **Free-Tier-Hinweis:** Das Projekt pausiert nach ~7 Tagen ohne Aktivität. Der tägliche Heartbeat hält es aktiv; falls es doch pausiert, reaktivieren die Agents es selbstständig via `restore_project`.
- **Sicherheit:** Alle Tabellen haben RLS aktiviert ohne offene Policies — Zugriff nur über die Service-Role (MCP). Kein anon-Zugriff.

## Neue Agents hinzufügen

1. Neue Datei `.claude/agents/<name>.md` mit Frontmatter (`name`, `description`) und Instruktionen anlegen — Vorlage: bestehende Agents.
2. In `CLAUDE.md` in der Agent-Tabelle ergänzen, damit der Manager den Agent kennt.
3. Committen und pushen. Ab der nächsten Session ist der Agent verfügbar.
