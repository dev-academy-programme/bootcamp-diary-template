// Pure helpers for daily notes in entries/. They write the same format as the `diary` terminal command.

export const SECTIONS = {
  note: "📝 Notes",
  learned: "💡 Learned",
  stuck: "🧱 Stuck",
  win: "🎉 Wins"
};

const pad = n => String(n).padStart(2, "0");

// Matches the `diary` command's heading, e.g. "# Sunday 4 October 2026".
export function dayHeading(d = new Date()) {
  const weekday = d.toLocaleDateString("en-GB", { weekday: "long" });
  const month = d.toLocaleDateString("en-GB", { month: "long" });
  return `# ${weekday} ${d.getDate()} ${month} ${d.getFullYear()}`;
}

export const timeStamp = (d = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

// Adds "- HH:MM note" to the end of a section, creating the file or section if needed.
// Uses the same rules as the terminal command so both can add to the same day's file.
export function addNote(file, { kind = "note", text, date = new Date() }) {
  const section = `## ${SECTIONS[kind] ?? SECTIONS.note}`;
  const line = `- ${timeStamp(date)} ${text.trim().replace(/\s+/g, " ")}`;
  const content = file ?? `${dayHeading(date)}\n`;

  const lines = content.replace(/\n$/, "").split("\n");
  const start = lines.indexOf(section);
  if (start === -1) return `${lines.join("\n")}\n\n${section}\n${line}\n`;

  let last = start;
  for (let i = start + 1; i < lines.length && !lines[i].startsWith("## "); i++) {
    if (lines[i] !== "") last = i;
  }
  lines.splice(last + 1, 0, line);
  return `${lines.join("\n")}\n`;
}

export const JOURNAL = "📓 Journal";

// Adds a journal entry ("### HH:MM" then the text, line breaks kept) to the end of the Journal section.
export function addJournal(file, { text, date = new Date() }) {
  const section = `## ${JOURNAL}`;
  const entry = [`### ${timeStamp(date)}`, ...text.trim().replace(/\r\n?/g, "\n").split("\n")];
  const content = file ?? `${dayHeading(date)}\n`;

  const lines = content.replace(/\n$/, "").split("\n");
  const start = lines.indexOf(section);
  if (start === -1) return `${lines.join("\n")}\n\n${section}\n\n${entry.join("\n")}\n`;

  let last = start;
  for (let i = start + 1; i < lines.length && !lines[i].startsWith("## "); i++) {
    if (lines[i] !== "") last = i;
  }
  lines.splice(last + 1, 0, "", ...entry);
  return `${lines.join("\n")}\n`;
}
