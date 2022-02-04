import Joi from 'joi';
import { KnownApp } from './types';

export const app = Joi.object<KnownApp>({
  id: Joi.string(),
  tizenAppId: Joi.string(),
  webosAppId: Joi.string(),
  orsayAppId: Joi.string(),
  playstationAppId: Joi.string(),
  alias: Joi.string().required(),
  description: Joi.string().allow(''),
  defaultParams: Joi.string().allow(''),
  evalOnDebug: Joi.string().allow(''),
});
