# Setting up your diary

Your diary is a private GitHub repo where you keep quick notes from each day and your Friday retro notes. You can add to it in two ways:

- the **`diary` command** in your terminal
- the **Dev Academy Diary** Chrome extension

Setup takes about 15 minutes. Do the steps in order.

## Before you start

You need:

- a GitHub account
- git on your laptop, connected to GitHub with an SSH key
- Chrome, Edge, Arc or Brave

> [!NOTE]
> On Windows, run every terminal command in Git Bash or WSL.

## 1. Create your diary repo

1. At the top of this page, click **Use this template** → **Create a new repository**.
2. Name it `dev-academy-diary`.
3. Choose **Private**. Your diary is just for you.
4. Click **Create repository**.

You can use a different name if you like. Just use it instead of `dev-academy-diary` in the steps below.

## 2. Clone it to your laptop

In your terminal, run this. Change `YOUR-USERNAME` to your GitHub username:

```bash
git clone git@github.com:YOUR-USERNAME/dev-academy-diary.git ~/dev-academy-diary
```

If you see `Permission denied (publickey)`, your SSH key isn't set up yet. Ask a facilitator for help.

## 3. Install the `diary` command

Go into your diary folder and run the installer:

```bash
cd ~/dev-academy-diary
bash install.sh
```

If you cloned it somewhere else, `cd` into that folder instead. The `diary` command works wherever your diary is.

**Open a new terminal window**, then try it:

```bash
diary learned "How to set up my diary"
```

You should see `Saved to 💡 Learned ✓`. Open your repo on GitHub and you'll find the note in the `entries` folder.

## 4. Install the Chrome extension

The extension is already in your diary, in the `extension` folder.

1. In Chrome, go to `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose the `extension` folder inside your diary folder.
4. Click the puzzle icon in the toolbar, then the pin next to **Dev Academy Diary**.

Chrome loads the extension from that folder, so don't move or delete it.

## 5. Connect the extension to your diary

The extension needs a GitHub token to save to your repo. The token only works for your diary repo, nothing else.

1. Click the extension icon, then **Set up**.
2. On the settings page, click the link to **GitHub's new token page**.
3. Name the token `Dev Academy Diary`.
4. For **Expiration**, pick a date after your course ends.
5. Under **Repository access**, choose **Only select repositories** and pick `dev-academy-diary`.
6. Under **Permissions** → **Repository permissions**, set **Contents** to **Read and write**.
7. Click **Generate token** and copy it. GitHub only shows it once.
8. Back in the extension settings, enter your repo as `YOUR-USERNAME/dev-academy-diary`, paste the token and click **Save and test**.

You're all set! 🎉

## Using it

### From the terminal

| Command | What it does |
|---|---|
| `diary "Pairing with Mia was fun"` | Adds a note |
| `diary learned "How useEffect cleanup works"` | Adds a note under 💡 Learned |
| `diary stuck "Knex migrations"` | Adds a note under 🧱 Stuck |
| `diary win "We deployed on time"` | Adds a note under 🎉 Wins |
| `diary` | Opens today's notes in VS Code |
| `diary sync` | Saves changes you made by hand |
| `diary help` | Shows these commands |

Wrap your note in double quotes, especially if it has an apostrophe: `diary "It's working"`.

### From Chrome

- **Quick note:** click the extension icon, pick a type of note, type it and press Enter. It goes into the same daily file as the `diary` command.
- **Retro notes:** on the retro page, click **Copy my notes**. Then click the extension icon, open **Retro notes**, paste, check the date and click **Save to my diary**. Your action for next week shows at the top of the extension and of your diary's README.

### Interview stories

When something in a retro would make a good interview answer, copy it into [stories.md](stories.md) as a STAR story.

## If something goes wrong

| What you see | What to do |
|---|---|
| `diary: command not found` | Open a new terminal window. If it still happens, go into your diary folder and run `bash install.sh` again. |
| `Can't find your diary repo` | Your diary folder has moved since you installed. Go into the folder where it is now and run `bash install.sh`, then open a new terminal. |
| `Saved on this laptop. It will go to GitHub next time...` | You're offline, or GitHub couldn't be reached. Your note is safe. Run `diary sync` later. |
| Extension: `Your GitHub token isn't working` | Your token has probably expired. Make a new one (step 5 above) and paste it into the extension settings. |
| Extension: `Your token can't write to this repo` | Edit your token on GitHub and set **Contents** to **Read and write**. |
| Extension: `Can't find your diary repo` | Check the repo name in the extension settings is `YOUR-USERNAME/dev-academy-diary`, and that your token has access to that repo. |
| The extension disappeared from Chrome | You may have moved or deleted your diary folder. Load it again (step 4). |

## Removing the diary command

You don't need to remove it. It only runs when you type `diary`, and if you delete your diary folder it simply stops working.

To remove it completely:

1. Open your shell config in VS Code: `code ~/.zshrc` (or `code ~/.bashrc` if you use bash).
2. Delete the three lines under `# Dev Academy Diary`, and save.
3. Open a new terminal window.

To remove the extension, go to `chrome://extensions` and click **Remove** on its card.
