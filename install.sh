#!/usr/bin/env bash
# Installs the `diary` command by adding two lines to your shell config.
set -e

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MARKER=".diary/diary.sh"
BLOCK="
# Dev Academy Diary
export DIARY_REPO=\"$REPO\"
if [ -f \"$REPO/$MARKER\" ]; then source \"$REPO/$MARKER\"; fi"
# The if means a deleted diary folder just turns the command off, with no error in every new terminal.

configs=()
[ -f "$HOME/.zshrc" ] && configs+=("$HOME/.zshrc")
[ -f "$HOME/.bashrc" ] && configs+=("$HOME/.bashrc")

# No config yet: create one for the shell they use.
if [ ${#configs[@]} -eq 0 ]; then
  case "$SHELL" in
    */zsh) configs=("$HOME/.zshrc") ;;
    *)     configs=("$HOME/.bashrc") ;;
  esac
fi

for rc in "${configs[@]}"; do
  if [ -f "$rc" ] && grep -qF "export DIARY_REPO=\"$REPO\"" "$rc"; then
    echo "Already installed in $rc"
  elif [ -f "$rc" ] && grep -qF "$MARKER" "$rc"; then
    # Installed from another folder (the repo was moved or cloned again): point it here instead.
    tmp="$(mktemp)"
    grep -vF -e "# Dev Academy Diary" -e "export DIARY_REPO=" -e "$MARKER" "$rc" > "$tmp" || true
    cat "$tmp" > "$rc" && rm -f "$tmp"
    printf '%s\n' "$BLOCK" >> "$rc"
    echo "Updated the diary command in $rc to use $REPO"
  else
    printf '%s\n' "$BLOCK" >> "$rc"
    echo "Added the diary command to $rc"
  fi
done

echo ""
echo "Done! Open a new terminal window, then try:"
echo "  diary help"
