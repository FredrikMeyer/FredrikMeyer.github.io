---
layout: post
title: Making Emacs use correct Python interpreter in a virtual environment
date: 2020-08-26 21:33 +0200
tags: programming emacs
---

I like to be able to test things interactively in a Python shell when exploring a new package. I also don't like to exit Emacs when I don't have to. So I'd like to be able to run `C-c C-p` (or `run-python`) directly from Emacs.

I use the `pyvenv` package to manage virtual environments within Emacs. It works well, but it doesn't automaticlly set the correct Python interpreter that I expect when I change virtual environments.

So I added this to my `init.el`:

```elisp
(use-package pyvenv
  :ensure t
  :config
  (pyvenv-mode t)

  ;; Set correct Python interpreter
  (setq pyvenv-post-activate-hooks
        (list (lambda ()
                (setq python-shell-interpreter (concat pyvenv-virtual-env "bin/python3")))))
  (setq pyvenv-post-deactivate-hooks
        (list (lambda ()
                (setq python-shell-interpreter "python3")))))

```

Now, when I press `C-c C-p`, the Python shell interpreter that starts is the one in the virtual environment.

So my workflow is this: activate the virtual environment with `M-x pyvenv-activate`, experiment in a Python shell (started with `C-c C-p`), profit.

(I use `lsp-mode` and [Python Language Server](https://github.com/palantir/python-language-server) for IDE-like features, but that is another post...)
