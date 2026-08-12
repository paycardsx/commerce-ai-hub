import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/recuperar")({
  head: () => ({
    meta: [
      { title: "Recuperar acesso — CommerceAI OS" },
      { name: "description", content: "Recupere o acesso à sua conta do CommerceAI OS." },
      { property: "og:title", content: "Recuperar acesso — CommerceAI OS" },
      { property: "og:description", content: "Enviaremos as instruções por e-mail." },
    ],
  }),
  component: Recuperar,
});

function Recuperar() {
  const [enviado, setEnviado] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-gradient px-4 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center gap-3">
          <div className="bg-brand grid h-10 w-10 place-items-center rounded-xl font-display font-black text-primary-foreground">
            AI
          </div>
          <span className="font-display text-lg font-bold">CommerceAI OS</span>
        </Link>

        <h1 className="font-display text-2xl font-bold">Recuperar acesso</h1>
        {enviado ? (
          <div className="card-surface mt-6 p-5">
            <p className="text-sm">
              Se este e-mail estiver cadastrado, as instruções de recuperação serão enviadas em
              alguns minutos.
            </p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link to="/">Voltar para início</Link>
            </Button>
          </div>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setEnviado(true);
            }}
          >
            <p className="text-sm text-muted-foreground">
              Informe o e-mail usado no cadastro da empresa.
            </p>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" required placeholder="voce@empresa.com" />
            </div>
            <Button type="submit" className="w-full">
              Enviar instruções
            </Button>
            <Link
              to="/"
              className="block text-center text-sm text-muted-foreground hover:underline"
            >
              Voltar
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
