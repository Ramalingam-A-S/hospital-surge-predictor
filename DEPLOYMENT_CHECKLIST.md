# 🚀 MedCentric AI - Deployment Checklist

## Pre-Deployment (5 minutes)

### ✅ Step 1: Run Pre-Deployment Check
```bash
chmod +x pre-deployment-check.sh
./pre-deployment-check.sh
```

**Expected Output:** All checks passed ✅

---

## Deployment (3-5 minutes)

### ✅ Step 2A: Deploy via GitHub (Recommended)

```bash
# 1. Commit and push
git add .
git commit -m "chore: production deployment"
git push origin main

# 2. Go to Vercel Dashboard
# → https://vercel.com/new
# → Import your GitHub repository
# → Add environment variables:
#   - TURSO_CONNECTION_URL
#   - TURSO_AUTH_TOKEN
#   - BETTER_AUTH_SECRET
# → Click "Deploy"
```

### OR Step 2B: Deploy via CLI

```bash
# 1. Install Vercel CLI (if needed)
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Set environment variables
vercel env add TURSO_CONNECTION_URL production
vercel env add TURSO_AUTH_TOKEN production
vercel env add BETTER_AUTH_SECRET production

# 5. Redeploy with env vars
vercel --prod
```

---

## Post-Deployment Verification (10 minutes)

### ✅ Step 3: Verify Deployment

```bash
# Get your production URL from Vercel (e.g., https://medcentric-ai.vercel.app)
export PROD_URL="https://your-actual-url.vercel.app"

# Make scripts executable
chmod +x verify-deployment.sh test-production-api.sh

# Run verification
./verify-deployment.sh $PROD_URL
```

**Expected:** All routes return HTTP 200 or 401 (for protected routes) ✅

---

### ✅ Step 4: Test Complete User Flow

```bash
./test-production-api.sh $PROD_URL
```

**This will:**
- ✅ Create test user
- ✅ Test login
- ✅ Test AI analysis APIs
- ✅ Verify full data pipeline

---

### ✅ Step 5: Manual Browser Testing

**5.1 Registration Flow:**
1. Visit `$PROD_URL/register`
2. Fill form with real credentials
3. Submit → Should redirect to `/login`
4. Verify success toast appears

**5.2 Login Flow:**
1. Visit `$PROD_URL/login`
2. Enter credentials from registration
3. Submit → Should redirect to `/dashboard`
4. Verify user info displays in header

**5.3 AI Analysis Flow:**
1. On dashboard, fill "Hospital Snapshot Form"
2. Use HIGH RISK scenario:
   ```
   Hospital ID: MED-CENTRAL-001
   Total Beds: 200
   Free Beds: 15
   Incoming Emergencies: 25
   AQI: 350
   News Summary: Major accident on highway
   ```
3. Submit form
4. Wait 2-3 seconds
5. Verify results display:
   - ✅ Risk level shows "High"
   - ✅ Predicted patients shows number
   - ✅ Recommended actions appear
   - ✅ Alert message displays

**5.4 Browser Console Check:**
1. Open DevTools (F12)
2. Check Console tab → Should be NO red errors
3. Check Network tab → All requests should be 200/201
4. Navigate between tabs → No errors should appear

---

### ✅ Step 6: Performance Audit

**Option A - Lighthouse (Chrome DevTools):**
```bash
# In Chrome DevTools:
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Performance, Accessibility, Best Practices, SEO"
4. Click "Analyze page load"
```

**Target Scores:**
- 🟢 Performance: >85
- 🟢 Accessibility: >90
- 🟢 Best Practices: >95
- 🟢 SEO: >80

**Option B - Command Line:**
```bash
npm install -g lighthouse
lighthouse $PROD_URL --view
```

---

## Post-Deployment Summary

### ✅ Step 7: Document Deployment

Copy this template and fill in your actual values:

