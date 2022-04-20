export interface KnownApp extends Record<string, unknown> {
  /**
   * Application id (internal)
   */
  id: string;
  //platform: Platform;
  /**
   * Application alias
   */
  alias: string;
  /**
   * Tizen application id
   */
  tizenAppId: string;
  /**
   * WebOS application id
   */
  webosAppId: string;
  /**
   * PlayStation application id
   */
  playstationAppId: string;
  /**
   * Orsay application id
   */
  orsayAppId: string;
  /**
   * Description
   */
  description: string;
  /**
   * EvalOnDebug script
   */
  evalOnDebug: string;
  /**
   * Default application params
   */
  defaultParams: string;
  /**
   * Is installable app (e.g. DevMode on WebOS is not installablle)
   */
  isInstallable: boolean;
}

export interface InstallAppResult {
  /**
   * ok
   */
  result: string;
  /**
   * Application id.
   */
  appId?: string;
}

export interface FileInfo {
  /**
   * File path
   */
  file: string;
}

export interface AppState {
  /**
   * Application Name
   */
  name?: string;
  /**
   * Is installed on TV (not available on PlayStation)
   */
  installed?: boolean;
  /**
   * is running now
   */
  running: boolean;
  /**
   * version (for Tizen and Orsay)
   */
  version?: string;
  /**
   * Visible (for Tizen)
   */
  visible?: boolean;
}

export interface DebugAppInfo {
  /**
   * application title
   */
  title?: string;
  /**
   * debug session URL
   */
  debugUrl: string;
  /**
   * debug session websocket URL
   */
  wsUrl?: string;
}

export interface AppInfo {
  /**
   * application id
   */
  appId: string;
  /**
   * application name
   */
  name: string;
}

export interface AppListInfo {
  /**
   * application id
   */
  appId: string;
  /**
   * application alias
   */
  alias?: string;
}

export interface PackAppAdditionalParams {
  /**
   * app resolution, e.g. '1920x1080'
   */
  resolution?: string;
  /**
   * not minify application (for webOS only)
   */
  noMinify?: boolean;
  /**
   * Custom security profile (tizen only)
   */
  tizenSecurityProfile?: string;
}

export type DebugAppOptions = {
  attach?: boolean;
  eval?: string | ((...args: unknown[]) => unknown);
};
