import { createFileRoute } from "@tanstack/react-router";
import { Barcode, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, PageHeader, SectionCard } from "@/components/ui-kit";
import { moeda, useStore } from "@/core/store";
import type { BasePreco, ItemCatalogo, TipoItem } from "@/core/types";

export const Route = createFileRoute("/app/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo — CommerceAI OS" },
      {
        name: "description",
        content: "Produtos, serviços, itens de cardápio e combos em um catálogo adaptável.",
      },
      { property: "og:title", content: "Catálogo — CommerceAI OS" },
      { property: "og:description", content: "Catálogo adaptável por segmento." },
    ],
  }),
  component: Catalogo,
});

const ROTULO_TIPO: Record<TipoItem, string> = {
  produto: "Produto",
  servico: "Serviço",
  cardapio: "Cardápio",
  combo: "Combo",
};

const ROTULO_BASE: Record<BasePreco, string> = {
  unidade: "Por unidade",
  peso: "Por peso",
  duracao: "Por duração",
  pacote: "Pacote",
};

function novoItem(empresaId: string, tipo: TipoItem): ItemCatalogo {
  return {
    id: `it-${Date.now()}`,
    empresaId,
    nome: "",
    descricao: "",
    categoria: "",
    tipo,
    basePreco: tipo === "servico" ? "duracao" : "unidade",
    preco: 0,
    variacoes: [],
    adicionais: [],
    observacoesPermitidas: tipo === "cardapio",
    ativo: true,
  };
}

