import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Boxes,
  Bot,
  Building2,
  ClipboardList,
  Menu,
  Plug,
  ScanLine,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Users,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import type { ComponentType, ReactNode } from "react";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBrandTheme } from "@/branding/use-brand-theme";
import { ROTULO_FUNCAO } from "@/core/permissoes";
import { SEGMENTOS } from "@/core/segmentos";
import { useStore } from "@/core/store";
import { cn } from "@/lib/utils";

interface ItemNav {
  to: string;
  rotulo: string;
  icone: ComponentType<{ className?: string }>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { empresa, usuario, usuarios, estado, rotulos, trocarEmpresa, trocarUsuario } = useStore();
  const [aberto, setAberto] = useState(false);
  useBrandTheme(empresa.branding.corPrimaria, empresa.branding.corDestaque);

  const nav: ItemNav[] = [
    { to: "/app", rotulo: "Painel", icone: BarChart3 },
    { to: "/app/pdv", rotulo: "PDV", icone: ScanLine },
    { to: "/app/catalogo", rotulo: rotulos.catalogo, icone: Boxes },
    { to: "/app/vendas", rotulo: rotulos.vendas, icone: ClipboardList },
    { to: "/app/clientes", rotulo: "Clientes", icone: Users },
    { to: "/app/assistente", rotulo: "Assistente", icone: Bot },
    { to: "/app/equipe", rotulo: "Equipe", icone: UsersRound },
    { to: "/app/unidades", rotulo: "Unidades", icone: Building2 },
    { to: "/app/integracoes", rotulo: "Integrações", icone: Plug },
    { to: "/app/configuracoes", rotulo: "Configurações", icone: Settings },
    { to: "/app/auditoria", rotulo: "Auditoria", icone: ShieldCheck },
  ];

  const menu = (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => (
        <NavLink key={item.to} item={item} onClick={() => setAberto(false)} />
      ))}
      <Link
        to="/loja"
        onClick={() => setAberto(false)}
        className="mt-3 flex items-center gap-3 rounded-lg border border-primary/30 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
      >
        <Smartphone className="h-4 w-4 shrink-0" />
        Abrir app do cliente
      </Link>
      <Link
        to="/exportar"
        onClick={() => setAberto(false)}
        className="mt-2 flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
      >
        <Download className="h-4 w-4 shrink-0" />
        Exportar páginas
      </Link>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <BrandMark
          iniciais={empresa.branding.iniciais}
          nome={empresa.branding.nomeExibicao}
          slogan={SEGMENTOS[empresa.segmento].nome}
        />
        <div className="mt-5 flex-1 overflow-y-auto">{menu}</div>
        <p className="pt-4 text-[11px] text-muted-foreground">
          CommerceAI OS · dados de demonstração
        </p>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={aberto} onOpenChange={setAberto}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-sidebar p-4">
                <SheetTitle className="sr-only">Navegação</SheetTitle>
                <BrandMark
                  iniciais={empresa.branding.iniciais}
                  nome={empresa.branding.nomeExibicao}
                  slogan={SEGMENTOS[empresa.segmento].nome}
                />
                <div className="mt-5">{menu}</div>
              </SheetContent>
            </Sheet>

            <Select value={empresa.id} onValueChange={trocarEmpresa}>
              <SelectTrigger className="h-9 w-full max-w-[15rem] border-border bg-surface">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {estado.empresas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {SEGMENTOS[e.segmento].emoji} {e.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Select value={usuario?.id} onValueChange={trocarUsuario}>
              <SelectTrigger className="hidden h-9 w-56 border-border bg-surface sm:flex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {usuarios.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nome} · {ROTULO_FUNCAO[u.funcao]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="bg-brand grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-primary-foreground">
              {usuario?.nome
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

function NavLink({ item, onClick }: { item: ItemNav; onClick: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const ativo = item.to === "/app" ? pathname === "/app" : pathname.startsWith(item.to);
  const Icone = item.icone;
  return (
    <Link
      to={item.to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        ativo
          ? "bg-primary/15 text-primary"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icone className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.rotulo}</span>
    </Link>
  );
}

export { ShoppingBag };
