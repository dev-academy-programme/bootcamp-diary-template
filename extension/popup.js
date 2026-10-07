import { getFile, putFile } from "./github.js";
import { extractAction, updateReadme, currentAction, localDate } from "./retro.js";
import { addNote, SECTIONS } from "./notes.js";

const $ = id => document.getElementById(id);
const els = {
  setup: $("setup"), main: $("main"), repoName: $("repoName"),
  actionCard: $("actionCard"), actionText: $("actionText"),
  note: $("note"), notePath: $("notePath"), saveNote: $("saveNote"), noteStatus: $("noteStatus"),
  notes: $("notes"), date: $("date"), path: $("path"),
  save: $("save"), status: $("status")
};
const tabs = { note: $("tab-note"), retro: $("tab-retro") };
const panels = { note: $("panel-note"), retro: $("panel-retro") };

let settings = null;
let confirmReplace = false;

const pathFor = date => `retros/${date}.md`;
const entryPathFor = date => `entries/${date}.md`;

function showStatus(el, kind, html) {
  el.className = `status ${kind}`;
  el.innerHTML = html;
}
const clearStatus = el => { el.className = "status"; el.textContent = ""; };

// ---- Action this week ----

function showAction(action) {
  els.actionCard.hidden = !action;
  els.actionText.textContent = action;
}

async function refreshAction() {
  try {
    const readme = await getFile({ ...settings, path: "README.md" });
    const action = readme ? currentAction(readme.content) : "";
    showAction(action);
    await chrome.storage.local.set({ action });
  } catch {
    // Keep showing the saved action; the save buttons report connection problems.
  }
}

// ---- Tabs ----

function selectTab(name, { focus = false } = {}) {
  for (const key of Object.keys(tabs)) {
    const selected = key === name;
    tabs[key].setAttribute("aria-selected", String(selected));
    tabs[key].tabIndex = selected ? 0 : -1;
    panels[key].hidden = !selected;
  }
  if (focus) tabs[name].focus();
  else (name === "note" ? els.note : els.notes).focus();
  chrome.storage.local.set({ tab: name });
}

// ---- Quick note ----

const selectedKind = () => document.querySelector('input[name="kind"]:checked').value;

async function saveNote() {
  const text = els.note.value.trim();
  if (!text) {
    showStatus(els.noteStatus, "warn", "Write your note first.");
    return;
  }
  const kind = selectedKind();
  const date = localDate();
  const path = entryPathFor(date);

  els.saveNote.disabled = true;
  showStatus(els.noteStatus, "warn", "Saving…");

  try {
    // If the terminal command saved to the same file a moment ago, GitHub rejects the old version. Read it again and retry.
    for (let attempt = 1; ; attempt++) {
      const existing = await getFile({ ...settings, path });
      try {
        await putFile({
          ...settings, path,
          content: addNote(existing?.content ?? null, { kind, text }),
          sha: existing?.sha,
          message: `Diary: ${date}`
        });
        break;
      } catch (err) {
        if (attempt < 3 && (err.status === 409 || err.status === 422)) continue;
        throw err;
      }
    }

    els.note.value = "";
    await chrome.storage.local.remove("noteDraft");
    showStatus(els.noteStatus, "ok", `Saved to ${SECTIONS[kind]} ✓`);
    els.note.focus();
  } catch (err) {
    showStatus(els.noteStatus, "error", err.message || "Something went wrong. Please try again.");
  } finally {
    els.saveNote.disabled = false;
  }
}

// ---- Retro notes ----

function resetConfirm() {
  confirmReplace = false;
  els.save.textContent = "Save to my diary";
}

function updatePath() {
  els.path.textContent = `Saves to ${pathFor(els.date.value)}`;
  resetConfirm();
  clearStatus(els.status);
}

async function save() {
  const content = els.notes.value.trim();
  if (!content) {
    showStatus(els.status, "warn", "Paste your notes first.");
    return;
  }
  const date = els.date.value;
  if (!date) {
    showStatus(els.status, "warn", "Choose the retro date.");
    return;
  }
  const path = pathFor(date);

  els.save.disabled = true;
  showStatus(els.status, "warn", "Saving…");

  try {
    const existing = await getFile({ ...settings, path });
    if (existing && !confirmReplace) {
      confirmReplace = true;
      els.save.textContent = "Replace it";
      showStatus(els.status, "warn", "You already saved a retro for this date. Click <strong>Replace it</strong> to save over it, or change the date.");
      return;
    }

    const { url } = await putFile({
      ...settings, path,
      content: content + "\n",
      sha: existing?.sha,
      message: `Retro notes: ${date}`
    });

    // Best effort: update the action and retros table in the README.
    let readmeNote = "";
    try {
      const readme = await getFile({ ...settings, path: "README.md" });
      const updated = readme && updateReadme(readme.content, { date, path, action: extractAction(content) });
      if (updated) {
        await putFile({ ...settings, path: "README.md", content: updated, sha: readme.sha, message: `Update diary home: ${date}` });
      }
      if (readme) {
        const action = currentAction(updated || readme.content);
        showAction(action);
        await chrome.storage.local.set({ action });
      }
    } catch {
      readmeNote = "<br><span style=\"font-weight:400\">Your notes are saved, but the README couldn't be updated.</span>";
    }

    await chrome.storage.local.remove("draft");
    els.notes.value = "";
    resetConfirm();
    const link = url ? ` <a href="${url}" target="_blank" rel="noopener">Open on GitHub</a>` : "";
    showStatus(els.status, "ok", `Saved to your diary ✓${link}${readmeNote}`);
  } catch (err) {
    showStatus(els.status, "error", err.message || "Something went wrong. Please try again.");
  } finally {
    els.save.disabled = false;
  }
}

// ---- Start ----

async function init() {
  const stored = await chrome.storage.local.get(["token", "repo", "draft", "noteDraft", "action", "tab"]);
  if (!stored.token || !stored.repo) {
    els.setup.hidden = false;
    return;
  }
  settings = { token: stored.token, repo: stored.repo };
  els.main.hidden = false;
  els.repoName.textContent = `Saving to ${settings.repo}`;

  showAction(stored.action || "");
  refreshAction();

  els.note.value = stored.noteDraft || "";
  els.notePath.textContent = `Saves to ${entryPathFor(localDate())}`;
  els.notes.value = stored.draft || "";
  els.date.value = localDate();
  updatePath();

  // An unsaved retro paste wins, so it isn't hidden behind the other tab.
  selectTab(stored.draft ? "retro" : stored.tab === "retro" ? "retro" : "note");
}

// Keep what they typed if the popup closes before saving.
els.note.addEventListener("input", () => {
  chrome.storage.local.set({ noteDraft: els.note.value });
  clearStatus(els.noteStatus);
});
els.note.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.isComposing) saveNote();
});
els.saveNote.addEventListener("click", saveNote);

els.notes.addEventListener("input", () => {
  chrome.storage.local.set({ draft: els.notes.value });
  resetConfirm();
});
els.date.addEventListener("change", updatePath);
els.save.addEventListener("click", save);

for (const [name, tab] of Object.entries(tabs)) {
  tab.addEventListener("click", () => selectTab(name));
  tab.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") selectTab(name === "note" ? "retro" : "note", { focus: true });
  });
}

$("openSettings").addEventListener("click", () => chrome.runtime.openOptionsPage());
$("startSetup").addEventListener("click", () => chrome.runtime.openOptionsPage());

init();
