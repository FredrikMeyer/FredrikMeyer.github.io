---
layout: post
title: How I use Tmux
date: 2023-05-31 19:21 +0000
published: true
tags: programming
---

When working in the terminal, I like to move efficiently between panes. To do this I use [tmux](https://github.com/tmux/tmux/wiki), which is a _terminal multiplexer_. I had to look that word up, so here is what [Wikipedia](https://en.wikipedia.org/wiki/Terminal_multiplexer) says:

> A terminal multiplexer is a software application that can be used to multiplex several separate pseudoterminal-based login sessions inside a single terminal display, (...)

A _multiplexer_ is a device that combines several signal sources into a single signal. So in short, _tmux_ lets you combine several terminal sessions into a single one. It also remembers the configuration if you manage to close your terminal, since the `tmux` server keeps running in the background.

Let's just dive into how I would start a day at work. After typing `tmux` my terminal looks something like this:

![Tmux start](/assets/tmux_1.png)

Then I press `ctrl+b` and `%` to split the terminal into two horizontal panes (to split vertically, type `ctr+b` and `"`). I can use `ctrl+b` and the arrow keys to jump between panes.

Now I can run for example `yarn typecheck --watch` in the left pane, a dev server in the bottom right, and a free terminal in the upper right pane.

![Tmux with panes](/assets/tmux_2.png)

If I think it starts to get too crowded, I can type `ctrl+b` and `:` and write `new-window`, to start fresh with zero panes (these are the numbers at the bottom in the pictures). To navigate between windows I would use `ctr+b` and `n/p` (next/previous).

I use a very simple configuration file (put it in `~/.tmux.conf`):

```conf
set -g mouse on

bind c new-window -c "#{pane_current_path}"
bind '"' split-window -c "#{pane_current_path}"
bind % split-window -h -c "#{pane_current_path}"
```

The configuration file does two things: first, by default mouse actions are not supported, so I enable it (which lets me copy text by marking it, for example). The second options make sure that new panes and windows are opened in the same directory as the original pane.

There is of course a lot more you can do, but at this point, these are the commands I use the most. For more inspiration (and better guides than this one), see for example thr [awesome-tmux](https://github.com/rothgar/awesome-tmux) repository. This was not meant to be a guide, for that I would recommend the [official documentation](https://github.com/tmux/tmux/wiki/Getting-Started#splitting-the-window).
