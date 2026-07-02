/**
 * @Timing — Method decorator that logs execution time of any async method.
 * Pattern: Decorator Pattern (GoF)
 *
 * Usage:
 *   @Timing
 *   async myMethod() { ... }
 */
export function Timing(
  target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor,
): PropertyDescriptor {
  const originalMethod = descriptor.value as (...args: unknown[]) => Promise<unknown>

  descriptor.value = async function (...args: unknown[]) {
    const start = performance.now()
    const result = await originalMethod.apply(this, args)
    const duration = (performance.now() - start).toFixed(2)
    console.log(`[Timing] ${target.constructor.name}.${propertyKey} → ${duration}ms`)
    return result
  }

  return descriptor
}
