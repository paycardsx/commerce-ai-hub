import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBrandTheme } from "@/branding/use-brand-theme";
import { moeda, useStore } from "@/core/store";
import type { ItemPedido, Pedido } from "@/core/types";

export const Route = createFileRoute("/loja")({
  head: () => ({
    meta: [
      { title: "Aplicativo do cliente — CommerceAI OS" },
      {
        name: "description",
        content:
          "Protótipo do app do cliente: catálogo da empresa, carrinho e pedido com a marca aplicada.",
      },
      { property: "og:title", content: "Aplicativo do cliente — CommerceAI OS" },
      { property: "og:description", content: "Vitrine white label para o consumidor final." },
    ],
  }),
  component: Loja,
});

function Loja() {
  const { empresa, estado, catalogo, unidades, trocarEmpresa, registrarPedido, registrar } =
    useStore();
  useBrandTheme(empresa.branding);

  const [carrinho, setCarrinho] = useState<Record<string, number>>({});
  const [categoria, setCategoria] = useState("todas");

  const categorias = ["todas", ...Array.from(new Set(catalogo.map((i) => i.categoria)))];
  const itens = catalogo.filter(
    (i) => i.ativo && (categoria === "todas" || i.categoria === categoria),
  );

  const linhas: ItemPedido[] = Object.entries(carrinho)
    .map(([id, qtd]) => {
      const item = catalogo.find((i) => i.id === id);
      if (!item || qtd <= 0) return null;
      return {
        itemId: item.id,
        nome: item.nome,
        quantidade: qtd,
        precoUnitario: item.preco,
      } satisfies ItemPedido;
    })
    .filter((l): l is ItemPedido => l !== null);

  const total = linhas.reduce((s, l) => s + l.precoUnitario * l.quantidade, 0);

  const mudar = (id: string, delta: number) =>
    setCarrinho((c) => {
      const novo = Math.max(0, (c[id] ?? 0) + delta);
      const copia = { ...c };
      if (novo === 0) delete copia[id];
      else copia[id] = novo;
      return copia;
    });

  const finalizar = () => {
    if (linhas.length === 0) return;
    const pedido: Pedido = {
      id: `pd-${Date.now()}`,
      empresaId: empresa.id,
      unidadeId: unidades[0]?.id ?? "",
      numero: 9000 + Math.floor(Math.random() * 999),
      clienteNome: "Cliente do app",
      canal: "app",
      status: "aberto",
      itens: linhas,
      desconto: 0,
      total,
      pagamento: "pendente",
      criadoEm: new Date().toISOString(),
    };
    registrarPedido(pedido);
    registrar("Pedido pelo app do cliente", `#${pedido.numero} — ${moeda(total)}`);
    toast.success(`Pedido #${pedido.numero} enviado`);
    setCarrinho({});
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-brand text-primary-foreground">
        <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4">
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold">
              {empresa.branding.nomeExibicao}
            </p>
            <p className="truncate text-xs opacity-80">{empresa.branding.slogan}</p>
          </div>
          <Link
            to="/app"
            className="inline-flex shrink-0 items-center gap-1 rounded-md bg-background/15 px-3 py-1.5 text-xs font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Painel
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-5 pb-40">
        <div className="card-surface grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-3">
          <BrandMark
            iniciais={empresa.branding.iniciais}
            nome="Você está vendo o app como cliente"
            slogan="Troque a empresa para comparar segmentos"
            size="sm"
          />
          <Select value={empresa.id} onValueChange={trocarEmpresa}>
            <SelectTrigger className="w-40 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {estado.empresas.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.branding.nomeExibicao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {categorias.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={categoria === c ? "default" : "outline"}
              className="shrink-0 capitalize"
              onClick={() => setCategoria(c)}
            >
              {c}
            </Button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {itens.map((i) => (
            <article key={i.id} className="card-surface p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <div className="min-w-0">
                  <h2 className="truncate font-display font-semibold">{i.nome}</h2>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{i.descricao}</p>
                </div>
                <Badge variant="outline" className="shrink-0 capitalize">
                  {i.tipo}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <p className="font-display text-lg font-bold text-primary">{moeda(i.preco)}</p>
                {carrinho[i.id] ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <Button size="icon" variant="outline" onClick={() => mudar(i.id, -1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-6 text-center text-sm font-semibold">{carrinho[i.id]}</span>
                    <Button size="icon" onClick={() => mudar(i.id, 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" className="shrink-0" onClick={() => mudar(i.id, 1)}>
                    Adicionar
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>

      {linhas.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                {linhas.reduce((s, l) => s + l.quantidade, 0)} itens no carrinho
              </p>
              <p className="font-display text-lg font-bold">{moeda(total)}</p>
            </div>
            <Button className="shrink-0" onClick={finalizar}>
              <ShoppingBag className="mr-1 h-4 w-4" /> Enviar pedido
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
