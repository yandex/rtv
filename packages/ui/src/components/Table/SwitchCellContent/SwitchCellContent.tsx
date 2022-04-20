import Switch from 'react-switch';

import { OnEditRow, RowInfo } from '../types';
import styles from './SwitchCellContent.module.css';

interface Props<TRowData> {
  row: RowInfo<TRowData>;
  field: keyof TRowData;
  onEditRow: OnEditRow<TRowData>;
}

export default function SwitchCellContent<TRowData>({ row, field, onEditRow }: Props<TRowData>) {
  const isChecked = Boolean(row.data[field] ?? true);
  return (
    <Switch
      className={styles.switch}
      height={20}
      width={40}
      onColor="#f60"
      offColor="#aaaaaa"
      disabled={!row.isEditing}
      onChange={() => onEditRow(row.id, { [field]: !isChecked } as unknown as Partial<TRowData>)}
      checked={isChecked}
    />
  );
}
