import {Injectable, NestMiddleware} from '@nestjs/common';
import type {Request, Response, NextFunction} from 'express';
import chalk from 'chalk';

/*
    * HTTP logging middleware.
    *
    * Privacy and payload size:
    * - Can log GraphQL variables; avoid including sensitive data or anonymize it.
    * - Queries and payloads are truncated to avoid huge logs (query ~700 chars, payload ~2000/1500).
    * - These limits can be configured via ConfigService if required.
    *
    * Introspection:
    * - Introspection queries are detected and logged compactly.
*/

function colorMethod(method: string) {
    switch (method.toUpperCase()) {
        case 'GET':
            return chalk.blue(method);
        case 'POST':
            return chalk.green(method);
        default:
            return chalk.white(method);
    }
}

function colorStatus(status: number) {
    if (status >= 500) return chalk.bgRed.white(` ${status} `);
    if (status >= 400) return chalk.red(String(status));
    if (status >= 300) return chalk.cyan(String(status));
    return chalk.green(String(status));
}

function safeStringify(obj: any, space = 2, maxLength = 2000) {
    try {
        const text = JSON.stringify(obj, null, space);
        if (!text) return undefined;
        if (text.length > maxLength) {
            return text.slice(0, maxLength) + `\n${chalk.gray('...truncated...')}`;
        }
        return text;
    } catch {
        return undefined;
    }
}

function isGraphQLIntrospection(body: any): boolean {
    if (!body) return false;
    if (body.operationName === 'IntrospectionQuery') return true;
    const q: string | undefined = body.query;
    return !!q && q.includes('__schema');
}

function extractGraphQLOperationName(query: any): string | undefined {
    if (typeof query !== 'string') return undefined;
    // Remove leading comments and whitespace
    const q = query.trim().replace(/^#[^\n]*\n/gm, '').trim();
    const match = q.match(/^(query|mutation|subscription)\s+([A-Za-z_][A-Za-z0-9_]*)\b/);
    return match ? match[2] : undefined;
}

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const time = new Date().toISOString();
        const method = req.method;
        const url = (req as any).originalUrl || req.url;
        const ip = (req.headers['x-forwarded-for'] as string) || (req.ip || (req.socket && req.socket.remoteAddress) || '');

        const finish = () => {
            // In Express, finish may fire multiple times if misused; remove listener after first run
            res.removeListener('finish', finish);
            const status = res.statusCode;

            const header = [
                chalk.bgMagenta.white.bold(' REQ '),
                chalk.gray(time),
                colorMethod(method),
                chalk.white(url),
                chalk.gray('from'),
                chalk.white(ip),
            ];

            const metaParts: string[] = [];
            metaParts.push(`${chalk.gray('status')} ${colorStatus(status)}`);

            // Payload + resolve GraphQL operation name for logs
            let payloadStr: string | undefined;
            let resolvedOperationName: string | undefined;
            if (method !== 'GET') {
                const body = (req as any).body;
                if (body) {
                    if (url.startsWith('/api/rick-and-morty')) {
                        if (isGraphQLIntrospection(body)) {
                            resolvedOperationName = body.operationName || 'IntrospectionQuery';
                            payloadStr = chalk.gray('(GraphQL introspection query)');
                        } else {
                            // Try to resolve the operation name from body.operationName or from the query text
                            resolvedOperationName =
                                (typeof body.operationName === 'string' && body.operationName.trim()) ||
                                extractGraphQLOperationName(body.query);
                            const gqlPayload: any = {
                                // Ensure values are visible and not null in logs
                                operationName: resolvedOperationName || 'anonymous',
                                variables:
                                    typeof body.variables === 'string'
                                        ? (() => {
                                            try {
                                                return JSON.parse(body.variables);
                                            } catch {
                                                return {};
                                            }
                                        })()
                                        : body.variables ?? {},
                                query: typeof body.query === 'string' ? body.query.trim() : body.query,
                            };
                            // Avoid logging megabyte-sized queries
                            if (typeof gqlPayload.query === 'string' && gqlPayload.query.length > 700) {
                                gqlPayload.query = gqlPayload.query.slice(0, 700) + ' ...';
                            }
                            const s = safeStringify(gqlPayload, 2, 2000);
                            if (s) payloadStr = s;
                        }
                    } else {
                        const s = safeStringify(body, 2, 1500);
                        if (s) payloadStr = s;
                    }
                }
            }
            if (resolvedOperationName) {
                metaParts.push(`${chalk.gray('op')} ${chalk.white(resolvedOperationName)}`);
            }

            // Build output lines
            const line1 = header.join(' ');
            const line2 = `${chalk.gray('•')} ${metaParts.join(chalk.gray(' | '))}`;
            if (payloadStr) {
                // Align payload block with a label
                const label = chalk.gray('payload');
                const block = payloadStr
                    .split('\n')
                    .map((ln) => '  ' + ln)
                    .join('\n');
                // eslint-disable-next-line no-console
                console.log(`${line1}\n${line2}\n${label}:\n${block}`);
            } else {
                // eslint-disable-next-line no-console
                console.log(`${line1}\n${line2}`);
            }
        };

        res.on('finish', finish);
        next();
    }
}
