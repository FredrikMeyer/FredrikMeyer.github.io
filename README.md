# FredrikMeyer.github.io

## rbenv

Install `rbenv`:

```
brew install rbenv ruby-build
```

Latest Ruby version:

```
rbenv install 3.4.4
```

## Build

Local server:

```
bundle exec jekyll serve
```

Often need to run `bundle install` first (for example if dependabot has updated some dependencies).


New post (example):

```
bundle exec jekyll post emacs-python-venv
```

(using [this](https://github.com/jekyll/jekyll-compose))

Image resizing with https://rbuchberger.github.io/jekyll_picture_tag/

## Check dead links 

F.ex with [Lychee](https://github.com/lycheeverse/lychee). Like this:

First build, then from `_site_`:

```
lychee -b https://fredrikmeyer.net/ .
```

Inspired from this: https://www.jeremykun.com/2024/10/30/how-this-blog-does-indieweb/


## Google Search Console

https://search.google.com/search-console?resource_id=sc-domain%3Afredrikmeyer.net

## Liquid tutorial

https://www.seanh.cc/2019/09/29/liquid/#3-filters
https://jekyllrb.com/tutorials/navigation/#scenario-7-including-items-conditionally

## Sjekk ut

https://github.com/yagarea/jektex
https://github.com/planetjekyll/awesome-jekyll-plugins?tab=readme-ov-file
