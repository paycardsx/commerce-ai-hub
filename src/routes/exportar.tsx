import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, ExternalLink, FileCode2, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";


import { PageHeader } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/exportar")({
  head: () => ({
    meta: [
      { title: "Exportar páginas — CommerceAI OS" },
      {
        name: "description",
        content:
          "Selecione as páginas do CommerceAI OS e baixe o código-fonte em um arquivo .zip para editar com facilidade.",
      },
      { property: "og:title", content: "Exportar páginas — CommerceAI OS" },
      {
        property: "og:description",
        content: "Selecione as telas e baixe todo o código do protótipo em um .zip.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExportarPage,
});

/** Todos os arquivos do projeto acessíveis como texto (carregados sob demanda). */
const ARQUIVOS = import.meta.glob("/src/**/*.{ts,tsx,css}", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

interface Pagina {
  rota: string;
  nome: string;
  descricao: string;
  arquivo: string;
  grupo: "Público" | "Administrativo" | "Cliente";
}

const PAGINAS: Pagina[] = [
  {
    rota: "/",
    nome: "Apresentação",
    descricao: "Landing do produto",
    arquivo: "/src/routes/index.tsx",
    grupo: "Público",
  },
  {
    rota: "/entrar",
    nome: "Login",
    descricao: "Acesso com contas demo",
    arquivo: "/src/routes/entrar.tsx",
    grupo: "Público",
  },
  {
    rota: "/recuperar",
    nome: "Recuperar acesso",
    descricao: "Simulação de recuperação",
    arquivo: "/src/routes/recuperar.tsx",
    grupo: "Público",
  },
  {
    rota: "/cadastro",
    nome: "Cadastro de empresa",
    descricao: "Wizard de onboarding",
    arquivo: "/src/routes/cadastro.tsx",
    grupo: "Público",
  },
  {
    rota: "/app",
    nome: "Painel",
    descricao: "KPIs por segmento",
    arquivo: "/src/routes/app.index.tsx",
    grupo: "Administrativo",
  },
  {
    rota: "/app/pdv",
    nome: "PDV",
    descricao: "Frente de caixa",
    arquivo: "/src/routes/app.pdv.tsx",
    grupo: "Administrativo",
  },
  {
    rota: "/app/catalogo",
    nome: "Catálogo",
    descricao: "Produtos, serviços e cardápio",
    arquivo: "/src/routes/app.catalogo.tsx",
    grupo: "Administrativo",
  },
  {
    rota: "/app/vendas",
    nome: "Vendas e pedidos",
    descricao: "Status por segmento",
    arquivo: "/src/routes/app.vendas.tsx",
    grupo: "Administrativo",
  },
  {
    rota: "/app/clientes",
    nome: "Clientes",
    descricao: "Histórico e preferências",
    arquivo: "/src/routes/app.clientes.tsx",
    grupo: "Administrativo",
  },
  {
    rota: "/app/assistente",
    nome: "Assistente",
    descricao: "Chat de demonstração",
    arquivo: "/src/routes/app.assistente.tsx",
    grupo: "Administrativo",
  },
  {
    rota: "/app/equipe",
    nome: "Equipe",
    descricao: "Usuários e permissões",
    arquivo: "/src/routes/app.equipe.tsx",
    grupo: "Administrativo",
  },
  {
    rota: "/app/unidades",
    nome: "Unidades",
    descricao: "Filiais da empresa",
    arquivo: "/src/routes/app.unidades.tsx",
    grupo: "Administrativo",
  },
  {
    rota: "/app/integracoes",
    nome: "Integrações",
    descricao: "Central de conexões",
    arquivo: "/src/routes/app.integracoes.tsx",
    grupo: "Administrativo",
  },
  {
    rota: "/app/configuracoes",
    nome: "Configurações",
    descricao: "White label e IA",
    arquivo: "/src/routes/app.configuracoes.tsx",
    grupo: "Administrativo",
  },
  {
    rota: "/app/auditoria",
    nome: "Auditoria",
    descricao: "Registro de ações",
    arquivo: "/src/routes/app.auditoria.tsx",
    grupo: "Administrativo",
  },
  {
    rota: "/loja",
    nome: "App do cliente",
    descricao: "Loja com a marca da empresa",
    arquivo: "/src/routes/loja.tsx",
    grupo: "Cliente",
  },
];

/** Arquivos de base incluídos quando a opção estiver ligada. */
const BASE = [
  "/src/styles.css",
  "/src/lib/utils.ts",
  "/src/core/types.ts",
  "/src/core/segmentos.ts",
  "/src/core/permissoes.ts",
  "/src/core/store.tsx",
  "/src/data/seed.ts",
  "/src/branding/use-brand-theme.ts",
  "/src/components/ui-kit.tsx",
  "/src/components/brand-mark.tsx",
  "/src/components/app-shell.tsx",
  "/src/modules/assistente/motor.ts",
  "/src/modules/vendas/status.ts",
  "/src/routes/__root.tsx",
  "/src/routes/app.tsx",
];

const GRUPOS: Pagina["grupo"][] = ["Público", "Administrativo", "Cliente"];

function ExportarPage() {
  const [selecionadas, setSelecionadas] = useState<string[]>(PAGINAS.map((p) => p.arquivo));
  const [incluirBase, setIncluirBase] = useState(true);
  const [incluirUi, setIncluirUi] = useState(false);
  const [busca, setBusca] = useState("");
  const [baixando, setBaixando] = useState(false);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return PAGINAS;
    return PAGINAS.filter((p) =>
      `${p.nome} ${p.rota} ${p.descricao}`.toLowerCase().includes(termo),
    );
  }, [busca]);

  const alternar = (arquivo: string) =>
    setSelecionadas((atual) =>
      atual.includes(arquivo) ? atual.filter((a) => a !== arquivo) : [...atual, arquivo],
    );

  const todasMarcadas = filtradas.every((p) => selecionadas.includes(p.arquivo));

  const marcarTodas = () =>
    setSelecionadas((atual) => {
      const alvos = filtradas.map((p) => p.arquivo);
      return todasMarcadas
        ? atual.filter((a) => !alvos.includes(a))
        : Array.from(new Set([...atual, ...alvos]));
    });

  const total =
    selecionadas.length +
    (incluirBase ? BASE.length : 0) +
    (incluirUi ? Object.keys(ARQUIVOS).filter((p) => p.startsWith("/src/components/ui/")).length : 0);

  async function baixar() {
    if (!selecionadas.length) return;
    setBaixando(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();

      const caminhos = new Set<string>(selecionadas);
      if (incluirBase) BASE.forEach((c) => caminhos.add(c));
      if (incluirUi) {
        Object.keys(ARQUIVOS)
          .filter((p) => p.startsWith("/src/components/ui/"))
          .forEach((c) => caminhos.add(c));
      }

      await Promise.all(
        Array.from(caminhos).map(async (caminho) => {
          const carregar = ARQUIVOS[caminho];
          if (!carregar) return;
          const conteudo = await carregar();
          zip.file(caminho.replace(/^\//, ""), conteudo);
        }),
      );

      const lista = PAGINAS.filter((p) => selecionadas.includes(p.arquivo))
        .map((p) => `- ${p.nome} (${p.rota}) → ${p.arquivo.replace(/^\//, "")}`)
        .join("\n");
      zip.file(
        "LEIA-ME.md",
        `# CommerceAI OS — páginas exportadas\n\nGerado em ${new Date().toLocaleString("pt-BR")}.\n\n## Páginas incluídas\n${lista}\n\n${
          incluirBase ? "Arquivos de base (tipos, dados demo, tema, componentes) incluídos.\n" : ""
        }${incluirUi ? "Componentes de UI (shadcn) incluídos.\n" : ""}`,
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `commerceai-os-paginas-${new Date().toISOString().slice(0, 10)}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setBaixando(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <PageHeader
          titulo="Exportar páginas"
          descricao="Selecione as telas do sistema e baixe o código-fonte em um .zip para editar onde preferir."
          acoes={
            <Button onClick={baixar} disabled={baixando || !selecionadas.length}>
              {baixando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Baixar {total} arquivo{total === 1 ? "" : "s"}
            </Button>
          }
        />

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar página..."
            className="sm:max-w-xs"
          />
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <Switch checked={incluirBase} onCheckedChange={setIncluirBase} />
              Incluir base do sistema
            </label>
            <label className="flex items-center gap-2">
              <Switch checked={incluirUi} onCheckedChange={setIncluirUi} />
              Incluir componentes de UI
            </label>
            <Button variant="outline" size="sm" onClick={marcarTodas}>
              {todasMarcadas ? "Desmarcar" : "Selecionar"} tudo
            </Button>
          </div>
        </div>

        {GRUPOS.map((grupo) => {
          const itens = filtradas.filter((p) => p.grupo === grupo);
          if (!itens.length) return null;
          return (
            <section key={grupo} className="space-y-3">
              <h2 className="font-display text-lg font-semibold">{grupo}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {itens.map((p) => {
                  const marcada = selecionadas.includes(p.arquivo);
                  return (
                    <div
                      key={p.arquivo}
                      className={cn(
                        "flex w-full flex-col overflow-hidden rounded-xl border transition-colors",
                        marcada
                          ? "border-primary/60 bg-primary/5"
                          : "border-border bg-surface hover:border-primary/30",
                      )}
                    >
                      <Previa rota={p.rota} nome={p.nome} />
                      <button
                        type="button"
                        onClick={() => alternar(p.arquivo)}
                        className="flex w-full flex-col gap-3 p-4 text-left"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{p.nome}</p>
                            <p className="truncate text-xs text-muted-foreground">{p.descricao}</p>
                          </div>
                          <Checkbox checked={marcada} className="pointer-events-none mt-1" />
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <FileCode2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{p.arquivo.replace("/src/routes/", "")}</span>
                        </div>
                      </button>
                      <div className="flex items-center justify-between gap-2 border-t border-border/60 px-4 py-2">
                        <span className="truncate text-xs text-primary">{p.rota}</span>
                        <Link
                          to={p.rota}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Abrir <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

      </div>
    </div>
  );
}

/** Miniatura ao vivo da rota, renderizada em iframe reduzido e sem interação. */
function Previa({ rota, nome }: { rota: string; nome: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visivel) return;
    const obs = new IntersectionObserver(
      (entradas) => entradas.forEach((e) => e.isIntersecting && setVisivel(true)),
      { rootMargin: "200px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visivel]);

  return (
    <div
      ref={ref}
      className="relative h-44 w-full overflow-hidden border-b border-border/60 bg-background"
    >
      {visivel ? (
        <iframe
          src={rota}
          title={`Prévia da tela ${nome}`}
          loading="lazy"
          onLoad={() => setCarregado(true)}
          tabIndex={-1}
          className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
          style={{ width: 1280, height: 900, transform: "scale(0.32)" }}
        />
      ) : null}
      {!carregado ? (
        <div className="absolute inset-0 grid place-items-center bg-surface/80 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : null}
    </div>
  );
}
