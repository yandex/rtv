import path from 'path';
import sinon from 'sinon';
import chai from 'chai';
import unzipper from 'unzipper';
import fs from 'fs-extra';

import cliCmd from '../helpers/cli-cmd';
import { serverMock, serverHost, testTmpDir } from '../constants';

const extractZip = async (zipPath: string, destPath: string) => {
  await fs.emptyDir(destPath);
  await fs
    .createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: destPath }))
    .promise();
};

describe('cli:app', () => {
  it('app-install (from wgt)', async () => {
    serverMock.post('/api/app/install').reply(200, {
      result: 'ok',
      appId: 'TESTABCDEF.App',
    });

    const logger = await cliCmd(`app-install 1.2.3.5 ${path.join(__dirname, '../mocks/App.wgt')}`);
    sinon.assert.calledWithMatch(logger.table, { appId: 'TESTABCDEF.App' });
  });

  it('app-install (from directory)', async () => {
    const pkgDestPath = path.join(testTmpDir, 'app');
    await extractZip(path.join(__dirname, '../mocks/App.zip'), pkgDestPath);
    serverMock.post('/api/app/install').reply(200, {
      result: 'ok',
      appId: 'TESTABCDEF.App',
    });

    const logger = await cliCmd(`app-install 1.2.3.5 ${pkgDestPath}`);
    sinon.assert.calledWithMatch(logger.table, { appId: 'TESTABCDEF.App' });
  });

  it('app-pack', async () => {
    const pkgDestPath = path.join(testTmpDir, 'app1');
    await extractZip(path.join(__dirname, '../mocks/App.zip'), pkgDestPath);
    serverMock.post('/api/app/pack').reply(200, 'File content', {
      'content-disposition': 'attachment;filename="App.wgt"',
    });

    const outFilePath = path.join(testTmpDir, 'App.wgt');
    const logger = await cliCmd(`app-pack ${pkgDestPath} ${outFilePath}`);
    sinon.assert.calledWith(logger.table, { file: outFilePath });
    const fileContent = await fs.readFile(outFilePath);
    chai.assert.equal(fileContent.toString(), 'File content');
  });

  it('app-pack with --tizenSecurityProfile', async () => {
    const pkgDestPath = path.join(testTmpDir, 'app1');
    const outFilePath = path.join(testTmpDir, 'App.wgt');
    await extractZip(path.join(__dirname, '../mocks/App.zip'), pkgDestPath);
    serverMock
      .post('/api/app/pack', (body) => {
        return hexToString(body).includes('Content-Disposition: form-data; name="tizenSecurityProfile"\r\n\r\nfoo');
      })
      .reply(200, 'File content', {
        'content-disposition': 'attachment;filename="App.wgt"',
      });

    const logger = await cliCmd(`app-pack ${pkgDestPath} ${outFilePath} --tizenSecurityProfile foo`);

    sinon.assert.calledWith(logger.table, { file: outFilePath });
    const fileContent = await fs.readFile(outFilePath);
    chai.assert.equal(fileContent.toString(), 'File content');
  });

  it('app-state', async () => {
    serverMock.get('/api/app/state?ip=1.2.3.5&appId=TESTABCDEF.App').reply(200, {
      name: 'My App',
      running: false,
      version: '1.0.1',
      visible: false,
      id: 'TESTABCDEF.App',
    });

    const logger = await cliCmd('app-state 1.2.3.5 TESTABCDEF.App');
    sinon.assert.calledWithMatch(logger.table, { id: 'TESTABCDEF.App' });
  });

  it('app-launch', async () => {
    serverMock
      .post(
        `/api/app/launch?ip=1.2.3.5&appId=TESTABCDEF.App&params=${encodeURIComponent(JSON.stringify({ foo: 'bar' }))}`
      )
      .reply(200, {
        ok: true,
      });

    const logger = await cliCmd('app-launch 1.2.3.5 TESTABCDEF.App {"foo":"bar"}');
    sinon.assert.calledWithMatch(logger.table, { ok: true });
  });

  it('app-debug', async () => {
    const debugUrl = `${serverHost}/devtools/inspector.html?ws=${serverHost}proxy/http/1.2.3.5/7011/devtools/page/6319D57F-1A01-403A-915A-CBF24A9C4D74%3Frtv-user%3Dtest`;
    serverMock.post('/api/app/debug?ip=1.2.3.5&appId=TESTABCDEF.App&options=%7B%7D').reply(200, {
      title: 'My App',
      debugUrl,
    });

    const logger = await cliCmd('app-debug 1.2.3.5 TESTABCDEF.App');
    sinon.assert.calledWithMatch(logger.table, { debugUrl });
  });

  it('app-close', async () => {
    serverMock.post('/api/app/close?ip=1.2.3.5&appId=TESTABCDEF.App').reply(200, {
      wasClosed: true,
    });

    const logger = await cliCmd('app-close 1.2.3.5 TESTABCDEF.App');
    sinon.assert.calledWithMatch(logger.table, { wasClosed: true });
  });

  it('app-uninstall', async () => {
    serverMock.post('/api/app/uninstall?ip=1.2.3.5&appId=TESTABCDEF.App').reply(200, {
      result: 'ok',
      appId: 'TESTABCDEF.App',
    });

    const logger = await cliCmd('app-uninstall 1.2.3.5 TESTABCDEF.App');
    sinon.assert.calledWithMatch(logger.table, { appId: 'TESTABCDEF.App' });
  });

  it('app-list', async () => {
    const appList = [
      { appId: '4uI12bRGkE.OkkoHD', name: 'Okko Фильмы HD' },
      { appId: 'adplatform.ADPlayer', name: '' },
      { appId: 'vxqdl8ERTQ.SmartTV', name: 'smartHD' },
    ];
    serverMock.get('/api/app/list?ip=1.2.3.5').reply(200, appList);

    const logger = await cliCmd('app-list 1.2.3.5');
    sinon.assert.calledWith(logger.table, appList);
  });
});

// see: https://github.com/nock/nock/issues/887#issuecomment-301009923
const hexToString = (hex: string) => {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
};
