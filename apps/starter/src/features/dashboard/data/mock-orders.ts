// Placeholder data until Phase 3 connects a real API.
export type OrderStatus = "paid" | "pending" | "failed";

export interface Order {
  id: string;
  customer: string;
  amount: number;
  status: OrderStatus;
}

export const mockOrders: Order[] = [
  { id: "ORD-1042", customer: "Northwind Traders", amount: 1840, status: "paid" },
  { id: "ORD-1041", customer: "Bluefin Logistics", amount: 620, status: "pending" },
  { id: "ORD-1040", customer: "Cedar & Co.", amount: 2310, status: "paid" },
  { id: "ORD-1039", customer: "Atlas Freight", amount: 415, status: "failed" },
  { id: "ORD-1038", customer: "Harbor Supply", amount: 980, status: "paid" },
  { id: "ORD-1037", customer: "Meridian Labs", amount: 1275, status: "pending" },
];

export const mockStats = [
  { label: "Revenue (30 days)", value: "$48,210", change: "+12.4%", trend: "up" },
  { label: "Open orders", value: "37", change: "+4", trend: "up" },
  { label: "Failed payments", value: "3", change: "−2", trend: "down" },
] as const;
