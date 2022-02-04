import { assert } from 'chai';
import MemoryAdapter from 'lowdb/adapters/Memory';

import { initDb } from '../../src/helpers/db';

import { getMock, req, reqJson, reqPostJson, stubCmd } from '../helpers';

describe('app-list', () => {
  describe('Tizen 2.3', () => {
    beforeEach(() => {
      stubCmd('sdb connect 1.2.3.5', getMock('tizen23/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen23/sdb_capability.txt'));
    });

    it('list: return apps list', async () => {
      stubCmd('sdb -s 1.2.3.5 shell 0 applist', getMock('tizen23/sdb_applist.txt'));
      const result = await reqJson('api/app/list?ip=1.2.3.5');
      assert.deepEqual(result, [
        { appId: '4uI12bRGkE.OkkoHD', name: 'Okko Фильмы HD' },
        { appId: 'adplatform.ADPlayer', name: '' },
        { appId: 'vxqdl8ERTQ.SmartTV', name: 'smartHD' },
      ]);
    });

    it('list: return empty list', async () => {
      stubCmd('sdb -s 1.2.3.5 shell 0 applist', getMock('tizen23/sdb_applist_empty.txt'));
      const result = await reqJson('api/app/list?ip=1.2.3.5');
      assert.deepEqual(result, []);
    });

    it('list: return error when sdb returns not valid response', async () => {
      stubCmd('sdb -s 1.2.3.5 shell 0 applist', getMock('some_error.txt'));
      const result = await reqJson('api/app/list?ip=1.2.3.5');
      assert.equal(result.message, 'Error: Unable to parse app list');
    });
  });

  describe('Tizen 2.4', () => {
    beforeEach(() => {
      stubCmd('sdb connect 1.2.3.5', getMock('tizen24/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen24/sdb_capability.txt'));
    });

    it('list: return apps list', async () => {
      stubCmd('sdb -s 1.2.3.5 shell 0 applist', getMock('tizen24/sdb_applist.txt'));
      const result = await reqJson('api/app/list?ip=1.2.3.5');
      assert.deepEqual(result, [
        { appId: '07wyKannVj.BasicProject', name: 'BasicProject' },
        { appId: 'TESTABCDEF.App', name: 'App (test)' },
        { appId: 'adplatform.ADPlayer', name: '[NULL]' },
      ]);

      it('list: return empty list', async () => {
        stubCmd('sdb -s 1.2.3.5 shell 0 applist', getMock('tizen24/sdb_applist_empty.txt'));
        const result = await reqJson('api/app/list?ip=1.2.3.5');
        assert.deepEqual(result, []);
      });

      it('list: return error when sdb returns not valid response', async () => {
        stubCmd('sdb -s 1.2.3.5 shell 0 applist', getMock('some_error.txt'));
        const result = await reqJson('api/app/list?ip=1.2.3.5');
        assert.equal(result.message, 'Error: Unable to parse app list');
      });
    });
  });

  describe('Tizen 3', () => {
    beforeEach(() => {
      stubCmd('sdb connect 1.2.3.5', getMock('tizen30/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen30/sdb_capability.txt'));
    });

    it('list: return apps list', async () => {
      stubCmd('sdb -s 1.2.3.5 shell 0 applist', getMock('tizen30/sdb_applist.txt'));
      const result = await reqJson('api/app/list?ip=1.2.3.5');
      assert.deepEqual(result, [
        { appId: 'org.tizen.AVControl', name: 'AVControl' },
        { appId: 'org.tizen.SMSourceAPP', name: 'SMSourceAPP' },
        { appId: 'org.tizen.mycontent-photo-player-tv', name: 'Photo player' },
      ]);
    });

    it('list: return empty list', async () => {
      stubCmd('sdb -s 1.2.3.5 shell 0 applist', getMock('tizen30/sdb_applist_empty.txt'));
      const result = await reqJson('api/app/list?ip=1.2.3.5');
      assert.deepEqual(result, []);
    });

    it('list: return error when sdb returns not valid response', async () => {
      stubCmd('sdb -s 1.2.3.5 shell 0 applist', getMock('some_error.txt'));
      const result = await reqJson('api/app/list?ip=1.2.3.5');
      assert.equal(result.message, 'Error: Unable to parse app list');
    });
  });

  describe('Tizen 4', () => {
    beforeEach(() => {
      stubCmd('sdb connect 1.2.3.5', getMock('tizen40/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen40/sdb_capability.txt'));
    });

    it('list: return apps list', async () => {
      stubCmd('sdb -s 1.2.3.5 shell 0 applist', getMock('tizen40/sdb_applist.txt'));
      const result = await reqJson('api/app/list?ip=1.2.3.5');
      assert.deepEqual(result, [
        { appId: 'org.tizen.AVControl', name: 'AVControl' },
        { appId: 'org.tizen.SMSourceAPP', name: '' },
        { appId: 'org.tizen.mycontent-photo-player-tv', name: 'Photo player' },
      ]);
    });

    it('list: return empty list', async () => {
      stubCmd('sdb -s 1.2.3.5 shell 0 applist', getMock('tizen40/sdb_applist_empty.txt'));
      const result = await reqJson('api/app/list?ip=1.2.3.5');
      assert.deepEqual(result, []);
    });

    it('list: return error when sdb returns not valid response', async () => {
      stubCmd('sdb -s 1.2.3.5 shell 0 applist', getMock('some_error.txt'));
      const result = await reqJson('api/app/list?ip=1.2.3.5');
      assert.equal(result.message, 'Error: Unable to parse app list');
    });
  });

  describe('Known apps', () => {
    beforeEach(() => {
      initDb(
        new MemoryAdapter('', {
          defaultValue: {
            apps: [
              {
                id: '1',
                alias: 'one',
                platform: 'tizen',
                tizenAppId: 'TESTABCDEF.One',
                description: 'First app',
              },
              {
                id: '2',
                alias: 'two',
                platform: 'tizen',
                tizenAppId: 'TESTABCDEF.Two',
                description: 'Second app',
              },
            ],
          },
        })
      );
    });

    after(() => {
      initDb();
    });

    it('get known apps', async () => {
      const apps = await reqJson('api/app/known');
      assert.lengthOf(apps, 2);
      assert.deepEqual(apps[0], {
        id: '1',
        alias: 'one',
        platform: 'tizen',
        tizenAppId: 'TESTABCDEF.One',
        description: 'First app',
      });
    });

    it('add known app', async () => {
      const app = {
        id: 'new',
        alias: 'newApp',
        platform: 'tizen',
        tizenAppId: 'TESTABCDEF.New',
        description: 'New app',
      };
      const added = await reqPostJson('api/app/known', app);
      assert.deepEqual(added, app);
      const apps = await reqJson('api/app/known');
      assert.deepEqual(apps[apps.length - 1], app);
    });

    it('update known app', async () => {
      const updateData = {
        id: '1',
        alias: 'updatedApp',
        platform: 'webos',
        tizenAppId: 'TESTABCDEF.Updated',
        description: 'Updated app',
      };
      const updated = await reqPostJson('api/app/known', updateData);
      assert.deepEqual(updated, updateData);
      const apps = await reqJson('api/app/known');
      assert.deepEqual(apps[0], updateData);
    });

    it('delete known app', async () => {
      await req('api/app/known/1', { method: 'delete' });
      const apps = await reqJson('api/app/known');
      assert.lengthOf(apps, 1);
      assert.equal(apps[0].id, '2');
    });
  });
});
