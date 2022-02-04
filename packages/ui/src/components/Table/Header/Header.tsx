import CellWrapper from '../CellWrapper/CellWrapper';
import { ColumnInfo, ColumnsInfo } from '../types';
import styles from './Header.module.css';

interface Props<TRowData> {
  columns: ColumnsInfo<TRowData>;
}

export function Header<TRowData>({ columns }: Props<TRowData>) {
  return (
    <thead>
      <tr className={styles.row}>
        {Object.values(columns)
          .map((column) => column as ColumnInfo)
          .map(({ label, alignment }) => (
            <td className={styles.cell} key={label}>
              <CellWrapper alignment={alignment}>
                <div className={styles.content}>{label}</div>
              </CellWrapper>
            </td>
          ))}
        <td className={styles.cell} />
      </tr>
    </thead>
  );
}

export default Header;
