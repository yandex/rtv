/**
 * Default config
 */
import { IS_NODE } from './helpers/env';

export default {
  /**
   * RTV server address.
   */
  apiUrl: 'http://localhost:3000/api',

  /**
   * Timeout for requests.
   */
  timeout: 20 * 1000,

  /**
   * Check TV now is used by someone else
   */
  checkTvIsOccupied: true,

  /**
   * rtv-user name (shown in lastUsed field)
   */
  user: IS_NODE ? process.env.USER : undefined,
};