```markdown
## 🚀 MedCentric AI - Production Deployment

**Deployment Date:** [Today's Date]
**Production URL:** [Your Vercel URL]
**Deployment Method:** [GitHub / CLI]

### Build Status
- ✅ Production build successful
- ✅ Build time: [X] minutes
- ✅ No TypeScript errors
- ✅ No build warnings

### Environment Variables
- ✅ TURSO_CONNECTION_URL configured
- ✅ TURSO_AUTH_TOKEN configured
- ✅ BETTER_AUTH_SECRET configured

### Core Routes (All HTTP 200)
- ✅ / (Homepage)
- ✅ /login
- ✅ /register
- ✅ /dashboard

### API Endpoints (All Functional)
- ✅ /api/auth/* (Authentication)
- ✅ /api/quick_check (Risk Assessment)
- ✅ /api/agentic_analysis (AI Analysis)
- ✅ /api/snapshot (Save & Analyze)
- ✅ /api/historical-trends (Charts)

### User Flow Tests
- ✅ Registration works
- ✅ Login works
- ✅ Dashboard loads
- ✅ AI analysis generates predictions
- ✅ Recommended actions display
- ✅ No console errors

### Performance Metrics
- Lighthouse Performance: [SCORE]/100
- Lighthouse Accessibility: [SCORE]/100
- LCP: [X.X]s
- FID: [X]ms

### Security
- ✅ Environment variables secured in Vercel
- ✅ Authentication enforced on protected routes
- ✅ API routes validate sessions
- ✅ No sensitive data in client code

**Status: 🟢 LIVE & OPERATIONAL**
```

---

## Monitoring Setup

### ✅ Step 8: Enable Monitoring

**Vercel Dashboard:**
1. Go to your project in Vercel
2. Enable "Analytics" tab
3. Enable "Speed Insights"
4. Check "Function Logs" regularly

**Database Monitoring:**
1. Visit Turso Dashboard: https://turso.tech/
2. Monitor query performance
3. Check connection counts

---

## Troubleshooting

### Issue: Build fails on Vercel

**Solution:**
```bash
# Check build logs in Vercel dashboard
# Common fixes:
1. Verify all dependencies are in package.json
2. Check for TypeScript errors (even though ignoreBuildErrors: true)
3. Ensure .env variables are set in Vercel
4. Check Node.js version compatibility
```

### Issue: "Authentication required" on API calls

**Solution:**
```bash
# 1. Verify BETTER_AUTH_SECRET is set in Vercel
# 2. Redeploy after adding env vars
vercel --prod

# 3. Clear browser cookies and try again
# 4. Check browser console for token errors
```

### Issue: Database connection errors

**Solution:**
```bash
# 1. Verify Turso credentials in Vercel env vars
# 2. Test database connection:
curl https://api.turso.tech/v1/databases/YOUR_DB/health

# 3. Check Turso dashboard for database status
# 4. Verify TURSO_AUTH_TOKEN hasn't expired
```

### Issue: AI analysis returns errors

**Solution:**
```bash
# 1. Check Vercel function logs for specific error
# 2. Verify all required fields in form submission
# 3. Test API directly:
curl -X POST $PROD_URL/api/quick_check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"hospital_id":"TEST","beds_total":100,"beds_free":50}'

# 4. If USE_AGENTIC=true, verify OPENAI_API_KEY
```

---

## Rollback Plan

### If Critical Issues Occur:

**Option 1 - Vercel Dashboard:**
1. Go to Deployments
2. Find previous working deployment
3. Click "..." menu
4. Select "Promote to Production"

**Option 2 - CLI:**
```bash
vercel rollback
```

**Option 3 - Git Revert:**
```bash
git revert HEAD
git push origin main
# Vercel auto-deploys
```

---

## Success Criteria

✅ **Deployment is successful when:**

1. All scripts pass without errors
2. Registration + Login work in browser
3. AI analysis generates predictions
4. No console errors in browser
5. Lighthouse scores meet targets
6. All API endpoints return valid responses
7. Dashboard displays user data correctly
8. Forms submit successfully
9. Database operations work
10. No errors in Vercel function logs

---

## Quick Command Reference

```bash
# Pre-deployment check
./pre-deployment-check.sh

# Deploy to production
vercel --prod

# Verify deployment
./verify-deployment.sh https://your-url.vercel.app

# Test full API flow
./test-production-api.sh https://your-url.vercel.app

# View deployment logs
vercel logs

# Open production URL
vercel open

# Rollback if needed
vercel rollback
```

---

## 🎯 Ready to Deploy?

**Follow these steps in order:**
1. ✅ Run `./pre-deployment-check.sh`
2. ✅ Deploy via GitHub or `vercel --prod`
3. ✅ Set environment variables in Vercel
4. ✅ Run `./verify-deployment.sh $PROD_URL`
5. ✅ Run `./test-production-api.sh $PROD_URL`
6. ✅ Test in browser manually
7. ✅ Run Lighthouse audit
8. ✅ Document deployment in summary
9. ✅ Enable monitoring in Vercel
10. ✅ Celebrate! 🎉

---

**Your MedCentric AI application is production-ready!** 🚀