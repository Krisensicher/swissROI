# Geschäftsmodell des Nutzers — Kontext für alle Agents

Stand: Juli 2026. Diese Datei ist Pflichtlektüre für Aufgaben rund um Websites/SEO/Content.

## Leadgen-Modell «Hub + Regional-Unterseiten»

- Der Nutzer betreibt ein **Leadgen-Business**: Er baut SEO-starke Websites in lokalen
  Dienstleistungs-Nischen und **vermietet** sie an lokale Dienstleister —
  zuerst Bezahlung pro Lead, später als Miete.
- Muster pro Nische: **eine Autoritäts-Hauptseite (Hub)** + **begrenzte Anzahl regionaler
  Unterseiten** für die erfolgversprechendsten Regionen.
- Erste Nische: **Sanitär-Notdienst 24/7**, Hub: **sanitaer-notdienst.ch** (existiert bereits,
  sammelt Autorität).
- **Nischen-Pipeline (entschieden Juli 2026):** Nische 2 = **Wasserschadensanierung** (volles
  Hub+Regional-Modell; Abgrenzung: wasserrohrbruch bleibt beim Sanitär-Hub; Hagel/Sturm später
  als Silo andockbar). Zusatz: **Kellerabdichtung** als schlanker Hub ohne Regionalseiten
  (White-Space). Zukunftswette: **Wärmepumpen-Notdienst** — nur Domain gesichert, Bau erst bei
  messbarer Nachfrage. Verworfen: Abbruch (keine Anrufe), Schimmel (DIY-Intent), Flachdach
  (kein Volumen); Kanalsanierung kein eigener Hub (evtl. später Sanitär-Ausbau).
- **Auftragswert-Regel:** Ø-Auftragswert der Nische ≥ ~3'000 CHF (Durchschnitt — einzelne
  kleinere Aufträge sind ok, hartes Minimum gilt nicht).
- **Telefonnummer und E-Mail sind pro Unterseite separat**, bleiben im Besitz des Nutzers und
  werden an den jeweils aktuellen Mieter/Kunden umgeleitet.
- **Nummern-Ablauf (entschieden Juli 2026):** Jede Regionalseite hat eine eigene VoIP-Nummer;
  die Hub-Hauptseite hat **keine** eigene Nummer, sie leitet auf die Regionen. Neue Nummern sind
  zunächst auf den Nutzer selbst umgeleitet (Leads gehen kostenlos an potenzielle Kunden zur
  Akquise); nach Zusage läuft Pay-per-Lead, die Nummer wird auf den Kunden umgeleitet und im
  VoIP-System getrackt. Auf den Seiten stehen bis zur Einrichtung Platzhalter
  ({{NUMMER_ZUERICH}} usw.) in `src/config.ts` — zentral ersetzbar.
- Weitere Nischen nach demselben Muster geplant — Prozesse und Erkenntnisse wiederverwendbar
  aufbauen (Templates, Checklisten, Keyword-Methodik ins Second Brain).

## Nischen-Playbook (Standard ab Nische 4)

Jede neue Nische durchläuft von Anfang an in einem Guss:
1. **Domain-Vorschläge sofort:** Bereits in der Strategie-Phase 2–3 passende .ch-Domains
   vorschlagen (exact-match-nah, seriös, frei wirkend) — der Nutzer registriert früh, damit
   Bau und Livegang nicht auf die Domain warten.
2. **SEO-Struktur komplett planen, bevor gebaut wird:** Seitenbaum (Hub, Leistungs-/
   Themenseiten, Regionalseiten nur bei belegtem Volumen), URL-Schema, Intent-Zuordnung je
   Seite (eine Seite = ein Cluster), interne Verlinkung, Hub-zu-Hub-Brücken.
3. **Info-Beiträge auf die relevantesten Keywords gehören zum Grundausbau:** Die
   volumenstärksten informationalen Keywords der Nische werden von Anfang an mit
   Ratgeber-Artikeln besetzt (zitierfähig nach AI-SEO-Standard) — sie sind Autoritäts- und
   KI-Sichtbarkeits-Hebel, nicht Nachtrag.
4. Keyword-Map-Dokument pro Website ab Tag 1, Vorschau-Pflicht, Bewertungsschema.

## Anonymitäts-Entscheid (Nutzer, Juli 2026)

Die Websites laufen bewusst **ohne Firmen-/Standort-Bezug** (keine Betreiber-Firma, kein
lokales Büro auf den Seiten) — Priorität ist die Eigenständigkeit/Vermietbarkeit jeder
Website. Der Nutzer akzeptiert die dokumentierten Nachteile bewusst: schwächere
E-E-A-T-Signale, kein Google Business Profile (Map-Pack bleibt unerreichbar), erschwerte
Verzeichniseinträge. Konsequenzen für die Agents: keine erfundenen Firmen-/Personen-Angaben
als Ersatz; Vertrauensarbeit läuft über Inhaltsqualität, Ratgeber-Autorität und ehrliche
Prozess-Transparenz. Rechtliches Minimum (Impressum/Kontaktweg) bleibt Thema des Nutzers —
die Seiten-Gerüste dafür existieren und werden mit dem befüllt, was der Nutzer vorgibt.

## Feste Leitplanken

1. **Nur Deutschschweiz, nur Deutsch** (Schweizer Hochdeutsch, «ss» statt «ß»).
1a. **Einzugsgebiets-Regel (entschieden Juli 2026):** Regionen werden nach dem Ort mit der
   Suchnachfrage benannt und als zusammenhängendes Gebiet geschnitten, in dem ein lokaler
   Betrieb realistisch in **~30 Minuten Fahrzeit** vor Ort ist. Orte darüber hinaus: weglassen
   oder «auf Anfrage». Die 30 Minuten sind interne Planungsregel — **niemals** als Zusage auf
   die Website schreiben.
2. **SEO-Kannibalisierung vermeiden:** Die Anzahl der Regional-Unterseiten ist bewusst
   **limitiert** und muss datenbasiert festgelegt werden (Suchvolumen ÷ Konkurrenz je Region,
   Überschneidung der Suchintentionen mit dem Hub und untereinander prüfen).
3. **Conversion-Ziel = Anruf:** direkter Anruf im Notfall. Seriös, modern, vertrauensbildend —
   ohne Druckmittel (keine Countdown-Timer o. ä.), aber maximal conversion-optimiert
   (Klick-zum-Anrufen prominent, mobil zuerst).
4. **Ehrlichkeit:** Keine Versprechen auf den Seiten, die der jeweilige Mieter nicht
   nachweislich halten kann (z. B. Reaktionszeiten).
5. Websites maximal auf SEO optimieren — Technik (Ladezeit, strukturierte Daten, interne
   Verlinkung Hub ↔ Unterseiten) gehört immer dazu.
6. **AI-SEO-Standard (jede Website, ab Juli 2026):** KI-Crawler in robots.txt einzeln erlauben
   (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User,
   PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended); llms.txt; sichtbares
   «Zuletzt aktualisiert» + dateModified im Schema; FAQ-Antworten beantworten die Frage in den
   ersten 1–2 Sätzen direkt; zitierfähige Fakten-Blöcke (nummerierte «X Schritte bei …»-Listen,
   Richtwert-Tabellen mit Quellen-Einordnung); Entitäten byte-identisch (Name/Region/Nummer).
   Monatliches Monitoring per Test-Prompts (im Keyword-Map-Dokument der Site), keine
   GEO-Agenturen/Tools kaufen.
