import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, Receipt, Search, Trash2, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { moeda, useStore } from "@/core/store";
import type { ItemPedido, Pedido } from "@/core/types";

export const Route = createFileRoute("/app/pdv")({
  head: () => ({
    meta: [
      { title: "PDV — CommerceAI OS" },
      {
        name: "description",
        content: "Ponto de venda rápido: busca, carrinho, desconto autorizado e comprovante.",
      },
      { property: "og:title", content: "PDV — CommerceAI OS" },
      { property: "og:description", content: "Venda rápida com comprovante simulado." },
    ],
  }),
  component: Pdv,
});

function Pdv() {
  const {
    catalogo,
    clientes,
    empresa,
    unidades,
    pedidos,
    registrarPedido,
    registrar,
    pode,
    temCapacidade,
  } = useStore();
  const [busca, setBusca] = useState("");
  const [carrinho, setCarrinho] = useState<ItemPedido[]>([]);
  const [clienteId, setClienteId] = useState("avulso");
  const [desconto, setDesconto] = useState(0);
  const [pagamento, setPagamento] = useState<Pedido["pagamento"]>("pix");
  const [comprovante, setComprovante] = useState<Pedido | null>(null);

  const disponiveis = useMemo(
    () =>
      catalogo
        .filter((i) => i.ativo)
        .filter((i) =>
          `${i.nome} ${i.codigoBarras ?? ""} ${i.categoria}`
            .toLowerCase()
            .includes(busca.toLowerCase()),
        ),
    [catalogo, busca],
  );

  const subtotal = carrinho.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0);
  const total = Math.max(0, subtotal - desconto);

  function adicionar(itemId: string, nome: string, preco: number) {
    setCarrinho((c) => {
      const existente = c.find((i) => i.itemId === itemId);
      if (existente)
        return c.map((i) => (i.itemId === itemId ? { ...i, quantidade: i.quantidade + 1 } : i));
      return [...c, { itemId, nome, quantidade: 1, precoUnitario: preco }];
    });
  }

  function alterarQtd(itemId: string, delta: number) {
    setCarrinho((c) =>
      c
        .map((i) => (i.itemId === itemId ? { ...i, quantidade: i.quantidade + delta } : i))
        .filter((i) => i.quantidade > 0),
    );
  }

  function finalizar() {
    if (carrinho.length === 0) return;
    const cliente = clientes.find((c) => c.id === clienteId);
    const pedido: Pedido = {
      id: `pd-${Date.now()}`,
      empresaId: empresa.id,
      unidadeId: unidades[0]?.id ?? "",
      numero: (pedidos[0]?.numero ?? 1000) + 1,
      ...(cliente ? { clienteId: cliente.id } : {}),
      clienteNome: cliente?.nome ?? "Consumidor",
      canal: "pdv",
      status: temCapacidade("cozinha") ? "em_producao" : "concluido",
      itens: carrinho,
      desconto,
      total,
      pagamento,
      criadoEm: new Date().toISOString(),
    };
    registrarPedido(pedido);
    registrar("Venda registrada", `#${pedido.numero} — ${moeda(total)}`);
    setComprovante(pedido);
    setCarrinho([]);
    setDesconto(0);
    toast.success(`Venda #${pedido.numero} registrada`);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="space-y-4">
        <div className="card-surface p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              className="h-12 pl-9 text-base"
              placeholder={
                temCapacidade("codigoBarras")
                  ? "Escaneie o código ou busque pelo nome..."
                  : "Busque um item..."
              }
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && disponiveis[0]) {
                  adicionar(disponiveis[0].id, disponiveis[0].nome, disponiveis[0].preco);
                  setBusca("");
                }
              }}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {disponiveis.map((i) => (
            <button
              key={i.id}
              onClick={() => adicionar(i.id, i.nome, i.preco)}
              className="card-surface p-4 text-left transition-colors hover:border-primary/50"
            >
              <p className="truncate font-medium">{i.nome}</p>
              <p className="truncate text-xs text-muted-foreground">{i.categoria}</p>
              <p className="mt-2 font-display font-bold text-primary">{moeda(i.preco)}</p>
              {i.estoque !== undefined && (
                <Badge variant="outline" className="mt-2 text-[11px]">
                  {i.estoque} em estoque
                </Badge>
              )}
            </button>
          ))}
        </div>
      </section>

      <aside className="card-surface flex h-fit flex-col gap-4 p-4 lg:sticky lg:top-20">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold">Venda atual</h2>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-xs">
            <UserRound className="h-3.5 w-3.5" /> Cliente
          </Label>
          <Select value={clienteId} onValueChange={setClienteId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="avulso">Consumidor não identificado</SelectItem>
              {clientes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="max-h-72 space-y-2 overflow-y-auto">
          {carrinho.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum item adicionado.
            </p>
          ) : (
            carrinho.map((i) => (
              <div key={i.itemId} className="flex items-center gap-2 rounded-lg border border-border p-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{i.nome}</p>
                  <p className="text-xs text-muted-foreground">{moeda(i.precoUnitario)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => alterarQtd(i.itemId, -1)}>
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-6 text-center text-sm">{i.quantidade}</span>
                  <Button size="icon" variant="ghost" onClick={() => alterarQtd(i.itemId, 1)}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {pode("aplicar_desconto") ? (
          <div className="space-y-2">
            <Label className="text-xs">Desconto autorizado (R$)</Label>
            <Input
              type="number"
              min={0}
              value={desconto}
              onChange={(e) => setDesconto(Number(e.target.value))}
            />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Sua função não permite aplicar descontos.
          </p>
        )}

        <div className="space-y-2">
          <Label className="text-xs">Pagamento</Label>
          <Select value={pagamento} onValueChange={(v) => setPagamento(v as Pedido["pagamento"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pix">Pix</SelectItem>
              <SelectItem value="cartao">Cartão</SelectItem>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{moeda(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Desconto</span>
            <span>-{moeda(desconto)}</span>
          </div>
          <div className="flex justify-between font-display text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{moeda(total)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCarrinho([])} disabled={!carrinho.length}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button className="flex-1" onClick={finalizar} disabled={!carrinho.length}>
            Finalizar venda
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Pagamento simulado — nenhum valor real é processado nesta fase.
        </p>
      </aside>

      <Dialog open={!!comprovante} onOpenChange={(o) => !o && setComprovante(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Comprovante simulado</DialogTitle>
          </DialogHeader>
          {comprovante && (
            <div className="space-y-3 rounded-lg border border-dashed border-border p-4 font-mono text-xs">
              <p className="text-center font-display text-sm font-bold">
                {empresa.branding.nomeExibicao}
              </p>
              <p className="text-center text-muted-foreground">
                Venda #{comprovante.numero} · {new Date(comprovante.criadoEm).toLocaleString("pt-BR")}
              </p>
              <div className="border-t border-dashed border-border pt-2">
                {comprovante.itens.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate">
                      {i.quantidade}× {i.nome}
                    </span>
                    <span>{moeda(i.precoUnitario * i.quantidade)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-dashed border-border pt-2 text-sm font-bold">
                <span>Total</span>
                <span>{moeda(comprovante.total)}</span>
              </div>
              <p className="text-center text-muted-foreground">
                Documento sem valor fiscal — protótipo.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setComprovante(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
