import classNames from 'classnames';

import Cell from '../Cell/Cell';
import RowButtons from '../RowButtons/RowButtons';
import {
  ColumnInfo,
  ColumnsInfo,
  OnCancelEditRow,
  OnDeleteRow,
  OnEditRow,
  OnSaveRow,
  OnStartEditRow,
  RowInfo,
} from '../types';
import styles from './Row.module.css';

interface Props<TRowData> {
  row: RowInfo<TRowData>;
  columns: ColumnsInfo<TRowData>;
  labelField: keyof TRowData;
  onStartEditRow: OnStartEditRow<TRowData>;
  onCancelEditRow: OnCancelEditRow<TRowData>;
  onEditRow: OnEditRow<TRowData>;
  onSaveRow: OnSaveRow<TRowData>;
  onDeleteRow: OnDeleteRow<TRowData>;
}

export default function Row<TRowData>({
  row,
  columns,
  labelField,
  onEditRow,
  onSaveRow,
  onDeleteRow,
  onStartEditRow,
  onCancelEditRow,
}: Props<TRowData>) {
  return (
    <tr className={classNames(styles.row, { [styles.edit]: row.isEditing })}>
      {Object.entries(columns).map(([field, column]) => (
        <Cell
          className={styles.cell}
          key={field}
          field={field as keyof TRowData}
          row={row}
          column={column as ColumnInfo}
          onEditRow={onEditRow}
        />
      ))}
      <RowButtons
        className={styles.cell}
        row={row}
        onSaveRow={onSaveRow}
        onStartEditRow={onStartEditRow}
        onCancelEditRow={onCancelEditRow}
        onDeleteRow={onDeleteRow}
        labelField={labelField}
      ></RowButtons>
    </tr>
  );
}
