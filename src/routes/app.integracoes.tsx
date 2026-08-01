import { createFileRoute } from "@tanstack/react-router";
import {
  CreditCard,
  FileText,
  MessageCircle,
  Printer,
  Truck,
  Wrench,
} from "lucide-react";
import type { ComponentType } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PageHeader, SectionCard } from "@/components/ui-kit";
import { useStore } from "@/core/store";
import type { Integracao } from "@/core/types";

export const Route = createFileRoute("/app/integracoes")({
  head: () => ({
    meta: [
      { title: "Integrações — CommerceAI OS" },
      {
        name: "description",
        content: "Pagamentos, fiscal, entregas, mensagens e dispositivos conectados à operação.",
      },
      { property: "og:title", content: "Integrações — CommerceAI OS" },
      { property: "og:description", content: "Central de conexões e dispositivos." },
    ],
  }),
  component: Integracoes,
});

const ICONES: Record<Integracao["categoria"], ComponentType<{ className?: string }>> = {
  pagamentos: CreditCard,
  fiscal: FileText,
  entregas: Truck,
  mensagens: MessageCircle,
  dispositivos: Printer,
  servicos: Wrench,
};

const ROTULO_CATEGORIA: Record<Integracao["categoria"], string> = {
  pagamentos: "Pagamentos",
  fiscal: "Fiscal",
  entregas: "Entregas",
  mensagens: "Mensagens",
  dispositivos: "Dispositivos",
  servicos: "Serviços externos",
};

function Integracoes() {
  const { integracoes, alternarIntegracao, registrar } = useStore();
  const categorias = Array.from(new Set(integracoes.map((i) => i.categoria)));

  return (
    <>
      <PageHeader
        titulo="Central de integrações"
        descricao="Conexões simuladas nesta fase — nenhuma credencial real é usada."
      />

      {categorias.map((cat) => {
        const Icone = ICONES[cat];
        return (
          <SectionCard key={cat} titulo={ROTULO_CATEGORIA[cat]}>
            <div className="grid gap-3 sm:grid-cols-2">
              {integracoes
                .filter((i) => i.categoria === cat)
                .map((i) => (
                  <div
                    key={i.id}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-4"
                  >
                    <Icone className="h-5 w-5 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{i.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">{i.descricao}</p>
                      <Badge
                        variant="outline"
                        className={
                          i.conectada ? "mt-1 border-success/40 text-success" : "mt-1"
                        }
                      >
                        {i.conectada ? "Conectada" : "Desconectada"}
                      </Badge>
                    </div>
                    <Switch
                      checked={i.conectada}
                      onCheckedChange={() => {
                        alternarIntegracao(i.id);
                        registrar(
                          i.conectada ? "Integração desativada" : "Integração ativada",
                          i.nome,
                        );
                        toast(`${i.nome}: ${i.conectada ? "desconectada" : "conectada"}`);
                      }}
                    />
                  </div>
                ))}
            </div>
          </SectionCard>
        );
      })}
    </>
  );
}
