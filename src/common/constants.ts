export function getValue(key: string, defaultValue: string) {
  return process.env[key] || defaultValue;
}
