import { useMutation, useQuery, useQueryClient } from 'react-query';
import { KnownApp } from 'rtv-client';

import Button from 'components/Button/Button';
import { Spinner } from 'components/Spinner/Spinner';
import Table from 'components/Table/Table';
import { errorToast, successToast } from 'components/ToastContainer/ToastContainer';
import useTable from 'hooks/useTable';
import { ReactComponent as AddIcon } from 'icons/plus.svg';
import { ReactComponent as TVIcon } from 'icons/tv.svg';
import { queries } from 'utils/queries';
import { deleteKnownApp, getKnownApps, saveKnownApp } from 'utils/rtv-client';

import { appColumns } from './appColumns';
import styles from './AppSettings.module.css';
import { validateApp } from './validateApp';

const getAppName = (app: KnownApp) => app.alias ?? 'Application';

const AppSettings: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: knownApps = [], isLoading } = useQuery(queries.settingsKnownApps, getKnownApps, {
    onError: () => errorToast('Apps were not loaded'),
    refetchOnWindowFocus: false,
  });

  const saveKnownAppMutation = useMutation(
    ({ updatedApp }: { isNew: boolean; updatedApp: KnownApp }) => saveKnownApp(updatedApp),
    {
      onSuccess: (_data, { updatedApp, isNew }) =>
        successToast(isNew ? 'New application was added' : `${getAppName(updatedApp)} was updated`),
      onError: (_error, { updatedApp, isNew }) =>
        errorToast(isNew ? 'New application was not added' : `${getAppName(updatedApp)} was not updated`),
    }
  );

  const deleteKnownAppMutation = useMutation((app: KnownApp) => deleteKnownApp(app.id), {
    onSuccess: (_data, app) => successToast(`${getAppName(app)} was deleted`),
    onError: (_error, app) => errorToast(`${getAppName(app)} was not not deleted`),
  });

  const onDeleteApp = async (app: KnownApp) => {
    deleteKnownAppMutation.mutate(app, {
      onSuccess: (_data, deletedApp) => onDeleteRow(deletedApp.id),
    });
  };

  const persistApp = (updatedApp: KnownApp, isNew: boolean) => {
    saveKnownAppMutation.mutate(
      { updatedApp, isNew },
      { onSuccess: (_data, { updatedApp }) => onCommitRow(updatedApp) }
    );
  };

  const { actualRows, onStartEditRow, onCancelEditRow, onEditRow, onAddNewRow, onSaveRow, onDeleteRow, onCommitRow } =
    useTable({
      rows: knownApps,
      setRows: (updatedKnownApps) => queryClient.setQueryData(queries.settingsKnownApps, updatedKnownApps),
      validateRow: validateApp,
      persistRow: persistApp,
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
        <h3 className={styles.noDataText}>No app has been added</h3>
        <Button className={styles.addButton} onClick={onAddNewRow}>
          <AddIcon className={styles.addIcon} />
          Add new app
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.controls}>
        <Button className={styles.addButton} onClick={onAddNewRow}>
          <AddIcon className={styles.addIcon} />
          Add new app
        </Button>
      </div>
      <Table
        rows={actualRows}
        columns={appColumns}
        labelField="alias"
        onStartEditRow={onStartEditRow}
        onCancelEditRow={onCancelEditRow}
        onEditRow={onEditRow}
        onSaveRow={onSaveRow}
        onDeleteRow={onDeleteApp}
      />
    </>
  );
};

export default AppSettings;
