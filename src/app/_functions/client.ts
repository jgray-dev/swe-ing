export function getLocalTime(unix: number) {
  return new Date(unix).toLocaleString();
}
