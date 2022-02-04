/**
 * Tizen web pages.
 */
import { Request, Response } from 'express';
import * as proxyHelper from '../../proxy/helper';
import TizenTV from '../../platform/tizen/tv';

export const renderDevPanel = async (req: Request, res: Response) => {
  const { ip } = req.query as Record<string, string>;
  const tv = new TizenTV(ip);
  const proxiedUrl = proxyHelper.proxyUrlAsPath(tv.devPanelUrl);
  const info = await tv.getMsfInfo();

  return res.render('tizen/dev-panel', { baseUrl: proxiedUrl, info });
};

export const renderLogs = async (req: Request, res: Response) => {
  const { ip } = req.query as Record<string, string>;
  const tv = new TizenTV(ip);
  const proxiedUrl = proxyHelper.proxyUrlAsPath(tv.devPanelUrl);

  return res.render('tizen/logs', { baseUrl: proxiedUrl });
};
