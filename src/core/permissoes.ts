import type { Funcao, Permissao } from "./types";

export const PERMISSOES_POR_FUNCAO: Record<Funcao, Permissao[]> = {
  proprietario: [
    "ver_painel",
    "gerir_catalogo",
    "gerir_clientes",
    "operar_pdv",
    "gerir_vendas",
    "gerir_equipe",
    "gerir_configuracoes",
    "ver_auditoria",
    "aplicar_desconto",
  ],
  gerente: [
    "ver_painel",
    "gerir_catalogo",
    "gerir_clientes",
    "operar_pdv",
    "gerir_vendas",
    "gerir_equipe",
    "ver_auditoria",
    "aplicar_desconto",
  ],
  operador: ["ver_painel", "operar_pdv", "gerir_vendas", "gerir_clientes"],
  atendente: ["operar_pdv", "gerir_vendas"],
  cozinha: ["gerir_vendas"],
};

export const ROTULO_FUNCAO: Record<Funcao, string> = {
  proprietario: "Proprietário",
  gerente: "Gerente",
  operador: "Operador",
  atendente: "Atendente",
  cozinha: "Cozinha",
};

export function temPermissao(funcao: Funcao, permissao: Permissao) {
  return PERMISSOES_POR_FUNCAO[funcao]?.includes(permissao) ?? false;
}
