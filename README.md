# Abdullah Şahin

> abdullahsahin.org — Software engineer. Side projects and writing about what they teach me.

![Astro](https://img.shields.io/badge/Astro-v5.0-orange?style=flat-square&logo=astro)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.0-blue?style=flat-square&logo=typescript)

Personal website built with **Astro** and **MDX**. Bilingual (EN/TR), static, deployed to GitHub Pages.

## Getting Started

### Prerequisites

- **Node.js** v18+
- **pnpm**

### Installation

```bash
git clone https://github.com/mrabdullahsahin/mrabdullahsahin.github.io.git
cd mrabdullahsahin.github.io
pnpm install
pnpm dev
```

Site runs at `http://localhost:4321`.

To stop the development server, press `Ctrl + C` in the terminal.

## Content

### Writing (`src/content/writing/`)

```mdx
---
title: 'English Title'
titleTr: 'Türkçe Başlık'
date: '2024-01-15'
category: 'engineering'
categoryTr: 'mühendislik'
readTime: 8
description: 'English description.'
descriptionTr: 'Türkçe açıklama.'
draft: false
---

import Lang from '../../components/Lang.astro'

<Lang lang="en">

English content...

</Lang>

<Lang lang="tr">

Türkçe içerik...

</Lang>
```

### Projects (`src/content/projects/`)

```mdx
---
name: 'Project Name'
years: '2023 —'
status: 'live'          # live | acquired | open-source | paused | sunset | failed
statusLabel: 'active'
statusLabelTr: 'aktif'
description: 'English description.'
descriptionTr: 'Türkçe açıklama.'
order: 1
draft: false
---

import Lang from '../../components/Lang.astro'

<Lang lang="en">

English project story...

</Lang>

<Lang lang="tr">

Türkçe proje hikayesi...

</Lang>
```

## Deployment

Push to the `development` branch — GitHub Actions builds and deploys automatically to GitHub Pages.

Workflow: `.github/workflows/gh-pages.yml`

## Scripts

| Script | Description |
| :--- | :--- |
| `pnpm dev` | Start local development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build locally |
| `pnpm check` | Run Astro type checking |
