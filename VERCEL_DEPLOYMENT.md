# Vercel Auto-Deploy Setup

## Cara Setup Auto-Deploy dari GitHub ke Vercel

### Option 1: Native Vercel Integration (PALING MUDAH) 🎯

1. Pergi ke [Vercel Dashboard](https://vercel.com/new)
2. Klik **"Import Git Repository"**
3. Pilih repository `thisisniagahub/OPENPROJECT-1`
4. Klik **Import**
5. Framework akan auto-detect sebagai **Next.js**
6. Klik **Deploy**

✅ **SIAP!** Setiap push ke `main` branch akan auto-deploy!

---

### Option 2: GitHub Actions (Advanced) 🔧

Jika nak guna GitHub Actions workflow, perlu setup secrets:

#### Step 1: Dapatkan Vercel Credentials

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Dapatkan IDs
cat .vercel/project.json
```

#### Step 2: Add GitHub Secrets

Pergi ke repo Settings → Secrets and variables → Actions

Tambah secrets berikut:

| Secret Name | Cara Dapatkan |
|-------------|---------------|
| `VERCEL_TOKEN` | [Create Token](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Run `cat .vercel/project.json` |
| `VERCEL_PROJECT_ID` | Run `cat .vercel/project.json` |

#### Step 3: Enable Workflow

1. Pergi ke **Actions** tab di GitHub
2. Enable workflows jika diminta
3. Push ke `main` branch untuk trigger deployment

---

## Environment Variables

Pastikan setup environment variables di Vercel Dashboard:

1. Pergi ke Project Settings → Environment Variables
2. Tambah variables dari `.env.example`:

```env
DATABASE_URL="file:./db/custom.db"
OPENPROJECT_API_TOKEN="your_secure_bearer_token"
NEXT_PUBLIC_GATEWAY_URL="wss://live.openclaw-gateway.example"
```

---

## Deployment Triggers

| Event | Action |
|-------|--------|
| Push ke `main`/`master` | Deploy ke Production |
| Pull Request | Deploy Preview |
| Manual (workflow_dispatch) | Deploy ke Production |

---

## Troubleshooting

### Build Failed
- Check build logs di Vercel Dashboard
- Pastikan `bun.lockb` ada dalam repo
- Verify environment variables

### Timeout
- Check `vercel.json` untuk `maxDuration` settings
- API routes dah set ke 30 seconds max

### Region
- Default region: `sin1` (Singapore)
- Boleh tukar di `vercel.json`

---

## Files Created

1. **`vercel.json`** - Vercel configuration
2. **`.github/workflows/deploy.yml`** - Main deployment workflow
3. **`.github/workflows/preview.yml`** - PR preview deployment
