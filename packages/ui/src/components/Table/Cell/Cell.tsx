import classNames from 'classnames';
import Popup from 'reactjs-popup';

import CellWrapper from '../CellWrapper/CellWrapper';
import CodeEditorCellContent from '../CodeEditorCellContent/CodeEditorCellContent';
import SwitchCellContent from '../SwitchCellContent/SwitchCellContent';
import TextCellContent from '../TextCellContent/TextCellContent';
import { ColumnInfo, OnEditRow, RowInfo } from '../types';
import VisibilityCellContent from '../VisibilityCellContent/VisibilityCellContent';
import styles from './Cell.module.css';

interface Props<TRowData> {
  className?: string;
  row: RowInfo<TRowData>;
  field: keyof TRowData;
  column: ColumnInfo;
  onEditRow: OnEditRow<TRowData>;
}

export default function Cell<TRowData>(props: Props<TRowData>) {
  const { className, row, field, column, onEditRow } = props;
  const { type = 'text', alignment } = column;
  const error = row.validation?.[field];
  const cellClassName = classNames(styles.cell, className, {
    [styles.edit]: row.isEditing,
    [styles.error]: Boolean(error),
  });
  return (
    <Popup
      className="validationPopup"
      on={[]}
      open={Boolean(error)}
      closeOnDocumentClick={false}
      trigger={
        <td className={cellClassName}>
          <CellWrapper showSeparator={row.isEditing} alignment={alignment}>
            {type === 'visibility' && <VisibilityCellContent {...props} />}
            {type === 'boolean' && <SwitchCellContent {...props} />}
            {type === 'text' && <TextCellContent {...props} />}
            {(type === 'code' || type === 'json5') && (
              <CodeEditorCellContent
                row={row}
                field={field}
                column={column}
                onSave={(code) => onEditRow(row.id, { [field]: code } as unknown as Partial<TRowData>)}
              />
            )}
          </CellWrapper>
        </td>
      }
    >
      {error}
    </Popup>
  );
}
