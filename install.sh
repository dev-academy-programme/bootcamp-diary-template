#!/usr/bin/env bash
# Installs the `diary` command by adding two lines to your shell config.
set -e

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MARKER=".diary/diary.sh"
BLOCK="
# Dev Academy Diary
export DIARY_REPO=\"$REPO\"
source \"$REPO/$MARKER\""

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
  if [ -f "$rc" ] && grep -qF "$MARKER" "$rc"; then
    echo "Already installed in $rc"
  else
    printf '%s\n' "$BLOCK" >> "$rc"
    echo "Added the diary command to $rc"
  fi
done

echo ""
echo "Done! Open a new terminal window, then try:"
echo "  diary help"
