# Setting up your diary

This takes about 5 minutes.

## 1. Create your diary repo

1. On this template's GitHub page, click **Use this template** → **Create a new repository**.
2. Name it `dev-academy-diary` and set it to **Private**.

## 2. Clone it to your laptop

```bash
git clone git@github.com:YOUR-USERNAME/dev-academy-diary.git ~/dev-academy-diary
```

## 3. Install the `diary` command

```bash
bash ~/dev-academy-diary/install.sh
```

Then open a new terminal window.

> [!NOTE]
> On Windows, use Git Bash or WSL.

## Using it

| Command | What it does |
|---|---|
| `diary "Pairing with Mia was fun"` | Adds a note |
| `diary learned "How useEffect cleanup works"` | Adds a note under 💡 Learned |
| `diary stuck "Knex migrations"` | Adds a note under 🧱 Stuck |
| `diary win "We deployed on time"` | Adds a note under 🎉 Wins |
| `diary` | Opens today's notes in VS Code |
| `diary sync` | Saves any changes you made by hand |
| `diary help` | Shows these commands |

Wrap your note in double quotes, especially if it has an apostrophe.

## Saving retro notes

Use the **Dev Academy Diary** Chrome extension. Paste the notes from the retro page, and it saves them to the `retros` folder and updates this README.
