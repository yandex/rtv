import Joi from 'joi';
import { KnownTv } from 'rtv-client';

const ipSchema = Joi.string().ip().required();
const aliasSchema = Joi.string().required();
const platformSchema = Joi.string().valid('tizen', 'webos', 'playstation', 'orsay', 'vidaa').required();

export const validateTv = ({ row, rows }: { row: KnownTv; rows: KnownTv[] }) => {
  const result: Record<string, string> = {};

  const { error: aliasError } = aliasSchema.validate(row.alias);
  if (aliasError) {
    result.alias = 'Please enter alias';
  }

  const isUniqueIp = rows.find((r) => r.id !== row.id && r.ip === row.ip) === undefined;
  if (!isUniqueIp) {
    result.ip = `TV with IP ${row.ip} already exists`;
  }

  const { error: ipError } = ipSchema.validate(row.ip);
  if (ipError) {
    result.ip = 'Please enter valid IP';
  }

  const { error: platformError } = platformSchema.validate(row.platform);
  if (platformError) {
    result.platform = 'Please enter platform (tizen, webos, playstation, orsay, vidaa)';
  }

  return result;
};
