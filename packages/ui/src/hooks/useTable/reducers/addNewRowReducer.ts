import { nanoid } from 'nanoid';

import { RowData, State } from '../types';

export default function addNewRowReducer<TRowData extends RowData>(prevState: State<TRowData>) {
  const { editingRows, newRows } = prevState;

  const newRow = {
    id: nanoid(),
  } as TRowData;

  return {
    ...prevState,
    newRows: [newRow, ...newRows],
    editingRows: {
      ...editingRows,
      [newRow.id]: {
        ...newRow,
      },
    },
    validation: {},
  };
}
