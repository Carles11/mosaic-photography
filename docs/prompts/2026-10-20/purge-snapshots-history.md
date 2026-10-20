# Purge the 3 URL-inspection snapshots from git history

> Procedure for Carles (Git Bash on hp-omen). Not an agent prompt.
> Task 4 #1 in `docs/TASKS.md`. Decided 2026-10-20: purge (repo is public).
> Written 2026-10-20. Destructive part = step 5 (force-push). Stop at each **STOP**.

## Scope (checked by Claude 2026-10-20, read-only)

Files to remove from all history:

```
seo-reports/11-09-2026/url-inspections/https-www-mosaic-photography.html
seo-reports/11-09-2026/url-inspections/https-www-mosaic-photography-after-fixes.html
seo-reports/11-09-2026/url-inspections/https-www-mosaic-photography-after-fixes-2.html
```

- Added in `25667e9`, `efb9cec`, `7b442d4` (2026-09-11); removed from the index in `63d849c` (2026-10-20).
- Only branch containing them: `main` (local and `origin`). No other branch, tag or stash.
- The 2 contributor emails appear in **no other file** in any commit (`git log --all -S`).
- `tested-live-page-js-console-messages.md` in the same folder was never committed; it stays.
- `.gitignore` line 56 (`seo-reports/**/url-inspections/*.html`) already stops re-adding them.
- Effect: **40 commits on `main` get new hashes** (`25667e9` … `306b8f1`). The
  final tree of `main` is unchanged (the files are already gone from HEAD), so
  Amplify builds the same site. 12 hashes cited in `docs/TASKS.md`,
  `docs/RUNBOOKS.md` and `claude/START-HERE.md` go stale → step 7.

Method: GitHub's "Removing sensitive data from a repository" doc
(git-filter-repo ≥ 2.47 with `--sensitive-data-removal`), except we push only
`main` instead of `--mirror`, because only `main` is affected.

---

## 1. Install git-filter-repo (Git Bash, anywhere)

```bash
python --version
python -m pip install --user --upgrade git-filter-repo
python -m pip show git-filter-repo | grep Version
git filter-repo -h | grep -c sensitive-data-removal
```

Expected: Python 3.x; Version **2.47.0 or later**; last line prints `1` or more.
If `git filter-repo` says "not a git command", pip's Scripts folder isn't on PATH:

```bash
export PATH="$PATH:$(python -c 'import sysconfig;print(sysconfig.get_path("scripts","nt_user"))')"
git filter-repo -h | grep -c sensitive-data-removal
```

## 2. Backup: mirror clone (non-destructive)

```bash
mkdir -p /c/Users/elcar/Documents/aaa_repos/_backup && cd /c/Users/elcar/Documents/aaa_repos/_backup
git clone --mirror git@github.com:Carles11/mosaic-photography.git mosaic-photography-pre-purge-2026-10-20.git
git -C mosaic-photography-pre-purge-2026-10-20.git rev-parse main 'main^{tree}'
```

Expected: two hashes; the first starts with `306b8f1`. Note the second one (old tree hash).
This backup still contains the emails. Keep it private, delete it after step 8.

## 3. Rewrite in a fresh clone

```bash
mkdir -p /c/Users/elcar/Documents/aaa_repos/_purge && cd /c/Users/elcar/Documents/aaa_repos/_purge
git clone git@github.com:Carles11/mosaic-photography.git
cd mosaic-photography
git filter-repo --sensitive-data-removal --invert-paths \
  --path seo-reports/11-09-2026/url-inspections/https-www-mosaic-photography.html \
  --path seo-reports/11-09-2026/url-inspections/https-www-mosaic-photography-after-fixes.html \
  --path seo-reports/11-09-2026/url-inspections/https-www-mosaic-photography-after-fixes-2.html
```

Expected: ends with "Completely finished after …" and lists **First Changed
Commit(s)** (should be `25667e9…`). Copy that output into a text file; GitHub
Support needs it in step 6.

