/**
 * Static mock data for the dashboard front end.
 * These shapes mirror what the market-data / portfolio API will return later,
 * so components can be wired to real endpoints without structural changes.
 */

export type Trend = "up" | "down";

export interface StatCard {
  id: string;
  label: string;
  value: number;
  changePct: number;
  trend: Trend;
  caption: string;
}

export const stats: StatCard[] = [
  {
    id: "portfolio-value",
    label: "Portfolio Value",
    value: 124847.84,
    changePct: 16.8,
    trend: "up",
    caption: "Compared to last month",
  },
  {
    id: "total-invested",
    label: "Total Invested",
    value: 98650.0,
    changePct: 15.2,
    trend: "up",
    caption: "Compared to last month",
  },
  {
    id: "todays-change",
    label: "Today's Change",
    value: -462.64,
    changePct: 12.8,
    trend: "down",
    caption: "Compared to last month",
  },
];

export type TxnStatus = "Filled" | "Pending";
export type TxnSide = "Buy" | "Sell";

export interface Transaction {
  id: string;
  ticker: string;
  name: string;
  /** tailwind bg + text classes for the ticker avatar */
  accent: string;
  date: string;
  status: TxnStatus;
  side: TxnSide;
  amount: number;
}

export const transactions: Transaction[] = [
  { id: "#TX6368", ticker: "AAPL", name: "Apple Inc.", accent: "bg-slate-900 text-white", date: "16 Jul 2024", status: "Filled", side: "Buy", amount: 848.84 },
  { id: "#TX6367", ticker: "MSFT", name: "Microsoft Corp.", accent: "bg-[#e8f0fe] text-[#2f6bed]", date: "15 Jul 2024", status: "Filled", side: "Buy", amount: 665.05 },
  { id: "#TX6366", ticker: "GOOGL", name: "Alphabet Inc.", accent: "bg-[#fdecec] text-[#dc2626]", date: "14 Jul 2024", status: "Pending", side: "Buy", amount: 567.7 },
  { id: "#TX6365", ticker: "NVDA", name: "NVIDIA Corp.", accent: "bg-[#eafaef] text-[#16a34a]", date: "13 Jul 2024", status: "Filled", side: "Sell", amount: 787.5 },
  { id: "#TX6364", ticker: "TSLA", name: "Tesla Inc.", accent: "bg-[#fdecec] text-[#dc2626]", date: "12 Jul 2024", status: "Pending", side: "Buy", amount: 557.8 },
  { id: "#TX6363", ticker: "AMZN", name: "Amazon.com Inc.", accent: "bg-[#fff4e5] text-[#d97706]", date: "11 Jul 2024", status: "Filled", side: "Buy", amount: 578.5 },
  { id: "#TX6362", ticker: "META", name: "Meta Platforms", accent: "bg-[#e8f0fe] text-[#2f6bed]", date: "10 Jul 2024", status: "Filled", side: "Buy", amount: 467.2 },
  { id: "#TX6361", ticker: "VOO", name: "Vanguard S&P 500", accent: "bg-slate-900 text-white", date: "9 Jul 2024", status: "Filled", side: "Buy", amount: 356.84 },
  { id: "#TX6360", ticker: "AMD", name: "Advanced Micro Devices", accent: "bg-[#eafaef] text-[#16a34a]", date: "8 Jul 2024", status: "Filled", side: "Buy", amount: 854.05 },
];

export interface Holding {
  ticker: string;
  name: string;
  accent: string;
  shares: number;
  marketValue: number;
}

export const topHoldings: Holding[] = [
  { ticker: "AAPL", name: "Apple Inc.", accent: "bg-slate-900 text-white", shares: 48, marketValue: 10848.84 },
  { ticker: "MSFT", name: "Microsoft Corp.", accent: "bg-[#e8f0fe] text-[#2f6bed]", shares: 21, marketValue: 8784.5 },
  { ticker: "NVDA", name: "NVIDIA Corp.", accent: "bg-[#eafaef] text-[#16a34a]", shares: 60, marketValue: 7357.2 },
  { ticker: "VOO", name: "Vanguard S&P 500", accent: "bg-[#fff4e5] text-[#d97706]", shares: 14, marketValue: 6854.5 },
];

export const user = {
  name: "Jerry Warren",
  role: "Investor",
  firstName: "Jerry",
  avatar:
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=96&h=96&fit=crop&crop=faces",
};

export const todayLabel = "16 May 2024";
