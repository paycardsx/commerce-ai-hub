/**
 * Entidades centrais do CommerceAI OS.
 * Tudo é multiempresa: toda entidade operacional carrega `empresaId`.
 */

export type Segmento =
  | "mercadinho"
  | "lanchonete"
  | "loja"
  | "restaurante"
  | "servicos"
  | "distribuidor";

export type Capacidade =
  | "estoque"
  | "codigoBarras"
  | "vendaRapida"
  | "cardapio"
  | "adicionais"
  | "comandas"
  | "cozinha"
  | "mesas"
  | "divisaoConta"
  | "agenda"
  | "profissionais"
  | "variacoes"
  | "entregas"
  | "pesoVariavel"
  | "assistenteIA"
  | "appCliente";

export type Modulo =
  | "painel"
  | "catalogo"
  | "clientes"
  | "vendas"
  | "pdv"
  | "equipe"
  | "unidades"
  | "integracoes"
  | "assistente"
  | "configuracoes"
  | "auditoria";

export type Permissao =
  | "ver_painel"
  | "gerir_catalogo"
  | "gerir_clientes"
  | "operar_pdv"
  | "gerir_vendas"
  | "gerir_equipe"
  | "gerir_configuracoes"
  | "ver_auditoria"
  | "aplicar_desconto";

export type Funcao = "proprietario" | "gerente" | "operador" | "atendente" | "cozinha";

export interface Branding {
  nomeExibicao: string;
  slogan: string;
  corPrimaria: string; // hex — convertido para token em runtime
  corDestaque: string;
  iniciais: string;
}

export interface PersonaIA {
  nome: string;
  tom: "amigavel" | "profissional" | "direto" | "regional";
  saudacao: string;
  ativa: boolean;
}

export interface Empresa {
  id: string;
  nome: string;
  documento: string;
  segmento: Segmento;
  branding: Branding;
  capacidades: Capacidade[];
  modulos: Modulo[];
  personaIA: PersonaIA;
  criadaEm: string;
}

export interface Unidade {
  id: string;
  empresaId: string;
  nome: string;
  cidade: string;
  endereco: string;
  tipo: "matriz" | "filial" | "quiosque";
  ativa: boolean;
}

export interface Usuario {
  id: string;
  empresaId: string;
  nome: string;
  email: string;
  funcao: Funcao;
  unidadeId: string;
  ativo: boolean;
}

export type TipoItem = "produto" | "servico" | "cardapio" | "combo";
export type BasePreco = "unidade" | "peso" | "duracao" | "pacote";

export interface VariacaoItem {
  id: string;
  nome: string;
  precoExtra: number;
}

export interface AdicionalItem {
  id: string;
  nome: string;
  preco: number;
}

export interface ItemCatalogo {
  id: string;
  empresaId: string;
  nome: string;
  descricao: string;
  categoria: string;
  tipo: TipoItem;
  basePreco: BasePreco;
  preco: number;
  unidadeMedida?: string;
  codigoBarras?: string;
  estoque?: number;
  estoqueMinimo?: number;
  duracaoMinutos?: number;
  variacoes: VariacaoItem[];
  adicionais: AdicionalItem[];
  observacoesPermitidas: boolean;
  ativo: boolean;
}

export interface Cliente {
  id: string;
  empresaId: string;
  nome: string;
  telefone: string;
  email?: string;
  desde: string;
  totalGasto: number;
  pedidos: number;
  preferencias: string[];
  consentimentoMemoria: boolean;
  vip: boolean;
}

export type CanalPedido = "pdv" | "app" | "balcao" | "mesa" | "entrega" | "telefone";
export type StatusPedido =
  | "aberto"
  | "em_producao"
  | "pronto"
  | "em_entrega"
  | "concluido"
  | "cancelado";

export interface ItemPedido {
  itemId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  adicionais?: string[];
  observacao?: string;
}

export interface Pedido {
  id: string;
  empresaId: string;
  unidadeId: string;
  numero: number;
  clienteId?: string;
  clienteNome: string;
  canal: CanalPedido;
  status: StatusPedido;
  itens: ItemPedido[];
  desconto: number;
  total: number;
  pagamento: "dinheiro" | "cartao" | "pix" | "pendente";
  criadoEm: string;
  mesa?: string;
}

export interface Integracao {
  id: string;
  empresaId: string;
  nome: string;
  categoria: "pagamentos" | "fiscal" | "entregas" | "mensagens" | "dispositivos" | "servicos";
  descricao: string;
  conectada: boolean;
}

export interface RegistroAuditoria {
  id: string;
  empresaId: string;
  usuario: string;
  acao: string;
  detalhe: string;
  em: string;
}

export interface MensagemIA {
  id: string;
  autor: "cliente" | "assistente";
  texto: string;
  em: string;
}
