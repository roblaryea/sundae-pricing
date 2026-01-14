# Deployment Guide - GitHub Pages

This guide explains how to deploy the Sundae Pricing Configurator to GitHub Pages.

## 🌐 Live URL

Once deployed, your app will be available at:

**https://roblaryea.github.io/sundae-pricing/**

---

## 📋 Prerequisites

1. ✅ Git repository initialized and pushed to GitHub
2. ✅ Repository: `https://github.com/roblaryea/sundae-pricing`
3. ✅ Node.js and npm installed locally

---

## 🚀 Deployment Steps

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/roblaryea/sundae-pricing
2. Click **Settings** (⚙️)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select:
   - **Branch:** `gh-pages`
   - **Folder:** `/ (root)`
5. Click **Save**

> **Note:** The `gh-pages` branch will be automatically created on first deployment.

---

### Step 2: Deploy from Local Machine

Run the deployment command:

```bash
npm run deploy
```

This command will:
1. ✅ Run `npm run validate:pricing` (pricing validation)
2. ✅ Run `npm run build` (TypeScript compilation + Vite build)
3. ✅ Publish `dist` folder to `gh-pages` branch
4. ✅ Push to GitHub

**Expected Output:**
```
> sundae-pricing@0.0.0 predeploy
> npm run build

> sundae-pricing@0.0.0 build
> tsc -b && vite build

✓ built in 3.45s

> sundae-pricing@0.0.0 deploy
> gh-pages -d dist

Published
```

---

### Step 3: Verify Deployment

1. Wait 30-60 seconds for GitHub Pages to build
2. Visit: **https://roblaryea.github.io/sundae-pricing/**
3. Test the app loads correctly
4. Refresh the page (should not 404 thanks to SPA routing)

---

## 🔧 Configuration Details

### Vite Base Path

The app is configured to work at `/sundae-pricing/` in production:

```typescript
// vite.config.ts
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/sundae-pricing/' : '/',
})
```

- **Development:** Base path is `/` (localhost:5173)
- **Production:** Base path is `/sundae-pricing/` (GitHub Pages)

### SPA Routing Support

GitHub Pages doesn't natively support Single Page Applications (SPAs). We use a workaround:

1. **404.html** - Catches all 404 errors and redirects to index.html with the path as a query param
2. **index.html** - Restores the correct URL from the query param using `history.replaceState`

This ensures deep links work correctly:
- ✅ `https://roblaryea.github.io/sundae-pricing/` - Works
- ✅ `https://roblaryea.github.io/sundae-pricing/some/route` - Works (no 404)
- ✅ Page refresh on any route - Works

---

## 📦 NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (validates pricing first) |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Build and deploy to GitHub Pages |
| `npm run predeploy` | Automatically runs before deploy (build) |

---

## 🐛 Troubleshooting

### Issue: Build Fails

**Symptom:** `npm run deploy` fails during build

**Solution:**
```bash
# Check TypeScript errors
npx tsc --noEmit

# Run tests
npm run test

# Validate pricing
npm run validate:pricing
```

### Issue: 404 on Deployment

**Symptom:** App shows 404 after deployment

**Solution:**
1. Check GitHub Pages settings (branch should be `gh-pages`)
2. Wait 1-2 minutes for Pages to build
3. Clear browser cache
4. Verify URL: `https://roblaryea.github.io/sundae-pricing/` (with trailing slash)

### Issue: Blank Page

**Symptom:** Page loads but shows blank screen

**Solution:**
1. Check browser console for errors
2. Verify `base` in vite.config.ts is set correctly
3. Rebuild and redeploy:
   ```bash
   rm -rf dist
   npm run deploy
   ```

### Issue: Assets Not Loading

**Symptom:** CSS/JS files return 404

**Solution:**
Ensure all asset references use relative paths. Vite handles this automatically with the `base` configuration.

### Issue: SPA Routing Doesn't Work

**Symptom:** Refresh on deep route returns 404

**Solution:**
1. Verify `public/404.html` exists
2. Verify `index.html` has the redirect handler script
3. Both files should be copied to `dist` during build

---

## 🔄 Re-Deployment

To deploy updates:

```bash
# Make your changes
git add .
git commit -m "Update: description"
git push origin main

# Deploy to GitHub Pages
npm run deploy
```

The `gh-pages` branch is managed automatically by the `gh-pages` package.

---

## 🌍 Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to `public/` directory:
   ```
   yourdomain.com
   ```

2. Configure DNS with your domain provider:
   - **A Record** pointing to GitHub Pages IPs, or
   - **CNAME** pointing to `roblaryea.github.io`

3. Update GitHub Pages settings to use custom domain

4. Update `base` in `vite.config.ts`:
   ```typescript
   base: process.env.NODE_ENV === 'production' ? '/' : '/',
   ```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] App loads at https://roblaryea.github.io/sundae-pricing/
- [ ] All assets (CSS, JS, images) load correctly
- [ ] Navigation between steps works
- [ ] Page refresh doesn't cause 404
- [ ] Direct links to routes work (e.g., `/sundae-pricing/some-route`)
- [ ] LocalStorage persists configuration
- [ ] Pricing calculations are accurate
- [ ] No console errors

---

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [gh-pages Package](https://github.com/tschaub/gh-pages)
- [SPA on GitHub Pages](https://github.com/rafgraph/spa-github-pages)

---

## 🎉 Success!

Your Sundae Pricing Configurator is now live and accessible to the world!

**Share your deployment:**
- URL: https://roblaryea.github.io/sundae-pricing/
- Repository: https://github.com/roblaryea/sundae-pricing

For issues or questions, check the troubleshooting section above or review build logs.
# redeploy Wed Dec 31 20:39:36 +04 2025
