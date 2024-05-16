export function getLocalTime(unix: number) {
  return new Date(unix * 1000).toLocaleString();
}
