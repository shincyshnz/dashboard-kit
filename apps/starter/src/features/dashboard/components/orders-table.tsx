import { useQueryStates } from "nuqs";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { mockOrders, type OrderStatus } from "../data/mock-orders";
import { orderStatuses, ordersSearchParams } from "../search-params";

const statusVariant: Record<OrderStatus, "success" | "warning" | "destructive"> = {
  paid: "success",
  pending: "warning",
  failed: "destructive",
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function OrdersTable() {
  const [{ q, status }, setFilters] = useQueryStates(ordersSearchParams);

  const term = q.trim().toLowerCase();
  const rows = mockOrders.filter(
    (order) =>
      (status === "all" || order.status === status) &&
      (!term || order.customer.toLowerCase().includes(term) || order.id.toLowerCase().includes(term)),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent orders</CardTitle>
        <CardDescription>Filters are stored in the URL — copy the address to share this view.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="order-search">Search orders</label>
          <input
            id="order-search"
            value={q}
            onChange={(event) => void setFilters({ q: event.target.value || null })}
            placeholder="Search customer or order ID"
            className="h-9 w-64 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <div role="group" aria-label="Filter by status" className="flex gap-1">
            {orderStatuses.map((value) => (
              <Button
                key={value}
                size="sm"
                variant={status === value ? "secondary" : "ghost"}
                aria-pressed={status === value}
                onClick={() => void setFilters({ status: value === "all" ? null : value })}
                className="capitalize"
              >
                {value}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Order</th>
                <th className="px-4 py-2.5 font-medium">Customer</th>
                <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((order, index) => (
                <tr key={order.id} className={cn(index > 0 && "border-t")}>
                  <td className="px-4 py-2.5 font-mono text-xs">{order.id}</td>
                  <td className="px-4 py-2.5">{order.customer}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{currency.format(order.amount)}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant={statusVariant[order.status]} className="capitalize">{order.status}</Badge>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No orders match these filters. Clear the search or pick another status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
