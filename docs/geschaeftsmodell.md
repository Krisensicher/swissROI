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

## Feste Leitplanken

1. **Nur Deutschschweiz, nur Deutsch** (Schweizer Hochdeutsch, «ss» statt «ß»).
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
