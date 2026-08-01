import { createFileRoute } from "@tanstack/react-router";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, SectionCard } from "@/components/ui-kit";
import { moeda, useStore } from "@/core/store";
import type { ItemCatalogo } from "@/core/types";
import { SUGESTOES_PADRAO, responder } from "@/modules/assistente/motor";

export const Route = createFileRoute("/app/assistente")({
  head: () => ({
    meta: [
      { title: "Assistente conversacional — CommerceAI OS" },
      {
        name: "description",
        content:
          "Assistente de demonstração que responde apenas com dados reais do catálogo da empresa.",
      },
      { property: "og:title", content: "Assistente conversacional — CommerceAI OS" },
      { property: "og:description", content: "Conversa baseada no catálogo real da empresa." },
    ],
  }),
  component: Assistente,
});

interface Bolha {
  id: string;
  autor: "ia" | "eu";
  texto: string;
  itens: ItemCatalogo[];
}

function Assistente() {
  const { empresa, catalogo } = useStore();
  const persona = empresa.personaIA;
  const [texto, setTexto] = useState("");
  const contador = useRef(0);
  const [mensagens, setMensagens] = useState<Bolha[]>(() => [
    { id: "m0", autor: "ia", texto: persona.saudacao, itens: [] },
  ]);

  const ativa = persona.ativa && empresa.capacidades.includes("assistenteIA");

  const enviar = (pergunta: string) => {
    const limpo = pergunta.trim();
    if (!limpo) return;
    const resposta = responder(limpo, empresa, catalogo);
    contador.current += 1;
    const n = contador.current;
    setMensagens((m) => [
      ...m,
      { id: `u${n}`, autor: "eu", texto: limpo, itens: [] },
      { id: `a${n}`, autor: "ia", texto: resposta.texto, itens: resposta.itens },
    ]);
    setTexto("");
  };

  const resumo = useMemo(
    () => ({
      itens: catalogo.filter((i) => i.ativo).length,
      categorias: new Set(catalogo.map((i) => i.categoria)).size,
    }),
    [catalogo],
  );

  return (
    <>
      <PageHeader
        titulo={persona.nome}
        descricao={`Tom ${persona.tom} · responde somente com o catálogo de ${empresa.branding.nomeExibicao}`}
        acoes={
          <Badge variant="outline" className={ativa ? "border-success/40 text-success" : ""}>
            {ativa ? "Assistente ativa" : "Desligada — operação segue normal"}
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <SectionCard titulo="Conversa" descricao="Demonstração determinística, sem serviço externo">
          <div className="flex max-h-[28rem] flex-col gap-4 overflow-y-auto pr-1">
            {mensagens.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.autor === "eu" ? "flex-row-reverse" : ""}`}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                  {m.autor === "ia" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </span>
                <div className="min-w-0 max-w-[85%] space-y-2">
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm ${
                      m.autor === "eu"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {m.texto}
                  </div>
                  {m.itens.length > 0 && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {m.itens.map((i) => (
                        <div key={i.id} className="rounded-xl border border-border p-3">
                          <p className="truncate text-sm font-medium">{i.nome}</p>
                          <p className="text-xs text-muted-foreground">{i.categoria}</p>
                          <p className="mt-1 text-sm font-semibold text-primary">
                            {moeda(i.preco)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              enviar(texto);
            }}
          >
            <Input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={ativa ? "Pergunte sobre o catálogo…" : "Assistente desligada"}
              disabled={!ativa}
            />
            <Button type="submit" disabled={!ativa}>
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {SUGESTOES_PADRAO.map((s) => (
              <Button
                key={s}
                size="sm"
                variant="outline"
                disabled={!ativa}
                onClick={() => enviar(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard titulo="Base de conhecimento">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{resumo.itens} itens ativos no catálogo</li>
              <li>{resumo.categorias} categorias</li>
              <li>Preços e estoque lidos em tempo real</li>
            </ul>
          </SectionCard>
          <SectionCard titulo="Regras de conduta">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Nunca promete item que não está no catálogo.
              </li>
              <li className="flex gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Não usa pressão nem culpa para vender.
              </li>
              <li className="flex gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Encaminha para atendimento humano quando pedido.
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
