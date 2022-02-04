/**
 * Parsers for tv command output
 * Example:
 *
 * const input =
 * header
 * id   name
 * 1    foo
 *
 * parseTable(input, 'header'); // returns [['id', 'name'], [1, 'foo']]
 */

export const parseTable = (output: string, header?: string) => {
  const rows = output
    .split('\n')
    .map((row) => row.trim())
    .filter(Boolean);
  const headerIndex = rows.findIndex((row) => row === header);
  return rows.slice(headerIndex + 1).map((line) => line.split(/\t|\s{2,}/).map((item) => item.trim()));
};
