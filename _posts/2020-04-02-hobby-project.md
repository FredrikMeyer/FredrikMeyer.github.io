---
layout: post
title: Proof of concept chat app
date: 2020-04-02 10:05 +0200
---

I had some time in between projects at work, so I have spent some spare time trying to learn new stuff. I have for a while wanted to learn about web sockets, so I decided to try to write a simple chat app. Turns out, I had to learn about a lot of other stuff as well. This is a short write up to summarise (mostly) for myself what I've learned.

I chose Clojure as the backend language, because I have a fascination for languages in the LISP (*list processing*) family. On the frontend I used [Create React App](https://create-react-app.dev/) to bootstrap a React + [Typescript](https://www.typescriptlang.org/index.html) app with sane defaults.

Before I explain the implementation, open it [here](https://gifted-antonym-271008.firebaseapp.com/). Try to open it in two browser windows, and type something.

## Technologies used

To get some context and list some buzzwords, here's the complete tech stack. The backend is written in [Clojure](https://clojure.org/) running in a [Docker](https://www.docker.com/) container on [Google App Engine](https://cloud.google.com/appengine). It hosts a [GraphQL](https://graphql.org/) server using the [Lacinia](https://github.com/walmartlabs/lacinia) Clojure library. Incoming chat messages are pushed onto a [Redis](https://redis.io/) pub/sub stream.

The frontend is written in Typescript and React, hosted on Google Firebase. It uses the [Apollo GraphQL](https://www.apollographql.com/) library to talk with the backend.

The code is at [Github](https://github.com/fredrikmeyer/chat-app/), and I use [Github Actions](https://github.com/features/actions) to automatically deploy any changes to the backend and frontend directories.

## Architecture

Below is a sketch of the architecture:

![Chat app architecture](/assets/chat_app_structure.png)

The frontend is relatively straight forward (at least with the current functionality). The only UI is a input field for the name of sender, and a input field for the message. New messages are received by subscribing to GraphQL subscriptions.

What complicates the backend most is actually the choice of hosting. The backend lives in Docker containers on Google App Engine (GAE), but GAE does automatic scaling of the number of running instances. This had the weird effect that users only saw some of the messages received, because it was essentially random which instance your request would connect to.

The solution was to use a single source of truth, and because GAE has Redis support, I chose Redis for the job. Every time a message is received, it is pushed onto a pub/sub Redis channel. Then a subscribed client (perhaps the same) reads the message, and pushes it onto the GraphQL subscription. This essentially makes the Clojure part a stateless server - no state is ever saved anywhere.

## Lessons learned

The answer to the question "It can't be that hard, can it?" is always yes. There were several technologies I knew, but not well enough to avoid Googling a lot of solutions. The number of technologies involved probably increased the time from start to finish to some degree.

## Onwards

Technically, this is a working chat app. But it is not good. It would be fun to add authentication, chat rooms, and a prettier UI.
