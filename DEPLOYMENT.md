# Deployment Guide for GitHub Pages

This guide explains how to deploy the DirtyGame to GitHub Pages with a custom domain.

## Prerequisites

1. Make sure you have a GitHub repository named `DirtyGame`
2. Ensure you're working on the `finished2` branch
3. Make sure GitHub Pages is enabled in your repository settings
4. **Custom Domain**: You need to own `nobsadultgames.com` and configure DNS settings

## Custom Domain Setup

### DNS Configuration
You need to configure your domain's DNS settings to point to GitHub Pages:

1. **Add CNAME Record**:
   - Go to your domain registrar's DNS settings
   - Add a CNAME record:
     - **Name**: `@` (or leave blank for root domain)
     - **Value**: `[your-username].github.io`
     - **TTL**: 3600 (or default)

2. **Alternative: A Records** (if CNAME doesn't work for root domain):
   - Add A records pointing to GitHub Pages IP addresses:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`

### GitHub Pages Configuration
1. Go to your repository settings
2. Navigate to "Pages" in the sidebar
3. Under "Custom domain", enter: `nobsadultgames.com`
4. Check "Enforce HTTPS" (recommended)
5. Click "Save"

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
- **Custom domain**: `nobsadultgames.com` (set in `public/CNAME`)
- **Build output**: `dist/` directory
- **Deployment branch**: `gh-pages` (created automatically)

## Accessing Your Deployed Game

Once deployed and DNS is configured, your game will be available at:
```
https://nobsadultgames.com
```

## Troubleshooting

1. **If the deployment fails**:
   - Check the GitHub Actions tab in your repository
   - Ensure all dependencies are properly installed
   - Verify the `finished2` branch exists

2. **If the custom domain doesn't work**:
   - Check your DNS settings at your domain registrar
   - Verify the CNAME record points to `[your-username].github.io`
   - DNS changes can take up to 48 hours to propagate
   - Check GitHub Pages settings for the custom domain

3. **If you need to update the deployment**:
   - Simply push new changes to the `finished2` branch
   - The automatic deployment will handle the rest

## SSL/HTTPS

GitHub Pages automatically provides SSL certificates for custom domains. Make sure to:
1. Check "Enforce HTTPS" in your GitHub Pages settings
2. Wait for the SSL certificate to be provisioned (can take up to 24 hours)
