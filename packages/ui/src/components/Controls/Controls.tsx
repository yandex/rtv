import { ChangeEvent, useRef } from 'react';

import JSON5 from 'json5';
import { useMutation, useQueryClient } from 'react-query';
import Popup from 'reactjs-popup';
import { PopupActions } from 'reactjs-popup/dist/types';
import { AppState, KnownTv, Platform } from 'rtv-client';

import Button from 'components/Button/Button';
import ConfirmationModal from 'components/ConfirmationModal/ConfirmationModal';
import RemoteControlModal from 'components/RemoteControlModal/RemoteControlModal';
import { errorToast, successToast } from 'components/ToastContainer/ToastContainer';
import useAuth from 'hooks/useAuth';
import { ReactComponent as ChevronDownIcon } from 'icons/chevron-down.svg';
import { ReactComponent as ChevronUpIcon } from 'icons/chevron-up.svg';
import { ReactComponent as MoreIcon } from 'icons/more.svg';
import { ReactComponent as TrashIcon } from 'icons/trash.svg';
import { queries } from 'utils/queries';
import { remoteKeysByPlatform } from 'utils/remoteKeys';
import { appClose, appDebug, appLaunch, enableDevMode, free, wakeUp, appInstall, appUninstall } from 'utils/rtv-client';

import styles from './Controls.module.css';

interface Props {
  tv?: KnownTv;
  appId?: string;
  appParams?: string;
  appState: Partial<AppState> | null;
  isTVInfoOpen: boolean;
  toggleTVInfo?: () => void;
}

const paramTemplates = {
  platform: '{{PLATFORM}}',
};

const parseParams = (params?: string, platform?: Platform) => {
  let parsedParams = {};
  try {
    if (params) {
      const replacedParams = platform ? params.replace(new RegExp(paramTemplates.platform, 'g'), platform) : params;
      parsedParams = JSON5.parse(replacedParams);
    }
  } catch (e) {
    errorToast('Invalid JSON5 format in launch params');
    throw e;
  }

  return parsedParams;
};

