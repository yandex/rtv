/**
 * TV info
 */
export interface TVInfo {
  /**
   * platform
   */
  platform: string;
  /**
   * TV IP
   */
  ip: string;
  /**
   * TV name
   */
  name: string;
  /**
   * TV model year
   */
  modelYear: string;
  /**
   * TV screent resolution
   */
  resolution: string;
  /**
   * is developer mode enabled
   */
  developerMode: boolean;
  /**
   * developer IP
   */
  developerIP: string;
  /**
   * access to TV
   */
  hasAccess: boolean;
  /**
   * TV alias
   */
  alias: string;
  /**
   * who and when last used TV
   */
  lastUsed: string;
}

/**
 * TV extended info
 */
export interface TVExtendedInfo {
  /**
   * platform
   */
  platform: string;
  /**
   * TV IP
   */
  ip: string;
  /**
   * TV alias
   */
  alias: string;
  /**
   * TV name
   */
  name: string;
  /**
   * TV model year
   */
  modelYear: string;
  /**
   * TV model name
   */
  modelName: string;
  /**
   * TV screen resolution
   */
  resolution: string;
  /**
   * is developer mode enabled
   */
  developerMode: boolean;
  /**
   * developer IP
   */
  developerIP: string;
  /**
   * access to TV
   */
  hasAccess: boolean;
  /**
   * TV OS verion
   */
  osVersion: string;
}

/**
 * URL info
 */
export interface URLInfo {
  /**
   * URL
   */
  url: string;
}

/**
 * App launch info
 */
export interface BrowserLaunchResult {
  /**
   * browser application id
   */
  appId: string;
  /**
   * is launched
   */
  launched: boolean;
}

/**
 * Wake up result
 */
export interface WakeUpResult {
  /**
   * wake up result
   */
  result: string;
}
