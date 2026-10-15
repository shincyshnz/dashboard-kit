import { mockStats } from "../data/mock-orders";
import { OrdersTable } from "../components/orders-table";
import { StatCard } from "../components/stat-card";

export function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            positive={stat.label === "Failed payments" ? stat.trend === "down" : stat.trend === "up"}
          />
        ))}
      </section>
      <OrdersTable />
    </div>
  );
}
