import { createFileRoute } from "@tanstack/react-router";
import { Building2, Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/ui-kit";
import { useStore } from "@/core/store";
import type { Unidade } from "@/core/types";

export const Route = createFileRoute("/app/unidades")({
  head: () => ({
    meta: [
      { title: "Unidades — CommerceAI OS" },
      { name: "description", content: "Matriz, filiais e pontos de operação da empresa." },
      { property: "og:title", content: "Unidades — CommerceAI OS" },
      { property: "og:description", content: "Gestão de filiais e pontos de operação." },
    ],
  }),
  component: Unidades,
});

function Unidades() {
  const { unidades, usuarios, pedidos, empresa, salvarUnidade, registrar } = useStore();
  const [edicao, setEdicao] = useState<Unidade | null>(null);

  return (
    <>
      <PageHeader
        titulo="Unidades"
        descricao="Cada unidade pode ter equipe, pedidos e dispositivos próprios."
        acoes={
          <Button
            onClick={() =>
              setEdicao({
                id: `un-${Date.now()}`,
                empresaId: empresa.id,
                nome: "",
                cidade: "",
                endereco: "",
                tipo: "filial",
                ativa: true,
              })
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Nova unidade
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {unidades.map((u) => (
          <article key={u.id} className="card-surface p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <Building2 className="h-4 w-4 shrink-0 text-primary" />
                <h3 className="truncate font-display font-semibold">{u.nome}</h3>
              </div>
              <Badge variant="outline" className="shrink-0 capitalize">
                {u.tipo}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {u.endereco || "Sem endereço"} · {u.cidade || "—"}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-sm font-semibold">
                  {usuarios.filter((x) => x.unidadeId === u.id).length}
                </p>
                <p className="text-[11px] text-muted-foreground">pessoas</p>
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {pedidos.filter((p) => p.unidadeId === u.id).length}
                </p>
                <p className="text-[11px] text-muted-foreground">registros</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => setEdicao(u)}>
              Editar
            </Button>
          </article>
        ))}
      </div>

      <Dialog open={!!edicao} onOpenChange={(o) => !o && setEdicao(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{edicao?.nome ? "Editar unidade" : "Nova unidade"}</DialogTitle>
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
                <Label>Cidade</Label>
                <Input
                  value={edicao.cidade}
                  onChange={(e) => setEdicao({ ...edicao, cidade: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input
                  value={edicao.endereco}
                  onChange={(e) => setEdicao({ ...edicao, endereco: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={edicao.tipo}
                  onValueChange={(v) => setEdicao({ ...edicao, tipo: v as Unidade["tipo"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matriz">Matriz</SelectItem>
                    <SelectItem value="filial">Filial</SelectItem>
                    <SelectItem value="quiosque">Quiosque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <p className="text-sm font-medium">Unidade ativa</p>
                <Switch
                  checked={edicao.ativa}
                  onCheckedChange={(v) => setEdicao({ ...edicao, ativa: v })}
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
                salvarUnidade(edicao);
                registrar("Unidade salva", edicao.nome);
                toast.success("Unidade salva");
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
