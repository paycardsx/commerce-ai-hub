import { createFileRoute } from "@tanstack/react-router";
import { Plus, ShieldCheck } from "lucide-react";
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
import { PageHeader, SectionCard } from "@/components/ui-kit";
import { PERMISSOES_POR_FUNCAO, ROTULO_FUNCAO } from "@/core/permissoes";
import { useStore } from "@/core/store";
import type { Funcao, Usuario } from "@/core/types";

export const Route = createFileRoute("/app/equipe")({
  head: () => ({
    meta: [
      { title: "Equipe e permissões — CommerceAI OS" },
      { name: "description", content: "Usuários, funções e permissões por empresa e unidade." },
      { property: "og:title", content: "Equipe e permissões — CommerceAI OS" },
      { property: "og:description", content: "Controle de acesso por função." },
    ],
  }),
  component: Equipe,
});

function Equipe() {
  const { usuarios, unidades, empresa, salvarUsuario, registrar, pode } = useStore();
  const [edicao, setEdicao] = useState<Usuario | null>(null);

  return (
    <>
      <PageHeader
        titulo="Equipe"
        descricao="Cada função carrega um conjunto fixo de permissões."
        acoes={
          pode("gerir_equipe") ? (
            <Button
              onClick={() =>
                setEdicao({
                  id: `us-${Date.now()}`,
                  empresaId: empresa.id,
                  nome: "",
                  email: "",
                  funcao: "operador",
                  unidadeId: unidades[0]?.id ?? "",
                  ativo: true,
                })
              }
            >
              <Plus className="mr-1 h-4 w-4" /> Nova pessoa
            </Button>
          ) : null
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {usuarios.map((u) => (
          <article key={u.id} className="card-surface p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-display font-semibold">{u.nome}</h3>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              </div>
              <Badge className="shrink-0">{ROTULO_FUNCAO[u.funcao]}</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {unidades.find((un) => un.id === u.unidadeId)?.nome ?? "Sem unidade"}
              {u.ativo ? "" : " · inativo"}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PERMISSOES_POR_FUNCAO[u.funcao].slice(0, 4).map((p) => (
                <Badge key={p} variant="outline" className="text-[11px]">
                  {p.replace(/_/g, " ")}
                </Badge>
              ))}
              {PERMISSOES_POR_FUNCAO[u.funcao].length > 4 && (
                <Badge variant="outline" className="text-[11px]">
                  +{PERMISSOES_POR_FUNCAO[u.funcao].length - 4}
                </Badge>
              )}
            </div>
            {pode("gerir_equipe") && (
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setEdicao(u)}>
                Editar
              </Button>
            )}
          </article>
        ))}
      </div>

      <SectionCard titulo="Matriz de permissões" descricao="Referência das funções disponíveis">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-4">Função</th>
                <th className="py-2">Permissões</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(Object.keys(ROTULO_FUNCAO) as Funcao[]).map((f) => (
                <tr key={f}>
                  <td className="py-2 pr-4 font-medium">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" /> {ROTULO_FUNCAO[f]}
                    </span>
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {PERMISSOES_POR_FUNCAO[f].map((p) => p.replace(/_/g, " ")).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Dialog open={!!edicao} onOpenChange={(o) => !o && setEdicao(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{edicao?.nome ? "Editar pessoa" : "Nova pessoa"}</DialogTitle>
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
                <Label>E-mail</Label>
                <Input
                  value={edicao.email}
                  onChange={(e) => setEdicao({ ...edicao, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Função</Label>
                <Select
                  value={edicao.funcao}
                  onValueChange={(v) => setEdicao({ ...edicao, funcao: v as Funcao })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ROTULO_FUNCAO) as Funcao[]).map((f) => (
                      <SelectItem key={f} value={f}>
                        {ROTULO_FUNCAO[f]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Select
                  value={edicao.unidadeId}
                  onValueChange={(v) => setEdicao({ ...edicao, unidadeId: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <p className="text-sm font-medium">Ativo</p>
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
            <Button
              onClick={() => {
                if (!edicao?.nome.trim()) return;
                salvarUsuario(edicao);
                registrar("Usuário salvo", `${edicao.nome} — ${ROTULO_FUNCAO[edicao.funcao]}`);
                toast.success("Equipe atualizada");
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
