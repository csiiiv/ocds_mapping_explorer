import type { ReactNode } from "react";
import type { DataElementColumn, DataElementColumnGroup } from "../types";

interface Props {
  columns: DataElementColumn[];
  columnGroups: DataElementColumnGroup[];
  rows: Record<string, unknown>[];
  showOptional: boolean;
  showMappingStats: boolean;
  renderCell?: (row: Record<string, unknown>, col: DataElementColumn) => ReactNode;
}

export function DataElementsTable({
  columns,
  columnGroups,
  rows,
  showOptional,
  showMappingStats,
  renderCell,
}: Props) {
  const visible = columns.filter((col) => {
    if (col.optional && !showOptional) return false;
    if (col.group === "mapping_statistics" && !showMappingStats) return false;
    return true;
  });

  const visibleGroups = columnGroups
    .map((g) => ({
      ...g,
      keys: g.keys.filter((k) => visible.some((c) => c.key === k)),
    }))
    .filter((g) => g.keys.length > 0);

  if (!rows.length) {
    return <div className="placeholder">No rows.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="data de-table">
        <thead>
          <tr className="de-group-row">
            {visibleGroups.map((g) => (
              <th key={g.id} colSpan={g.keys.length} className="de-group-head">
                {g.label}
              </th>
            ))}
          </tr>
          <tr>
            {visible.map((col) => (
              <th key={col.key} className={col.optional ? "de-optional-col" : ""}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {visible.map((col) => {
                const v = row[col.key];
                const content =
                  renderCell?.(row, col) ?? renderDefaultCell(v, col);
                return (
                  <td
                    key={col.key}
                    className={[
                      col.kind === "mono" ? "mono" : "",
                      col.kind === "wrap" ? "wrap" : "",
                      col.optional ? "de-optional-col" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
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

function renderDefaultCell(value: unknown, col: DataElementColumn): ReactNode {
  if (col.kind === "presence") {
    return value ? "✓" : "—";
  }
  return String(value ?? "");
}
