import React, { useEffect, useMemo, useRef } from 'react';

import { useMutation } from 'react-query';
import Popup from 'reactjs-popup';
import { PopupActions } from 'reactjs-popup/dist/types';
import { WsRemoteControl, KnownTv } from 'rtv-client';

import Button from 'components/Button/Button';
import { Spinner } from 'components/Spinner/Spinner';
import { ReactComponent as CrossIcon } from 'icons/close.svg';
import { RemoteKey, remoteKeysByPlatform } from 'utils/remoteKeys';
import { remoteControl } from 'utils/rtv-client';

import styles from './RemoteControlModal.module.css';

interface Props {
  trigger: React.ReactElement;
  tv?: KnownTv;
}

export default function RemoteControlModal({ trigger, tv }: Props) {
  const remote = useRef<WsRemoteControl>();
  const isOpen = useRef<boolean>();
  const popupRef = useRef<PopupActions>();

  const remoteKeys = useMemo(() => (tv?.platform && remoteKeysByPlatform[tv?.platform]) || [], [tv?.platform]);

  const remoteControlMutation = useMutation((tvIp: string) =>
    remoteControl(tvIp, {
      onClose: () => popupRef.current?.close(),
    })
  );

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (remote.current) {
        const remoteKey = remoteKeys.find((remoteKey) => remoteKey.keyCode === e.code);
        if (remoteKey) {
          remote.current.sendKey(remoteKey.tvKeyCode);
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [remoteKeys]);

  const onOpen = async () => {
    isOpen.current = true;

    if (tv?.ip && tv.platform) {
      remoteControlMutation.mutate(tv.ip, {
        onSuccess: (data, tvIp) => {
          if (isOpen.current && tvIp === tv.ip) {
            remote.current = data;
          }
        },
        onError: () => popupRef.current?.close(),
      });
    }
  };

  const onClose = () => {
    isOpen.current = false;
    remote.current = undefined;
  };

  const onRemoteKeyClick = (remoteKey: RemoteKey) => {
    if (remote.current) {
      remote.current.sendKey(remoteKey.tvKeyCode);
    }
  };

  return (
    <Popup
      ref={popupRef as React.Ref<PopupActions>}
      trigger={trigger}
      className="remoteControlPopup"
      modal
      onOpen={onOpen}
      onClose={onClose}
      closeOnEscape={false}
    >
      {(close: () => void) => (
        <>
          <div className={styles.header}>
            <h2 className={styles.title}>Remote mode</h2>
            <Button className={styles.closeButton} variant="ghost" onClick={close}>
              <CrossIcon />
            </Button>
          </div>
          <div className={styles.container}>
            <div className={styles.table}>
              {remoteKeys.map((remoteKey) => (
                <div key={remoteKey.tvKeyCode} className={styles.item} onClick={() => onRemoteKeyClick(remoteKey)}>
                  <div className={styles.tvKeyCode}>{remoteKey.tvKeyCodeLabel}</div>
                  <div className={styles.keyCode}>{remoteKey.keyCodeLabel}</div>
                </div>
              ))}
            </div>
            {remoteControlMutation.isLoading ? (
              <div className={styles.loadingContainer}>
                <Spinner className={styles.spinner} variant="medium" />
              </div>
            ) : null}
          </div>
        </>
      )}
    </Popup>
  );
}
