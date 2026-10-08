# Dev Academy Diary: Chrome extension

Save quick notes, journal entries and Friday retro notes to your diary repo on GitHub, straight from Chrome. The popup also shows your action for this week.

Works in Chrome, Edge, Arc and Brave.

> [!NOTE]
> This folder is part of your diary repo. The full setup guide is in `SETUP.md`, one folder up.

## Install

1. In Chrome, go to `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose this `extension` folder in your diary repo.
4. Pin it: click the puzzle icon in the toolbar, then the pin next to **Dev Academy Diary**.

Chrome loads the extension from this folder, so don't move or delete it.

## Connect it to your diary

Click the extension icon, then **Set up**. The settings page walks you through making a GitHub token that can only access your diary repo. When it asks for an expiry date, pick one after your course ends.

## Using it

**Quick note:** click the extension icon, pick 📝 Note, 💡 Learned, 🧱 Stuck or 🎉 Win, type your note and press Enter. It goes into today's file in `entries/`, the same file the `diary` terminal command uses.

**Journal:** open the **Journal** tab for longer writing about your day. Write as much as you like, then click **Save entry** or press ⌘/Ctrl + Enter. It goes into today's file under 📓 Journal, with your line breaks kept.

**Retro notes:**

1. On the retro page, click **Copy my notes**.
2. Click the extension icon, open **Retro notes** and paste.
3. Check the date, then click **Save to my diary**.

The action from your newest retro shows at the top of the popup.

## Updating

Your diary doesn't get new versions automatically. When your facilitator says there's a new one:

1. On the diary template's GitHub page, click **Code** → **Download ZIP** and unzip it.
2. Copy the files from its `extension` folder into this folder, replacing the old ones.
3. In `chrome://extensions`, click the ↻ reload button on the extension's card.

Your settings stay saved as long as this folder stays in the same place.

---

## For developers

| File | What it does |
|---|---|
| `manifest.json` | Extension setup and permissions |
| `popup.html`, `popup.js` | The popup: quick notes, journal and retro notes |
| `options.html`, `options.js` | Settings: repo name and token |
| `github.js` | Reads and saves files with the GitHub API |
| `retro.js` | Finds the action in the notes and updates the README |
| `notes.js` | Adds quick notes and journal entries to the day's file in `entries/` |
| `styles.css` | Shared styles |
