---
layout: page
title: All posts
permalink: /archive/
menu: true
---

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a> ({{ post.date | date: "%Y-%m-%d" }})
    </li>
  {% endfor %}
</ul>

## Other pages


{% assign page_paths = site.pages | map: "path"  %}

{% for path in page_paths %}
{% assign my_page = site.pages | where: "path", path | first %}
{% unless my_page.title and my_page.menu %}
<a class="page-link" href="{{ my_page.url | relative_url }}">{{ my_page.title | escape }}</a>
{% endunless %}
{% endfor %}
