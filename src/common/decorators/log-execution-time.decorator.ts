/*
 * Method decorator that logs the execution time of the decorated method.
 * Works with both sync and async methods (Promises).
 *
 * What it does:
 * - Wraps the original method and measures wall-clock time using high-resolution timers when available.
 * - Logs a colored, human-friendly line with ISO timestamp, method label and duration.
 * - Preserves metadata set by other NestJS decorators (e.g., GraphQL resolvers) to avoid breaking reflection.
 *
 * Performance notes:
 * - Uses process.hrtime.bigint() when available; falls back to Date.now() if not.
 * - Console logging has I/O cost: prefer enabling only in development or on specific methods/hot paths.
 * - For centralized logging, consider piping through NestJS Logger or your observability stack.
 *
 */
import chalk from 'chalk';

function colorDuration(ms: number, isError = false) {
  const s = `${ms.toFixed(0)}ms`;
  if (isError || ms >= 200) return chalk.red(s);
  if (ms >= 50) return chalk.yellow(s);
  return chalk.green(s);
}

function prefix(isError = false) {
  return isError
    ? chalk.bgRed.white.bold(' EXEC ')
    : chalk.bgBlue.white.bold(' EXEC ');
}

export function LogExecutionTime(label?: string): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const original = descriptor.value;

    if (typeof original !== 'function') {
      return descriptor;
    }

    // This block copies design-time metadata (used by other decorators) from the original function to the wrapper.
    const copyFnMetadata = (from: Function, to: Function) => {
      try {
        const R: any = Reflect as any;
        if (R && typeof R.getMetadataKeys === 'function') {
          const keys = R.getMetadataKeys(from) || [];
          for (const k of keys) {
            const v = R.getMetadata(k, from);
            R.defineMetadata(k, v, to);
          }
        }
      } catch {
        // ignore metadata copy errors
      }
    };

    // Prefer nanosecond-resolution timers when available; fallback keeps behavior consistent across runtimes.
    const nowNs = () => {
      try {
        if (typeof (process as any)?.hrtime?.bigint === 'function') {
          return (process as any).hrtime.bigint() as bigint;
        }
      } catch {}
      return BigInt(Date.now() * 1_000_000);
    };

    // Wrapper that handles both sync and async methods uniformly via await.
    const wrapped = async function (...args: any[]) {
      const name =
        label ?? `${target?.constructor?.name ?? ''}.${String(propertyKey)}`;
      const start = nowNs();
      try {
        const val = await original.apply(this, args);
        const end = nowNs();
        const durationMs = Number((end as any) - (start as any)) / 1_000_000;

        console.log(
          `${prefix(false)} ${chalk.gray(new Date().toISOString())} ${chalk.cyan(name)} ${chalk.gray('in')} ${colorDuration(durationMs)}`,
        );
        return val;
      } catch (err) {
        const end = nowNs();
        const durationMs = Number((end as any) - (start as any)) / 1_000_000;

        console.log(
          `${prefix(true)} ${chalk.gray(new Date().toISOString())} ${chalk.cyan(name)} ${chalk.gray('failed in')} ${colorDuration(durationMs, true)}`,
        );
        throw err;
      }
    } as any;

    // Preserve metadata that other Nest decorators may rely on
    copyFnMetadata(original, wrapped);

    descriptor.value = wrapped;
    return descriptor;
  };
}
