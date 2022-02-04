import { promisify } from 'util';
import xml2js from 'xml2js';

const parseXML = promisify(xml2js.parseString);

export async function extractAppConfigInfo(xml: string) {
  const json = (await parseXML(xml)) as any;
  const appId = json.widget['tizen:application'][0].$.id;
  const packageId = appId.split('.')[0];
  const appName = json.widget['name'][0];
  // appName is string when no attaributes in <name> tag, otherwise it is object
  const appNameStr = typeof appName === 'object' ? appName['_'] : appName;
  return { appId, packageId, appName: appNameStr };
}
