export function beautifyJson(obj: unknown) {
  return obj ? JSON.stringify(obj, null, 2) : '';
}

export function formatTime(time: Date) {
  const hours = time.getHours().toString().padStart(2, '0');
  const mins = time.getMinutes().toString().padStart(2, '0');
  const secs = time.getSeconds().toString().padStart(2, '0');
  const ms = time.getMilliseconds().toString().padStart(3, '0');

  return `${hours}:${mins}:${secs}.${ms}`;
}

export function setCookieValue({ name, value, expires }: { name: string; value: string; expires: Date }) {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )}; expires=${expires.toUTCString()}; SameSite=None; Secure; path=/;`;
}

export function getCookieValue(name: string) {
  const encodedName = encodeURIComponent(name);
  const encodedValue = `; ${document.cookie}`.split(`; ${encodedName}=`).pop()?.split(';').shift();
  return encodedValue && decodeURIComponent(encodedValue);
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
