import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { BrandMark } from "@/components/brand-mark";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, SectionCard } from "@/components/ui-kit";
import { LISTA_SEGMENTOS, ROTULO_CAPACIDADE, SEGMENTOS } from "@/core/segmentos";
import { useStore } from "@/core/store";
import type { Capacidade, PersonaIA, Segmento } from "@/core/types";

export const Route = createFileRoute("/app/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações white label — CommerceAI OS" },
      {
        name: "description",
        content: "Marca, cores, segmento, capacidades e personalidade da assistente.",
      },
      { property: "og:title", content: "Configurações white label — CommerceAI OS" },
      { property: "og:description", content: "Personalize marca, módulos e assistente." },
    ],
  }),
  component: Configuracoes,
});

function Configuracoes() {
  const { empresa, atualizarEmpresa, registrar, reiniciarDemo, pode } = useStore();
  const b = empresa.branding;
  const persona = empresa.personaIA;

  const setBranding = (patch: Partial<typeof b>) =>
    atualizarEmpresa({ branding: { ...b, ...patch } });
  const setPersona = (patch: Partial<PersonaIA>) =>
    atualizarEmpresa({ personaIA: { ...persona, ...patch } });

  const somenteLeitura = !pode("gerir_configuracoes");

  return (
    <>
      <PageHeader
        titulo="Configurações"
        descricao="White label, segmento, capacidades e assistente."
        acoes={
          <Button
            variant="outline"
            onClick={() => {
              reiniciarDemo();
              toast("Dados de demonstração restaurados");
            }}
          >
            <RotateCcw className="mr-1 h-4 w-4" /> Restaurar demo
          </Button>
        }
      />

      {somenteLeitura && (
        <p className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
          Sua função não permite alterar configurações. Visualização apenas.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard titulo="Marca" descricao="Aplicada em runtime a todo o sistema" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nome de exibição</Label>
              <Input
                disabled={somenteLeitura}
                value={b.nomeExibicao}
                onChange={(e) => setBranding({ nomeExibicao: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Iniciais do logo</Label>
              <Input
                disabled={somenteLeitura}
                maxLength={3}
                value={b.iniciais}
                onChange={(e) => setBranding({ iniciais: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Slogan</Label>
              <Input
                disabled={somenteLeitura}
                value={b.slogan}
                onChange={(e) => setBranding({ slogan: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Cor primária</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  disabled={somenteLeitura}
                  value={b.corPrimaria}
                  onChange={(e) => setBranding({ corPrimaria: e.target.value })}
                  className="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent"
                />
                <Input
                  disabled={somenteLeitura}
                  value={b.corPrimaria}
                  onChange={(e) => setBranding({ corPrimaria: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cor de destaque</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  disabled={somenteLeitura}
                  value={b.corDestaque}
                  onChange={(e) => setBranding({ corDestaque: e.target.value })}
                  className="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent"
                />
                <Input
                  disabled={somenteLeitura}
                  value={b.corDestaque}
                  onChange={(e) => setBranding({ corDestaque: e.target.value })}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard titulo="Prévia" descricao="Como a marca aparece">
          <div className="space-y-4">
            <BrandMark iniciais={b.iniciais} nome={b.nomeExibicao} slogan={b.slogan} size="lg" />
            <div className="bg-brand rounded-xl p-4 text-primary-foreground">
              <p className="font-display text-sm font-bold">{b.nomeExibicao}</p>
              <p className="text-xs opacity-80">{b.slogan}</p>
            </div>
            <Button className="w-full">Botão primário</Button>
          </div>
        </SectionCard>
      </div>

      <SectionCard titulo="Segmento e capacidades" descricao="Ativa ou desativa recursos por empresa">
        <div className="space-y-4">
          <div className="grid gap-3 sm:max-w-sm">
            <Label>Segmento</Label>
            <Select
              disabled={somenteLeitura}
              value={empresa.segmento}
              onValueChange={(v) => {
                const perfil = SEGMENTOS[v as Segmento];
                atualizarEmpresa({ segmento: perfil.id, capacidades: perfil.capacidades });
                registrar("Segmento alterado", perfil.nome);
                toast.success(`Segmento alterado para ${perfil.nome}`);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LISTA_SEGMENTOS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.emoji} {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(ROTULO_CAPACIDADE) as Capacidade[]).map((c) => {
              const ativa = empresa.capacidades.includes(c);
              return (
                <div
                  key={c}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <span className="min-w-0 truncate text-sm">{ROTULO_CAPACIDADE[c]}</span>
                  <Switch
                    disabled={somenteLeitura}
                    checked={ativa}
                    onCheckedChange={(v) =>
                      atualizarEmpresa({
                        capacidades: v
                          ? [...empresa.capacidades, c]
                          : empresa.capacidades.filter((x) => x !== c),
                      })
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>

      <SectionCard titulo="Assistente" descricao="Personalidade e tom de conversa da marca">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nome da assistente</Label>
            <Input
              disabled={somenteLeitura}
              value={persona.nome}
              onChange={(e) => setPersona({ nome: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Tom</Label>
            <Select
              disabled={somenteLeitura}
              value={persona.tom}
              onValueChange={(v) => setPersona({ tom: v as PersonaIA["tom"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amigavel">Amigável</SelectItem>
                <SelectItem value="profissional">Profissional</SelectItem>
                <SelectItem value="direto">Direto</SelectItem>
                <SelectItem value="regional">Regional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Saudação inicial</Label>
            <Textarea
              disabled={somenteLeitura}
              value={persona.saudacao}
              onChange={(e) => setPersona({ saudacao: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3 sm:col-span-2">
            <div>
              <p className="text-sm font-medium">Assistente ativa</p>
              <p className="text-xs text-muted-foreground">
                Com ela desligada, vendas e pedidos continuam funcionando normalmente.
              </p>
            </div>
            <Switch
              disabled={somenteLeitura}
              checked={persona.ativa}
              onCheckedChange={(v) => setPersona({ ativa: v })}
            />
          </div>
        </div>
      </SectionCard>
    </>
  );
}
