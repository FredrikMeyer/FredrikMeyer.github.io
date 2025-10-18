---
layout: post
title: All the ways I use AI
date: 2025-07-02 13:24 +0200
tags: ai programming
---

I had some very nice experiences with Claude Code recently, and I realized it would be fun to write down all the ways I use AI today (highly likely it will all change within the next year!).

For context, I am a software developer, these days I mainly use Kotlin and Next.js at work.

## Tools I use

### Raycast AI

I use [Raycast](https://www.raycast.com/) as a Spotlight replacement on Mac. I have bound <kbd>TAB</kbd> to its "Quick AI" feature (which at the moment uses GPT-4o).

I use it a lot for quick questions that don't require a conversation. This has for a large part replaced Google searches for me. Sometimes I just write "postgres literal json array", and I get the right response faster than a Google search.

(for some reason it doesn't support multi-line chat questions, which is a bit annoying with code questions...)

### ChatGPT desktop/phone app

I have had a ChatGPT subscription for a while now. I use it for longer conversations and random questions. I have tried the conversational feature, but I prefer writing. Common uses for me are recipe suggestions when shopping groceries, explaining words, et cetera. 

### Claude desktop app

I have a Garmin watch, and I use [GarminDB](https://github.com/tcgoetz/GarminDB) to export activity and heart rate data to a local SQLite database. I found a [JDBC MCP Server](https://github.com/quarkiverse/quarkus-mcp-servers/tree/main/jdbc), and I wanted to see what the AI could do with the data.

[{% picture /assets/claude_heart_rate.png style="float: right" --alt Screenshot of Claude Artifact %}](/assets/claude_heart_rate.png)

I was impressed, see the picture. After reading and understanding the database, it produced a HTML file with a nice plot.


### IntelliJ's Junie

Junie was the first agentic AI I tried (I got access to the early preview program). I used it to help me learn OpenGL in Java (which may be a topic for a future blog post). See [this repo](https://github.com/FredrikMeyer/minimal-lwjgl) for some example commits (those with "thx Junie" in the commit message).

I have also used it to write integration tests that requires a lot of setup or boilerplate code.

It understands the Java eco system quite well, and the generated code is quite good. Unfortunately it couldn't browse the internet last time I tried it, so it will often pull old versions of libraries. It doesn't seem to have access to IntelliJ's refactoring functionality (it edits one file at a time).

### Claude Code

I have tried Claude Code a few times. At the moment I'm using an API key to connect (which according to Google searches is probably more expensive if I were using it a lot). 

With Claude Code I could go a lot further with exploring the data from my Garmin watch. I asked it to use the [R programming language](https://www.r-project.org/) to analyze and plot the data, and summarize everything in a PDF using LaTeX.

[{% picture /assets/sleep_category_hr_boxplot.png style="float: right" --alt Sleep categories %}](/assets/sleep_category_hr_boxplot.png)

On question I wanted to answer was if bad sleep affected heart rates the following day. By analyzing the sleep scores and comparing with heart rates, it produced the plot on the right side.

We see a fairly clear association between bad sleep and average heart rate (it turns out the opposite question also is true: higher heart rate (stress) leads to worse sleep).

### LLM CLI

Another tool is Simon Willison's `llm` [CLI tool](https://github.com/simonw/llm).

The last six months I've gotten the habit of ending every work day by writing a few short sentences about what I did that day. I can copy all the days to the clipboard, and ask an LLM questions about how I've worked. For example:

```
> pbpaste | llm 'List the three things I have spent the most time on. Respond very succinctly, in English.'
1. Working on statistics and data accuracy for various reports.
2. Addressing issues and bugs related to processing and API integration.
3. Participating in and leading numerous meetings for alignment and planning.
```

The `llm` tool is also quite useful when in offline environments. It supports using models from [Ollama](https://ollama.com/search), running directly on my Mac. It is slower, but very useful when I don't remember some standard library functions, or some awkward `awk` syntax.


### Notebook LM

Google's Notebook LM lets you upload PDF's and you can ask questions about it. Its most famous feature is that it can make a podcast of the contents one has uploaded.

I did this with my [PhD thesis](https://notebooklm.google.com/notebook/d923aeac-f4b0-4da2-8916-faac82c44f72), and it was quite fun to hear. The most noticable thing is that the hosts are _extremely_ positive about simple ideas.

## Future ideas

I want to test more AI packages in Emacs, for example [`gptel`](https://github.com/karthink/gptel). It would also be fun to try to write some AI agent at some point, for example using JetBrain's [Koog](https://github.com/JetBrains/koog) or [Pydantic's framework for Python](https://ai.pydantic.dev/#tools-dependency-injection-example).

## My view on AI

For software engineering, AI is very good, used right. I find that for autocompletion it can sometimes be more distracting than useful. Good uses include:
 - Code review
 - Spotting bugs
 - Writing boring code

Bad (or worse) uses include:
 - Big tasks without clear boundaries
 - Illustrations for presentations
 - Writing prose. (actually, I _really_ dislike this use: it is good for correcting prose or suggesting change, but AI-written text is bad for sooo many reasons.)
