export const PURCHASE_BILLS = [
  { id: '191042', date: '11/24/2025 03:59:02 PM', vendor: 'OH Brewing', status: 'Committed', total: '826.00', dueDate: '12/24/2025 03:59:02 PM', note: '' },
  { id: '56406,07', date: '11/24/2025 02:25:11 PM', vendor: 'Fedway', status: 'Committed', total: '1913.78', dueDate: '12/24/2025 02:25:11 PM', note: '' },
  { id: '171544,170336', date: '11/24/2025 02:05:29 PM', vendor: 'Allied Beverages', status: 'Committed', total: '3514.42', dueDate: '12/24/2025 02:05:29 PM', note: '' },
  { id: '10347880', date: '11/21/2025 01:01:59 PM', vendor: 'REMARKABLE LIQUIDS', status: 'Committed', total: '539.85', dueDate: '12/21/2025 01:01:59 PM', note: '' },
  { id: '0178072', date: '11/21/2025 12:47:34 PM', vendor: 'High Grade', status: 'Committed', total: '450.25', dueDate: '12/21/2025 12:47:34 PM', note: '' },
  { id: '803462', date: '11/20/2025 06:25:47 PM', vendor: 'Gallo Wines', status: 'Committed', total: '448.04', dueDate: '12/20/2025 06:25:47 PM', note: '' },
  // ... adding more mock data to reach 65 records
  ...Array.from({ length: 59 }).map((_, i) => ({
    id: (200000 + i).toString(),
    date: '11/19/2025 10:30:15 AM',
    vendor: 'Sample Vendor ' + (i + 1),
    status: 'Committed',
    total: (Math.random() * 2000 + 100).toFixed(2),
    dueDate: '12/19/2025 10:30:15 AM',
    note: i % 5 === 0 ? 'Urgent' : ''
  }))
]
