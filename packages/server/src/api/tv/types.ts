/**
 * Extended TV info
 */
export interface TVInfo extends SavedTv {
  /**
   * Last used
   */
  lastUsed: string;
  /**
   * TV name
   */
  name?: string;
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
  developerMode?: boolean;
  /**
   * developer IP
   */
  developerIP?: string;
  /**
   * access to TV
   */
  hasAccess?: boolean;
  /**
   * TV OS verion
   */
  osVersion?: string | null;
  /**
   * Model Name
   */
  modelName?: string;
  /**
   * FirmwareVersion
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

export interface SavedTv {
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
   * Is visible
   */
  isVisible?: boolean;
  /**
   * Stream URL
   */
  streamUrl?: string;
}

export interface KnownTv extends SavedTv {
  /**
   * Online
   */
  online?: boolean;
  /**
   * Last used
   */
  lastUsed?: string;
  /**
   * Occupied by
   */
  occupied?: string | null;
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
 * Result
 */
export interface Result {
  /**
   * Operation result
   */
  result: string;
}

/**
 * Remote control data
 */
export interface RemoteControlInfo {
  /**
   * Proxied websocket URL
   */
  wsUrl: string;
  /**
   * Raw websocket URL
   */
  rawWsUrl: string;
  /**
   * Remote keys
   */
  keys: Record<string, string>;
  /**
   * Websocket message payload pattern
   */
  payloadPattern: string;
}