## 4. Verify before pushing

```bash
git log --all --oneline -- seo-reports/11-09-2026/url-inspections/ | wc -l
git rev-parse 'main^{tree}'
git log --oneline -3
grep -c '^refs/pull/.*/head$' .git/filter-repo/changed-refs
git remote -v
```

Expected:
- first line `0` (files gone from every ref)
- tree hash **identical** to the old tree hash from step 2 (site content unchanged)
- top 3 commits have the same messages as before, new hashes
- PR refs count: `0` or a small number (each affected PR is reported to Support)
- `origin` still points to `git@github.com:Carles11/mosaic-photography.git`
  (if it's missing: `git remote add origin git@github.com:Carles11/mosaic-photography.git`)

**STOP. Send Claude screenshots of:**
1. the step 4 output;
2. GitHub → repo → *Settings* → *Branches* / *Rules* (is force-push on `main` blocked?);
3. GitHub → repo → *Insights* → *Forks* (forks keep the old data; Support can't remove it from forks).

If anything differs from "Expected": delete `_purge` and stop. Nothing has changed on GitHub yet.

## 5. Force-push `main` (destructive, irreversible for the public history)

Only after Claude's go on the screenshots. If a rule blocks force-push, disable
it temporarily and re-enable it right after.

```bash
cd /c/Users/elcar/Documents/aaa_repos/_purge/mosaic-photography
git push --force origin main
```

Expected: `+ 306b8f1...<new> main -> main (forced update)`.
Amplify starts a build of the same tree; the site doesn't change.

## 6. GitHub Support ticket

https://support.github.com → *Contact support* → topic about removing sensitive data.
Text (fill in the bracketed parts):

> Repository: Carles11/mosaic-photography (public). I removed three committed
> HTML snapshots that contained personal email addresses using git-filter-repo
> --sensitive-data-removal and force-pushed main. First changed commit(s):
> [paste from step 3]. Affected pull requests: [count from step 4]. Please
> remove cached views of the old commits and run garbage collection so the old
> commits are no longer reachable by SHA. The data is personal data, not a
> credential, so rotation is not possible.

Until Support confirms, old commits stay reachable by direct SHA URL
(e.g. `/commit/25667e9`), so the leak isn't fully closed until then.

## 7. Re-sync the working copy + hash map

The working copy `aaa_repos/mosaic-photography` still has the old history.
`main` is the only branch affected; the other local branches and the stashes
don't contain these commits.

```bash
cd /c/Users/elcar/Documents/aaa_repos/mosaic-photography
git status --short
```

Must print nothing (commit or stash first otherwise). Then:

```bash
git fetch origin
git checkout main
git reset --hard origin/main
git log --oneline -3
cp /c/Users/elcar/Documents/aaa_repos/_purge/mosaic-photography/.git/filter-repo/commit-map /c/Users/elcar/Documents/aaa_repos/_backup/commit-map-2026-10-purge.txt
```

Expected: the same new hashes as in step 4. The ignored snapshot files on disk stay
(they're outside git; move them to `C:\Users\elcar\Documents\WEBs\Mosaic` if you
want them out of the repo folder).
Then tell Claude: it maps the 12 old hashes cited in the docs to the new ones
(from `commit-map`) and appends the map to `docs/TASKS.md` under Task 4 #1.

Any other clone (other PC, openCode workspace) must be re-cloned, never merged
or pushed from, or it brings the old commits back.

## 8. Clean up (after Support confirms)

- Delete `_purge`.
- Delete `_backup/mosaic-photography-pre-purge-2026-10-20.git` (contains the
  emails). Keep `commit-map-2026-10-purge.txt`.
- Re-check: open `https://github.com/Carles11/mosaic-photography/commit/25667e9`
  → should be 404.

## Rollback

- Before step 5: delete `_purge`. Nothing changed.
- After step 5: `git push --force` from the backup mirror would restore the old
  history *including the emails*. Only for a broken `main`, never routinely.

Source: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
