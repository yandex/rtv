import { getDb, LodashIdCollectionChain } from '../../helpers/db';
import { KnownTv } from './types';

const collectionName = 'tvs';

const getTvs = () =>
  getDb()
    .defaults<Record<typeof collectionName, KnownTv[]>>({ [collectionName]: [] })
    .get(collectionName) as LodashIdCollectionChain<KnownTv>;

export const getKnownTvs = () => getTvs().sortBy('alias').value();

export const getKnownTv = (ip: string) => getTvs().find({ ip }).value();

export const getKnownTvById = (id: string) => getTvs().getById(id).value();

export const saveKnownTv = (tv: KnownTv) => {
  const tvWithIp = getKnownTv(tv.ip);
  if (tvWithIp && tvWithIp.id !== tv.id) {
    throw new Error(`TV with IP ${tv.ip} already exists`);
  }
  const knownTv = getKnownTvById(tv.id);
  return knownTv ? getTvs().updateById(tv.id, tv).write() : getTvs().insert(tv).write();
};

export const deleteKnownTv = (id: string) => getTvs().removeById(id).write();

export const getIpAliases = () => {
  const tvs = getKnownTvs();
  return tvs.reduce((ipAliases, tv) => {
    if (tv.alias) {
      ipAliases[tv.alias] = tv.ip;
    }
    return ipAliases;
  }, {} as Record<string, string>);
};
