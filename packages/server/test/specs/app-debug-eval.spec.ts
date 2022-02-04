import nock from 'nock';

import { stubCmd, getMock, rtvClient, stubWS } from '../helpers';

const wsResponseById = (id: string) => ({
  id,
  result: {
    result: {
      type: 'string',
      value: 'http://index.html',
    },
  },
});
const wsUrl = 'ws://1.2.3.5:7011/devtools/page/6319D57F-1A01-403A-915A-CBF24A9C4D74';

describe('app-debug-eval', () => {
  it('eval on debug (saved on server)', async () => {
    stubCmd('sdb connect 1.2.3.5', getMock('tizen40/sdb_connect_ok.txt'));
    stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen40/sdb_capability.txt'));
    stubCmd('sdb -s 1.2.3.5 shell 0 kill TESTABCDEF', getMock('tizen24/sdb_kill_terminated.txt'));
    stubCmd('sdb -s 1.2.3.5 shell 0 debug TESTABCDEF.app2', getMock('tizen40/sdb_debug_ok.txt'));
    nock('http://1.2.3.5:7011').get('/json/list').reply(200, getMock('tizen30/debugger-json-list.json'));

    await Promise.all([
      rtvClient.app.debugApp('1.2.3.5', 'TESTABCDEF.app2', { foo: 1 }, {}),
      waitWebsocketMessageExpression(wsUrl, '(function () { console.log(42) })({"foo":1})'),
    ]);
  });

  it('eval on debug (passed as options.eval)', async () => {
    stubCmd('sdb connect 1.2.3.5', getMock('tizen40/sdb_connect_ok.txt'));
    stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen40/sdb_capability.txt'));
    stubCmd('sdb -s 1.2.3.5 shell 0 kill TESTABCDEF', getMock('tizen24/sdb_kill_terminated.txt'));
    stubCmd('sdb -s 1.2.3.5 shell 0 debug TESTABCDEF.app2', getMock('tizen40/sdb_debug_ok.txt'));
    nock('http://1.2.3.5:7011').get('/json/list').reply(200, getMock('tizen30/debugger-json-list.json'));

    await Promise.all([
      rtvClient.app.debugApp(
        '1.2.3.5',
        'TESTABCDEF.app2',
        { foo: 1 },
        {
          eval: () => console.log(123),
        }
      ),
      waitWebsocketMessageExpression(wsUrl, '(() => console.log(123))({"foo":1})'),
    ]);
  });
});

async function waitWebsocketMessageExpression(wsUrl: string, expression: string) {
  const wsServer = stubWS(wsUrl);
  return new Promise((resolve) => {
    wsServer.on('connection', (socket) => {
      socket.on('message', (msg) => {
        const msgObj = JSON.parse(msg as string);
        if (expression === msgObj.params.expression) {
          resolve('success');
        } else {
          const responseText = JSON.stringify(wsResponseById(msgObj.id));
          socket.send(responseText);
        }
      });
    });
  });
}
