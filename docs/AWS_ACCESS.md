# AWS Access

> This repo is **public**. Account IDs, the Organization ID and email addresses are deliberately left out: see LastPass.
> Never use root credentials for daily work; never print, log or commit access keys.

## Summary
- This project runs in AWS account "Mosaic" (account ID: see LastPass), region eu-central-1 (Frankfurt).
- Mosaic is the management account of an AWS Organization (ID: see LastPass), which also contains account "saasofsaass.com" (project Soss; account ID: see LastPass).
- Credentials and recovery details are stored in LastPass and in `C:\Users\elcar\Documents\WEBs\Accesses\AWS`. This doc only says where they are, never what they are.

## How to log in (daily)
- AWS access portal (IAM Identity Center, instance in us-east-1): https://d-9067c92674.awsapps.com/start
- User: carles. Permission set: AdministratorAccess (8h sessions). Pick Mosaic → AdministratorAccess.
- MFA: Google Authenticator entry "AWS – portal (carles)" or passkey "HP_OMEN – Windows Carles" (Windows Hello).
- Multi-session support is enabled in the console, so both accounts can be open side by side.

## Root user (emergency only)
- Root email: see LastPass. MFA entry "AWS – ROOT Mosaic (emergency)".
- Use only for root-only tasks, always in an incognito window starting at https://console.aws.amazon.com/.
- IAM access to Billing/Account pages is enabled, so root is not needed for billing.
- Centralized root access for member accounts is enabled here (IAM → Root access management). Privileged root actions on member accounts must be run from the portal login, not as root.

## IAM users in this account (programmatic only, no console login)
- carles-iam: active access key, in use, created ~599 days ago (as of 2026-10-25). To be replaced by `aws configure sso`, then deactivated.
- carles-amplify-user: old Netlify integration, key deactivated 2026-10-25. Delete around 2026-11-08 if nothing broke.

## Which credentials this repo uses
Searched 2026-10-25: config files, `amplify.yml`, `.github/`, `.gitignore`, `package.json`, `README.md`, `scripts/`, `docs/RUNBOOKS.md`.
- **No AWS credentials are referenced in the repo.** No AWS profile names, no `AWS_*` env var names, no GitHub secret names, no OIDC roles. There is no `amplify/` folder and no `.github/workflows/` (`.github/` only holds `copilot-instructions.md`), and no `.env.example`.
- **Local scripts use the AWS CLI's default credential chain** (no `--profile`, no keys in code), i.e. whatever the local default profile is (today presumably carles-iam's key; after the switch, an SSO profile):
  - `scripts/restore-missing-large-renditions.mjs`: `aws s3api` / `aws s3 cp` on bucket `mosaic.photography`
  - `scripts/community/photography/import-photography-contributor.mjs`: `aws s3 sync`
  - `scripts/contributors/synch-images-with-aws-move-*.sh`: `aws s3 sync` to `s3://mosaic.photography/...`
  - `docs/RUNBOOKS.md` requires "AWS CLI logged in with write access to bucket `mosaic.photography`".
- **Amplify Hosting build** (`amplify.yml`) uses no AWS credentials. It only reads Amplify Console env vars (Supabase, `AWIN_PUBLISHER_ID`) and writes `AWIN_PUBLISHER_ID` to `.env.production`. Amplify's own service role isn't defined in the repo; check it in the Amplify console if needed.
- Note: `aws/` (README, THIRD_PARTY_LICENSES, `install`) is the AWS CLI v2 installer, committed by accident; `aws/dist/` and `awscliv2.zip` are git-ignored. No credentials in it.

## Pending
- 2026-11-08: delete carles-amplify-user.
- Later: switch local CLI/Amplify to `aws configure sso` (portal URL above, region us-east-1), then deactivate carles-iam's key. If the SSO profile isn't named `default`, the scripts above need `AWS_PROFILE=<name>` set in the shell.

## Change log
- 2026-10-25: moved from root-only logins to IAM Identity Center for both accounts; added passkey; enabled IAM billing access and centralized root access; deleted root credentials of the Soss account; deactivated carles-amplify-user key; renamed account carles_riu → Mosaic.
