// Pure helpers for retro notes and the diary README. No browser APIs, so they're easy to test.

// Reads the action from the notes the retro page produces: the lines under the
// "My action for next week" heading, up to the next heading. "" if that section is empty.
export function extractAction(markdown) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex(line => /^#+\s*My action for next week\s*$/i.test(line));
  if (start === -1) return "";
  const end = lines.findIndex((line, i) => i > start && /^#+\s/.test(line));
  return lines.slice(start + 1, end === -1 ? undefined : end).join(" ").trim().replace(/\s+/g, " ");
}

const NO_ACTION = "_No action in your latest retro._";

const markers = (text, name) => {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;
  const i = text.indexOf(start);
  const j = text.indexOf(end);
  return i === -1 || j === -1 || j < i ? null : { from: i + start.length, to: j };
};

// Reads "My action this week" from the README. Returns "" while it's still the placeholder.
export function currentAction(readme) {
  const a = markers(readme, "action");
  const action = a ? readme.slice(a.from, a.to).trim() : "";
  return action.startsWith("_") ? "" : action;
}

const ROW =/^\| (\d{4}-\d{2}-\d{2}) \|/;

// Updates the "My action this week" tip and the retros table between the README markers.
// The action tip only changes when this is the newest retro, so re-saving an old one keeps the current action.
// If the newest retro has no action, the tip says so instead of keeping an old one.
// Returns the new README, or null if nothing changed (e.g. the markers were removed).
export function updateReadme(readme, { date, path, action }) {
  let out = readme;
  let isNewest = true;

  const r = markers(out, "retros");
  if (r) {
    const safeAction = (action || "").replace(/\|/g, "\\|");
    const rows = out.slice(r.from, r.to).split("\n")
      .filter(line => ROW.test(line) && line.match(ROW)[1] !== date);
    isNewest = rows.every(line => line.match(ROW)[1] < date);
    rows.push(`| ${date} | [Notes](${path}) | ${safeAction} |`);
    rows.sort((x, y) => y.match(ROW)[1].localeCompare(x.match(ROW)[1]));
    const table = `\n\n| Date | Notes | My action |\n|------|-------|-----------|\n${rows.join("\n")}\n\n`;
    out = out.slice(0, r.from) + table + out.slice(r.to);
  }

  const a = markers(out, "action");
  if (a && isNewest) out = out.slice(0, a.from) + (action || NO_ACTION) + out.slice(a.to);

  return out === readme ? null : out;
}

export const localDate = (d = new Date()) => d.toLocaleDateString("en-CA");
