---
layout: post
title: Github Action for checking if a changelog is updated 
date: 2021-05-12 23:01 +0200
---

At a work project I'm working on, we work in a monorepo. We have a simple way to keep track of changes: a `version.txt` and a `CHANGELOG.md` in the root of the repository, that should be updated for every merge to master.

It is easy to forget this, so I wrote a little [Github Action](https://github.com/features/actions) check that checks if these two files have been updated.

To use Github Actions, just put a workflow recipe in `.github/workflows/`.

Here is a workflow to check if both these files have changed:

```yml
name: Check changelog and version.txt
on:
  pull_request:
    types: [review_requested, ready_for_review, synchronize]

jobs:
  check-changelog-version-txt:
    timeout-minutes: 10
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - name: Check if files have changed
        run:  |
          FILES_CHANGED=$(git diff --name-only origin/master...HEAD | grep -E 'CHANGELOG\.md|version\.txt' -c)
          if [ "$FILES_CHANGED" != "2" ]; then echo "Remember to update CHANGELOG.md and version.txt"; exit 1; fi;
```

This check runs for every pull requests and every commit on that PR. The first step checks out the repository. Note that we have to set `fetch-depth: 0`. This fetches all Git history and not just the current commit: it is needed to be able to run `git diff`.

Then in the next step, we run a `git diff` against `origin/master` to get the list of changes files. We then filter anything that matches `CHANGELOG.md` or `version.txt` (the `-E` flag allows us to use regular expressions with `grep`), and then count the the result (that's the `-c` flag).

If not both of these files have changed, we return a non-zero exit code, and your build will automatically fail :).

Note: there is already a publicly available action that does something similar, see [here](https://github.com/tj-actions/changed-files). The reason I didn't go for that one was partly for security reasons (in principle, the action can read and copy all your code), and partly because I wanted something simple.
