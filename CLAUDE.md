# Repository Structure Summary

This is a Jekyll-based personal blog and website hosted at https://www.fredrikmeyer.net.

## Key Information

- **Site Owner**: Fredrik Meyer
- **Theme**: Minima (Jekyll's default theme)
- **Ruby Version**: 3.4.4 (managed with rbenv)
- **Jekyll Version**: ~4.4.1
- **Description**: "Mathematics is fun."

## Directory Structure

### Core Jekyll Files
- `_config.yml` - Main site configuration
- `Gemfile` - Ruby dependencies
- `index.md` - Homepage content
- `404.html` - Custom 404 page
- `CNAME` - Domain configuration

### Content
- `_posts/` - Blog posts (2016-2025), covering topics like:
  - Mathematics and discrete optimization
  - Programming (Java, Python, Emacs)
  - DevOps (Docker, Kubernetes, CloudFormation)
  - Tools and workflows (tmux, jq, GitHub Actions)
- `about.md` - About page
- `archive.md` - Post archive
- `links.md` - Links page
- `tags.md` - Tags page

### Layout & Styling
- `_layouts/` - Page templates (default, home, page, post)
- `_includes/` - Reusable components (header, footer, analytics)
- `_sass/` - Sass stylesheets
- `assets/` - Static assets (images, icons, CSS)

### Interactive Content
- `etc/` - p5.js creative coding projects:
  - Chasing colors animation
  - Hexagon patterns
  - Leftist tree visualization
  - Rotating circles

### Generated Content
- `_site/` - Generated static site (build output)

## Development Commands

```bash
# Install dependencies
bundle install

# Local development server
bundle exec jekyll serve

# Create new post
bundle exec jekyll post "post-title"
```

## Jekyll Plugins Used
- jekyll-feed (RSS feeds)
- jekyll-org (Org-mode support)
- jekyll-toc (Table of contents)
- jekyll-plantuml (UML diagrams)
- jekyll_picture_tag (responsive images)
- jekyll-compose (post creation)

## Notable Features
- Responsive image optimization
- UML diagram generation
- Mathematical content focus
- Creative coding projects
- Google Analytics integration
- Social media links (Twitter, GitHub, LinkedIn)