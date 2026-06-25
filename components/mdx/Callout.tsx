import { Info, AlertTriangle, Sparkles } from "lucide-react";

type CalloutVariant = "info" | "warning" | "tip";

const variantStyles: Record<
  CalloutVariant,
  {
    border: string;
    bg: string;
    icon: React.ReactNode;
  }
> = {
  info: {
    border: "border-l-forge-violet",
    bg: "bg-forge-violet/6",
    icon: <Info className="h-5 w-5 text-forge-violet shrink-0 mt-0.5" />,
  },
  warning: {
    border: "border-l-forge-amber",
    bg: "bg-forge-amber/6",
    icon: <AlertTriangle className="h-5 w-5 text-forge-amber shrink-0 mt-0.5" />,
  },
  tip: {
    border: "border-l-forge-mint",
    bg: "bg-forge-mint/6",
    icon: <Sparkles className="h-5 w-5 text-forge-mint shrink-0 mt-0.5" />,
  },
};

export function Callout({
  type = "info",
  children,
}: {
  type: CalloutVariant;
  children: React.ReactNode;
}) {
  const style = variantStyles[type];

  return (
    <div className={`flex gap-3 rounded-md border-l-3 p-4 ${style.border} ${style.bg}`}>
      {style.icon}
      <div className="text-body-m text-forge-ink [&>p:first-child]:mt-0 [&>p]:text-body-m">
        {children}
      </div>
    </div>
  );
}
