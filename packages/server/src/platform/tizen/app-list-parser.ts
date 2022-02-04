/**
 * Parsers for Tizen response on `sdb <ip> shell 0 applist` command
 */
export const parseTizen2AppList = (rawAppList: string) => {
  const VALID_RESPONSE = /No\s*Name\s*Version\s*GUID\s*Package ID\s*App ID/;
  if (!VALID_RESPONSE.test(rawAppList)) {
    throw new Error('Unable to parse app list');
  }
  const ROWS_BEFORE = 2;
  const COLUMNS_BEFORE_NAME = 1;
  const COLUMNS_AFTER_NAME = 4;
  const rows = rawAppList.split('\n').slice(ROWS_BEFORE);
  return rows
    .map((row) => {
      const fields = row.trim().split(/\s+/);
      return {
        name: fields.slice(COLUMNS_BEFORE_NAME, -COLUMNS_AFTER_NAME).join(' '),
        appId: fields[fields.length - 1],
      };
    })
    .sort(sorterByAppId);
};

export const parseTizen34AppList = (rawAppList: string) => {
  const VALID_RESPONSE = /Name\s*AppID/;
  if (!VALID_RESPONSE.test(rawAppList)) {
    throw new Error('Unable to parse app list');
  }
  const ROWS_BEFORE = 4;
  const ROWS_AFTER = 1;
  const QUOTED_SUBSTRING = /'([^']*)'/g;
  const rows = rawAppList.split('\n').slice(ROWS_BEFORE, -ROWS_AFTER);
  return rows
    .map((row) => {
      const keyValueStr = row.match(QUOTED_SUBSTRING) as string[];
      const quotedSubstrings = keyValueStr.map(removeQuotes);
      return {
        name: quotedSubstrings[0] || '',
        appId: quotedSubstrings[1] || '',
      };
    })
    .sort(sorterByAppId);
};

type AppInfo = {
  name: string;
  appId: string;
};

const sorterByAppId = (a: AppInfo, b: AppInfo) => (a.appId > b.appId ? 1 : a.appId < b.appId ? -1 : 0);

const removeQuotes = (str: string) => (/'*'/.test(str) ? str.slice(1, -1) : str);
