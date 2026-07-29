# Dein Setup — was du hast und wie es läuft

Stand: 29. Juli 2026. Für den Nutzer geschrieben — kein Fachjargon ohne Erklärung.

## Die Bausteine (7 Stück)

1. **Dieser Chat (Manager):** Deine Kommandozentrale. Du sprichst mit dem Manager-Agent —
   er koordiniert, delegiert an Spezialisten, protokolliert und legt dir Entscheidungen vor.
   Er führt nichts Fachliches selbst aus.
2. **Das swissROI-Repo (GitHub `Krisensicher/swissROI`):** Das «Betriebssystem» der Agentur.
   Hier steht alles, was das Verhalten steuert — und du kannst jede Zeile lesen:
   `CLAUDE.md` (Grundregeln des Managers), `.claude/agents/` (die 6 Spezialisten:
   SEO, Content, Strategie, Daten, Web, Research), `.claude/skills/heartbeat/` (der
   Tages-Ablauf), `docs/` (Geschäftsmodell, Playbook, Betrieb, Keyword-Maps, dieses
   Dokument). Jede Regel-Änderung ist ein Git-Commit — nachvollziehbar, rückgängig machbar.
3. **Supabase (Datenbank, Projekt `ahrammvkqgpmagyfggmi`):** Das Gedächtnis. Ziele,
   Aufgaben, jeder Agent-Lauf mit Token-Schätzung, Entscheidungen, alle Texte (Entwürfe),
   alle Keyword-Daten. Nichts lebt nur im Chat — eine neue Session liest hier den Stand.
4. **Dein Live-Dashboard (`dashboard.html` auf deinem Rechner):** Doppelklick → zeigt live
   aus der Datenbank: Ziele, Fortschritt, offene Entscheidungen, letzte Läufe, Kosten.
   Kostet null Tokens.
5. **Die Website-Repos:** Jede Nischen-Website ist ein eigenes GitHub-Repo → eigenes
   Vercel-Projekt → eigene Domain. Aktuell: `sanitaer-notdienst.ch` (auf GitHub, Livegang
   wartet als Pull Request #1 auf dich), Wasserschaden-Hub und Kellerabdichtungs-Hub
   (fertig gebaut, warten auf GitHub-Repos von dir).
6. **Die Zugänge (Connectoren):** Supabase, Semrush, GitHub — laufen über claude.ai,
   keine Passwörter im Repo. Vercel und Domain-Registrar bedienst nur du.
7. **Der Arbeits-Takt (Routine, täglich 04:00 CH):** Weckt diese Session, arbeitet die
   wichtigsten offenen Aufgaben ab (max. 3 Delegate), montags mit unabhängigem
   Kritiker-Review, schreibt einen Kurz-Report in die Datenbank.

## Wie ein Auftrag läuft

Du gibst ein Ziel → der Manager zerlegt es in Aufgaben (Datenbank) → Spezial-Agents
arbeiten sie ab (sofort auf Zuruf oder nachts im Takt) → Ergebnisse landen in der
Datenbank, Websites als Git-Commits, Vorschauen als klickbare Links → alles, was Geld
kostet, publiziert oder gelöscht würde, stoppt und wartet als «Entscheidung» auf dich.

## Wo du was siehst (Übersicht)

| Frage | Ort |
|---|---|
| Was läuft gerade / was wartet auf mich? | Dashboard (`dashboard.html`) |
| Was wurde geliefert, wie sieht es aus? | Vorschau-Links + Berichte in diesem Chat |
| Was wurde am Code/Regeln geändert? | GitHub-Commits (swissROI + Website-Repos) |
| Warum verhält sich das System so? | `CLAUDE.md` + `docs/` im swissROI-Repo |
| Was hat es gekostet? | Dashboard, Spalte Tokens (Schätzwerte) |

## Automatisch vs. deine Rolle

**Automatisch:** Recherche, Analysen, Texte (als Entwurf), Website-Bau auf Branches,
Protokolle, der tägliche Takt, wöchentliche Qualitätskontrolle.
**Nur du:** Geld (Domains, Abos, Nummern), Livegang (Merge), Publikation von Inhalten,
Strategie-Änderungen, neue Zugänge — plus alles ausserhalb der Session (Vercel-Klicks,
Registrar, GitHub-Repo anlegen).

## Bekannte Grenzen (ehrlich)

- Die Verbindung der Connectoren flattert gelegentlich → einzelne Freigabe-Klicks nötig
  (gebündelt auf 1–2 pro Lauf). Plattform-Thema, per /bug meldbar.
- Der Arbeits-Takt läuft in DIESER Session (Frisch-Sessions bekommen in deiner
  Organisation keine Connector-Zugänge mit — deshalb schlugen die ersten Takte fehl).
  Konsequenz: alles Automatische erscheint hier im Chat — maximale Übersicht, aber der
  Chat wird lang (wird automatisch komprimiert). Sollte diese Session je gelöscht werden:
  neue Session öffnen, «Setup prüfen» sagen — Repo + Datenbank stellen alles wieder her.
- Token-Zahlen sind Schätzungen, keine Abrechnung.
