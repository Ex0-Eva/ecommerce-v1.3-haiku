import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execFileAsync = promisify(execFile)

const DEFAULT_ALLOWED = [
  'ecommerce-template001.vercel.app',
  'ecommerce-template002.vercel.app',
  'ecommerce-template003.vercel.app',
  'ecommerce-template004.vercel.app',
  'ecommerce-template005.vercel.app',
  'localhost',
  '127.0.0.1'
]

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/https?:\/\//, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const targets = Array.isArray(body.targets) ? body.targets : []
    const allowed = Array.isArray(body.allowed) && body.allowed.length ? body.allowed : DEFAULT_ALLOWED

    if (!targets.length) {
      return new Response(JSON.stringify({ ok: false, error: 'no targets provided' }), { status: 400 })
    }

    const results = await Promise.allSettled(
      targets.map(async (t: any) => {
        const url = t.url
        if (!url || typeof url !== 'string') return { ok: false, reason: 'invalid url', target: t }
        let hostname: string
        try {
          hostname = new URL(url).hostname
        } catch (e) {
          return { ok: false, reason: 'invalid url', target: t }
        }

        if (!allowed.includes(hostname)) {
          return { ok: false, reason: 'domain not allowed', host: hostname, target: t }
        }

        const name = t.name || hostname
        const slug = slugify(name)
        const outDir = path.join(process.cwd(), 'public', 'template', slug)
        fs.mkdirSync(outDir, { recursive: true })

        const scriptPath = path.join(process.cwd(), 'scripts', 'screenshot-homepage.js')
        const args = ['--url', url, '--outDir', outDir]

        try {
          // Run the screenshot script
          const { stdout, stderr } = await execFileAsync('node', [scriptPath, ...args], { timeout: 5 * 60 * 1000 })
          return { ok: true, target: t, outDir: outDir.replace(process.cwd() + path.sep, ''), stdout: String(stdout).slice(0, 2000), stderr: String(stderr).slice(0, 2000) }
        } catch (err: any) {
          return { ok: false, target: t, reason: err.message || String(err), stderr: err.stderr ? String(err.stderr).slice(0, 2000) : undefined }
        }
      })
    )

    const mapped = results.map(r => (r.status === 'fulfilled' ? r.value : { ok: false, reason: 'unexpected' }))
    return new Response(JSON.stringify({ ok: true, results: mapped }, null, 2), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 })
  }
}
