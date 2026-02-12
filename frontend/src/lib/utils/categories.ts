export const EXPENSE_CATEGORIES = [
  { value: 'Housing', label: 'Housing', color: '#3B82F6' },
  { value: 'Transportation', label: 'Transportation', color: '#10B981' },
  { value: 'Utilities', label: 'Utilities', color: '#F59E0B' },
  { value: 'Insurance', label: 'Insurance', color: '#8B5CF6' },
  { value: 'Credit Cards', label: 'Credit Cards', color: '#EF4444' },
  { value: 'Personal Loans', label: 'Personal Loans', color: '#EC4899' },
  { value: 'Others', label: 'Others', color: '#6B7280' }
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  'Housing': '#3B82F6',
  'Transportation': '#10B981',
  'Utilities': '#F59E0B',
  'Insurance': '#8B5CF6',
  'Credit Cards': '#EF4444',
  'Personal Loans': '#EC4899',
  'Others': '#6B7280',
  'Loan Instalment': '#1D4ED8'
};

export const DSR_STATUS_COLORS = {
  'Healthy': 'bg-green-100 text-green-800 border-green-200',
  'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Caution': 'bg-orange-100 text-orange-800 border-orange-200',
  'High Risk': 'bg-red-100 text-red-800 border-red-200'
} as const;
