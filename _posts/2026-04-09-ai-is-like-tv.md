---
layout: post
title: AI is like TV
tags: programming
date: 2026-04-09 18:34 +0200
---

AI is like TV (or books before that). It started some years ago with asking ChatGPT about code constructs, then suddenly we were here: running agents in several terminals, producing more code than before, the programmer reduced to someone who just presses "accept" / "reject" / "think harder".

> What happened to challenging side projects? (just let an agent do it, but where's the fun in that!)

Socrates thought writing [would weaken our minds](https://www.historyofinformation.com/detail.php?id=3439) (because people would read and retrieve information without understanding it). When television came, people said it would [dull our minds](https://en.wikipedia.org/wiki/Social_aspects_of_television#Negative_effects_of_television). Today it is not hard to [predict the same thing about our use of AI](https://time.com/7295195/ai-chatgpt-google-learning-school/).

A programmer functions as an intermediary between business people and hardware, by writing software. A programmer's job is to "[deliver code you have proven to work](https://simonwillison.net/2025/Dec/18/code-proven-to-work/)" (in the words of Simon Willison). Our job is not to write code, but to deliver code. Or to be even clearer: our job is to deliver _systems_ that function well[^1] (systems that someone is willing to pay for).

To stay useful in the "knowledge sector", one must _produce_ and _learn_ at the same time. Sometimes these forces are not compatible. You will produce more code if you skip testing, but in the long run your project will stall. Pure vibe coding will get you very far, but as systems tend to grow in complexity, one needs more and more resources to keep developing.

My Norwegian teacher used to say books should be a struggle to read. Books should fight against you. At the time I couldn't possibly see what the point of _willfully_ fighting a book was, but there is value in opposition. Hard books often end up being the most rewarding books.

How do programmers learn? By experiencing the hard way that this choice was a bad choice, that tests are helpful, that breaking schemas is bad, that nullability is a pain, that any type of migration should be done in several steps, that logging should be done _before_ something happens (rather than after), that more code is bad[^2].

When programming with AI, code flows on the screen, maybe you read it, maybe you skim it, but you did not _write_ it. Programming suddenly feels more like scrolling Instagram than a craft.

> Claude wrote plenty of tests, let me skim through them...

As AI writes more of the codebase, [cognitive debt](https://simonwillison.net/2026/Feb/15/cognitive-debt/) takes over from technical debt. As long as we still care about the codebase, one must spend _more_ effort, not less, keeping the codebase tidy in order to understand it (especially important is readable tests), unless one has gone full "[gas town](https://github.com/gastownhall/gastown)."

My hope is that AI will lead us to a situation where we as programmers will spend more time _thinking about the problem domain_[^3] and less time _typing code_. We must not fall into the temptation of writing even _more_ code. The AI (Claude, Github Copilot CLI, Gemini CLI, etc etc) is our very helpful partner, and it should help us [review](https://batsov.com/articles/2026/03/11/essential-claude-code-skills-and-commands/#review--code-review), create, and [simplify](https://github.com/anthropics/claude-plugins-official/blob/7ed523140f506611c968a0ec32e1dfc40a1d5673/plugins/code-simplifier/agents/code-simplifier.md). AI's are very good discussion partners, but unless chastised, they are still overly verbose.

This demands some discipline. The same kind of discipline one has when one reads the _whole_ newspaper article and not only the first paragraph. Or closer to home: the same kind of discipline one has when one writes the test before the implementation.

I'll end my little stream of thought by a quote by [Kelly Clarkson](https://genius.com/Kelly-clarkson-stronger-what-doesnt-kill-you-lyrics)[^4]:

> What doesn't kill you makes you stronger.

[^1]: For some definition of _well_.

[^2]: In my experience, some things aren't really taught. Some knowledge is earnt over time.

[^3]: Meaning talking to domain experts, stakeholders, but also turning off the screen and trying out [hammock-driven development](https://youtu.be/f84n5oFoZBc?si=weB9MOEspb_Py27g).

[^4]: I'm trying to be funny, it's Friedrich Nietzsche.



