# Dev Academy Diary: the `diary` terminal command.
# install.sh loads this file from your shell config.

_diary_help() {
  cat <<'HELP'
Dev Academy Diary

  diary "your note"            Add a note
  diary learned "your note"    Add under 💡 Learned
  diary stuck "your note"      Add under 🧱 Stuck
  diary win "your note"        Add under 🎉 Wins
  diary                        Open today's notes in VS Code
  diary sync                   Save changes you made by hand
  diary help                   Show this help
HELP
}

_diary_push() {
  # Push, and if GitHub has newer changes (e.g. a retro saved by the extension), pull and retry.
  git -C "$1" push -q >/dev/null 2>&1 && return 0
  _diary_pull "$1" && git -C "$1" push -q >/dev/null 2>&1
}

_diary_pull() {
  # If the pull hits a conflict, undo it so the repo isn't left halfway through a rebase.
  git -C "$1" pull --rebase --autostash -q >/dev/null 2>&1 && return 0
  git -C "$1" rebase --abort >/dev/null 2>&1
  return 1
}

_diary_commit_and_push() {
  local repo="$1" message="$2" done_text="$3"
  git -C "$repo" add -A entries >/dev/null 2>&1
  if git -C "$repo" diff --cached --quiet; then
    echo "Nothing new to save."
    return 0
  fi
  git -C "$repo" commit -qm "$message" >/dev/null
  if _diary_push "$repo"; then
    echo "$done_text"
  else
    echo "Saved on this laptop. It will go to GitHub next time you're online (or run: diary sync)."
  fi
}

diary() {
  local repo="${DIARY_REPO:-$HOME/dev-academy-diary}"
  if [ ! -d "$repo/.git" ]; then
    echo "Can't find your diary repo at $repo"
    echo "Clone it there, or run install.sh again from inside the repo."
    return 1
  fi

  local today file
  today="$(date +%Y-%m-%d)"
  file="$repo/entries/$today.md"

  case "$1" in
    help|-h|--help) _diary_help; return 0 ;;
    sync) _diary_commit_and_push "$repo" "Diary: $today" "Synced ✓"; return $? ;;
  esac

  # Get any changes from GitHub first (the extension saves there directly).
  _diary_pull "$repo" || true

  mkdir -p "$repo/entries"
  [ -f "$file" ] || printf '# %s\n' "$(date '+%A %-d %B %Y')" > "$file"

  if [ $# -eq 0 ]; then
    if command -v code >/dev/null 2>&1; then
      code "$file"
      echo "Opened today's notes. Run 'diary sync' when you're done."
    else
      echo "Today's notes: $file"
    fi
    return 0
  fi

  local section="📝 Notes"
  case "$1" in
    learned) section="💡 Learned"; shift ;;
    stuck)   section="🧱 Stuck";   shift ;;
    win)     section="🎉 Wins";    shift ;;
  esac

  if [ $# -eq 0 ]; then
    echo "Add your note after the word, e.g. diary learned \"How props work\""
    return 1
  fi

  local line="- $(date +%H:%M) $*"

  if grep -qxF "## $section" "$file"; then
    # Insert after the last note in that section.
    awk -v sec="## $section" -v line="$line" '
      NR == FNR {
        if ($0 == sec) { insec = 1; last = FNR; next }
        if (insec && /^## /) insec = 0
        if (insec && $0 != "") last = FNR
        next
      }
      { print; if (FNR == last) print line }
    ' "$file" "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  else
    printf '\n## %s\n%s\n' "$section" "$line" >> "$file"
  fi

  _diary_commit_and_push "$repo" "Diary: $today" "Saved to $section ✓"
}
