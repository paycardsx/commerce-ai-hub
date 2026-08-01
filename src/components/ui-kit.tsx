import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  titulo,
  descricao,
  acoes,
}: {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">{titulo}</h1>
        {descricao ? <p className="mt-1 text-sm text-muted-foreground">{descricao}</p> : null}
      </div>
      {acoes ? <div className="flex shrink-0 flex-wrap gap-2">{acoes}</div> : null}
    </header>
  );
}

export function KpiCard({
  rotulo,
  valor,
  detalhe,
  icone,
  destaque,
}: {
  rotulo: string;
  valor: string;
  detalhe?: string;
  icone?: ReactNode;
  destaque?: boolean;
}) {
  return (
    <div
      className={cn(
        "card-surface p-4 transition-colors",
        destaque && "border-primary/40 shadow-brand",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">{rotulo}</p>
        {icone ? <span className="shrink-0 text-primary">{icone}</span> : null}
      </div>
      <p className="mt-2 font-display text-2xl font-bold">{valor}</p>
      {detalhe ? <p className="mt-1 text-xs text-muted-foreground">{detalhe}</p> : null}
    </div>
  );
}

export function EmptyState({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao: string;
  acao?: ReactNode;
}) {
  return (
    <div className="card-surface flex flex-col items-center gap-2 p-10 text-center">
      <p className="font-display text-lg font-semibold">{titulo}</p>
      <p className="max-w-md text-sm text-muted-foreground">{descricao}</p>
      {acao}
    </div>
  );
}

export function SectionCard({
  titulo,
  descricao,
  acoes,
  children,
  className,
}: {
  titulo?: string;
  descricao?: string;
  acoes?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card-surface overflow-hidden", className)}>
      {titulo ? (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 className="truncate font-display text-base font-semibold">{titulo}</h2>
            {descricao ? (
              <p className="truncate text-xs text-muted-foreground">{descricao}</p>
            ) : null}
          </div>
          {acoes}
        </div>
      ) : null}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
