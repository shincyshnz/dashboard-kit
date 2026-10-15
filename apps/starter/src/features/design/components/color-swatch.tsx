export function ColorSwatch({ name, value }: { name: string; value: string }) {
  return (
    <figure className="flex items-center gap-3">
      {/* The swatch reads the live CSS variable, so it updates the moment DESIGN.md changes. */}
      <span className="size-10 shrink-0 rounded-md border" style={{ background: `var(--${name})` }} />
      <figcaption className="min-w-0">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate font-mono text-xs text-muted-foreground">{value}</p>
      </figcaption>
    </figure>
  );
}
