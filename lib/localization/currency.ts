export interface SalaryRange {
  entryLPA: number;
  midLPA: number;
  highLPA: number;
  avgLPA: number;
}

export function formatINR(lpa: number): string {
  return `₹${lpa.toFixed(1)} LPA`;
}

export function formatSalaryRange(salary: SalaryRange): string {
  return `₹${salary.entryLPA} LPA – ₹${salary.highLPA} LPA`;
}

export function getSalaryBreakdown(salary: SalaryRange) {
  return [
    { level: 'Entry-Level', range: `₹${salary.entryLPA} LPA`, desc: '0 - 2 years experience' },
    { level: 'Mid-Level', range: `₹${salary.midLPA} LPA`, desc: '2 - 5 years experience' },
    { level: 'High-Level Potential', range: `₹${salary.highLPA} LPA`, desc: '5+ years top-tier compensation' },
    { level: 'Average Package', range: `₹${salary.avgLPA} LPA`, desc: 'Median across tech hubs' },
  ];
}
