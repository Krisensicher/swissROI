# Betriebshandbuch — KI-Agenten-Agentur swissROI

## Wie die Agentur läuft

Jede Claude-Code-Session in diesem Repo wird durch die `CLAUDE.md` automatisch zum **Manager-Agent**. Der Manager delegiert an die Spezial-Agents (`.claude/agents/`), protokolliert alles in Supabase und eskaliert nur wichtige Entscheidungen.

## Heartbeat (täglicher Report)

- **Zeitplan:** täglich 07:00 Schweizer Sommerzeit (05:00 UTC). Hinweis: Der Zeitplan ist fix in UTC — nach der Umstellung auf Winterzeit läuft der Report um 06:00 Lokalzeit; bei Bedarf die Routine auf `0 6 * * *` UTC ändern.
- **Mechanik:** Eine geplante Routine («Heartbeat swissROI») startet täglich eine frische Session in dieser Umgebung und führt das Skill `/heartbeat` aus.
- **Inhalt:** Token-Verbrauch (Schätzung), Läufe pro Agent, Fehler, hängende Läufe, offene Entscheidungen, Content-Pipeline, Empfehlungen.
- **Ablage:** `heartbeat_reports` (ein Report pro Tag, Upsert). Zusätzlich Benachrichtigung per Push/E-Mail, wenn der Lauf etwas Nennenswertes ergab.
- **Manuell:** In jeder Session `/heartbeat` eingeben.
- **Verwalten:** Die Routine kann in einer Session per `list_triggers` / `update_trigger` / `delete_trigger` (claude-code-remote MCP) angepasst, pausiert oder gelöscht werden — einfach den Manager darum bitten.

## Team-Dashboard (visuell)

- **URL:** https://claude.ai/code/artifact/805a14b3-1dba-4ce4-ad99-65ae574c3d6a (privat, nur für den Nutzer sichtbar; auch auffindbar unter claude.ai/code/artifacts)
- **Inhalt:** Alle Agents als Karten (Status, Spezialgebiete, letzte Einsätze), das gespeicherte Wissen (Second Brain) mit Eintragszahlen und eine Kurzanleitung.
- **Aktualisieren:** Das Dashboard ist eine Momentaufnahme. Auf Zuruf («Aktualisiere das Dashboard») holt der Manager die frischen Zahlen aus Supabase und veröffentlicht die Seite **unter derselben URL** neu — dazu beim Artifact-Tool die obige URL als `url`-Parameter übergeben.

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
