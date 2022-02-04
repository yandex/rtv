import wol from 'wakeonlan';
import { getKnownTvs } from '../../api/tv/service';

export const wakeUpTv = async (ip: string, port: number) => {
  const tvs = getKnownTvs();
  const tvConfig = tvs.find((tv) => tv.ip === ip);
  if (!tvConfig) {
    throw new Error(`Not found config for tv with ip ${ip}`);
  }
  const { mac } = tvConfig;
  if (!mac) {
    throw new Error(`MAC address is not specified for tv ${ip}`);
  }

  return wol(mac, { port });
};
