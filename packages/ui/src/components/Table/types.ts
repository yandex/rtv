export type ColumnsInfo<TRowData> = Partial<Record<keyof TRowData, ColumnInfo>>;

export type ColumnType = 'text' | 'visibility' | 'json5' | 'code';

export type Alignment = 'left' | 'center' | 'right';

export interface ColumnInfo {
  label: string;
  type?: ColumnType;
  defaultValue?: string | boolean;
  placeholder?: string;
  width?: number;
  alignment?: Alignment;
}

export type OnStartEditRow<TRowData> = (row: TRowData) => void;
export type OnCancelEditRow<TRowData> = (row: TRowData) => void;
export type OnEditRow<TRowData> = (id: string, value: Partial<TRowData>) => void;
export type OnSaveRow<TRowData> = (row: TRowData) => void;
export type OnDeleteRow<TRowData> = (row: TRowData) => void;

export type { RowData, RowInfo } from 'hooks/useTable';

export type EditorMode = 'json5' | 'javascript';
