// This shim exports class-validator and class-transformer decorators if available.
// If the packages are not installed (e.g., in a minimal test environment),
// it falls back to no-op decorators so imports continue to work without runtime errors.

function makeNoopDecorator(): any {
  return function () {
    return function () {
      // no-op
    } as any;
  } as any;
}

function safeLoad(mod: string): any | null {
  try {
    // In Jest (CJS), require is defined. In ESM environments, this will throw and we fall back to no-ops.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    if (typeof require === 'function') {
      return require(mod);
    }
    return null;
  } catch {
    return null;
  }
}

// Try to load real libraries when possible
const cv: any = safeLoad('class-validator');
const ct: any = safeLoad('class-transformer');

// Export validators (or no-ops)
export const IsInt = (cv && cv.IsInt) ? cv.IsInt : makeNoopDecorator();
export const IsOptional = (cv && cv.IsOptional) ? cv.IsOptional : makeNoopDecorator();
export const IsString = (cv && cv.IsString) ? cv.IsString : makeNoopDecorator();
export const Max = (cv && cv.Max) ? cv.Max : makeNoopDecorator();
export const MaxLength = (cv && cv.MaxLength) ? cv.MaxLength : makeNoopDecorator();
export const Min = (cv && cv.Min) ? cv.Min : makeNoopDecorator();

// Export transformers (or no-ops)
export const Transform = (ct && ct.Transform) ? ct.Transform : makeNoopDecorator();
export const Type = (ct && ct.Type) ? ct.Type : makeNoopDecorator();
