import classNames from 'classnames';

import { ColumnInfo, OnEditRow, RowInfo } from '../types';
import styles from './TextCellContent.module.css';

interface Props<TRowData> {
  row: RowInfo<TRowData>;
  field: keyof TRowData;
  column: ColumnInfo;
  onEditRow: OnEditRow<TRowData>;
}

export default function TextCellContent<TRowData>({ row, field, column, onEditRow }: Props<TRowData>) {
  const { placeholder } = column;
  const value = String(row.data[field] ?? '');
  const error = row.validation?.[field];
  return row.isEditing ? (
    <input
      className={classNames(styles.input, {
        [styles.error]: Boolean(error),
      })}
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onEditRow(row.id, { [field]: e.target.value } as unknown as Partial<TRowData>)}
    />
  ) : (
    <div className={styles.text}>{value}</div>
  );
}
