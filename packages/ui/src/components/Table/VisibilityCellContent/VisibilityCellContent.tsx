import Button from 'components/Button/Button';
import { ReactComponent as EyeOffIcon } from 'icons/eye-off.svg';
import { ReactComponent as EyeIcon } from 'icons/eye.svg';

import { OnEditRow, RowInfo } from '../types';
import styles from './VisibilityCellContent.module.css';

interface Props<TRowData> {
  row: RowInfo<TRowData>;
  field: keyof TRowData;
  onEditRow: OnEditRow<TRowData>;
}

export default function VisibilityCellContent<TRowData>({ row, field, onEditRow }: Props<TRowData>) {
  const isChecked = Boolean(row.data[field] ?? true);
  return (
    <Button
      className={row.isEditing ? styles.buttonEnabled : styles.buttonDisabled}
      disabled={!row.isEditing}
      variant="ghost"
      onClick={() => onEditRow(row.id, { [field]: !isChecked } as unknown as Partial<TRowData>)}
    >
      {isChecked ? <EyeIcon className={styles.eyeIcon} /> : <EyeOffIcon />}
    </Button>
  );
}
