# Deployment Guide for GitHub Pages

This guide explains how to deploy the DirtyGame to GitHub Pages.

## Prerequisites

1. Make sure you have a GitHub repository named `DirtyGame`
2. Ensure you're working on the `finished2` branch
3. Make sure GitHub Pages is enabled in your repository settings

## Automatic Deployment (Recommended)

The project is configured with GitHub Actions for automatic deployment. Here's how it works:

1. **Push to the `finished2` branch**: Every time you push changes to the `finished2` branch, GitHub Actions will automatically:
   - Build the project
   - Deploy it to GitHub Pages

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" in the sidebar
   - Under "Source", select "Deploy from a branch"
   - Choose the `gh-pages` branch
   - Click "Save"

3. **Enable GitHub Actions**:
   - Go to your repository settings
   - Navigate to "Actions" → "General"
   - Make sure "Allow all actions and reusable workflows" is selected
   - Click "Save"

## Manual Deployment

If you prefer to deploy manually:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   ```

## Configuration

The project is configured with:
- **Base path**: `/DirtyGame/` (set in `vite.config.ts`)
- **Build output**: `dist/` directory
- **Deployment branch**: `gh-pages` (created automatically)

## Accessing Your Deployed Game

Once deployed, your game will be available at:
```
https://[your-username].github.io/DirtyGame/
```

## Troubleshooting

1. **If the deployment fails**:
   - Check the GitHub Actions tab in your repository
   - Ensure all dependencies are properly installed
   - Verify the `finished2` branch exists

2. **If the game doesn't load**:
   - Check that the base path in `vite.config.ts` matches your repository name
   - Ensure GitHub Pages is enabled and pointing to the `gh-pages` branch

3. **If you need to update the deployment**:
   - Simply push new changes to the `finished2` branch
   - The automatic deployment will handle the rest
