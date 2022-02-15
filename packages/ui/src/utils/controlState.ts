import { KnownTv } from 'rtv-client';

import { remoteKeysByPlatform } from './remoteKeys';

interface ControlStateInfo {
  username?: string;
  tv?: KnownTv;
  appId?: string;
}

type DisableReason = null | string;

const TV_NOT_SELECTED = 'TV is not selected';
const TV_OFFLINE = 'TV is offline';
const TV_OCCUPIED = 'TV is occupied. Try later';
const NOT_SUPPORTED_BY_PLATFORM = 'Not supported by platform';
const MAC_NOT_SPECIFIED = 'MAC is not specified for TV';
const APP_NOT_SELECTED = 'Application is not selected';

export const getControlState = (props: ControlStateInfo) => {
  const { tv, username, appId } = props;

  function occupied() {
    return Boolean(tv?.occupied && tv?.occupied !== username);
  }

  function remoteControlDisabled(): DisableReason {
    if (!tv) {
      return TV_NOT_SELECTED;
    }
    if (tv.online === false) {
      return TV_OFFLINE;
    }
    if (occupied()) {
      return TV_OCCUPIED;
    }
    if (!remoteKeysByPlatform[tv.platform]) {
      return NOT_SUPPORTED_BY_PLATFORM;
    }

    return null;
  }

  function wakeUpDisabled(): DisableReason {
    if (!tv) {
      return TV_NOT_SELECTED;
    }
    if (!tv.mac) {
      return MAC_NOT_SPECIFIED;
    }
    if (['orsay', 'playstation'].includes(tv.platform)) {
      return NOT_SUPPORTED_BY_PLATFORM;
    }

    return null;
  }

  function devModeDisabled(): DisableReason {
    if (!tv) {
      return TV_NOT_SELECTED;
    }
    if (tv.online === false) {
      return TV_OFFLINE;
    }
    if (tv.platform !== 'webos') {
      return NOT_SUPPORTED_BY_PLATFORM;
    }

    return null;
  }

  function applicationControlDisabled(): DisableReason {
    if (!tv) {
      return TV_NOT_SELECTED;
    }
    if (tv.online === false) {
      return TV_OFFLINE;
    }
    if (!appId) {
      return APP_NOT_SELECTED;
    }

    return null;
  }

  function getState(reason: DisableReason) {
    return {
      disabled: reason !== null,
      disableReason: reason,
    }
  }

  return {
    applicationControl: getState(applicationControlDisabled()),
    devModeControl: getState(devModeDisabled()),
    wakeUpControl: getState(wakeUpDisabled()),
    remoteControl: getState(remoteControlDisabled()),
  }
}
