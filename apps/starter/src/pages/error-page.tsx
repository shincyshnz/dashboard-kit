import { isRouteErrorResponse, useRouteError } from "react-router";

export function ErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Unknown error";

  return (
    <div className="mx-auto flex max-w-md flex-col gap-3 px-6 py-16">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground">The page failed to load. Reload to try again.</p>
      <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">{message}</pre>
    </div>
  );
}
