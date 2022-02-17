import { useCallback, useState } from 'react';

import { useQuery } from 'react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { KnownTv, KnownApp } from 'rtv-client';

import AppSelect from 'components/AppSelect/AppSelect';
import Controls from 'components/Controls/Controls';
import Logs from 'components/Logs/Logs';
import Params from 'components/Params/Params';
import { errorToast } from 'components/ToastContainer/ToastContainer';
import TVInfo from 'components/TVInfo/TVInfo';
import TVSelect from 'components/TVSelect/TVSelect';
import UserInfo from 'components/UserInfo/UserInfo';
import useAuth from 'hooks/useAuth';
import { ReactComponent as LogoIcon } from 'icons/logo.svg';
import { ReactComponent as SettingsIcon } from 'icons/settings.svg';
import { ReactComponent as OccupiedIcon } from 'icons/user.svg';
import * as paramsHelper from 'utils/params';
import { queries } from 'utils/queries';
import { getKnownApps, getKnownTvs, getAppState } from 'utils/rtv-client';

import styles from './Main.module.css';

const tvRefetchInterval = 60 * 1000;
const appStateRefetchInterval = 30 * 1000;

function Main() {
  const { data: apps = [], isLoading: isAppsLoading } = useQuery(queries.mainKnownApps, getKnownApps, {
    onError: () => errorToast('Apps were not loaded'),
  });

  const fetchKnownTvs = useCallback(() => getKnownTvs({ additionalInfo: true }), []);
  const { data: tvs = [], isLoading: isTvsLoading } = useQuery(queries.mainKnownTvs, fetchKnownTvs, {
    onError: () => errorToast('TVs were not loaded'),
    refetchInterval: tvRefetchInterval,
  });

  const [searchParams, setSearchParams] = useSearchParams({
    tvIp: paramsHelper.getTvIp() || '',
    appId: paramsHelper.getAppId() || '',
    appParams: paramsHelper.getCurrentAppParams(),
  });

  const tvIp = searchParams.get('tvIp') || '';
  const appId = searchParams.get('appId') || '';
  const appParams = searchParams.get('appParams') || '';

  const [isTVInfoOpen, setIsTVInfoOpen] = useState(false);

  const tv = tvs.find((x: KnownTv) => x.ip === tvIp);
  const app = apps.find((x: KnownApp) => x.alias === appId);

  const { data: appState = null } = useQuery([queries.appState, { tvIp, appId }], () => getAppState(tvIp, appId), {
    enabled: Boolean(tvIp && appId),
    refetchInterval: appStateRefetchInterval,
  });

  if (tv && appId) {
    tv.online = Boolean(appState);
  }

  const onAppIdChange = (newAppId: string | null) => {
    if (!newAppId) {
      return;
    }

    const newApp = apps.find((x) => x.alias === newAppId);
    const newParams = paramsHelper.getAppParams(newAppId) || newApp?.defaultParams || '';

    setSearchParams({
      tvIp,
      appId: newAppId,
      appParams: newParams,
    });

    paramsHelper.saveAppId(newAppId);
    paramsHelper.saveAppParams(newAppId, newParams);
  };

  const onTvIpChange = (newTvIp: string | null) => {
    if (!newTvIp) {
      return;
    }
    setSearchParams({
      tvIp: newTvIp,
      appId,
      appParams,
    });
    paramsHelper.saveTvIp(newTvIp);
  };

  const onParamsChange = (newParams: string) => {
    setSearchParams({
      tvIp,
      appId,
      appParams: newParams,
    });
    if (appId) {
      paramsHelper.saveAppParams(appId, newParams || '');
    }
  };

  const { username } = useAuth();
  const occupied = tv?.occupied && tv?.occupied !== username;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.tvSelectContainer}>
          <LogoIcon />
          <TVSelect tvs={tvs} tv={tv} isLoading={isTvsLoading} onTvIpChange={onTvIpChange} />
          {occupied && (
            <>
              <OccupiedIcon width={16} height={16} className={styles.occupiedIcon} />
              <span className={styles.occupiedLabel}>Occupied</span>
              <span className={styles.occupiedByLabel}>by {tv?.occupied}</span>
            </>
          )}
        </div>
        <div className={styles.settingsContainer}>
          <Link to="/settings/tv" className={styles.link}>
            <SettingsIcon width={24} height={24} className={styles.settingsIcon} />
          </Link>
          <UserInfo />
        </div>
      </div>
      <div className={styles.controlsContainer}>
        <AppSelect apps={apps} app={app} isLoading={isAppsLoading} onAppIdChange={onAppIdChange} />
        <Controls
          tv={tv}
          appId={appId}
          appState={appState}
          appParams={appParams}
          isTVInfoOpen={isTVInfoOpen}
          toggleTVInfo={() => setIsTVInfoOpen(!isTVInfoOpen)}
        />
      </div>
      {tv && <TVInfo tv={tv} isOpen={isTVInfoOpen} setIsOpen={setIsTVInfoOpen} />}
      <div className={styles.mainBody}>
        <Params defaultParams={app?.defaultParams || ''} params={appParams} onParamsChange={onParamsChange} />
        <Logs />
      </div>
    </div>
  );
}

export default Main;
