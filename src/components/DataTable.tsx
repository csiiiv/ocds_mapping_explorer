import type { ReactNode } from "react";

interface Props<Row> {
  columns: { key: string; label: string; mono?: boolean; wrap?: boolean }[];
  rows: Row[];
  emptyHint?: string;
  renderCell?: (row: Row, colKey: string) => ReactNode;
}

export function DataTable<Row extends Record<string, unknown>>({
  columns,
  rows,
  emptyHint,
  renderCell,
}: Props<Row>) {
  if (!rows.length) {
    return <div className="placeholder">{emptyHint || "No rows."}</div>;
  }
  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {columns.map((c) => {
                const v = r[c.key];
                const custom = renderCell?.(r, c.key);
                const content = custom !== undefined ? custom : String(v ?? "");
                return (
                  <td key={c.key} className={`${c.mono ? "mono" : ""} ${c.wrap ? "wrap" : ""}`.trim()}>
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
