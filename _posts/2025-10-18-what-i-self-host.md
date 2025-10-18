---
layout: post
title: What I self host
date: 2025-10-18 13:39 +0200
tags: programming
---

I've always liked reading blogs, and have used several feed readers in the past (Feedly, for example). For a long time I was thinking it would be fun to write my own RSS reader, but instead of diving into the challenge, I did the next best thing, which was finding a decent one, and learning how to self host it.

In this post I will tell about the self hosting I do, and end by sketching the setup.

## RSS reader - Miniflux

[Miniflux](https://github.com/miniflux/v2) is a "minimalist and opinionated feed reader". I host my own instance at [https://rss.fredrikmeyer.net/](https://rss.fredrikmeyer.net/) It is very easy to set up using Docker, see [the documentation](https://miniflux.app/docs/docker.html#docker-compose).

[{% picture /assets/miniflux.png --style="" --alt Miniflux %}](/assets/miniflux.png){: .centered}

I do have lots of unread blog posts 🤨.

## Grafana, Strava Integration

I host a Grafana instance, also using Docker. What first triggered me to make this instance was an old project (that I want to revive one day): I had a Raspberry Pi with some sensors measuring gas and dust at my previous apartment, and a Grafana dashboard showing the data. It was interesting seeing how making food at home had a measurable impact on volatile gas levels.

Later I discovered the [Strava datasource plugin](https://grafana.com/grafana/plugins/grafana-strava-datasource/) for Grafana. It is a plugin that lets Grafana connect to the Strava API, and gives you summaries of your Strava activities. Below is an example of how it looks for me:

[{% picture /assets/grafana_strava.png --style="" --alt Grafana %}](/assets/grafana_strava.png){: .centered}

One gets several other dashboards included in the plugin.

## Spotify

One day [YourSpotify](https://github.com/Yooooomi/your_spotify/) was mentioned on HackerNews. It is an application that connects to the Spotify API, and gives you aggregated statistics of artists and albums you've listened to over time (why they chose to store the data in MongoDB I have no idea of!).

[{% picture /assets/spotify.png --style="" --alt YourSpotify %}](/assets/spotify.png){: .centered}

It is interesting to note that I have listened to less and less music over the years (I have noticed that the more experience I have at work, the less actual programming I do).

Because I didn't bother setting up DNS, this one is only exposed locally, so I use [Tailscale](https://tailscale.com/) to be able to access YourSpotify. This works by having Tailscale installed on the host, and connecting to the Tailnet. It lets me access the application by writing `http://forgottensuperhero:3001/` in the browser.

## Bookmark manager

I have a problem with closing tabs, and a tendency to hoard information (don't get me started on the number of unread PDF books on my Remarkable!). So I found Linkding, a bookmark manager, which I access at [https://links.fredrikmeyer.net/bookmarks/shared](https://links.fredrikmeyer.net/bookmarks/shared).

[{% picture /assets/linkding.png --style="" --alt LinkDing %}](/assets/linkding.png){: .centered}

In practice it is a grave yard for interesting things I never have the time to read, but it gives me peace some kind of peace of mind.

## How

I have an ambition of making the hosting "production grade", but at the moment this setup is a mix of practices of varying levels of quality.

I pay for a cheap droplet at [DigitalOcean](https://www.digitalocean.com/), about $5 per month, and an additional dollar for backup. The domain name and DNS is from [Domeneshop](https://domene.shop/). SSL certificates from [Let's Encrypt](https://letsencrypt.org/).

All the apps run in different Docker containers, with ports exposed. These ports are then listened to by Nginx, which redirects to HTTPS.

I manage _most of_ the configuration using Ansible. Here I must give thanks to [Jeff Geerling](https://www.jeffgeerling.com/)'s book [Ansible for DevOps](https://leanpub.com/ansible-for-devops), which was really good. So if I change my Nginx configuration, I edit it on my laptop, and run

```bash
ansible-playbook -i inventory.ini docker.yml  --ask-become-pass
```

to let Ansible do its magic. In this case, "most" means the Nginx configuration and Grafana.

Miniflux and YourSpotify are managed by simply doing `scp spotify_stats.yml droplet:~` and running `sudo docker-compose -f ./spotify_stats.yml up -d` on the host.

Ideally, I would like to have a 100% "infrastructure as code" approach, but hey, who has time for that!

## Ideas for the future

It would be nice to combine AI and user manuals of house appliances to make an application that lets you ask questions like "what does the red light on my oven mean?". Or write my own Jira, or... Lots of rabbit holes [in this list](https://github.com/awesome-selfhosted/awesome-selfhosted) on Github.

Until next time!
