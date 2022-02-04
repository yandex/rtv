/**
 * Change speed of timers for unit tests.
 */

const origSetTimeout = setTimeout;

export function set(rate: number) {
  global.setTimeout = ((fn: any, delay: number, ...args: any[]) =>
    origSetTimeout(fn, Math.round(delay / rate), ...args)) as typeof origSetTimeout;
}

export function reset() {
  global.setTimeout = origSetTimeout;
}
