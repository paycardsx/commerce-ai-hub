import type { Empresa, ItemCatalogo } from "@/core/types";

/**
 * Motor de demonstração da assistente. Responde apenas com dados reais do
 * catálogo da empresa ativa: nunca promete preço ou disponibilidade que não
 * exista. Não é IA de produção — é a base da conversa da Fase 1.
 */

const normalizar = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export interface RespostaAssistente {
  texto: string;
  itens: ItemCatalogo[];
}

export function responder(
  pergunta: string,
  empresa: Empresa,
  catalogo: ItemCatalogo[],
): RespostaAssistente {
  const q = normalizar(pergunta);
  const persona = empresa.personaIA.nome;
  const ativos = catalogo.filter((i) => i.ativo);

  const encontrados = ativos.filter((i) => {
    const alvo = normalizar(`${i.nome} ${i.categoria} ${i.descricao}`);
    return q
      .split(/\s+/)
      .filter((p) => p.length > 2)
      .some((p) => alvo.includes(p));
  });

  if (/humano|atendente|pessoa|gerente|reclama/.test(q)) {
    return {
      texto: `Claro. Vou encaminhar você para um atendente humano do ${empresa.branding.nomeExibicao}. Enquanto isso, posso deixar registrado o que você precisa.`,
      itens: [],
    };
  }

  if (/oi|ola|bom dia|boa tarde|boa noite|tudo bem/.test(q) && q.length < 30) {
    return { texto: empresa.personaIA.saudacao, itens: [] };
  }

  if (/lista|pedido|monta|carrinho|orcamento/.test(q)) {
    const sugestao = encontrados.length ? encontrados : ativos.slice(0, 3);
    return {
      texto: `Posso montar isso com você. Separei ${sugestao.length} ${sugestao.length === 1 ? "item" : "itens"} do nosso catálogo com preço e disponibilidade confirmados. Quer que eu adicione tudo ou prefere ajustar?`,
      itens: sugestao.slice(0, 5),
    };
  }

  if (encontrados.length > 0) {
    const primeiro = encontrados[0]!;
    const disponibilidade =
      primeiro.estoque === undefined
        ? "disponível agora"
        : primeiro.estoque > 0
          ? `${primeiro.estoque} em estoque`
          : "sem estoque no momento";
    return {
      texto: `Temos sim: ${primeiro.nome} sai por ${primeiro.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} (${disponibilidade}). ${encontrados.length > 1 ? "Também encontrei outras opções parecidas." : "Quer que eu adicione ao pedido?"}`,
      itens: encontrados.slice(0, 5),
    };
  }

  return {
    texto: `Não encontrei isso no catálogo do ${empresa.branding.nomeExibicao}, então prefiro não prometer. Posso procurar por outro nome, sugerir alternativas parecidas ou chamar um atendente. — ${persona}`,
    itens: ativos.slice(0, 3),
  };
}

export const SUGESTOES_PADRAO = [
  "O que vocês têm hoje?",
  "Quero montar um pedido",
  "Tem alguma opção mais barata?",
  "Quero falar com um atendente",
];
