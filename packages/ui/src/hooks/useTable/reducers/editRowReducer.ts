import { RowData, RowValidation, State } from '../types';

interface Props<TRowData> {
  updatedRow: TRowData;
  data: Partial<TRowData>;
  rowErrors: RowValidation<TRowData>;
}

export default function editRowReducer<TRowData extends RowData>(
  prevState: State<TRowData>,
  { updatedRow, data, rowErrors }: Props<TRowData>
) {
  const { editingRows, validation } = prevState;

  const updatedRowErrors =
    rowErrors &&
    (Object.keys(data)
      .map((field) => field as keyof TRowData)
      .reduce(
        (result, field) => ({
          ...result,
          [field]: rowErrors[field],
        }),
        validation[updatedRow.id] ?? {}
      ) as RowValidation<TRowData>);

  return {
    ...prevState,
    editingRows: {
      ...editingRows,
      [updatedRow.id]: updatedRow,
    },
    validation: {
      [updatedRow.id]: updatedRowErrors,
    },
  };
}
