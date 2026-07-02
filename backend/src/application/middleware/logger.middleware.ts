import { Request, Response, NextFunction } from 'express'

export function loggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now()
  const { method, url, ip } = req

  res.on('finish', () => {
    const duration = Date.now() - start
    const status = res.statusCode
    const statusColor = status >= 400 ? '\x1b[31m' : status >= 300 ? '\x1b[33m' : '\x1b[32m'
    const reset = '\x1b[0m'

    console.log(
      `[${new Date().toISOString()}] ${statusColor}${status}${reset} ${method} ${url} — ${duration}ms — ${ip}`,
    )
  })

  next()
}
