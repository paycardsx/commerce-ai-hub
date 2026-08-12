import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  Boxes,
  LayoutDashboard,
  Plug,
  ScanLine,
  Smartphone,
  Store,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { LISTA_SEGMENTOS } from "@/core/segmentos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CommerceAI OS — sistema comercial inteligente e white label" },
      {
        name: "description",
        content:
          "Painel, PDV, app do cliente, integrações e assistente conversacional em um só ecossistema multiempresa e multissegmento.",
      },
      { property: "og:title", content: "CommerceAI OS — sistema comercial inteligente" },
      {
        property: "og:description",
        content: "Um ecossistema modular para mercadinhos, lanchonetes, lojas, serviços e mais.",
      },
    ],
  }),
  component: Apresentacao,
});

const APPS = [
  {
    icone: LayoutDashboard,
    titulo: "Administrativo",
    texto: "Vendas, pedidos, estoque, equipe e indicadores em um painel único.",
  },
  {
    icone: ScanLine,
    titulo: "PDV",
    texto: "Venda rápida, busca por código, descontos autorizados e comprovante.",
  },
  {
    icone: Smartphone,
    titulo: "App do cliente",
    texto: "Com a marca do estabelecimento: catálogo, pedidos e conversa.",
  },
  {
    icone: Boxes,
    titulo: "Terminais",
    texto: "Comandas, mesas, cozinha, separação e autoatendimento.",
  },
  {
    icone: Plug,
    titulo: "Integrações",
    texto: "Pagamentos, fiscal, entregas, mensagens, impressoras e dispositivos.",
  },
  {
    icone: Bot,
    titulo: "Assistente",
    texto: "Companheira de compras que ajuda primeiro e vende como consequência.",
  },
];

function Apresentacao() {
  return (
    <div className="min-h-screen bg-surface-gradient">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-brand grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display font-black text-primary-foreground">
            AI
          </div>
          <span className="truncate font-display text-lg font-bold">CommerceAI OS</span>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/app">Entrar</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Store className="h-3.5 w-3.5" /> Multiempresa · multissegmento · white label
        </p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">
          Tecnologia que <span className="text-brand">impulsiona</span> o seu comércio.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Um ecossistema único para gerir, vender e atender. Cada empresa escolhe seu segmento e o
          sistema se adapta — do mercadinho de bairro ao restaurante, da loja ao prestador de
          serviços.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/app">
              Abrir demonstração <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/loja">Ver app do cliente</Link>
          </Button>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {APPS.map((app) => (
            <div key={app.titulo} className="card-surface p-5">
              <app.icone className="h-5 w-5 text-primary" />
              <h2 className="mt-3 font-display text-lg font-semibold">{app.titulo}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{app.texto}</p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <h2 className="font-display text-2xl font-bold">Segmentos suportados</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            O segmento não muda o sistema: ele ativa as capacidades certas.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LISTA_SEGMENTOS.map((s) => (
              <div key={s.id} className="card-surface flex gap-3 p-4">
                <span className="text-2xl leading-none">{s.emoji}</span>
                <div className="min-w-0">
                  <p className="font-display font-semibold">{s.nome}</p>
                  <p className="text-xs text-muted-foreground">{s.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        CommerceAI OS · protótipo com dados de demonstração
      </footer>
    </div>
  );
}
