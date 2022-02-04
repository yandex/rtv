import nodeAssert from 'assert';

import { waitForFunction } from '../../src/helpers/wait-for-function';

describe('waitForFunction', async () => {
  it('should reject on timeout', async () => {
    let a = false;
    setTimeout(() => (a = true), 200);

    await nodeAssert.rejects(waitForFunction(() => a, { interval: 50, timeout: 100 }));
  });

  it('should wait for function', async () => {
    let a = false;
    setTimeout(() => (a = true), 200);

    await nodeAssert.doesNotReject(waitForFunction(() => a, { interval: 100, timeout: 300 }));
  });

  it('should wait for function with default timings', async () => {
    let a = false;
    setTimeout(() => (a = true), 200);

    await nodeAssert.doesNotReject(waitForFunction(() => a));
  });
});