const Controls: React.FC<Props> = ({ tv, appId, appParams, isTVInfoOpen, toggleTVInfo, appState }) => {
  const queryClient = useQueryClient();

  const wakeUpMutation = useMutation((tvIp: string) => wakeUp(tvIp), {
    onSuccess: () => {
      queryClient.invalidateQueries(queries.mainKnownTvs);
      queryClient.invalidateQueries(queries.appState);
    },
  });
  const appInstallMutation = useMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ tvIp, file, appId }: { tvIp: string; file: any; appId: string }) => appInstall(tvIp, file, appId),
    {
      onSuccess: () => queryClient.invalidateQueries(queries.appState),
    }
  );
  const freeMutation = useMutation(({ tv, isForce }: { tv: KnownTv; isForce: boolean }) => free(tv.ip, isForce), {
    onSuccess: (_data, { tv }) => {
      successToast(`TV ${tv.alias} is free now`);
      queryClient.invalidateQueries(queries.mainKnownTvs);
    },
    onError: (_data, { tv }) => errorToast(`Unable to free TV ${tv.alias}`),
  });

  const onAppLaunch = () => {
    if (tv && appId) appLaunch(tv.ip, appId, parseParams(appParams, tv.platform));
  };
  const onAppDebug = () => {
    if (tv && appId) appDebug(tv.ip, appId, parseParams(appParams, tv.platform));
  };
  const onAppClose = () => {
    if (tv && appId) appClose(tv.ip, appId);
  };
  const onWakeUp = () => {
    if (tv) wakeUpMutation.mutate(tv.ip);
  };
  const onFree = () => {
    if (tv) freeMutation.mutate({ tv, isForce: true });
  };
  const onEnableDevMode = () => {
    if (tv) enableDevMode(tv.ip);
  };
  const onTvInfo = () => {
    toggleTVInfo && toggleTVInfo();
  };
  const onAppInstall = async ({ target }: ChangeEvent<HTMLInputElement>) => {
    const file = target?.files?.[0];
    if (file && tv && appId) {
      target.value = '';
      appInstallMutation.mutate({ tvIp: tv.ip, file, appId });
    }
  };
  const appUninstallMutation = useMutation(
    ({ tvIp, appId }: { tvIp: string; appId: string }) => appUninstall(tvIp, appId),
    {
      onSuccess: () => queryClient.invalidateQueries(queries.appState),
    }
  );
  const onAppUninstall = async () => {
    popupRef.current?.close();
    if (tv && appId) {
      appUninstallMutation.mutate({ tvIp: tv.ip, appId });
    }
  };

  const { username } = useAuth();
  const occupied = tv?.occupied && tv?.occupied !== username;
  const tvOnline = tv?.online;
  const enableRemoteControl = tvOnline && tv?.platform && remoteKeysByPlatform[tv?.platform] !== undefined && !occupied;
  const enableApplicationControl = Boolean(tvOnline && appId && appState && !occupied);
  const enableWakeUpButton = tv?.mac && !['orsay', 'playstation'].includes(tv.platform);
  const enableDevModeButton = tvOnline && tv?.platform === 'webos' && !occupied;

  const popupRef = useRef<PopupActions>();

  return (
    <div className={styles.buttons}>
      <div className={styles.buttonsGroup}>
        {appState?.installed === false ? (
          <Button className={styles.installButton} disabled={!enableApplicationControl}>
            <input type="file" accept=".ipk,.wgt,.zip" onChange={onAppInstall} />
            Install
          </Button>
        ) : (
          <>
            <Button
              className={styles.button}
              disabled={!enableApplicationControl}
              variant="secondary"
              onClick={onAppClose}
            >
              Close
            </Button>
            <Button
              className={styles.button}
              disabled={!enableApplicationControl}
              variant="secondary"
              onClick={onAppLaunch}
            >
              {appState?.running ? 'Relaunch' : 'Launch'}
            </Button>
            <Popup
              ref={popupRef as React.Ref<PopupActions>}
              className="morePopup"
              trigger={
                <Button className={styles.moreButton} variant="secondary" disabled={!enableApplicationControl}>
                  <MoreIcon className={enableApplicationControl ? styles.moreIcon : styles.moreIconDisabled} />
                </Button>
              }
              closeOnDocumentClick={true}
              position="bottom left"
              arrow={false}
            >
              <Button className={styles.uninstallButton} variant="ghost" onClick={onAppUninstall}>
                <TrashIcon className={styles.trashIcon} width={15} height={15} />
                <span className={styles.uninstallText}>Uninstall</span>
              </Button>
            </Popup>
            <Button className={styles.debugButton} disabled={!enableApplicationControl} onClick={onAppDebug}>
              Debug
            </Button>
          </>
        )}
      </div>
      <div className={styles.buttonsGroup}>
        <Button className={styles.button} variant="secondary" onClick={onWakeUp} disabled={!enableWakeUpButton}>
          Wake Up
        </Button>
        <ConfirmationModal
          title="Confirm"
          text={`Are you sure you want to free TV "${tv?.alias}"?`}
          trigger={
            <Button className={styles.button} variant="secondary" disabled={!tv}>
              Free
            </Button>
          }
          onConfirm={onFree}
          confirmText="Free"
          rejectText="Cancel"
        />
        <RemoteControlModal
          trigger={
            <Button className={styles.largeButton} variant="secondary" disabled={!enableRemoteControl}>
              Remote mode
            </Button>
          }
          tv={tv}
        />
        <Button
          className={styles.largeButton}
          variant="secondary"
          onClick={onEnableDevMode}
          disabled={!enableDevModeButton}
        >
          Dev mode on
        </Button>
        <Button
          className={tv ? styles.tvInfoButtonEnabled : styles.tvInfoButtonDisabled}
          disabled={!tv}
          variant="ghost"
          onClick={onTvInfo}
        >
          TV info
          {isTVInfoOpen ? (
            <ChevronUpIcon width={16} height={16} className={styles.chevronIcon} />
          ) : (
            <ChevronDownIcon width={16} height={16} className={styles.chevronIcon} />
          )}
        </Button>
      </div>
    </div>
  );
};

export default Controls;
