/**
 * Export utilities for downloading DebtShield schedules in CSV and JSON formats.
 */

export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;

  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent = [
    keys.join(separator),
    ...rows.map((row) =>
      keys
        .map((k) => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];
          if (typeof cell === 'string') {
            cell = `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(separator)
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJSON(filename, data) {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Transforms monthly schedule for CSV export
 */
export function formatScheduleForCSV(schedule, debts = []) {
  return schedule.map((row) => {
    const formatted = {
      Month: row.month,
      Date: row.date,
      'Total Remaining Balance': row.totalBalance,
      'Monthly Payment': row.monthlyPayment,
      'Monthly Interest Paid': row.monthlyInterest,
      'Monthly Principal Paid': row.monthlyPrincipal,
      'Cumulative Interest Paid': row.cumulativeInterest
    };

    if (row.debtBalances) {
      debts.forEach((d) => {
        formatted[`${d.name} Balance`] = row.debtBalances[d.id] ?? 0;
      });
    }

    return formatted;
  });
}
