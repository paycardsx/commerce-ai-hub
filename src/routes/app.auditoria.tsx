import { createFileRoute } from "@tanstack/react-router";
import { History } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { EmptyState, PageHeader, SectionCard } from "@/components/ui-kit";
import { dataCurta, horaCurta, useStore } from "@/core/store";

export const Route = createFileRoute("/app/auditoria")({
  head: () => ({
    meta: [
      { title: "Auditoria — CommerceAI OS" },
      { name: "description", content: "Registro das ações importantes feitas na empresa ativa." },
      { property: "og:title", content: "Auditoria — CommerceAI OS" },
      { property: "og:description", content: "Trilha de ações por usuário e data." },
    ],
  }),
  component: Auditoria,
});

function Auditoria() {
  const { auditoria, pode } = useStore();
  const [busca, setBusca] = useState("");

  if (!pode("ver_auditoria")) {
    return (
      <>
        <PageHeader titulo="Auditoria" />
        <EmptyState
          titulo="Sem acesso"
          descricao="Sua função não permite visualizar a trilha de auditoria desta empresa."
        />
      </>
    );
  }

  const lista = auditoria.filter((r) =>
    `${r.acao} ${r.detalhe} ${r.usuario}`.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        titulo="Auditoria"
        descricao="Toda ação relevante fica registrada com autor e horário."
      />

      <SectionCard
        titulo={`${lista.length} registros`}
        acoes={
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar ação, autor…"
            className="w-44 sm:w-64"
          />
        }
      >
        {lista.length === 0 ? (
          <EmptyState titulo="Nada por aqui" descricao="Nenhum registro corresponde à busca." />
        ) : (
          <ol className="space-y-3">
            {lista.map((r) => (
              <li key={r.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted">
                  <History className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.acao}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.detalhe} · {r.usuario}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {dataCurta(r.em)} {horaCurta(r.em)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </SectionCard>
    </>
  );
}
