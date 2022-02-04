/**
 * Script evaluation after debug start. Here you can process launch params.
 * Especially needed for Tizen, because `sbd` doesn't support parameters.
 */
import WebSocketAsPromised from 'websocket-as-promised';
import websocket from 'websocket';
import Loggee from 'loggee';
import { Platform } from '..';

const logger = Loggee.create('eval on debug');

const WAITING_PAGE_TIMEOUT = 60000;

let id = 1;
const evalPayload = (expression: string) => ({
  id: id++,
  method: 'Runtime.evaluate',
  params: { expression },
});

/**
 * Execute script on debug remotely via Chrome DevTools Protocol
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Runtime/#method-evaluate
 * If there will be any problems, puppeteer-tv can be used instead.
 *
 * @param {string} wsUrl - websocket URL
 * @param {string} fn - stringified function to eval
 * @param {Object} launchParams - launch params
 * @param {string} platform - platform name
 */
export const remoteEval = async (
  wsUrl: string,
  fn: string,
  launchParams: Record<string, unknown>,
  platform: Platform
) => {
  const expression = `(${fn})(${JSON.stringify(launchParams)})`;
  const wsp = createWsp(wsUrl);
  try {
    await wsp.open();
    if (platform !== 'playstation') {
      await waitForPage(wsp);
    }
    wsp.sendPacked(evalPayload(expression));
  } catch (e) {
    logger.error(e);
  } finally {
    await wsp.close();
  }
};

async function waitForPage(wsp: WebSocketAsPromised) {
  const checkUrlIntervalId = setInterval(() => {
    try {
      wsp.sendPacked(evalPayload('location.href'));
    } catch (e) {
      logger.error(e);
    }
  }, 500);
  try {
    await wsp.waitUnpackedMessage(
      (data) => data.result && data.result.result && data.result.result.value !== 'about:blank',
      { timeout: WAITING_PAGE_TIMEOUT }
    );
  } catch (error) {
    // Tizen 5 (2019) shows system dialog before loading index.html page, wait here when OK will be pressed
    throw new Error('Waiting for page failed: probably system dialog OK was not pressed');
  } finally {
    clearInterval(checkUrlIntervalId);
  }
}

function createWsp(wsUrl: string) {
  const wsp = new WebSocketAsPromised(wsUrl, {
    createWebSocket: (url) => new websocket.w3cwebsocket(url),
    packMessage: (data) => JSON.stringify(data),
    unpackMessage: (message) => JSON.parse(message.toString()),
  });

  wsp.onSend.addListener((message) => logger.log(`SEND ► ${message}`));
  wsp.onMessage.addListener((message) => logger.log(`RECV ◀ ${message}`));
  wsp.onError.addListener(logger.error);

  return wsp;
}
