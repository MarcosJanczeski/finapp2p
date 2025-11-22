import http, { IncomingMessage, ServerResponse } from 'node:http'
import { URL } from 'node:url'

type RouteHandler = (req: IncomingMessage, res: ServerResponse, params: Record<string, string>) => void

const routes: Array<{ method: string; path: string; handler: RouteHandler }> = [
  {
    method: 'GET',
    path: '/health',
    handler: (_req, res) => {
      sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() })
    }
  }
]

function sendJson(res: ServerResponse, status: number, body: unknown) {
  const data = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data)
  })
  res.end(data)
}

function notFound(res: ServerResponse) {
  sendJson(res, 404, { error: 'Not found' })
}

function matchRoute(req: IncomingMessage): RouteHandler | undefined {
  if (!req.url || !req.method) return undefined
  const url = new URL(req.url, 'http://localhost')
  const path = url.pathname
  const method = req.method.toUpperCase()
  return routes.find((route) => route.method === method && route.path === path)?.handler
}

const port = process.env.PORT ? Number(process.env.PORT) : 3000

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  const handler = matchRoute(req)
  if (!handler) {
    return notFound(res)
  }
  handler(req, res, {})
})

server.listen(port, () => {
  // Log simples para validar execução local.
  console.log(`Backend listening on http://localhost:${port}`)
})
