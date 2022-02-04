export interface RowData {
  id: string;
}

export type RowValidation<TRowData> = Record<keyof TRowData, string> | undefined;

export interface RowInfo<TRowData = RowData> {
  id: string;
  isEditing?: boolean;
  data: TRowData;
  validation: RowValidation<TRowData>;
}

export interface ValidateRowProps<TRowData> {
  row: TRowData;
}

type TableValidation<TRowData> = Record<string, RowValidation<TRowData>>;

export interface State<TRowData> {
  newRows: TRowData[];
  editingRows: Record<string, TRowData>;
  validation: TableValidation<TRowData>;
}

export type ValidateRowCallback<TRowData> = (props: ValidateRowProps<TRowData>) => RowValidation<TRowData>;
export type PersistRowCallback<TRowData> = (updatedRow: TRowData, isNew: boolean) => void;
