import Joi from 'joi';
import { KnownTv } from './types';

export const tv = Joi.object<KnownTv>({
  ip: Joi.string().ip().required(),
  alias: Joi.string().allow(''),
  platform: Joi.string().valid('tizen', 'webos', 'playstation', 'orsay'),
  mac: Joi.string().allow(''),
  webOSPassphrase: Joi.string().allow(''),
  streamUrl: Joi.string().uri().allow(''),
  isVisible: Joi.bool(),
});
