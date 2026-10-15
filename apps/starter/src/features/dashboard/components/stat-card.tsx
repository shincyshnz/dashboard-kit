import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

// Promoted to the registry as a block in Phase 4.
export function StatCard({ label, value, change, positive }: StatCardProps) {
  return (
    <Card className="gap-3">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant={positive ? "success" : "warning"}>{change} vs last period</Badge>
      </CardContent>
    </Card>
  );
}
