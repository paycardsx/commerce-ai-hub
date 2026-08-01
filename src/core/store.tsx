import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  AUDITORIA_DEMO,
  CATALOGO_DEMO,
  CLIENTES_DEMO,
  EMPRESAS_DEMO,
  INTEGRACOES_DEMO,
  PEDIDOS_DEMO,
  UNIDADES_DEMO,
  USUARIOS_DEMO,
} from "@/data/seed";
import { SEGMENTOS } from "./segmentos";
import { PERMISSOES_POR_FUNCAO } from "./permissoes";
import type {
  Capacidade,
  Cliente,
  Empresa,
  Integracao,
  ItemCatalogo,
  Pedido,
  Permissao,
  RegistroAuditoria,
  Unidade,
  Usuario,
} from "./types";

/**
 * Camada de dados simulada. Toda leitura é filtrada por empresa ativa —
 * substituir este módulo por um backend não exige mudar as telas.
 */

interface Estado {
  empresas: Empresa[];
  unidades: Unidade[];
  usuarios: Usuario[];
  catalogo: ItemCatalogo[];
  clientes: Cliente[];
  pedidos: Pedido[];
  integracoes: Integracao[];
  auditoria: RegistroAuditoria[];
  empresaAtivaId: string;
  usuarioAtivoId: string;
}

const ESTADO_INICIAL: Estado = {
  empresas: EMPRESAS_DEMO,
  unidades: UNIDADES_DEMO,
  usuarios: USUARIOS_DEMO,
  catalogo: CATALOGO_DEMO,
  clientes: CLIENTES_DEMO,
  pedidos: PEDIDOS_DEMO,
  integracoes: INTEGRACOES_DEMO,
  auditoria: AUDITORIA_DEMO,
  empresaAtivaId: "emp-mercadinho",
  usuarioAtivoId: "us-1",
};

const CHAVE = "commerceai-os:v1";

interface Contexto {
  estado: Estado;
  empresa: Empresa;
  usuario: Usuario;
  unidades: Unidade[];
  usuarios: Usuario[];
  catalogo: ItemCatalogo[];
  clientes: Cliente[];
  pedidos: Pedido[];
  integracoes: Integracao[];
  auditoria: RegistroAuditoria[];
  temCapacidade: (c: Capacidade) => boolean;
  pode: (p: Permissao) => boolean;
  rotulos: { catalogo: string; vendas: string };
  trocarEmpresa: (id: string) => void;
  trocarUsuario: (id: string) => void;
  criarEmpresa: (e: Empresa, unidades: Unidade[], usuarios: Usuario[]) => void;
  atualizarEmpresa: (patch: Partial<Empresa>) => void;
  salvarItem: (item: ItemCatalogo) => void;
  removerItem: (id: string) => void;
  salvarCliente: (c: Cliente) => void;
  registrarPedido: (p: Pedido) => void;
  atualizarStatusPedido: (id: string, status: Pedido["status"]) => void;
  alternarIntegracao: (id: string) => void;
  salvarUnidade: (u: Unidade) => void;
  salvarUsuario: (u: Usuario) => void;
  registrar: (acao: string, detalhe: string) => void;
  reiniciarDemo: () => void;
}

