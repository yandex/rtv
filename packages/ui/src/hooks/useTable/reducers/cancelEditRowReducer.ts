import { RowData, State } from '../types';

interface Props<TRowData> {
  canceledRow: TRowData;
}

export default function cancelEditRowReducer<TRowData extends RowData>(
  prevState: State<TRowData>,
  { canceledRow }: Props<TRowData>
) {
  const { editingRows, newRows } = prevState;

  const updatedEditingRows = {
    ...editingRows,
  };
  delete updatedEditingRows[canceledRow.id];

  return {
    ...prevState,
    editingRows: updatedEditingRows,
    newRows: newRows.filter((row) => row.id !== canceledRow.id),
    validation: {},
  };
}
