/** Loader hook: stub CSS modules so compiled client code can load in Node. */
export async function resolve(specifier, context, next) {
  if (specifier.endsWith('.module.css')) {
    return {
      url: 'data:text/javascript,export default new Proxy({}, { get: () => "stubbed-css-class" })',
      shortCircuit: true,
    }
  }
  return next(specifier, context)
}
