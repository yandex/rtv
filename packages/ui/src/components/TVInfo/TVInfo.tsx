import React, { useCallback } from 'react';

import classNames from 'classnames';
import { useQuery } from 'react-query';
import { KnownTv, TVInfo } from 'rtv-client';

import Expander from 'components/Expander/Expander';
import { Spinner } from 'components/Spinner/Spinner';
import { errorToast } from 'components/ToastContainer/ToastContainer';
import { queries } from 'utils/queries';
import { fetchTvInfo } from 'utils/rtv-client';

import { fieldNameMap, isVisibleField } from './fields';
import styles from './TVInfo.module.css';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  tv: KnownTv;
}

const getDisplayValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
};

const TVInfoPanel: React.FC<Props> = ({ isOpen, setIsOpen, tv }) => {
  const onFetchTVInfoError = useCallback(() => {
    if (isOpen) {
      errorToast(`TV ${tv.alias} info was not loaded`);
      setIsOpen(false);
    }
  }, [isOpen, setIsOpen, tv.alias]);

  const { data, isFetching } = useQuery([queries.tvInfo, tv.ip], () => fetchTvInfo(tv.ip), {
    onError: onFetchTVInfoError,
    enabled: isOpen,
    refetchOnWindowFocus: false,
  });

  const items = data
    ? Object.entries(data)
        .filter(
          ([field, value]) => isVisibleField(field as keyof TVInfo, tv.platform) && value !== undefined && value !== ''
        )
        .map(([key, value]) => ({
          label: fieldNameMap[key as keyof TVInfo] ?? key,
          value: getDisplayValue(value),
        }))
    : [];

  return (
    <Expander open={isOpen} className={styles.expander}>
      <div
        className={classNames(styles.container, {
          [styles.loading]: isFetching,
        })}
      >
        {isFetching ? (
          <Spinner />
        ) : (
          <div className={styles.table}>
            {items.map((item, index) => (
              <React.Fragment key={index}>
                <div className={styles.label}>{item.label}</div>
                <div className={styles.value}>{item.value}</div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </Expander>
  );
};

export default TVInfoPanel;
