/**
 * Tests for rtv-cli and rtv-client
 */
import nock from 'nock';
import sinon from 'sinon';
import { serverHost } from './constants';

beforeEach(() => {
  process.env.RTV_API_URL = `${serverHost}/api`;
});

// afterEach: assertions
afterEach(() => {
  assertPendingNocks();
});

// afterEach: cleanup
afterEach(() => {
  sinon.restore();
  nock.cleanAll();
});

after(async () => {
  nock.restore();
});

function assertPendingNocks() {
  if (!nock.isDone()) {
    const pendingMocks = nock.pendingMocks();
    const pendingMocksSliced =
      pendingMocks.length > 5 ? pendingMocks.slice(0, 5).concat(['...and more']) : pendingMocks;
    throw new Error(`Pending mocks (${pendingMocks.length}):\n${pendingMocksSliced.join('\n')}`);
  }
}
