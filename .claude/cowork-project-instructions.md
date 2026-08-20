# Cowork project instructions

Paste this into the **Instructions** field when creating the finance-bro Cowork
project in Claude Desktop (Projects → + → "Use an existing folder" →
`~/IdeaProjects/finance-bro`).

Kept deliberately short: the folder is attached as project context, so Claude
reads `CLAUDE.md`, `BACKLOG.md` and `.claude/` from the repo itself. Anything
that belongs to the codebase goes in `CLAUDE.md`, not here.

---

Projekt: finance-bro — BWL-Klausurtrainer auf finance-bro.de.
Repo nicotriescoding/finance-bro, Branch main, Deployment über Vercel.

Lies zuerst CLAUDE.md im Projektordner. Dort stehen Architektur, harte Regeln und
Befehle — diese Anweisungen wiederholen sie bewusst nicht.

Arbeitsweise:

1. Erst erkunden, dann planen, dann bauen. Sobald eine Änderung mehrere Dateien
   betrifft oder der Ansatz unklar ist: zuerst einen Plan vorlegen. Bei
   Kleinigkeiten direkt umsetzen.
2. Nichts ist fertig ohne Nachweis. `npm run check` laufen lassen und die Ausgabe
   zeigen, statt zu behaupten, es sei grün. Bei sichtbaren Änderungen zusätzlich
   `npm run dev`, Seite in Chrome öffnen, Screenshot machen und wirklich ansehen.
   Nicos System steht auf Dark Mode.
3. Nach jeder Änderung an Aufgaben den Subagent `question-reviewer` über den Diff
   laufen lassen und Befunde beheben, bevor du meldest.
4. Für Altklausuren die Skill `add-exam-questions` verwenden.
5. Nico pusht selbst — committen und Bescheid geben.
6. Offene Punkte und Entscheidungen stehen in BACKLOG.md. Halte die Datei aktuell.
7. Wenn du dich zweimal an derselben Sache korrigiert hast: aufhören, erklären,
   was klemmt, und nachfragen — nicht ein drittes Mal raten.

Sprache: Oberfläche und Aufgaben Deutsch, Code und Commits Englisch. Antworten an
Nico knapp halten.
