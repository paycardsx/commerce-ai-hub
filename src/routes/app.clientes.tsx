import { createFileRoute } from "@tanstack/react-router";
import { Plus, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EmptyState, PageHeader, SectionCard } from "@/components/ui-kit";
import { dataCurta, moeda, useStore } from "@/core/store";
import type { Cliente } from "@/core/types";

export const Route = createFileRoute("/app/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — CommerceAI OS" },
      { name: "description", content: "Base de clientes, histórico, preferências e consentimento." },
      { property: "og:title", content: "Clientes — CommerceAI OS" },
      { property: "og:description", content: "Histórico e preferências com controle do cliente." },
    ],
  }),
  component: Clientes,
});

function Clientes() {
  const { clientes, empresa, pedidos, salvarCliente, registrar } = useStore();
  const [busca, setBusca] = useState("");
  const [edicao, setEdicao] = useState<Cliente | null>(null);

  const lista = clientes.filter((c) =>
    `${c.nome} ${c.telefone}`.toLowerCase().includes(busca.toLowerCase()),
  );

  function novo() {
    setEdicao({
      id: `cl-${Date.now()}`,
      empresaId: empresa.id,
      nome: "",
      telefone: "",
      desde: new Date().toISOString(),
      totalGasto: 0,
      pedidos: 0,
      preferencias: [],
      consentimentoMemoria: false,
      vip: false,
    });
  }

  return (
    <>
      <PageHeader
        titulo="Clientes"
        descricao="Relacionamento com memória opcional e controlada pelo cliente."
        acoes={
          <Button onClick={novo}>
            <Plus className="mr-1 h-4 w-4" /> Novo cliente
          </Button>
        }
      />

      <SectionCard>
        <Input
          placeholder="Buscar cliente..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </SectionCard>

      {lista.length === 0 ? (
        <EmptyState titulo="Nenhum cliente" descricao="Cadastre o primeiro cliente da empresa." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {lista.map((c) => {
            const ultimos = pedidos.filter((p) => p.clienteId === c.id);
            return (
              <article key={c.id} className="card-surface p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-display font-semibold">{c.nome}</h3>
                    <p className="truncate text-xs text-muted-foreground">{c.telefone}</p>
                  </div>
                  {c.vip && (
                    <Badge className="shrink-0 gap-1">
                      <Star className="h-3 w-3" /> VIP
                    </Badge>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-sm font-semibold">{c.pedidos}</p>
                    <p className="text-[11px] text-muted-foreground">pedidos</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{moeda(c.totalGasto)}</p>
                    <p className="text-[11px] text-muted-foreground">total</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{dataCurta(c.desde)}</p>
                    <p className="text-[11px] text-muted-foreground">desde</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.preferencias.map((p) => (
                    <Badge key={p} variant="outline" className="text-[11px]">
                      {p}
                    </Badge>
                  ))}
                  <Badge
                    variant="outline"
                    className={
                      c.consentimentoMemoria
                        ? "border-success/40 text-[11px] text-success"
                        : "text-[11px]"
                    }
                  >
                    {c.consentimentoMemoria ? "Memória autorizada" : "Sem memória"}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    {ultimos.length} pedido(s) nesta base
                  </p>
                  <Button size="sm" variant="outline" onClick={() => setEdicao(c)}>
                    Editar
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={!!edicao} onOpenChange={(o) => !o && setEdicao(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{edicao?.nome ? "Editar cliente" : "Novo cliente"}</DialogTitle>
          </DialogHeader>
          {edicao && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={edicao.nome}
                  onChange={(e) => setEdicao({ ...edicao, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={edicao.telefone}
                  onChange={(e) => setEdicao({ ...edicao, telefone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Preferências (separadas por vírgula)</Label>
                <Input
                  value={edicao.preferencias.join(", ")}
                  onChange={(e) =>
                    setEdicao({
                      ...edicao,
                      preferencias: e.target.value
                        .split(",")
                        .map((p) => p.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Memória da assistente</p>
                  <p className="text-xs text-muted-foreground">
                    O cliente pode revogar a qualquer momento.
                  </p>
                </div>
                <Switch
                  checked={edicao.consentimentoMemoria}
                  onCheckedChange={(v) => setEdicao({ ...edicao, consentimentoMemoria: v })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <p className="text-sm font-medium">Cliente VIP</p>
                <Switch
                  checked={edicao.vip}
                  onCheckedChange={(v) => setEdicao({ ...edicao, vip: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEdicao(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!edicao?.nome.trim()) return;
                salvarCliente(edicao);
                registrar("Cliente salvo", edicao.nome);
                toast.success("Cliente salvo");
                setEdicao(null);
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
