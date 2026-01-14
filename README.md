
# Abdullah Sahin

> The World Through the Eyes of a Software Engineer

![Astro](https://img.shields.io/badge/Astro-v5.0-orange?style=flat-square&logo=astro)
![React](https://img.shields.io/badge/React-v19.0-blue?style=flat-square&logo=react)
![Tailwind](https://img.shields.io/badge/TailwindCSS-v4.0-38b2ac?style=flat-square&logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.0-blue?style=flat-square&logo=typescript)

Welcome to my personal website source code. This project is built with **Astro**, **React**, and **TailwindCSS**.

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (recommended package manager)

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/mrabdullahsahin/mrabdullahsahin.github.io.git
    cd mrabdullahsahin.github.io
    ```

2.  **Install dependencies**

    ```bash
    pnpm install
    ```

3.  **Start the development server**

    ```bash
    pnpm dev
    ```

    Your site should now be running at `http://localhost:4321`.

## Deployment

This project is configured to deploy automatically to GitHub Pages using GitHub Actions.

1.  Push your changes to the `master` branch.
2.  Ensure your GitHub repository settings under **Pages** has **Source** set to **GitHub Actions**.
3.  The workflow defined in `.github/workflows/gh-pages.yml` will automatically build and deploy the site.

## Scripts

| Script | Description |
| :--- | :--- |
| `pnpm dev` | Starts the local development server. |
| `pnpm build` | Builds the site for production. |
| `pnpm preview` | Previews the built production site locally. |
| `pnpm format` | Formats code using Prettier. |
| `pnpm check` | Runs Astro check for diagnostics. |