# Publish from a clean history

Git history is public the moment you push, including every file that was ever committed, every commit message and every author email. A file deleted in a later commit is still there. The only safe way to keep internal material out is to **never push a history that contained it**: start the public repository from a fresh `git init` in a folder that has never held it.

Do this once, before the first push.

## 1. Export the public file set into a new folder

From the working folder (the one that may hold the hidden adoption-notes folder, `PROGRESS.md`, old `.git`, build output):

```bash
node scripts/export-clean.mjs ../faun-publish
```

The destination must be outside the working folder and empty. The script copies exactly what `git add -A` would add (tracked files plus untracked files that `.gitignore` does not exclude), so `node_modules`, `dist`, generated files, `PROGRESS.md`, `.preflight-forbidden` and the adoption-notes folder stay behind, and the old `.git` and its history are never copied. Then it runs `git init -b main` in the destination.

The same thing without the script (a `git archive`-style copy that works with or without an existing `.git`):

```bash
SRC="$PWD"; DEST="$HOME/faun-publish"
test ! -e "$DEST" && mkdir -p "$DEST"
GD="$(mktemp -d)" && git init --bare -q "$GD"
git -c core.excludesFile= --git-dir="$GD" --work-tree="$SRC" ls-files -o --exclude-standard -z \
  | (cd "$SRC" && tar --null -T - -cf -) | tar -xf - -C "$DEST"
rm -rf "$GD"
cd "$DEST" && git init -b main
```

If the working folder is already a git repository and you only want tracked files, `git -C "$SRC" archive HEAD | tar -x -C "$DEST"` is equivalent for committed content; it will not include anything uncommitted, which is usually what you want to review first.

## 2. Set a safe commit identity, then commit once

Every commit publishes its author name and email. Use the GitHub noreply address (GitHub, Settings, Emails, tick "Keep my email addresses private", copy the `ID+username@users.noreply.github.com` address):

```bash
cd ../faun-publish
git config user.name "Your Name"
git config user.email "ID+username@users.noreply.github.com"
git add -A
git commit -m "chore: initial public commit"
```

(`node scripts/export-clean.mjs ../faun-publish --commit --email ID+username@users.noreply.github.com` does steps 1 and 2 together.)

## 3. Scan the files and the history before the first push

```bash
node scripts/preflight-publish.mjs           # files that are tracked, the whole history, the files npm would publish
git log --all -p | grep -inE 'your-private-term|another-term' || echo "history clean"
```

`preflight` already scans every file and every commit for the built-in terms (private project and employer names, personal email addresses, absolute local paths, the adoption-notes folder). Put your own private terms, one regular expression per line, in an **untracked** file named `.preflight-forbidden` in that folder (it is in `.gitignore`), or in the `FAUN_PREFLIGHT_FORBIDDEN` environment variable. The `grep` line above is a second, independent check on the history you are about to publish; edit the terms. If either finds anything, fix it and recreate the export from step 1; do not patch a history you have not pushed yet and then trust it.

It fails while `.github/CODEOWNERS` still has `@OWNER_PLACEHOLDER`; replace it in the working folder and export again, or edit it in the export and amend the commit before pushing.

## 4. Push

Only now, and only when the scan is clean:

```bash
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

The order of everything that follows is in [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md).

## If something internal was already pushed

Deleting the repository does not remove forks, caches or clones, and GitHub keeps unreachable commits reachable by hash for a while. Treat anything secret as exposed: rotate it, then contact GitHub Support to purge cached views, and publish from a new clean repository.
