import { RowData, State } from '../types';

interface Props<TRowData> {
  row: TRowData;
}

export default function startEditRowReducer<TRowData extends RowData>(
  prevState: State<TRowData>,
  { row }: Props<TRowData>
) {
  const { editingRows } = prevState;

  return {
    ...prevState,
    editingRows: {
      ...editingRows,
      [row.id]: {
        ...row,
      },
    },
  };
}
