import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Boxes,
  ChefHat,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiCard, PageHeader, SectionCard } from "@/components/ui-kit";
import { ROTULO_CAPACIDADE, SEGMENTOS } from "@/core/segmentos";
import { horaCurta, moeda, useStore } from "@/core/store";
import { ROTULO_STATUS } from "@/modules/vendas/status";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Painel — CommerceAI OS" },
      { name: "description", content: "Indicadores de vendas, pedidos e operação da empresa." },
      { property: "og:title", content: "Painel — CommerceAI OS" },
      { property: "og:description", content: "Indicadores adaptados ao segmento da empresa." },
    ],
  }),
  component: Painel,
});

function Painel() {
  const { empresa, pedidos, clientes, catalogo, rotulos, temCapacidade } = useStore();
  const hoje = new Date().toDateString();
  const doDia = pedidos.filter((p) => new Date(p.criadoEm).toDateString() === hoje);
  const faturamento = doDia.reduce((s, p) => s + p.total, 0);
  const ticket = doDia.length ? faturamento / doDia.length : 0;
  const emAberto = pedidos.filter((p) => !["concluido", "cancelado"].includes(p.status));
  const baixoEstoque = catalogo.filter(
    (i) => i.estoque !== undefined && i.estoque <= (i.estoqueMinimo ?? 0),
  );

  return (
    <>
      <PageHeader
        titulo={`Olá, ${empresa.branding.nomeExibicao}`}
        descricao={`${SEGMENTOS[empresa.segmento].nome} · ${SEGMENTOS[empresa.segmento].descricao}`}
        acoes={
          <>
            <Button asChild variant="outline">
              <Link to="/app/catalogo">{rotulos.catalogo}</Link>
            </Button>
            <Button asChild>
              <Link to="/app/pdv">Abrir PDV</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          rotulo="Faturamento do dia"
          valor={moeda(faturamento)}
          detalhe={`${doDia.length} ${doDia.length === 1 ? "registro" : "registros"}`}
          icone={<TrendingUp className="h-4 w-4" />}
          destaque
        />
        <KpiCard
          rotulo={rotulos.vendas}
          valor={String(pedidos.length)}
          detalhe={`${emAberto.length} em andamento`}
          icone={<Receipt className="h-4 w-4" />}
        />
        <KpiCard
          rotulo="Ticket médio"
          valor={moeda(ticket)}
          detalhe="Somente hoje"
          icone={<ShoppingCart className="h-4 w-4" />}
        />
        <KpiCard
          rotulo="Clientes"
          valor={String(clientes.length)}
          detalhe={`${clientes.filter((c) => c.vip).length} VIP`}
          icone={<Users className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          titulo={`${rotulos.vendas} recentes`}
          descricao="Últimos registros da empresa ativa"
          className="lg:col-span-2"
          acoes={
            <Button asChild size="sm" variant="ghost">
              <Link to="/app/vendas">Ver tudo</Link>
            </Button>
          }
        >
          <ul className="divide-y divide-border">
            {pedidos.slice(0, 6).map((p) => (
              <li key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    #{p.numero} · {p.clienteNome}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {horaCurta(p.criadoEm)} · {p.canal} · {p.itens.length} itens
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold">{moeda(p.total)}</p>
                  <Badge variant="outline" className="mt-1 text-[10px]">
                    {ROTULO_STATUS[p.status]}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div className="space-y-4">
          {temCapacidade("estoque") && (
            <SectionCard titulo="Estoque em atenção" descricao="Itens no mínimo ou abaixo">
              {baixoEstoque.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum item crítico.</p>
              ) : (
                <ul className="space-y-2">
                  {baixoEstoque.slice(0, 5).map((i) => (
                    <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                        <span className="truncate">{i.nome}</span>
                      </span>
                      <span className="shrink-0 text-muted-foreground">{i.estoque}</span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          )}

          {temCapacidade("cozinha") && (
            <SectionCard titulo="Fila de cozinha" descricao="Pedidos em produção">
              {emAberto.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem pedidos na fila.</p>
              ) : (
                <ul className="space-y-2">
                  {emAberto.slice(0, 5).map((p) => (
                    <li key={p.id} className="flex items-center gap-2 text-sm">
                      <ChefHat className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate">
                        #{p.numero} {p.mesa ? `· ${p.mesa}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          )}

          <SectionCard titulo="Capacidades ativas" descricao="Definidas pelo segmento">
            <div className="flex flex-wrap gap-2">
              {empresa.capacidades.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary"
                >
                  {ROTULO_CAPACIDADE[c]}
                </span>
              ))}
            </div>
          </SectionCard>

          <SectionCard titulo={rotulos.catalogo} descricao="Itens cadastrados">
            <div className="flex items-center gap-3">
              <Boxes className="h-8 w-8 text-primary" />
              <div>
                <p className="font-display text-2xl font-bold">{catalogo.length}</p>
                <p className="text-xs text-muted-foreground">
                  {catalogo.filter((i) => i.ativo).length} ativos
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
