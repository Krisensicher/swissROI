# swissROI — KI-Agenten-Agentur

Marketing- und Business-Agentur mit spezialisierten KI-Agents, die automatisiert zusammenarbeiten. Betrieben mit Claude Code + Supabase — kein VPS nötig.

## Architektur

```
                    ┌─────────────────┐
                    │  Manager-Agent  │  ← Hauptsession (startet automatisch via CLAUDE.md)
                    │  Koordination,  │
                    │  Token-Wache,   │
                    │  Eskalation     │
                    └────────┬────────┘
         ┌───────────┬───────┴───────┬───────────────┐
         ▼           ▼               ▼               ▼
   ┌──────────┐ ┌───────────┐ ┌──────────────┐ ┌───────────┐
   │ SEO-Agent│ │ Content-  │ │ Strategie-   │ │ Daten-    │
   │ Semrush  │ │ Agent     │ │ Agent        │ │ Agent     │
   │          │ │ Blog/Social│ │ Marktanalyse │ │ Supabase  │
   └──────────┘ └───────────┘ └──────────────┘ └───────────┘
                                                     │
                                              ┌──────▼──────┐
                                              │  Supabase   │
                                              │  (Logging,  │
                                              │  Reports,   │
                                              │  Content)   │
                                              └─────────────┘
```

| Agent | Aufgabe | Werkzeuge |
|---|---|---|
| **Manager-Agent** | Startet automatisch, delegiert an alle anderen Agents, überwacht Token-Verbrauch, eskaliert nur wichtige Entscheidungen | Agent-Tool, AskUserQuestion, Supabase |
| **SEO-Agent** | Keyword-Recherche, Konkurrenzanalyse, Backlinks, Site-Audits | Semrush (verbunden) |
| **Content-Agent** | Texte, Social Media, Blog-Artikel | Schreib-Tools, Supabase (`content_items`) |
| **Strategie-Agent** | Marktanalyse, Planung, Priorisierung | WebSearch, Semrush-Daten, Supabase |
| **Daten-Agent** | Datenbank-Schema, Abfragen, Auswertungen | Supabase (verbunden) |

## Steuerung

- **Routine-Tasks laufen automatisch.** Der Manager delegiert selbstständig an die Spezial-Agents und protokolliert jeden Lauf in Supabase (`agent_runs`).
- **Wichtige Entscheidungen werden abgestimmt.** Alles, was Geld kostet, öffentlich publiziert wird, Daten löscht oder die Strategie ändert, landet als offener Eintrag in `decisions` und wird dir zur Entscheidung vorgelegt.
- **Heartbeat:** Ein täglicher automatischer Report (07:00 Uhr Schweizer Zeit) mit Token-Verbrauch, Status aller Läufe und offenen Entscheidungen — gespeichert in `heartbeat_reports`.

## Infrastruktur

| Komponente | Status | Zweck |
|---|---|---|
| Claude Code | ✅ verbunden | Ausführung aller Agents |
| Supabase | ✅ verbunden (Projekt `ahrammvkqgpmagyfggmi`) | Logging, Reports, Content-Speicher |
| Semrush | ✅ verbunden (MCP) | SEO-Daten |
| GitHub | ✅ verbunden | Code & Konfiguration (dieses Repo) |

## Repo-Struktur

```
CLAUDE.md                          → Manager-Agent-Instruktionen (lädt bei jedem Sessionstart)
.claude/agents/seo-agent.md        → SEO-Agent-Definition
.claude/agents/content-agent.md    → Content-Agent-Definition
.claude/agents/strategie-agent.md  → Strategie-Agent-Definition
.claude/agents/daten-agent.md      → Daten-Agent-Definition
.claude/skills/heartbeat/SKILL.md  → /heartbeat — täglicher Report
supabase/migrations/               → Datenbank-Schema (bereits angewendet)
docs/betrieb.md                    → Betriebshandbuch (Heartbeat, Eskalation, Token)
```

## Loslegen

Einfach eine Claude-Code-Session in diesem Repo starten. Die `CLAUDE.md` macht die Session automatisch zum Manager-Agent. Beispiele:

- *«Mach eine Keyword-Recherche für krisensicher.ch»* → Manager delegiert an SEO-Agent
- *«Schreib einen Blogartikel über Notvorrat»* → Manager delegiert an Content-Agent (Entwurf), Publikation nur nach Freigabe
- *«Wie ist der Status?»* → Manager liest `agent_runs`, `decisions`, `heartbeat_reports`
- `/heartbeat` → Report sofort erzeugen (läuft sonst täglich automatisch)
