import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, KpiCard, PageHeader, SectionCard } from "@/components/ui-kit";
import { horaCurta, dataCurta, moeda, useStore } from "@/core/store";
import type { StatusPedido } from "@/core/types";
import { CORES_STATUS, ROTULO_CANAL, ROTULO_STATUS } from "@/modules/vendas/status";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/vendas")({
  head: () => ({
    meta: [
      { title: "Vendas e pedidos — CommerceAI OS" },
      { name: "description", content: "Acompanhe vendas, pedidos, canais e status da operação." },
      { property: "og:title", content: "Vendas e pedidos — CommerceAI OS" },
      { property: "og:description", content: "Fluxo de pedidos por canal e status." },
    ],
  }),
  component: Vendas,
});

const FLUXO: StatusPedido[] = [
  "aberto",
  "em_producao",
  "pronto",
  "em_entrega",
  "concluido",
  "cancelado",
];

function Vendas() {
  const { pedidos, rotulos, atualizarStatusPedido, registrar, temCapacidade } = useStore();
  const [status, setStatus] = useState<string>("todos");
  const [busca, setBusca] = useState("");

  const lista = pedidos.filter(
    (p) =>
      (status === "todos" || p.status === status) &&
      `${p.numero} ${p.clienteNome}`.toLowerCase().includes(busca.toLowerCase()),
  );

  const total = pedidos.reduce((s, p) => s + p.total, 0);
  const abertos = pedidos.filter((p) => !["concluido", "cancelado"].includes(p.status));

  return (
    <>
      <PageHeader
        titulo={rotulos.vendas}
        descricao="Todos os canais em uma lista única, com status adaptado ao segmento."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard rotulo="Total registrado" valor={moeda(total)} destaque />
        <KpiCard rotulo="Em andamento" valor={String(abertos.length)} />
        <KpiCard rotulo="Registros" valor={String(pedidos.length)} />
      </div>

      <SectionCard>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
          <Input
            placeholder="Buscar por número ou cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {FLUXO.map((s) => (
                <SelectItem key={s} value={s}>
                  {ROTULO_STATUS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      {lista.length === 0 ? (
        <EmptyState titulo="Nada por aqui" descricao="Nenhum registro com esses filtros." />
      ) : (
        <div className="space-y-3">
          {lista.map((p) => (
            <article key={p.id} className="card-surface p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display font-semibold">
                    #{p.numero} · {p.clienteNome}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {dataCurta(p.criadoEm)} {horaCurta(p.criadoEm)} · {ROTULO_CANAL[p.canal]}
                    {p.mesa ? ` · ${p.mesa}` : ""} · pagamento {p.pagamento}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display font-bold">{moeda(p.total)}</p>
                  <Badge variant="outline" className={cn("mt-1", CORES_STATUS[p.status])}>
                    {ROTULO_STATUS[p.status]}
                  </Badge>
                </div>
              </div>

              <ul className="mt-3 space-y-1 text-sm">
                {p.itens.map((i, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="truncate">
                        {i.quantidade}× {i.nome}
                      </span>
                      {i.adicionais?.length ? (
                        <span className="block text-xs text-muted-foreground">
                          + {i.adicionais.join(", ")}
                        </span>
                      ) : null}
                      {i.observacao ? (
                        <span className="block text-xs text-warning">obs: {i.observacao}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {moeda(i.precoUnitario * i.quantidade)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex flex-wrap gap-2">
                {FLUXO.filter(
                  (s) => s !== p.status && (s !== "em_producao" || temCapacidade("cozinha")),
                )
                  .slice(0, 4)
                  .map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        atualizarStatusPedido(p.id, s);
                        registrar("Status alterado", `#${p.numero} → ${ROTULO_STATUS[s]}`);
                        toast.success(`#${p.numero}: ${ROTULO_STATUS[s]}`);
                      }}
                    >
                      {ROTULO_STATUS[s]}
                    </Button>
                  ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
