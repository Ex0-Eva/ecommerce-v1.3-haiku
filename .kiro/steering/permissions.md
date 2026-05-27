---
inclusion: always
---

# Kiro Permissions & Capabilities

## Package Manager
- Use **pnpm** for all package operations — never npm or yarn
- Allowed commands: `pnpm install`, `pnpm add`, `pnpm remove`, `pnpm run`, `pnpm build`, `pnpm dev`, `pnpm start`, `pnpm lint`, `pnpm prisma`
- npm is allowed only for `npx` one-off commands (e.g. `npx prisma`, `npx tsx`)

## Terminal Commands
- Full access to run shell commands via the terminal tool
- Allowed: `pnpm`, `npx`, `node`, `git`, `prisma` CLI commands
- Can run build scripts, migration scripts, seed scripts, and test scripts without asking for permission

## Browser & DevTools
- Can instruct the user to open browser DevTools (F12) for debugging
- Can use Playwright for automated browser testing and screenshots
- Script: `scripts/screenshot-homepage.js` is available for capturing screenshots

## File System
- Full read/write access to all project files
- Can create, edit, and delete files in the project directory
- Can create new directories as needed

## Database
- Can run `pnpm prisma migrate dev`, `pnpm prisma migrate deploy`, `pnpm prisma db seed`, `pnpm prisma generate`, `pnpm prisma studio`
- DATABASE_URL is configured in `.env` and `.env.local` pointing to Prisma Postgres (Vercel)

## Environment
- `.env` — Prisma CLI database connection
- `.env.local` — Next.js runtime environment variables
- Never commit secrets to git

## Definition of Done — ทุกงานต้องผ่านก่อนส่ง

**ก่อนบอกว่างานเสร็จทุกครั้ง ต้องทำตามลำดับนี้:**

1. `npx tsc --noEmit` — ต้องไม่มี TypeScript error
2. `pnpm build` — ต้องผ่าน (exit code 0)
3. ถ้า build ล้มเหลว → แก้ error ทั้งหมดแล้ว build ใหม่จนผ่าน
4. ห้ามส่งงานถ้ายังมี error ที่แก้ได้อยู่

**ข้อยกเว้น:**
- `WasmHash._updateWithBuffer` crash บน Windows — เป็น known bug ของ Next.js 16.2.6 + webpack บน Windows เท่านั้น ไม่ต้องแก้ ถือว่าผ่าน
- Vercel build บน Linux จะผ่านปกติ
