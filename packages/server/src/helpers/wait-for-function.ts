/**
 * Waits until func returns truthy value
 * @param {function} func - function to check, can be async
 * @param {number} [interval=100] - polling interval ms
 * @param {number} [timeout=30000] - timeout ms
 */
export async function waitForFunction<T>(func: () => T, { interval = 100, timeout = 30000 } = {}) {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const check = async () => {
      try {
        const timeLeft = Date.now() - startTime;
        if (timeLeft > timeout) {
          return reject(new Error(`Timeout ${timeout} ms exceeded.`));
        }
        const result = await func();
        if (result) {
          resolve(result);
        } else {
          setTimeout(check, interval);
        }
      } catch (e) {
        reject(e);
      }
    };

    check();
  });
}
