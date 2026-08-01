import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/core/store";
import { SEGMENTOS } from "@/core/segmentos";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — CommerceAI OS" },
      { name: "description", content: "Acesse o painel da sua empresa no CommerceAI OS." },
      { property: "og:title", content: "Entrar — CommerceAI OS" },
      { property: "og:description", content: "Acesse o painel da sua empresa." },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const { estado, trocarEmpresa } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("carla@bompreco.com");
  const [senha, setSenha] = useState("demo1234");

  function acessar(empresaId?: string) {
    if (empresaId) trocarEmpresa(empresaId);
    toast.success("Acesso de demonstração liberado");
    navigate({ to: "/app" });
  }

  return (
    <div className="grid min-h-screen bg-surface-gradient lg:grid-cols-2">
      <div className="hidden flex-col justify-between border-r border-border p-10 lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-brand grid h-10 w-10 place-items-center rounded-xl font-display font-black text-primary-foreground">
            AI
          </div>
          <span className="font-display text-lg font-bold">CommerceAI OS</span>
        </Link>
        <div>
          <h2 className="max-w-sm font-display text-3xl font-bold">
            Tudo do seu comércio em um só lugar.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Painel, PDV, app do cliente e assistente — adaptados ao segmento da sua empresa.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Ambiente de demonstração</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold">Entrar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use qualquer credencial: esta fase não valida senha real.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              acessar();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link to="/recuperar" className="text-primary hover:underline">
              Esqueci minha senha
            </Link>
            <Link to="/cadastro" className="text-muted-foreground hover:underline">
              Criar empresa
            </Link>
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Acesso rápido às demos
            </p>
            <div className="mt-3 space-y-2">
              {estado.empresas.map((e) => (
                <button
                  key={e.id}
                  onClick={() => acessar(e.id)}
                  className="card-surface flex w-full items-center gap-3 p-3 text-left transition-colors hover:border-primary/40"
                >
                  <span className="text-xl">{SEGMENTOS[e.segmento].emoji}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{e.nome}</span>
                    <span className="block text-xs text-muted-foreground">
                      {SEGMENTOS[e.segmento].nome}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
