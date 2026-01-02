# Changelog - Gerenciamento de Viagens

## [Janeiro 2026 - v2.1] - Melhorias de UI/UX e Correções

### ✅ Adicionado

#### Tela Editar Viagem - Redesign de Calendários
- **Labels Externos**: Texto "Ida" e "Volta" movidos para fora dos calendários, alinhados à esquerda
- **Ícones de Avião**: 
  - Calendário Ida: ícone `flight-takeoff` (avião decolando)
  - Calendário Volta: ícone `flight-land` (avião pousando)
- **Estilo Consistente**: Botões de calendário com borda, fundo branco, alinhados com Nova Viagem
- **Removido**: Texto "Datas da Viagem" (limpar interface)

#### Contadores Dinâmicos de Fotos
- **Cálculo Automático**: `mediaCount` agora é calculado dinamicamente a partir das memórias salvas
- **Função `updateTripMediaCounts`**: Conta fotos por destino de viagem ao carregar Home
- **Sincronização**: Contador atualiza automaticamente ao voltar de Memórias
- **Zero Inicial**: Viagens novas começam com 0 fotos (sem números fictícios)

#### Sistema de Despesas - Categorias Expandidas
- **10 Categorias Completas**: 
  - Alimentação (🍽️ restaurant)
  - Transporte (✈️ flight)
  - Hospedagem (🏨 hotel)
  - Atividades (🎭 local-activity)
  - Compras (🛍️ shopping-bag)
  - **NOVO**: Saúde (🏥 local-hospital)
  - **NOVO**: Lazer (🏖️ beach-access)
  - **NOVO**: Emergências (⚠️ warning)
  - **NOVO**: Presentes (🎁 card-giftcard)
  - Outros (💰 attach-money)
- **Modal de Despesas**: Todas as categorias disponíveis para seleção
- **Nomes em Português**: Tradução completa de todas as categorias

#### UI/UX - Melhorias de Alinhamento
- **Botões "+" Tracejados**: Alinhados à direita em:
  - Itinerário
  - Reservas
  - Tarefas
  - Despesas
- **Consistência Visual**: Mesmo estilo de botão em todas as abas

### 🔧 Corrigido

#### Correções de TypeScript
- **ExpenseCategory Type Safety**:
  - Adicionado cast `as ExpenseCategory` em `openExpenseModal`
  - Funções `getCategoryIcon` e `getCategoryName` agora incluem todas as 10 categorias
  - Correção de tipo em exibição de despesas
- **Trip Status Type**:
  - Corrigido filtro de viagens: `'past'` → `'completed'`
  - Alinhado com tipo `'upcoming' | 'ongoing' | 'completed'`

#### Correções de Funcionalidade
- **Edit Trip - Date Pickers**: 
  - Pickers de data agora fecham o outro ao abrir (iOS)
  - Melhor controle de estado `showStartPicker` e `showEndPicker`
- **Home Screen - Data Display**: Corrigido "Em NaN meses" → agora mostra "Em X meses" corretamente
- **Itinerário Vazio**: Removidos cards padrão ("Check-in Hotel", "Passeio Turístico")
- **formatDateRange**: Capitalização de meses para consistência (`"Fev"` em vez de `"fev"`)

### 📝 Documentação
- **README.md**: Completamente reescrito com badges, estrutura clara e todas as funcionalidades
- **FEATURES.md**: Atualizado com novas funcionalidades de janeiro 2026
- **CHANGELOG.md**: Este arquivo, documentando todas as mudanças recentes

---

## [Dezembro 2025] - Sistema de Orçamento Completo

### ✅ Adicionado
- **9 Categorias de Despesas**: Alimentação, Transporte, Hospedagem, Atividades, Compras, Saúde, Lazer, Emergências, Presentes
- **Gráfico de Tendências**: LineChart com dados diários responsivo a f iltros
- **Filtros por Período**: Hoje, Semana, Mês, Todo Período
- **Configuração de Orçamento Global**: Limite total + alertas de 80% e 100%
- **Distribuição por Categoria**: Gráfico de barras com percentagens

---

## [Dezembro 2025] - Memórias (Galeria de Fotos)

### ✅ Adicionado
- **Upload de Fotos**: Câmera ou galeria nativa
- **Leitura de EXIF**: Extração automática de data original da foto
- **Vínculo com Viagem**: Seleção de qual viagem a foto pertence
- **Galeria Full-screen**: Visualizador profissional com swipe
- **Contador de Fotos**: Badge nos cards de viagem (agora dinâmico!)
- **Edit Trip - Foto de Capa**: Modal para alterar foto da viagem existente
- **Edit Trip - Calendário Inline**: Seleção de datas melhorada
- **Placeholder para Viagens sem Foto**: Exibição de "Sem foto de capa" quando viagem não tem imagem
- **Filtro "Passadas" Automático**: Status da viagem calculado automaticamente por data
- **Padronização de Ícones "+"**: Todos os botões de adicionar usam círculo tracejado

### 🔧 Corrigido
- **Home Screen - Contador de Fotos**: Corrigido chave AsyncStorage, contador funciona para todas as viagens

### 🗑️ Removido
- **URL Padrão de Foto**: Removida imagem placeholder da Unsplash
- **Mock Events**: Removido código que criava itinerário padrão

---

## Próximas Melhorias

Ver [ROADMAP.md](./ROADMAP.md) para plano completo.

### Prioridade Alta 🔥
- Backend com Supabase
- Autenticação Social (Google, Apple)
- Sincronização multi-dispositivo

### Prioridade Média 📊
- Dark Mode
- Múltiplas Moedas
- Google Maps Integration
- Internacionalização (i18n)
- Export de itinerários em PDF

### Prioridade Baixa 💡
- Compartilhamento de viagens
- Notificações push
- Widget de tela inicial
- Apple Watch companion app
