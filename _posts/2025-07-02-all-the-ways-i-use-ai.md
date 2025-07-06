---
layout: post
title: All the ways I use AI
date: 2025-07-02 13:24 +0200
---

I had some very nice experiences with Claude Code recently, and I realized it would be fun to write down all the ways I use AI today (highly likely it will all change within the next year!).

For context, I am a software developer, these days I mainly use Kotlin and Next.js at work.

## Tools I use

### Raycast AI

I use [Raycast](https://www.raycast.com/) as a Spotlight replacement on Mac. I have bound <kbd>TAB</kbd> to its "Quick AI" feature (which at the moment uses GPT-4o mini).

I use it a lot for quick questions that doesn't require a conversation. This has for a large part replaced Google searches for me. Sometimes I just write "postgres literal json array", and I get the right response faster than a Google search.

### ChatGPT desktop/phone app

I have had a ChatGPT subscription for a time now. I use it for longer conversations and random questions. I have tried the conversational feature, but I prefer writing. I

### Claude desktop app

I have a Garmin watch, and I use [GarminDB](https://github.com/tcgoetz/GarminDB) to export activity and heart rate data to a local SQLite database. I found a [JDBC MCP Server](https://github.com/quarkiverse/quarkus-mcp-servers/tree/main/jdbc), and I wanted to see what the AI could do with the data.

I was impressed. After reading and understanding the database, it produced a HTML file with a nice plot.

[{% picture /assets/claude_heart_rate.png style="float: right" --alt Screenshot of Claude Artifact %}](/assets/claude_heart_rate.png)


### IntelliJ's Junie

Junie was the first agentic AI I tried (I got access to the early preview program). I used it to help me learn OpenGL in Java (which may be a topic for a future blog post). See [this repo](https://github.com/FredrikMeyer/minimal-lwjgl) for some example commits (those with "thx Junie" in the commit message).

I have also used it to write integration tests that requires a lot of setup or boilerplate code.

It understands the Java eco system quite well, and the generated code is quite good. Unfortunately it cannot browse the internet, so it will often pull old versions of libraries. It doesn't seem to have access to IntelliJ's refactoring functionality (it edits one file at a time).

### Claude Code

I have tried Claude Code a few times. At the moment I'm using an API key to connect (which according to Google searches is probably more expensive if I were using it a lot). 

I have two anectodes here.

[historien om hjertedata]

[komme i gang med Lean]

### LLM CLI

Another tool is Simon Willison's `llm` [CLI tool](https://github.com/simonw/llm).

The last six months I've gotten the habit of ending every work day by writing a few short sentences about what I did that day.

```
pbpaste | llm '....'
```


### Notebook LM


## Future ideas

## My view on AI

Raycast tab
chatgpt app
chatgpt phone app
claude app
claude code
intellij junie
github copilot
llm CLi
notebook lm
