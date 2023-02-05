---
layout: page
title: Tags
permalink: /tags/
---


{% for tag in site.tags %}
  <h3 style="text-transform: capitalize">{{ tag[0] }}</h3>
  <ul>
    {% for post in tag[1] %}
      <li><a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
  </ul>
{% endfor %}
