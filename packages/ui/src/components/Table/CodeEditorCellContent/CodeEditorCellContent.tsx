import CodeEditorModal from 'components/CodeEditorModal/CodeEditorModal';
import { beautifyJson } from 'utils/helpers';

import { ColumnInfo, ColumnType, EditorMode, RowInfo } from '../types';
import styles from './CodeEditorCellContent.module.css';

interface Props<TRowData> {
  row: RowInfo<TRowData>;
  field: keyof TRowData;
  column: ColumnInfo;
  onSave: (code: string) => void;
}

const getEditorMode = (columnType?: ColumnType): EditorMode => {
  switch (columnType) {
    case 'json5':
      return 'json5';
    case 'code':
    default:
      return 'javascript';
  }
};

export default function CodeEditorCellContent<TRowData>({ row, field, column, onSave }: Props<TRowData>) {
  const value = row.data[field];
  const text = typeof value === 'object' ? beautifyJson(value) : String(value ?? '');
  const defaultText = typeof column.defaultValue === 'string' ? column.defaultValue : '';
  return (
    <div className={styles.container}>
      <span className={styles.text}>{text}</span>
      {row.isEditing && (
        <CodeEditorModal
          title={column.placeholder ?? column.label}
          initialText={text}
          onSave={(code) => onSave(code)}
          defaultText={defaultText}
          mode={getEditorMode(column.type)}
        />
      )}
    </div>
  );
}
