# CSS Fix Deployment Guide

## What Was Fixed

The CSS files were not loading on the deployed site because the `_routes.json` file was not excluding the `/glenugie-booking/assets/*` path. This meant that Cloudflare Workers was trying to handle CSS requests through the worker instead of serving them as static files.

## Changes Made

1. **Created `fix-routes.js`** - A post-build script that ensures `_routes.json` correctly excludes the assets folder
2. **Updated `package.json`** - Modified the build script to run the fix after building
3. **Updated `_routes.json`** - Added `/glenugie-booking/assets/*` to the exclude list

## How to Deploy

### Option 1: Deploy via Webflow Dashboard (Recommended)

1. Go to your Webflow project
2. Navigate to the Apps section
3. Find your Glenugie Booking app
4. Click "Deploy" or "Publish"
5. Wait for the deployment to complete (usually 1-2 minutes)

### Option 2: Manual Deployment

If you have access to the Cloudflare Workers dashboard:

1. Build the project locally:
   ```bash
   npm run build
   ```

2. Upload the `dist` folder contents to your Cloudflare Worker

3. Ensure the `_routes.json` file is uploaded correctly

## Verification

After deployment, check:

1. Visit: `https://glenugiekennels.webflow.io/glenugie-booking`
2. Open browser DevTools (F12)
3. Go to the Network tab
4. Refresh the page
5. Look for CSS files - they should load with status 200
6. The page should now have proper styling

## What the Fix Does

The `_routes.json` file tells Cloudflare Workers which paths should be handled by the worker and which should be served as static files. By excluding `/glenugie-booking/assets/*`, we ensure that:

- CSS files are served directly from Cloudflare's CDN
- No worker execution is needed for static assets
- Faster load times
- Proper caching

## Files Changed

- `fix-routes.js` (new)
- `package.json` (updated build script)
- `dist/_routes.json` (automatically generated during build)

## Testing Locally

To test the fix locally:

```bash
npm run build
npm run preview
```

Then visit `http://localhost:8788/glenugie-booking` and verify CSS loads correctly.

## Troubleshooting

If CSS still doesn't load after deployment:

1. **Clear Cloudflare cache**:
   - Go to Cloudflare dashboard
   - Navigate to Caching → Configuration
   - Click "Purge Everything"

2. **Check browser cache**:
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or open in incognito/private mode

3. **Verify deployment**:
   - Check that the latest build was deployed
   - Verify the `_routes.json` file is present in the deployment

4. **Check asset paths**:
   - In DevTools Network tab, check the actual URL being requested for CSS
   - It should be: `/glenugie-booking/assets/[filename].css`

## Next Steps

After successful deployment:

1. Test all pages to ensure styling is correct
2. Check the admin dashboard
3. Test the booking form
4. Verify mobile responsiveness

---

**Note**: This fix is permanent and will be applied automatically on every build going forward.
