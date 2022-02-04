import path from 'path';
import fs from 'fs-extra';
import lodashId from 'lodash-id';
import { CollectionChain, ObjectChain } from 'lodash';
import lowdb, { AdapterSync, LowdbSync } from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import { values as config } from '../config';

export interface LodashIdCollectionChain<T> extends CollectionChain<T> {
  getById(id: string): ObjectChain<T>;
  insert(doc: T): ObjectChain<T>;
  updateById(id: string, attrs: Partial<T>): ObjectChain<T>;
  removeById(id: string): ObjectChain<T>;
  upsert(doc: T): ObjectChain<T>;
}

let db: LowdbSync<unknown>;

export function initDb<T>(adapter?: AdapterSync<T>) {
  fs.ensureDirSync(config.rtvDataPath);
  db = lowdb(adapter || new FileSync(path.join(config.rtvDataPath, '.db.json')));
  db._.mixin(lodashId);
  return db;
}

export const getDb = () => db || initDb();
