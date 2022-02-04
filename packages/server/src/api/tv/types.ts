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
  modelYear?: string;
  /**
   * TV screent resolution
   */
  resolution?: string;
  /**
   * is developer mode enabled
   */
  developerMode: boolean;
  /**
   * developer IP
   */
  developerIP?: string;
  /**
   * access to TV
   */
  hasAccess?: boolean;
  /**
   * TV alias
   */
  alias: string;
  /**
   * who and when last used TV
   */
  lastUsed?: string;
  /**
   * TV OS verion
   */
  osVersion?: string;
  /**
   * MAC
   */
  mac?: string;
  /**
   * Model Name
   */
  modelName?: string;
  /**
   * Passphrase
   */
  webOSPassphrase?: string;
  /**
   * Client Key
   */
  webOSClientKey?: string;
  /**
   * Stream Url
   */
  streamUrl?: string;
  /**
   * Is Visible flag
   */
  isVisible?: boolean;
  /**
   * Id
   */
  id?: string;
  /**
   * firmwareVersion
   */
  firmwareVersion?: string;
  /**
   * boardType
   */
  boardType?: string;
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

interface PkgInfo {
  /**
   * downloadPath (e.g. `/uploads/e9d64e99fd5b46c9aba4715dea9e3bfa.zip`)
   */
  downloadPath: string;
  /**
   * Package size (in kB)
   */
  size: string;
}

export type Platform = 'webos' | 'tizen' | 'orsay' | 'playstation';

export interface KnownTv {
  /**
   * Internal TV id
   */
  id: string;
  /**
   * TV IP
   */
  ip: string;
  /**
   * TV alias
   */
  alias: string;
  /**
   * TV platform
   */
  platform: Platform;
  /**
   * TV MAC
   */
  mac?: string;
  /**
   * WebOS passphrase
   */
  webOSPassphrase?: string;
  /**
   * webOSClientKey (for reuse remote control without confirm)
   */
  webOSClientKey?: string;
  /**
   * Package URLs for Orsay
   */
  pkgUrls?: Record<string, PkgInfo | undefined>;
  /**
   * Online
   */
  online?: boolean;
  /**
   * Stream URL
   */
  streamUrl?: string;
  /**
   * Last used
   */
  lastUsed?: string;
  /**
   * Is visible
   */
  isVisible?: boolean;
  /**
   * Occupied by
   */
  occupied?: string | null;
}
