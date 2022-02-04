import { useState } from 'react';

import addNewRowReducer from './reducers/addNewRowReducer';
import cancelEditRowReducer from './reducers/cancelEditRowReducer';
import commitRowReducer from './reducers/commitRowReducer';
import editRowReducer from './reducers/editRowReducer';
import startEditRowReducer from './reducers/startEditRowReducer';
import { RowData, RowInfo, State, ValidateRowCallback, PersistRowCallback } from './types';

interface Props<TRowData> {
  rows?: TRowData[];
  setRows: (rows: TRowData[]) => void;
  validateRow: ValidateRowCallback<TRowData>;
  persistRow: PersistRowCallback<TRowData>;
}

function useTable<TRowData extends RowData>({ rows = [], setRows, validateRow, persistRow }: Props<TRowData>) {
  const [state, setState] = useState<State<TRowData>>({
    newRows: [],
    editingRows: {},
    validation: {},
  });

  const isNewRow = (row: TRowData) => newRows.find((newRow) => newRow.id === row.id) !== undefined;

  const onSaveRow = (updatedRow: TRowData) => {
    const errors = validateRow?.({ row: updatedRow });

    if (errors && Object.keys(errors).length) {
      setState((prevState) => ({
        ...prevState,
        validation: {
          [updatedRow.id]: errors,
        },
      }));
    } else {
      persistRow(updatedRow, isNewRow(updatedRow));
    }
  };

  const onEditRow = (id: string, data: Partial<TRowData>) => {
    const updatedRow: TRowData = {
      ...editingRows[id],
      ...data,
    };

    const rowErrors = validateRow?.({ row: updatedRow });
    setState((prevState) => editRowReducer(prevState, { updatedRow, rowErrors, data }));
  };

  const onDeleteRow = (id: string) => {
    const updatedRows = rows.filter((row) => row.id !== id);
    setRows(updatedRows);

    setState((prevState) => ({
      ...prevState,
      validation: {},
    }));
  };

  const onCommitRow = (updatedRow: TRowData) => {
    const isNew = isNewRow(updatedRow);

    setState((prevState) => commitRowReducer(prevState, { updatedRow }));

    const updatedRows = isNew
      ? [updatedRow, ...rows]
      : rows.map((row) => (row.id === updatedRow.id ? updatedRow : row));
    setRows(updatedRows);
  };

  const { editingRows, newRows, validation } = state;

  const actualRows: RowInfo<TRowData>[] = [...newRows, ...rows].map((row) => ({
    id: row.id,
    isEditing: editingRows[row.id] !== undefined,
    data: editingRows[row.id] ?? row,
    validation: validation[row.id],
  }));

  return {
    actualRows,
    onStartEditRow: (row: TRowData) => {
      setState((prevState) => startEditRowReducer(prevState, { row }));
    },
    onCancelEditRow: (canceledRow: TRowData) => {
      setState((prevState) => cancelEditRowReducer(prevState, { canceledRow }));
    },
    onEditRow,
    onAddNewRow: () => {
      setState((prevState) => addNewRowReducer(prevState));
    },
    onSaveRow,
    onDeleteRow,
    onCommitRow,
  };
}

export default useTable;
