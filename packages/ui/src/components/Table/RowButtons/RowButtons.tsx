import classNames from 'classnames';

import Button from 'components/Button/Button';
import ConfirmationModal from 'components/ConfirmationModal/ConfirmationModal';
import { ReactComponent as OkIcon } from 'icons/check.svg';
import { ReactComponent as CancelIcon } from 'icons/close.svg';
import { ReactComponent as EditIcon } from 'icons/edit.svg';
import { ReactComponent as DeleteIcon } from 'icons/trash.svg';

import CellWrapper from '../CellWrapper/CellWrapper';
import { OnCancelEditRow, OnDeleteRow, OnSaveRow, OnStartEditRow, RowInfo } from '../types';
import styles from './RowButtons.module.css';

interface Props<TRowData> {
  className?: string;
  row: RowInfo<TRowData>;
  labelField: keyof TRowData;
  onSaveRow: OnSaveRow<TRowData>;
  onStartEditRow: OnStartEditRow<TRowData>;
  onCancelEditRow: OnCancelEditRow<TRowData>;
  onDeleteRow: OnDeleteRow<TRowData>;
}

export default function RowButtons<TRowData>({
  className,
  row,
  labelField,
  onSaveRow,
  onStartEditRow,
  onCancelEditRow,
  onDeleteRow,
}: Props<TRowData>) {
  return (
    <td
      className={classNames(className, {
        [styles.edit]: row.isEditing,
      })}
    >
      <CellWrapper showSeparator={false} alignment="center">
        {row.isEditing && (
          <>
            <Button className={styles.primaryIconButton} onClick={() => onSaveRow(row.data)}>
              <OkIcon className={styles.okIcon} />
            </Button>
            <Button className={styles.secondaryIconButton} variant="ghost" onClick={() => onCancelEditRow(row.data)}>
              <CancelIcon />
            </Button>
          </>
        )}
        {!row.isEditing && (
          <>
            <Button className={styles.primaryIconButton} variant="ghost" onClick={() => onStartEditRow(row.data)}>
              <EditIcon />
            </Button>
            <ConfirmationModal
              title="Confirm"
              text={`Are you sure you want to delete "${row.data[labelField]}"?`}
              trigger={
                <Button className={styles.secondaryIconButton} variant="ghost">
                  <DeleteIcon className={styles.deleteIcon} />
                </Button>
              }
              onConfirm={() => onDeleteRow(row.data)}
              confirmText="Delete"
              rejectText="Cancel"
            />
          </>
        )}
      </CellWrapper>
    </td>
  );
}
