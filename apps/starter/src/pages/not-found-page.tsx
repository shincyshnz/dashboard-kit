import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { paths } from "@/config/routes";

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-start gap-4 py-16">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">This address doesn't match any page. Check the link or go back to the overview.</p>
      <Button asChild>
        <Link to={paths.home}>Go to overview</Link>
      </Button>
    </div>
  );
}
