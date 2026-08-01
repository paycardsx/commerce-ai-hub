## CommerceAI OS — Fase 1 (protótipo web responsivo, dados simulados)

Arquivos de referência já salvos no projeto em `docs/referencias/`:
- `Manual_Mestre_CommerceAI_OS.pdf`
- `identidade-visual-zxpdv.png`

### 1. Princípios da arquitetura
- **Multiempresa**: todo dado carrega `empresaId`; nada é lido sem o contexto da empresa ativa.
- **Multissegmento**: segmento não cria código novo — ativa **capacidades** (`estoque`, `codigoBarras`, `cardapio`, `adicionais`, `comandas`, `cozinha`, `mesas`, `agenda`, `profissionais`, `variacoes`, `entregas`, `pesoVariavel`, `divisaoConta`).
- **White label**: nome, logo, cores e personalidade da IA vêm da empresa e são aplicados via tokens CSS em runtime.
- **IA opcional**: PDV, catálogo, vendas e pedidos funcionam integralmente com a IA desligada.
- **Preparado para desktop/dispositivos**: camada de dados isolada atrás de repositórios (`src/data/*`), hoje simulados, depois trocáveis por backend/Cloud sem tocar nas telas.

### 2. Módulos (pastas por responsabilidade)
```text
src/
  core/        contexto de empresa, permissões, capacidades, auditoria
  branding/    tema white label, logo, tokens dinâmicos
  modules/
    onboarding/  catalogo/  clientes/  vendas/  pdv/
    equipe/      unidades/  integracoes/  configuracoes/
    assistente/  app-cliente/
  data/        entidades, seeds (mercadinho e lanchonete), repositórios simulados
  components/  UI reutilizável (KPI, DataTable, EmptyState, ModuleGuard...)
```

### 3. Telas da Fase 1
| Rota | Tela |
|---|---|
| `/` | Apresentação do produto |
| `/entrar`, `/recuperar` | Login e recuperação |
| `/cadastro` | Nova empresa → segmento → unidades → usuários (wizard) |
| `/app` | Painel principal (KPIs adaptados ao segmento) |
| `/app/catalogo` | Catálogo adaptável (produto, serviço, cardápio, combo, variações, adicionais) |
| `/app/clientes` | Clientes, histórico e preferências |
| `/app/vendas` | Vendas e pedidos (status por segmento) |
| `/app/pdv` | Protótipo de PDV (busca, carrinho, desconto, pagamento simulado, comprovante) |
| `/app/equipe` | Usuários, funções e permissões |
| `/app/unidades` | Filiais |
| `/app/integracoes` | Central de integrações (cards de conexão simulados) |
| `/app/configuracoes` | White label: nome, logo, cores, personalidade da IA, módulos on/off |
| `/app/assistente` | Assistente conversacional (demo baseada no catálogo real) |
| `/app/auditoria` | Registro de ações importantes |
| `/loja` | Aplicativo do cliente com a marca da empresa (catálogo, pedido, chat, pedidos) |

### 4. Entidades principais
`Empresa` (segmento, branding, capacidades, personaIA) · `Unidade` · `Usuario` + `Funcao`/`Permissao` · `ItemCatalogo` (tipo, precificação por unidade/peso/duração, `variacoes[]`, `adicionais[]`, `estoque?`, `codigoBarras?`, `duracao?`) · `Categoria` · `Cliente` (preferências, consentimento) · `Pedido`/`Venda` (itens, canal, status, pagamento simulado) · `Mesa`/`Comanda` · `Integracao` · `RegistroAuditoria` · `ConversaIA`.

### 5. Design
Direção visual inspirada na identidade enviada: base grafite/preto (#111317, #1F2328) com laranja de ação (#FF8A00), tipografia Poppins (títulos) + Inter (texto), tudo em tokens semânticos no design system — trocáveis por empresa no white label.

### 6. Fora desta fase
Sem GitHub, sem desktop, sem dinheiro real, sem fiscal definitivo, sem backend real (dados simulados nesta etapa; Lovable Cloud entra na fase seguinte para persistência e login reais).

### 7. Entrega
Duas empresas demo prontas: **Mercadinho Bom Preço** (estoque, código de barras, venda rápida) e **Lanchonete Sabor & Cia** (cardápio, adicionais, comandas, cozinha) — mostrando módulos diferentes conforme o segmento.

Aprovando, começo pelo design system + navegação + dados demo, depois as telas na ordem acima.