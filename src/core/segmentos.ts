import type { Capacidade, Modulo, Segmento } from "./types";

export interface PerfilSegmento {
  id: Segmento;
  nome: string;
  descricao: string;
  emoji: string;
  capacidades: Capacidade[];
  modulos: Modulo[];
  rotuloCatalogo: string;
  rotuloVendas: string;
}

const MODULOS_BASE: Modulo[] = [
  "painel",
  "catalogo",
  "clientes",
  "vendas",
  "pdv",
  "equipe",
  "unidades",
  "integracoes",
  "assistente",
  "configuracoes",
  "auditoria",
];

export const SEGMENTOS: Record<Segmento, PerfilSegmento> = {
  mercadinho: {
    id: "mercadinho",
    nome: "Mercadinho",
    descricao: "Estoque, código de barras e venda rápida no balcão.",
    emoji: "🛒",
    capacidades: [
      "estoque",
      "codigoBarras",
      "vendaRapida",
      "pesoVariavel",
      "entregas",
      "assistenteIA",
      "appCliente",
    ],
    modulos: MODULOS_BASE,
    rotuloCatalogo: "Produtos",
    rotuloVendas: "Vendas",
  },
  lanchonete: {
    id: "lanchonete",
    nome: "Lanchonete",
    descricao: "Cardápio, adicionais, comandas e fila de cozinha.",
    emoji: "🍔",
    capacidades: [
      "cardapio",
      "adicionais",
      "comandas",
      "cozinha",
      "entregas",
      "assistenteIA",
      "appCliente",
    ],
    modulos: MODULOS_BASE,
    rotuloCatalogo: "Cardápio",
    rotuloVendas: "Pedidos",
  },
  loja: {
    id: "loja",
    nome: "Loja",
    descricao: "Variações, pedidos e entregas para varejo.",
    emoji: "🏬",
    capacidades: ["estoque", "variacoes", "codigoBarras", "entregas", "assistenteIA", "appCliente"],
    modulos: MODULOS_BASE,
    rotuloCatalogo: "Produtos",
    rotuloVendas: "Pedidos",
  },
  restaurante: {
    id: "restaurante",
    nome: "Restaurante",
    descricao: "Mesas, produção, comandas e divisão de conta.",
    emoji: "🍽️",
    capacidades: [
      "cardapio",
      "adicionais",
      "mesas",
      "comandas",
      "cozinha",
      "divisaoConta",
      "assistenteIA",
      "appCliente",
    ],
    modulos: MODULOS_BASE,
    rotuloCatalogo: "Cardápio",
    rotuloVendas: "Pedidos",
  },
  servicos: {
    id: "servicos",
    nome: "Prestador de serviços",
    descricao: "Agenda, duração e profissionais.",
    emoji: "✂️",
    capacidades: ["agenda", "profissionais", "assistenteIA", "appCliente"],
    modulos: MODULOS_BASE,
    rotuloCatalogo: "Serviços",
    rotuloVendas: "Agendamentos",
  },
  distribuidor: {
    id: "distribuidor",
    nome: "Distribuidor",
    descricao: "Pedidos em volume, estoque e entregas programadas.",
    emoji: "🚚",
    capacidades: ["estoque", "codigoBarras", "entregas", "assistenteIA"],
    modulos: MODULOS_BASE,
    rotuloCatalogo: "Produtos",
    rotuloVendas: "Pedidos",
  },
};

export const LISTA_SEGMENTOS = Object.values(SEGMENTOS);

export const ROTULO_CAPACIDADE: Record<Capacidade, string> = {
  estoque: "Controle de estoque",
  codigoBarras: "Código de barras",
  vendaRapida: "Venda rápida",
  cardapio: "Cardápio",
  adicionais: "Adicionais e complementos",
  comandas: "Comandas",
  cozinha: "Fila de cozinha",
  mesas: "Mesas",
  divisaoConta: "Divisão de conta",
  agenda: "Agenda",
  profissionais: "Profissionais",
  variacoes: "Variações",
  entregas: "Entregas",
  pesoVariavel: "Venda por peso",
  assistenteIA: "Assistente conversacional",
  appCliente: "Aplicativo do cliente",
};
