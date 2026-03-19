export const purchaseOrdersData = [
  { po: '369', date: '11/15/2021', vendor: 'Gallo Wines', vendorOrder: '', status: 'Open', total: '2430.34', overallStatus: 'Open' },
  { po: '368', date: '11/09/2021', vendor: 'Classic Wines', vendorOrder: '', status: 'Open', total: '427.88', overallStatus: 'Open' },
  { po: '367', date: '11/08/2021', vendor: 'Wines 4 All', vendorOrder: '', status: 'Open', total: '681.05', overallStatus: 'Open' },
  { po: '366', date: '11/08/2021', vendor: 'M Barriston & Sons / Newark To', vendorOrder: '', status: 'Fully Received', total: '1857.69', overallStatus: 'Fully Received' },
  { po: '365', date: '11/04/2021', vendor: 'Latitude', vendorOrder: '', status: 'Open', total: '770.00', overallStatus: 'Open' },
  { po: '364', date: '11/03/2021', vendor: 'Gallo Wines', vendorOrder: '', status: 'Fully Received', total: '1695.44', overallStatus: 'Fully Received' },
  // Generate more data to match the screenshot's '230' count for testing pagination/scrolling later if needed
  ...Array.from({ length: 224 }, (_, i) => ({
    po: (363 - i).toString(),
    date: '10/25/2021',
    vendor: i % 2 === 0 ? 'Gallo Wines' : 'Classic Wines',
    vendorOrder: '',
    status: i % 3 === 0 ? 'Fully Received' : 'Open',
    total: (Math.random() * 2000 + 500).toFixed(2),
    overallStatus: i % 3 === 0 ? 'Fully Received' : 'Open'
  }))
]
