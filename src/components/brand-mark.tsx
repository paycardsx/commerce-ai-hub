import { cn } from "@/lib/utils";

export function BrandMark({
  iniciais,
  nome,
  slogan,
  className,
  size = "md",
}: {
  iniciais: string;
  nome: string;
  slogan?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const box = size === "sm" ? "h-9 w-9 text-sm" : size === "lg" ? "h-14 w-14 text-xl" : "h-11 w-11";
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div
        className={cn(
          "bg-brand grid shrink-0 place-items-center rounded-xl font-display font-black text-primary-foreground",
          box,
        )}
      >
        {iniciais}
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-base font-bold leading-tight">{nome}</p>
        {slogan ? <p className="truncate text-xs text-muted-foreground">{slogan}</p> : null}
      </div>
    </div>
  );
}
