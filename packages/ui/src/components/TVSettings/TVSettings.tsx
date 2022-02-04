import { useMutation, useQuery, useQueryClient } from 'react-query';
import { KnownTv } from 'rtv-client';

import Button from 'components/Button/Button';
import { Spinner } from 'components/Spinner/Spinner';
import Table from 'components/Table/Table';
import { errorToast, successToast } from 'components/ToastContainer/ToastContainer';
import useTable from 'hooks/useTable';
import { ReactComponent as AddIcon } from 'icons/plus.svg';
import { ReactComponent as TVIcon } from 'icons/tv.svg';
import { queries } from 'utils/queries';
import { deleteKnownTv, getKnownTvs, saveKnownTv } from 'utils/rtv-client';

import { tvColumns } from './tvColumns';
import styles from './TVSettings.module.css';
import { validateTv } from './validateTv';

const getTvName = (tv: KnownTv) => tv.alias ?? 'TV';

const fetchKnownTvs = () => getKnownTvs({ showInvisible: true });

const TVSettings: React.FC = () => {
  const queryClient = useQueryClient();

  const { isLoading, data: knownTvs = [] } = useQuery(queries.settingsKnownTvs, fetchKnownTvs, {
    onError: () => errorToast('TVs were not loaded'),
    refetchOnWindowFocus: false,
  });

  const saveKnownTvMutation = useMutation(
    ({ updatedTv }: { isNew: boolean; updatedTv: KnownTv }) => saveKnownTv(updatedTv),
    {
      onSuccess: (_data, { updatedTv, isNew }) =>
        successToast(isNew ? 'New TV was added' : `${getTvName(updatedTv)} was updated`),
      onError: (_error, { updatedTv, isNew }) =>
        errorToast(isNew ? 'New TV was not added' : `${getTvName(updatedTv)} was not updated`),
    }
  );

  const deleteKnownTvMutation = useMutation((tv: KnownTv) => deleteKnownTv(tv.id), {
    onSuccess: (_data, tv) => successToast(`${getTvName(tv)} was deleted`),
    onError: (_error, tv) => errorToast(`${getTvName(tv)} was not not deleted`),
  });

  const onDeleteTv = async (tv: KnownTv) => {
    deleteKnownTvMutation.mutate(tv, {
      onSuccess: (_data, deletedTv) => onDeleteRow(deletedTv.id),
    });
  };

  const persistTv = (updatedTv: KnownTv, isNew: boolean) => {
    saveKnownTvMutation.mutate({ updatedTv, isNew }, { onSuccess: (_data, { updatedTv }) => onCommitRow(updatedTv) });
  };

  const { actualRows, onStartEditRow, onCancelEditRow, onEditRow, onAddNewRow, onSaveRow, onDeleteRow, onCommitRow } =
    useTable<KnownTv>({
      rows: knownTvs,
      setRows: (updatedKnownTvs) => queryClient.setQueryData(queries.settingsKnownTvs, updatedKnownTvs),
      validateRow: ({ row }) => validateTv({ row, rows: knownTvs }),
      persistRow: persistTv,
    });

  if (isLoading) {
    return (
      <div className={styles.noDataContainer}>
        <Spinner className={styles.spinner} variant="medium" />
      </div>
    );
  }

  if (!actualRows.length) {
    return (
      <div className={styles.noDataContainer}>
        <TVIcon className={styles.noDataIcon} />
        <h3 className={styles.noDataText}>No TV has been added</h3>
        <Button className={styles.addButton} onClick={onAddNewRow}>
          <AddIcon className={styles.addIcon} />
          Add new TV
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.controls}>
        <Button className={styles.addButton} onClick={onAddNewRow}>
          <AddIcon className={styles.addIcon} />
          Add new TV
        </Button>
      </div>
      <Table
        rows={actualRows}
        columns={tvColumns}
        labelField="alias"
        onStartEditRow={onStartEditRow}
        onCancelEditRow={onCancelEditRow}
        onEditRow={onEditRow}
        onSaveRow={onSaveRow}
        onDeleteRow={onDeleteTv}
      />
    </>
  );
};

export default TVSettings;
