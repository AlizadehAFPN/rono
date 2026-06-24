# Rono — Project Handoff & Reference

> Rono is a **standalone product forked from Synapse** on 2026-06-24.
> Fresh git repo, fully independent codebase. This file is the reference for
> what was changed during the fork + rebrand and what still needs doing.

## 1. What Rono is

A complete copy of the Synapse stack (adaptive learning platform: FastAPI +
SQLAlchemy async backend, Next.js frontend, native iOS + Android clients),
rebranded to **Rono** and intended to evolve **independently** from Synapse.

- Origin: copied from `~/Desktop/Synapse`, excluding `.git`, `.env`, and
  build artifacts (`node_modules`, `.venv`, `.next`, etc.).
- Git: brand-new history (`main`). Not connected to Synapse's remote.
- Domain: **`rono.getjanus.dev`** (parent `getjanus` org kept).

## 2. Brand / identifier mapping (Synapse → Rono)

| Area | Before | After |
|---|---|---|
| Display name | Synapse | **Rono** |
| Web wordmark | `Synapse` in `frontend/components/logo.tsx` | `Rono` |
| Domain | `synapse.getjanus.dev` | `rono.getjanus.dev` |
| Android package | `dev.getjanus.synapse` | `dev.getjanus.rono` |
| Android applicationId | `dev.getjanus.synapse` | `dev.getjanus.rono` |
| Android deep-link scheme | `synapse://` | `rono://` |
| Android keystore file | `synapse-release.jks` | `rono-release.jks` |
| iOS target / dir / bundle | `Synapse` / `dev.getjanus.synapse` | `Rono` / `dev.getjanus.rono` |
| Backend base exception | `SynapseException` | `RonoException` |
| Demo seed emails | `@synapse-demo.edu` | `@rono-demo.edu` |
| Cookies | `synapse-theme`, `synapse-lang` | `rono-theme`, `rono-lang` |

The **LogoMark geometry is unchanged** (abstract "hourglass" graph, no text).
Only the wordmark text changed. A distinct Rono mark can still be designed.

> Note: 3 comments in `infra/hetzner/deploy.sh` + `docker-compose.prod.yml`
> intentionally still say "Synapse" — they refer to the *sibling* Synapse
> deployment that Rono coexists with on the same host. Leave them.

## 3. Theme — brand accent is now VIOLET (was blue)

Single source per client; all WCAG AA verified.

| Token | Light | Dark |
|---|---|---|
| `primary` / `ring` / `sidebar-primary` | `#7C3AED` (5.7:1 on white) | `#9B6BFF` (4.7:1 on dim bg) |

- Web: `frontend/app/globals.css` (+ PWA `theme_color`, `manifest.ts`, `layout.tsx`).
- Web marketing homepage accent **cyan → violet** (Hero gradient → `violet-400 → fuchsia-400`).
- iOS: `ios/Rono/DesignSystem/Theme.swift`.
- Android: `core/designsystem/theme/Color.kt` (`PrimaryL`/`PrimaryD`), widget, `colors.xml`, launcher gradient.
- Data-viz `chart-1` blue (`#1D9BF0`) was intentionally **kept** (categorical palette).
- App icons regenerated from the violet gradient via `frontend/scripts/generate-icons.mjs`
  (`BRAND_TOP #9B6BFF` → `BRAND_BOTTOM #6D28D9`); this also rewrites the iOS `AppIcon-1024.png`.

## 4. Deployment — isolated to coexist with Synapse on the same Hetzner host

`infra/hetzner/deploy.sh` was hardened for Rono:

- Compose project: **`-p rono`** (Synapse uses `-p synapse`) → volumes namespaced
  `rono_pgdata` / `rono_uploads_data` → **no data crossover**.
- App dir **`/opt/rono`** (Synapse at `/opt/synapse`).
- Host port **`127.0.0.1:3200`** (Synapse uses 3100).
- Own `.env` with fresh secrets; deploy **does NOT rotate secrets** on redeploy
  (writes `.env` only if absent) and excludes `.env` + `backups/` from rsync.

Deploy command (once DNS is set):
```bash
bash infra/hetzner/deploy.sh <SERVER_IP> rono.getjanus.dev
```

## 5. TODO / follow-ups (not done yet)

- [ ] **DNS**: create an A record for `rono.getjanus.dev` → Hetzner server IP.
- [ ] **Deploy** with the command above (isolated from Synapse).
- [ ] **Frontend deps**: a temporary npm `frontend/node_modules` (~668M, gitignored)
      was created to regenerate icons. The project uses **yarn** — run
      `rm -rf frontend/node_modules && yarn install` to reconcile.
- [ ] **Build verification** not run locally (deps weren't installed): verify
      `yarn build` (frontend), Gradle sync (android), open `ios/Rono.xcodeproj`.
- [ ] **Android signing**: build machine's `keystore.properties` (gitignored secret)
      must point `storeFile` to `rono-release.jks`.
- [ ] **Stale artifact**: an old `ios/Synapse.xcodeproj` may remain on disk
      (gitignored, harmless) — delete manually. Active project is `ios/Rono.xcodeproj`.
- [ ] **Legacy CI**: `.github/workflows/*` (AWS ECS) were string-renamed but are
      legacy — Rono deploys via Hetzner, not AWS. Remove or rewrite when convenient.

## 6. Verification done

- Repo-wide sweep: **0** residual `synapse` references (excluding the 3 intentional
  sibling-deployment comments + terraform state files, which were deliberately untouched).
- Backend renamed files pass `py_compile`.
- Android package declarations match the new `dev/getjanus/rono/` directory.
- Contrast test (`ContrastTest.kt`) updated to assert the new violet values.
