import { Movement, Investor, BuyerSale, MyInvestment, Debtor, UserProfile, SavingGoal, Debt } from '../types/finance';

const BACKUP_DATE_KEY = 'control_financiero_last_backup_date';

export function getLastBackupDate(): string | null {
  try {
    return localStorage.getItem(BACKUP_DATE_KEY);
  } catch {
    return null;
  }
}

export function recordBackupDate(): void {
  try {
    localStorage.setItem(BACKUP_DATE_KEY, new Date().toISOString());
  } catch {
    // Ignore storage failure
  }
}

export function exportFullBackupToJson(state: {
  movements: Movement[];
  investors: Investor[];
  buyerSales: BuyerSale[];
  debtors?: Debtor[];
  myInvestments: MyInvestment[];
  savings?: SavingGoal[];
  debts?: Debt[];
  accounts: unknown;
  configLists: unknown;
  profiles?: UserProfile[];
}) {
  const jsonString = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `control_financiero_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  recordBackupDate();
}

export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCsv = (val: string | number) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
