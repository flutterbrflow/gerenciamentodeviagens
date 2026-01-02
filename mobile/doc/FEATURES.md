# Funcionalidades (Features) - Mobile

## 🏠 1. Minhas Viagens (Home)

### Visualização de Viagens
- **Tabs Inteligentes**: "Próximas" e "Passadas" com filtro automático por status
- **Cards Visuais**: Foto de capa, destino, datas e contador de fotos
- **Contagem Regressiva**: "Faltam X dias" calculado dinamicamente
- **Contador de Fotos Dinâmico**: `mediaCount` atualizado automaticamente com base em memórias salvas
- **Avatar do Usuário**: Sincronizado com tela de Perfil
- **Botão Flutuante**: Acesso rápido para criar nova viagem

### Recursos Técnicos
- **useFocusEffect**: Recarrega dados ao retornar para a tela
- **AsyncStorage**: Persistência local de viagens
- **Auto-refresh**: Contador de fotos atualiza após adicionar memórias

---

## 📸 2. Memórias (Galeria de Fotos)

### Upload e Organização
- **Seleção de Fotos**: Galeria nativa com `expo-image-picker`
- **Leitura de EXIF**: Extração automática de:
  - Data original da foto (`DateTimeOriginal`)
  - Metadados de localização (futura)
- **Vínculo com Viagem**: Seleção opcional de qual viagem a foto pertence
- **Fallback Inteligente de Datas**:
  1. Data EXIF (se disponível)
  2. Data da viagem (se vinculada)
  3. Data atual

### Visualização
- **Grid de Trips**: Cards com foto de capa e contador de fotos
- **Agrupamento**: Fotos organizadas automaticamente por viagem
- **Viewer Full-screen**: 
  - Navegação por swipe horizontal
  - Contador "X / Total"
  - Overlay com nome da viagem e data
  - Botão de fechar

### Recursos Técnicos
- `FlatList` com `pagingEnabled` para performance
- `Dimensions` para responsividade
- `MemoriesStorage` para persistência

---

## 🗺️ 3. Detalhes da Viagem

Tela principal com 4 abas: **Itinerário**, **Reservas**, **Tarefas**, **Despesas**.

### ✏️ Editar Viagem (NOVA UI - Janeiro 2026)

#### Calendários de Data
- **Labels Externos**: "Ida" e "Volta" posicionados acima dos calendários
- **Ícones de Avião**:
  - `flight-takeoff` (🛫) no calendário de Ida
  - `flight-land` (🛬) no calendário de Volta
- **Design Consistente**: Alinhado com tela Nova Viagem
- **Validação**: Data de volta não pode ser anterior à data de ida
- **DateTimePicker**: Modal iOS / Inline Android

#### Outras Edições
- **Destino**: Campo de texto editável
- **Foto de Capa**: Modal de seleção com preview
- **Notas**: TextArea multiline

### 📋 Itinerário

- **Timeline de Eventos**: Ordenados por horário
- **12 Tipos de Ícones**:
  - Voo (✈️), Hotel (🏨), Atividade (🎭), Restaurante (🍽️)
  - Transporte (🚌), Lazer (🏖️), Compras (🛍️), Museu (🏛️)
  - Café (☕), Bar (🍺), Igreja (⛪), Parque (🌳)
- **Botão "+" Alinhado à Direita**: Design tracejado
- **Campos**: Horário, título, descrição, tipo
- **Ações**: Editar, excluir

### 🎫 Reservas

- **6 Tipos de Reserva**:
  - Voo, Hotel, Aluguel de carro, Passeio, Ingresso, Outro
- **Informações**: Fornecedor, data, código de reserva
- **Botão "+" Alinhado à Direita**
- **Persistência**: `BookingsStorage`

### ✅ Tarefas

- **Checklist Interativo**: Marcar/desmarcar tarefas
- **Estados Visuais**: Texto riscado quando completo
- **Botão "+" Alinhado à Direita**
- **Campos**: Texto da tarefa
- **Persistência**: `TasksStorage`

### 💰 Despesas (Orçamento) - COMPLETO

#### Categorias (10 Total)
1. **Alimentação** (🍽️) - `restaurant`
2. **Transporte** (✈️) - `flight`
3. **Hospedagem** (🏨) - `hotel`
4. **Atividades** (🎭) - `local-activity`
5. **Compras** (🛍️) - `shopping-bag`
6. **Saúde** (🏥) - `local-hospital`
7. **Lazer** (🏖️) - `beach-access`
8. **Emergências** (⚠️) - `warning`
9. **Presentes** (🎁) - `card-giftcard`
10. **Outros** (💰) - `attach-money`

#### Recursos
- **Filtros Temporais**: Hoje, Semana, Mês, Todo o Período
- **Gráfico de Tendências**: LineChart filtrado por período
- **Distribuição por Categoria**: Gráfico de barras horizontal
- **Saldo Global**: Total gasto vs. orçamento
- **Alertas**: 80% e 100% do orçamento
- **CRUD Completo**: Adicionar, editar, excluir despesas
- **Botão "+" Alinhado à Direita**

#### Campos de Despesa
- Descrição
- Valor (R$)
- Categoria (10 opções)
- Data (gerada automaticamente)

---

## 👤 4. Perfil

### Personalização
- **Avatar**: Upload de foto com `ImagePicker`
- **Persistência**: Salvo em `ProfileStorage`
- **Sincronização**: Avatar aparece na Home

### Estatísticas (Visual)
- **Países Visitados**: Contador
- **Viagens Realizadas**: Total
- **Fotos Compartilhadas**: Total de memórias

### Configurações (UI)
- **Notificações**: Toggle (visual apenas)
- **Tema**: Opção de Dark Mode (visual apenas)

---

## 🆕 5. Nova Viagem (Create Trip)

### Formulário Completo
- **Foto de Capa**: Seleção opcional com preview
- **Destino**: Campo de texto (Ex: "Paris, França")
- **Datas** (Novo Design):
  - **Calendário Ida**: `flight-takeoff` icon, label "Ida" acima
  - **Calendário Volta**: `flight-land` icon, label "Volta" acima
  - **Validação**: Volta não pode ser antes da Ida
- **Notas**: TextArea para descrição

### Recursos
- **Auto-ajuste**: Se Ida > Volta, ajusta Volta para Ida + 1 dia
- **DateTimePicker**: Modal iOS com botões Cancelar/Confirmar
- **Persistência**: Salvo em `TripsStorage`

---

## 🔧 Recursos Técnicos Gerais

### Armazenamento
- **TripsStorage**: Gerencia viagens
- **MemoriesStorage**: Gerencia fotos e vínculos
- **TasksStorage**: Gerencia tarefas
- **BookingsStorage**: Gerencia reservas
- **ExpensesStorage**: Gerencia despesas
- **ProfileStorage**: Gerencia perfil e avatar

### UI/UX
- **MaterialIcons**: Ícones consistentes
- **TypeScript**: Type safety completo
- **Validações**: Campos obrigatórios e datas lógicas
- **Feedback Visual**: Loading states, empty states
- **Navegação**: Stack + Bottom Tabs

### Performance
- **useFocusEffect**: Recarrega dados apenas quando necessário
- **FlatList**: Listas otimizadas
- **AsyncStorage**: Persistência rápida e local

---

**Status**: ✅ Em Produção - v2.1 (Janeiro 2026)
