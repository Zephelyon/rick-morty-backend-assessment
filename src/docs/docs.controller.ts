import { Controller, Get, Header, Res } from '@nestjs/common';
import type { Response } from 'express';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

@Controller()
export class DocsController {
  @Get('docs')
  @Header('Content-Type', 'text/html; charset=utf-8')
  getDocs(): string {
    // Serve Redoc UI via CDN, pointing to our OpenAPI document
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>API Docs — Rick & Morty (Redocly)</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { margin: 0; padding: 0; }
      .top-banner { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, "Apple Color Emoji", "Segoe UI Emoji"; background:#0f172a; color:#e2e8f0; padding:12px 16px; }
      .top-banner a { color:#60a5fa; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="top-banner">Documentation generated with <a href="https://redocly.com/redoc/" target="_blank" rel="noreferrer">Redocly</a>. Specification: <code>/openapi.yaml</code></div>
    <redoc spec-url="/openapi.yaml" hide-download-button="false"></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  </body>
</html>`;
  }

  @Get('openapi.yaml')
  getOpenApi(@Res() res: Response) {
    const filePath = resolve(process.cwd(), 'openapi.yaml');
    if (!existsSync(filePath)) {
      return res.status(404).type('text/plain').send('openapi.yaml not found');
    }
    const content = readFileSync(filePath, 'utf8');
    return res.type('application/yaml; charset=utf-8').send(content);
  }
}
