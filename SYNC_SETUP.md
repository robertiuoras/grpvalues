# 🔄 Template Sync Setup Guide

## Overview

This setup allows you to automatically sync your LifeInvader templates from the original Google Sheet to your copy, ensuring your website always has the latest data.

## Files Created/Modified

### New API Routes:

- `app/api/sync-templates/route.ts` - Main sync API that fetches from original sheet
- `app/api/cron/sync-templates/route.ts` - Cron job endpoint for automatic syncing

### Modified Files:

- `app/lifeinvader/page.tsx` - Added sync UI and functionality
- `vercel.json` - Added cron job scheduling

## How It Works

1. **Manual Sync**: Click the "Sync Templates" button to sync immediately
2. **Automatic Sync**: Cron job runs every 6 hours automatically
3. **Data Flow**: Original sheet → Your copy → Your website

## Environment Variables

Add these to your Vercel environment variables:

```env
# Cron job secret (for security)
CRON_SECRET=your-super-secret-cron-key-here

# Your app's base URL (for cron job to call itself)
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

## Setup Steps

1. **Deploy to Vercel** with the new files
2. **Set Environment Variables** in Vercel dashboard
3. **Test Manual Sync** by clicking the sync button
4. **Verify Cron Job** is working (check Vercel logs)

## Cron Schedule

The cron job runs every 6 hours (`0 */6 * * *`). You can change this in `vercel.json`:

- `"0 */1 * * *"` - Every hour
- `"0 */6 * * *"` - Every 6 hours (current)
- `"0 0 * * *"` - Once daily at midnight
- `"0 0 */2 * *"` - Every 2 days

## Troubleshooting

### Manual Sync Not Working

- Check browser console for errors
- Verify API routes are deployed correctly
- Check network tab for failed requests

### Cron Job Not Running

- Verify `CRON_SECRET` environment variable is set
- Check Vercel logs for cron execution
- Ensure `NEXT_PUBLIC_BASE_URL` is correct

### Sync Errors

- Check if original sheet URLs are accessible
- Verify your copy sheet has the correct structure
- Check API logs for detailed error messages

## Features

✅ **Per-Category Sync**: Each category syncs individually
✅ **Progress Tracking**: Visual progress bar during sync
✅ **Error Handling**: Individual category failures don't break others
✅ **Manual & Automatic**: Both manual and scheduled syncing
✅ **Real-time Updates**: Your website always has latest data

## Security

- Cron job requires authentication via `CRON_SECRET`
- Only reads from original sheet (no write access needed)
- Your copy sheet remains under your control