const StoreContext = createContext<Contexto | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(ESTADO_INICIAL);

  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(CHAVE);
      if (salvo) setEstado({ ...ESTADO_INICIAL, ...JSON.parse(salvo) });
    } catch {
      /* estado inicial */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch {
      /* ignora */
    }
  }, [estado]);

  const empresa =
    estado.empresas.find((e) => e.id === estado.empresaAtivaId) ?? estado.empresas[0]!;
  const usuario =
    estado.usuarios.find((u) => u.id === estado.usuarioAtivoId && u.empresaId === empresa.id) ??
    estado.usuarios.find((u) => u.empresaId === empresa.id)!;

  const registrar = useCallback((acao: string, detalhe: string) => {
    setEstado((s) => {
      const emp = s.empresas.find((e) => e.id === s.empresaAtivaId);
      const user = s.usuarios.find((u) => u.id === s.usuarioAtivoId);
      return {
        ...s,
        auditoria: [
          {
            id: `au-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            empresaId: emp?.id ?? s.empresaAtivaId,
            usuario: user?.nome ?? "Sistema",
            acao,
            detalhe,
            em: new Date().toISOString(),
          },
          ...s.auditoria,
        ],
      };
    });
  }, []);

  const valor: Contexto = useMemo(() => {
    const doEmpresa = <T extends { empresaId: string }>(lista: T[]) =>
      lista.filter((i) => i.empresaId === empresa.id);
    const perfil = SEGMENTOS[empresa.segmento];

    return {
      estado,
      empresa,
      usuario,
      unidades: doEmpresa(estado.unidades),
      usuarios: doEmpresa(estado.usuarios),
      catalogo: doEmpresa(estado.catalogo),
      clientes: doEmpresa(estado.clientes),
      pedidos: doEmpresa(estado.pedidos).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)),
      integracoes: doEmpresa(estado.integracoes),
      auditoria: doEmpresa(estado.auditoria),
      temCapacidade: (c) => empresa.capacidades.includes(c),
      pode: (p) => PERMISSOES_POR_FUNCAO[usuario?.funcao ?? "atendente"].includes(p),
      rotulos: { catalogo: perfil.rotuloCatalogo, vendas: perfil.rotuloVendas },
      trocarEmpresa: (id) =>
        setEstado((s) => ({
          ...s,
          empresaAtivaId: id,
          usuarioAtivoId: s.usuarios.find((u) => u.empresaId === id)?.id ?? s.usuarioAtivoId,
        })),
      trocarUsuario: (id) => setEstado((s) => ({ ...s, usuarioAtivoId: id })),
      criarEmpresa: (nova, unidades, usuarios) =>
        setEstado((s) => ({
          ...s,
          empresas: [...s.empresas, nova],
          unidades: [...s.unidades, ...unidades],
          usuarios: [...s.usuarios, ...usuarios],
          empresaAtivaId: nova.id,
          usuarioAtivoId: usuarios[0]?.id ?? s.usuarioAtivoId,
          integracoes: [
            ...s.integracoes,
            ...INTEGRACOES_DEMO.filter((i) => i.empresaId === "emp-mercadinho").map((i, idx) => ({
              ...i,
              id: `${nova.id}-int-${idx}`,
              empresaId: nova.id,
              conectada: false,
            })),
          ],
        })),
      atualizarEmpresa: (patch) =>
        setEstado((s) => ({
          ...s,
          empresas: s.empresas.map((e) => (e.id === empresa.id ? { ...e, ...patch } : e)),
        })),
      salvarItem: (item) =>
        setEstado((s) => ({
          ...s,
          catalogo: s.catalogo.some((i) => i.id === item.id)
            ? s.catalogo.map((i) => (i.id === item.id ? item : i))
            : [item, ...s.catalogo],
        })),
      removerItem: (id) =>
        setEstado((s) => ({ ...s, catalogo: s.catalogo.filter((i) => i.id !== id) })),
      salvarCliente: (c) =>
        setEstado((s) => ({
          ...s,
          clientes: s.clientes.some((i) => i.id === c.id)
            ? s.clientes.map((i) => (i.id === c.id ? c : i))
            : [c, ...s.clientes],
        })),
      registrarPedido: (p) => setEstado((s) => ({ ...s, pedidos: [p, ...s.pedidos] })),
      atualizarStatusPedido: (id, status) =>
        setEstado((s) => ({
          ...s,
          pedidos: s.pedidos.map((p) => (p.id === id ? { ...p, status } : p)),
        })),
      alternarIntegracao: (id) =>
        setEstado((s) => ({
          ...s,
          integracoes: s.integracoes.map((i) =>
            i.id === id ? { ...i, conectada: !i.conectada } : i,
          ),
        })),
      salvarUnidade: (u) =>
        setEstado((s) => ({
          ...s,
          unidades: s.unidades.some((i) => i.id === u.id)
            ? s.unidades.map((i) => (i.id === u.id ? u : i))
            : [...s.unidades, u],
        })),
      salvarUsuario: (u) =>
        setEstado((s) => ({
          ...s,
          usuarios: s.usuarios.some((i) => i.id === u.id)
            ? s.usuarios.map((i) => (i.id === u.id ? u : i))
            : [...s.usuarios, u],
        })),
      registrar,
      reiniciarDemo: () => setEstado(ESTADO_INICIAL),
    };
  }, [estado, empresa, usuario, registrar]);

  return <StoreContext.Provider value={valor}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore precisa estar dentro de StoreProvider");
  return ctx;
}

export const moeda = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const dataCurta = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

export const horaCurta = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