function Catalogo() {
  const { catalogo, empresa, rotulos, salvarItem, removerItem, temCapacidade, registrar, pode } =
    useStore();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [edicao, setEdicao] = useState<ItemCatalogo | null>(null);

  const categorias = useMemo(
    () => ["todas", ...Array.from(new Set(catalogo.map((i) => i.categoria).filter(Boolean)))],
    [catalogo],
  );

  const lista = catalogo.filter(
    (i) =>
      (categoria === "todas" || i.categoria === categoria) &&
      `${i.nome} ${i.codigoBarras ?? ""}`.toLowerCase().includes(busca.toLowerCase()),
  );

  const tipoPadrao: TipoItem = temCapacidade("cardapio")
    ? "cardapio"
    : temCapacidade("agenda")
      ? "servico"
      : "produto";

  function salvar() {
    if (!edicao || !edicao.nome.trim()) return;
    salvarItem(edicao);
    registrar("Item do catálogo salvo", edicao.nome);
    toast.success(`${edicao.nome} salvo`);
    setEdicao(null);
  }

  return (
    <>
      <PageHeader
        titulo={rotulos.catalogo}
        descricao="Produto, serviço, item de cardápio ou combo — a estrutura é a mesma."
        acoes={
          pode("gerir_catalogo") ? (
            <Button onClick={() => setEdicao(novoItem(empresa.id, tipoPadrao))}>
              <Plus className="mr-1 h-4 w-4" /> Novo item
            </Button>
          ) : null
        }
      />

      <SectionCard>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <Input
            placeholder="Buscar por nome ou código..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "todas" ? "Todas as categorias" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      {lista.length === 0 ? (
        <EmptyState
          titulo="Nenhum item encontrado"
          descricao="Ajuste a busca ou cadastre um novo item no catálogo."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {lista.map((item) => (
            <article key={item.id} className="card-surface flex flex-col gap-3 p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-display font-semibold">{item.nome}</h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.categoria || "Sem categoria"} · {ROTULO_TIPO[item.tipo]}
                  </p>
                </div>
                <span className="shrink-0 font-display font-bold text-primary">
                  {moeda(item.preco)}
                </span>
              </div>

              {item.descricao ? (
                <p className="line-clamp-2 text-xs text-muted-foreground">{item.descricao}</p>
              ) : null}

              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <Badge variant="outline">{ROTULO_BASE[item.basePreco]}</Badge>
                {item.estoque !== undefined && (
                  <Badge
                    variant="outline"
                    className={
                      item.estoque <= (item.estoqueMinimo ?? 0) ? "border-warning text-warning" : ""
                    }
                  >
                    Estoque {item.estoque}
                    {item.unidadeMedida ? ` ${item.unidadeMedida}` : ""}
                  </Badge>
                )}
                {item.adicionais.length > 0 && (
                  <Badge variant="outline">{item.adicionais.length} adicionais</Badge>
                )}
                {item.codigoBarras && (
                  <Badge variant="outline" className="gap-1">
                    <Barcode className="h-3 w-3" /> {item.codigoBarras}
                  </Badge>
                )}
                {!item.ativo && <Badge variant="destructive">Inativo</Badge>}
              </div>

              {pode("gerir_catalogo") && (
                <div className="mt-auto flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setEdicao(item)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      removerItem(item.id);
                      registrar("Item removido", item.nome);
                      toast(`${item.nome} removido`);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <Dialog open={!!edicao} onOpenChange={(o) => !o && setEdicao(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{edicao?.nome ? "Editar item" : "Novo item"}</DialogTitle>
          </DialogHeader>
          {edicao && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Nome</Label>
                  <Input
                    value={edicao.nome}
                    onChange={(e) => setEdicao({ ...edicao, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={edicao.tipo}
                    onValueChange={(v) => setEdicao({ ...edicao, tipo: v as TipoItem })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ROTULO_TIPO) as TipoItem[]).map((t) => (
                        <SelectItem key={t} value={t}>
                          {ROTULO_TIPO[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Precificação</Label>
                  <Select
                    value={edicao.basePreco}
                    onValueChange={(v) => setEdicao({ ...edicao, basePreco: v as BasePreco })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ROTULO_BASE) as BasePreco[]).map((b) => (
                        <SelectItem key={b} value={b}>
                          {ROTULO_BASE[b]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input
                    value={edicao.categoria}
                    onChange={(e) => setEdicao({ ...edicao, categoria: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={edicao.preco}
                    onChange={(e) => setEdicao({ ...edicao, preco: Number(e.target.value) })}
                  />
                </div>
                {temCapacidade("estoque") && (
                  <div className="space-y-2">
                    <Label>Estoque</Label>
                    <Input
                      type="number"
                      value={edicao.estoque ?? 0}
                      onChange={(e) => setEdicao({ ...edicao, estoque: Number(e.target.value) })}
                    />
                  </div>
                )}
                {temCapacidade("codigoBarras") && (
                  <div className="space-y-2">
                    <Label>Código de barras</Label>
                    <Input
                      value={edicao.codigoBarras ?? ""}
                      onChange={(e) => setEdicao({ ...edicao, codigoBarras: e.target.value })}
                    />
                  </div>
                )}
                {temCapacidade("agenda") && (
                  <div className="space-y-2">
                    <Label>Duração (min)</Label>
                    <Input
                      type="number"
                      value={edicao.duracaoMinutos ?? 30}
                      onChange={(e) =>
                        setEdicao({ ...edicao, duracaoMinutos: Number(e.target.value) })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={edicao.descricao}
                  onChange={(e) => setEdicao({ ...edicao, descricao: e.target.value })}
                />
              </div>

              {temCapacidade("adicionais") && (
                <div className="space-y-2">
                  <Label>Adicionais (nome:preço, separados por vírgula)</Label>
                  <Input
                    value={edicao.adicionais.map((a) => `${a.nome}:${a.preco}`).join(", ")}
                    onChange={(e) =>
                      setEdicao({
                        ...edicao,
                        adicionais: e.target.value
                          .split(",")
                          .map((p) => p.trim())
                          .filter(Boolean)
                          .map((p, i) => {
                            const [nome, preco] = p.split(":");
                            return {
                              id: `${edicao.id}-ad-${i}`,
                              nome: nome?.trim() ?? "",
                              preco: Number(preco ?? 0),
                            };
                          }),
                      })
                    }
                    placeholder="Bacon:5, Ovo:3"
                  />
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Item ativo</p>
                  <p className="text-xs text-muted-foreground">Aparece no PDV e no app.</p>
                </div>
                <Switch
                  checked={edicao.ativo}
                  onCheckedChange={(v) => setEdicao({ ...edicao, ativo: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEdicao(null)}>
              Cancelar
            </Button>
            <Button onClick={salvar}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
