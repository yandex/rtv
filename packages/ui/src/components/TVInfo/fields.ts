import { Platform, TVInfo } from 'rtv-client';

export const fieldNameMap: Record<keyof TVInfo, string> = {
  alias: 'Alias',
  name: 'Name',
  platform: 'Platform',
  ip: 'IP',
  id: 'ID',
  modelName: 'Model Name',
  modelYear: 'Model Year',
  developerMode: 'Developer Mode',
  developerIP: 'Developer IP',
  hasAccess: 'Has Access',
  resolution: 'Resolution',
  osVersion: 'OS Version',
  lastUsed: 'Last Used',
  online: 'Online',
  mac: 'MAC',
  webOSPassphrase: 'Passphrase',
  isVisible: 'Is Visible',
  streamUrl: 'Stream URL',
  webOSClientKey: 'Client Key',
  boardType: 'Board Type',
  firmwareVersion: 'Firmware Version',
  pkgUrls: 'Uploaded packages',
};

const hiddenFields: (keyof TVInfo)[] = ['ip', 'isVisible', 'alias', 'streamUrl', 'pkgUrls'];
const hiddenPlatformFields: Partial<Record<Platform, (keyof TVInfo)[]>> = {
  webos: ['name', 'webOSClientKey'],
};

export const isVisibleField = (field: keyof TVInfo, platform: Platform) => {
  return !hiddenFields.includes(field) && !hiddenPlatformFields[platform]?.includes(field);
};
