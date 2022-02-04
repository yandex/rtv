import { RowData, State } from '../types';

interface Props<TRowData> {
  updatedRow: TRowData;
}

export default function commitRowReducer<TRowData extends RowData>(
  prevState: State<TRowData>,
  { updatedRow }: Props<TRowData>
): State<TRowData> {
  const { newRows, editingRows } = prevState;

  const updatedEditingRows = {
    ...editingRows,
  };
  delete updatedEditingRows[updatedRow.id];

  return {
    ...prevState,
    editingRows: updatedEditingRows,
    newRows: newRows.filter((row) => row.id !== updatedRow.id),
    validation: {},
  };
}
