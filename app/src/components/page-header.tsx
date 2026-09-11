export function PageHeader({
  title,
  subtitle,
  right,
  legend,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  /** Optional small explainer row (e.g. a colour-priority legend) shown under the subtitle. */
  legend?: React.ReactNode;
}) {
  return (
    <div className="px-8 pt-8 pb-6 border-b border-border">
      {right && <div className="mb-4">{right}</div>}
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>}
      {legend && <div className="mt-3">{legend}</div>}
    </div>
  );
}
