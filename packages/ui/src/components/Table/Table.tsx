import Header from './Header/Header';
import Row from './Row/Row';
import styles from './Table.module.css';
import {
  ColumnInfo,
  ColumnsInfo,
  OnCancelEditRow,
  OnDeleteRow,
  OnEditRow,
  OnSaveRow,
  OnStartEditRow,
  RowInfo,
} from './types';

interface Props<TRowData> {
  rows: RowInfo<TRowData>[];
  columns: ColumnsInfo<TRowData>;
  labelField: keyof TRowData;
  onStartEditRow: OnStartEditRow<TRowData>;
  onCancelEditRow: OnCancelEditRow<TRowData>;
  onEditRow: OnEditRow<TRowData>;
  onSaveRow: OnSaveRow<TRowData>;
  onDeleteRow: OnDeleteRow<TRowData>;
}

export default function Table<TRowData>({
  rows,
  columns,
  onStartEditRow,
  onCancelEditRow,
  onEditRow,
  onSaveRow,
  onDeleteRow,
  labelField,
}: Props<TRowData>) {
  return (
    <table className={styles.table}>
      <colgroup>
        {Object.entries(columns).map(([field, column]) => (
          <col key={field} width={(column as ColumnInfo).width} />
        ))}
        <col width={124} />
      </colgroup>

      <Header columns={columns} />
      <tbody>
        {rows.map((row) => (
          <Row
            key={row.id}
            row={row}
            columns={columns}
            onStartEditRow={onStartEditRow}
            onCancelEditRow={onCancelEditRow}
            onEditRow={onEditRow}
            onSaveRow={onSaveRow}
            onDeleteRow={onDeleteRow}
            labelField={labelField}
          />
        ))}
      </tbody>
    </table>
  );
}
