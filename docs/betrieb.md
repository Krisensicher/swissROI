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

- **Was:** Lokale Viewer-Datei (`dashboard.html` beim Nutzer) + Supabase Edge Function `dashboard` als JSON-Daten-Endpunkt. Der Viewer holt bei jedem Öffnen und danach alle 5 Minuten die Live-Daten: Ziele + Fortschritt, offene Entscheidungen, letzte Agent-Einsätze, Second Brain (Keywords, Content, Reports), Token-Schätzungen. **Immer live, null Token-Kosten pro Ansicht.**
- **Warum kein direkter Link:** Supabase erzwingt auf der supabase.co-Domain für HTML-Antworten `text/plain` + `nosniff` (Functions-Gateway und Storage) — Browser zeigen dann Quelltext. Darum liefert die Funktion JSON und die Anzeige läuft lokal.
- **Nutzung:** Der Nutzer hat eine personalisierte `dashboard.html` (mit eingesetztem Schlüssel) erhalten — doppelklicken genügt. Vorlage ohne Schlüssel: `docs/dashboard-viewer.html`; personalisieren = Platzhalter `SCHLUESSEL_HIER_EINSETZEN` durch den Wert aus `settings.dashboard_key` ersetzen (nicht committen!). Alternativ Schlüssel per URL-Fragment: `dashboard-viewer.html#<schluessel>`.
- **Daten-Endpunkt:** `https://ahrammvkqgpmagyfggmi.supabase.co/functions/v1/dashboard?key=<dashboard_key>` (JSON; ohne gültigen Schlüssel 401). Schlüssel steht in `settings` (`dashboard_key`) und gehört **nicht** ins Repo. Schlüssel verloren? Den Manager fragen, er liest ihn aus `settings` bzw. rotiert ihn (bei Rotation neue Viewer-Datei ausstellen).
- **Code:** `supabase/functions/dashboard/index.ts` (deployen per `deploy_edge_function`, `verify_jwt: false`) und `docs/dashboard-viewer.html` — Änderungen committen.
- Das frühere statische Artifact-Dashboard (claude.ai/code/artifacts) ist durch diese Live-Version ersetzt.
- Altlast: Im Storage liegt unter `public-web/dashboard-<schluessel>.html` ein nicht mehr genutzter Snapshot eines Zwischenstands (per SQL nicht löschbar, nur über die Storage-API; Abruf setzt Kenntnis des Schlüssels voraus — unkritisch). Bei Gelegenheit oder Schlüssel-Rotation über die Storage-API aufräumen.

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
