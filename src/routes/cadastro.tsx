import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionCard } from "@/components/ui-kit";
import { LISTA_SEGMENTOS, ROTULO_CAPACIDADE, SEGMENTOS } from "@/core/segmentos";
import { ROTULO_FUNCAO } from "@/core/permissoes";
import { useStore } from "@/core/store";
import type { Funcao, Segmento, Unidade, Usuario } from "@/core/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Cadastrar empresa — CommerceAI OS" },
      {
        name: "description",
        content: "Crie sua empresa, escolha o segmento e configure unidades e equipe.",
      },
      { property: "og:title", content: "Cadastrar empresa — CommerceAI OS" },
      { property: "og:description", content: "Empresa, segmento, unidades e equipe em 4 passos." },
    ],
  }),
  component: Cadastro,
});

const PASSOS = ["Empresa", "Segmento", "Unidades", "Equipe"];
const id = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

function Cadastro() {
  const { criarEmpresa, registrar } = useStore();
  const navigate = useNavigate();
  const [passo, setPasso] = useState(0);

  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [slogan, setSlogan] = useState("");
  const [cor, setCor] = useState("#FF8A00");
  const [segmento, setSegmento] = useState<Segmento>("mercadinho");
  const [unidades, setUnidades] = useState<
    { nome: string; cidade: string; endereco: string; tipo: Unidade["tipo"] }[]
  >([{ nome: "Matriz", cidade: "", endereco: "", tipo: "matriz" }]);
  const [equipe, setEquipe] = useState([
    { nome: "", email: "", funcao: "proprietario" as Funcao },
  ]);

  const perfil = SEGMENTOS[segmento];
  const iniciais =
    nome
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CA";

  const podeAvancar =
    (passo === 0 && nome.trim().length > 1) ||
    passo === 1 ||
    (passo === 2 && unidades.every((u) => u.nome.trim())) ||
    (passo === 3 && equipe.every((u) => u.nome.trim()));

  function concluir() {
    const empresaId = id("emp");
    const novasUnidades: Unidade[] = unidades.map((u) => ({
      id: id("un"),
      empresaId,
      nome: u.nome,
      cidade: u.cidade,
      endereco: u.endereco,
      tipo: u.tipo,
      ativa: true,
    }));
    const novosUsuarios: Usuario[] = equipe.map((u, i) => ({
      id: id("us"),
      empresaId,
      nome: u.nome,
      email: u.email || `${u.nome.toLowerCase().replace(/\s+/g, ".")}@empresa.com`,
      funcao: u.funcao,
      unidadeId: novasUnidades[0]?.id ?? "",
      ativo: true,
      ...(i === 0 ? {} : {}),
    }));

    criarEmpresa(
      {
        id: empresaId,
        nome,
        documento,
        segmento,
        branding: {
          nomeExibicao: nome,
          slogan: slogan || perfil.descricao,
          corPrimaria: cor,
          corDestaque: cor,
          iniciais,
        },
        capacidades: perfil.capacidades,
        modulos: perfil.modulos,
        personaIA: {
          nome: "Assistente",
          tom: "amigavel",
          saudacao: `Olá! Sou a assistente do ${nome}. Como posso ajudar?`,
          ativa: true,
        },
        criadaEm: new Date().toISOString(),
      },
      novasUnidades,
      novosUsuarios,
    );
    registrar("Empresa criada", `${nome} — segmento ${perfil.nome}`);
    toast.success(`${nome} criada com o segmento ${perfil.nome}`);
    navigate({ to: "/app" });
  }

  return (
    <div className="min-h-screen bg-surface-gradient px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-3">
          <div className="bg-brand grid h-9 w-9 place-items-center rounded-xl font-display text-sm font-black text-primary-foreground">
            AI
          </div>
          <span className="font-display font-bold">CommerceAI OS</span>
        </Link>

        <ol className="mb-6 grid grid-cols-4 gap-2">
          {PASSOS.map((p, i) => (
            <li key={p} className="min-w-0">
              <div
                className={cn(
                  "h-1 rounded-full",
                  i <= passo ? "bg-primary" : "bg-border",
                )}
              />
              <span
                className={cn(
                  "mt-2 block truncate text-xs",
                  i === passo ? "text-primary" : "text-muted-foreground",
                )}
              >
                {i + 1}. {p}
              </span>
            </li>
          ))}
        </ol>

        {passo === 0 && (
          <SectionCard titulo="Dados da empresa" descricao="Identidade básica e marca inicial.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="nome">Nome da empresa</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Mercadinho Bom Preço"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc">CNPJ ou CPF</Label>
                <Input
                  id="doc"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cor">Cor da marca</Label>
                <div className="flex items-center gap-3">
                  <input
                    id="cor"
                    type="color"
                    value={cor}
                    onChange={(e) => setCor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent"
                  />
                  <Input value={cor} onChange={(e) => setCor(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="slogan">Slogan (opcional)</Label>
                <Input
                  id="slogan"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="Perto de você, todo dia."
                />
              </div>
            </div>
          </SectionCard>
        )}

        {passo === 1 && (
          <SectionCard
            titulo="Segmento de atuação"
            descricao="Define quais capacidades e módulos ficam ativos."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {LISTA_SEGMENTOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSegmento(s.id)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    segmento === s.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <p className="mt-2 font-display font-semibold">{s.nome}</p>
                  <p className="text-xs text-muted-foreground">{s.descricao}</p>
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-border bg-background/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Capacidades ativadas
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {perfil.capacidades.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary"
                  >
                    {ROTULO_CAPACIDADE[c]}
                  </span>
                ))}
              </div>
            </div>
          </SectionCard>
        )}

        {passo === 2 && (
          <SectionCard
            titulo="Unidades"
            descricao="Matriz, filiais ou pontos de operação."
            acoes={
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setUnidades((u) => [
                    ...u,
                    { nome: "", cidade: "", endereco: "", tipo: "filial" as const },
                  ])
                }
              >
                <Plus className="mr-1 h-4 w-4" /> Unidade
              </Button>
            }
          >
            <div className="space-y-4">
              {unidades.map((u, i) => (
                <div key={i} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      value={u.nome}
                      onChange={(e) =>
                        setUnidades((lista) =>
                          lista.map((x, idx) => (idx === i ? { ...x, nome: e.target.value } : x)),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input
                      value={u.cidade}
                      onChange={(e) =>
                        setUnidades((lista) =>
                          lista.map((x, idx) => (idx === i ? { ...x, cidade: e.target.value } : x)),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Endereço</Label>
                    <div className="flex gap-2">
                      <Input
                        value={u.endereco}
                        onChange={(e) =>
                          setUnidades((lista) =>
                            lista.map((x, idx) =>
                              idx === i ? { ...x, endereco: e.target.value } : x,
                            ),
                          )
                        }
                      />
                      {unidades.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Remover unidade"
                          onClick={() => setUnidades((l) => l.filter((_, idx) => idx !== i))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {passo === 3 && (
          <SectionCard
            titulo="Equipe e funções"
            descricao="Cada função recebe um conjunto de permissões."
            acoes={
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setEquipe((e) => [...e, { nome: "", email: "", funcao: "operador" as Funcao }])
                }
              >
                <Plus className="mr-1 h-4 w-4" /> Pessoa
              </Button>
            }
          >
            <div className="space-y-4">
              {equipe.map((u, i) => (
                <div key={i} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      value={u.nome}
                      onChange={(e) =>
                        setEquipe((l) =>
                          l.map((x, idx) => (idx === i ? { ...x, nome: e.target.value } : x)),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                      value={u.email}
                      onChange={(e) =>
                        setEquipe((l) =>
                          l.map((x, idx) => (idx === i ? { ...x, email: e.target.value } : x)),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Função</Label>
                    <div className="flex gap-2">
                      <Select
                        value={u.funcao}
                        onValueChange={(v) =>
                          setEquipe((l) =>
                            l.map((x, idx) => (idx === i ? { ...x, funcao: v as Funcao } : x)),
                          )
                        }
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
                      {equipe.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Remover pessoa"
                          onClick={() => setEquipe((l) => l.filter((_, idx) => idx !== i))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => setPasso((p) => Math.max(0, p - 1))}
            disabled={passo === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Voltar
          </Button>
          {passo < 3 ? (
            <Button onClick={() => setPasso((p) => p + 1)} disabled={!podeAvancar}>
              Continuar <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={concluir} disabled={!podeAvancar}>
              <Check className="mr-1 h-4 w-4" /> Criar empresa
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
