import { testConnection, parseRepo } from "./github.js";

const $ = id => document.getElementById(id);
const repoInput = $("repo");
const tokenInput = $("token");
const status = $("status");
const disconnect = $("disconnect");

function showStatus(kind, text) {
  status.className = `status ${kind}`;
  status.textContent = text;
}

async function init() {
  const { token, repo } = await chrome.storage.local.get(["token", "repo"]);
  if (repo) repoInput.value = repo;
  if (token) {
    tokenInput.value = token;
    disconnect.hidden = false;
  }
}

$("save").addEventListener("click", async () => {
  const repo = parseRepo(repoInput.value);
  const token = tokenInput.value.trim();
  if (!repo) return showStatus("warn", "Enter your repo as your-username/repo-name.");
  if (!token) return showStatus("warn", "Paste your GitHub token.");

  showStatus("warn", "Checking…");
  try {
    const info = await testConnection({ token, repo });
    await chrome.storage.local.set({ token, repo: info.fullName });
    await chrome.storage.local.remove("action");
    repoInput.value = info.fullName;
    disconnect.hidden = false;
    if (info.isPrivate) {
      showStatus("ok", `Connected to ${info.fullName} ✓ You can close this tab.`);
    } else {
      showStatus("warn", `Connected to ${info.fullName}, but this repo is public, so anyone can read your diary. You can make it private in the repo's settings on GitHub.`);
    }
  } catch (err) {
    showStatus("error", err.message);
  }
});

disconnect.addEventListener("click", async () => {
  await chrome.storage.local.remove(["token", "repo", "draft", "noteDraft", "action"]);
  tokenInput.value = "";
  disconnect.hidden = true;
  showStatus("ok", "Disconnected. Your token has been removed from this browser.");
});

init();
