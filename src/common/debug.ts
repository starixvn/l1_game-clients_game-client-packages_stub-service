const colors = ["\x1b[32m", "\x1b[33m", "\x1b[34m", "\x1b[35m", "\x1b[36m"];
const contextColors = {};

function getContextColor(context: string) {
  if (!contextColors[context]) {
    const index = Object.keys(contextColors).length % colors.length;

    contextColors[context] = colors[index];
  }

  return contextColors[context];
}

export function debug(context: string, ...args: unknown[]) {
  if (context) {
    const color = getContextColor(context);

    console.debug(color, `${context}:`, ...args, "\x1b[0m");
  }
}
