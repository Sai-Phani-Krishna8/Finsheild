export const mockActivities = [
  {
    id: 1,
    type: "Company Registration",
    description: "PAN used to register 'Sri Venkata Exports Pvt Ltd' at MCA21 portal without owner's knowledge",
    source: "MCA21 Portal",
    timestamp: "2025-01-14 · 11:32 AM",
    status: "SUSPICIOUS",
  },
  {
    id: 2,
    type: "Loan Inquiry",
    description: "Credit check initiated for ₹15L personal loan application at HDFC Bank",
    source: "HDFC Bank",
    timestamp: "2025-01-14 · 10:15 AM",
    status: "SUSPICIOUS",
  },
  {
    id: 3,
    type: "ITR Filing",
    description: "Income Tax Return filed for FY 2023-24 via official Income Tax Portal",
    source: "IT Portal",
    timestamp: "2025-01-13 · 04:20 PM",
    status: "NORMAL",
  },
  {
    id: 4,
    type: "GST Registration",
    description: "New GST registration attempted using PAN at GST portal for fake trading firm",
    source: "GST Portal",
    timestamp: "2025-01-13 · 01:45 PM",
    status: "SUSPICIOUS",
  },
  {
    id: 5,
    type: "KYC Verification",
    description: "PAN KYC verification completed for Zerodha demat account by account holder",
    source: "Zerodha",
    timestamp: "2025-01-12 · 09:00 AM",
    status: "NORMAL",
  },
  {
    id: 6,
    type: "Credit Card Application",
    description: "Credit card application for ₹2L limit submitted to SBI using stolen PAN copy",
    source: "SBI Cards",
    timestamp: "2025-01-11 · 03:30 PM",
    status: "SUSPICIOUS",
  },
  {
    id: 7,
    type: "Aadhaar-PAN Link",
    description: "Aadhaar-PAN linking verified successfully by account holder on IT portal",
    source: "IT Portal",
    timestamp: "2025-01-10 · 11:00 AM",
    status: "NORMAL",
  },
  {
    id: 8,
    type: "Property Registration",
    description: "PAN submitted as identity proof for property sale deed registration in Guntur",
    source: "Registration Dept",
    timestamp: "2025-01-09 · 02:15 PM",
    status: "SUSPICIOUS",
  },
  {
    id: 9,
    type: "Mutual Fund KYC",
    description: "KYC completed at Groww for SIP investment in index funds by account holder",
    source: "Groww",
    timestamp: "2025-01-08 · 10:45 AM",
    status: "NORMAL",
  },
  {
    id: 10,
    type: "Bank Account Opening",
    description: "Savings account opening attempted at Axis Bank branch using forged PAN photocopy",
    source: "Axis Bank",
    timestamp: "2025-01-07 · 04:00 PM",
    status: "SUSPICIOUS",
  },
]

export const simulatedAlerts = [
  {
    type: "New Company Director",
    description: "PAN added as director in 'Fake Realty Solutions Pvt Ltd' on MCA21 without consent",
    source: "MCA21 Portal",
    status: "SUSPICIOUS",
  },
  {
    type: "Gold Loan Application",
    description: "Gold loan of ₹8L applied at Muthoot Finance using PAN as identity proof",
    source: "Muthoot Finance",
    status: "SUSPICIOUS",
  },
  {
    type: "Insurance Policy",
    description: "Term life insurance policy opened at LIC using PAN details without owner's knowledge",
    source: "LIC of India",
    status: "SUSPICIOUS",
  },
  {
    type: "UPI KYC Update",
    description: "UPI KYC updated successfully by account holder on PhonePe app",
    source: "PhonePe",
    status: "NORMAL",
  },
  {
    type: "Foreign Remittance",
    description: "Outward remittance of $3,000 initiated using PAN at unknown forex dealer",
    source: "Forex Dealer",
    status: "SUSPICIOUS",
  },
  {
    type: "Crypto Exchange KYC",
    description: "KYC submitted on CoinDCX crypto exchange using PAN — account not created by owner",
    source: "CoinDCX",
    status: "SUSPICIOUS",
  },
  {
    type: "EPF Withdrawal",
    description: "EPF partial withdrawal claim submitted using PAN on EPFO portal by account holder",
    source: "EPFO Portal",
    status: "NORMAL",
  },
  {
    type: "Vehicle Loan",
    description: "Two-wheeler loan of ₹1.2L applied at Bajaj Finance using PAN copy",
    source: "Bajaj Finance",
    status: "SUSPICIOUS",
  },
  {
    type: "Passport Application",
    description: "PAN submitted as address proof for passport application — address does not match records",
    source: "Passport Seva",
    status: "SUSPICIOUS",
  },
  {
    type: "Demat Account",
    description: "New demat account opened at Angel One by account holder for stock trading",
    source: "Angel One",
    status: "NORMAL",
  },
]

export const getStatusCounts = (activities) => {
  const suspicious = activities.filter(a => a.status === "SUSPICIOUS").length
  const normal = activities.filter(a => a.status === "NORMAL").length
  return { total: activities.length, suspicious, normal }
}