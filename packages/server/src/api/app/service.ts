import { getDb, LodashIdCollectionChain } from '../../helpers/db';
import { Platform } from '../../platform';
import { KnownApp } from './types';

const appIdName = (platform: Platform) => `${platform}AppId` as PlatformAppIds;
const collectionName = 'apps';

type PlatformAppIds = 'tizenAppId' | 'webosAppId' | 'orsayAppId' | 'playstationAppId';

const getApps = () =>
  getDb()
    .defaults<Record<typeof collectionName, KnownApp[]>>({ [collectionName]: [] })
    .get(collectionName) as LodashIdCollectionChain<KnownApp>;

export const getKnownApps = () => getApps().value();

export const saveKnownApp = (app: KnownApp) => getApps().upsert(app).write();

export const deleteKnownApp = (id: string) => getApps().removeById(id).write();

export const getAppIdByAlias = (alias: string, platform: Platform) => {
  const app = getApps().find({ alias }).value();
  return app ? app[appIdName(platform)] : undefined;
};

export const getAliasByAppId = (appId: string, platform: Platform) => {
  const app = getAppByAppId(appId, platform);
  return app ? app.alias : undefined;
};

export const getAppByAppId = (appId: string, platform: Platform) =>
  getApps()
    .find({ [appIdName(platform)]: appId })
    .value();
