# Changelog - Gerenciamento de Viagens

## [Janeiro 2026] - Melhorias de UI/UX

### ✅ Adicionado
- **Edit Trip - Foto de Capa**: Modal para alterar foto da viagem existente
- **Placeholder para Viagens sem Foto**: Exibição de "Sem foto de capa" quando viagem não tem imagem
- **Filtro "Passadas" Automático**: Status da viagem calculado automaticamente por data
- **Padronização de Ícones "+"**: Todos os botões de adicionar (Evento, Reserva, Tarefa, Despesa) agora usam círculo tracejado com ícone MaterialIcons

### 🔧 Corrigido
- **Home Screen - Data Display**: Corrigido "Em NaN meses" → agora mostra "Em X meses" corretamente
- **Home Screen - Contador de Fotos**: Corrigido chave AsyncStorage, contador funciona para todas as viagens
- **Itinerário Vazio**: Removidos cards padrão ("Check-in Hotel", "Passeio Turístico")
- **formatDateRange**: Capitalização de meses para consistência (`"Fev"` em vez de `"fev"`)

### 🗑️ Removido
- **URL Padrão de Foto**: Removida imagem placeholder da Unsplash
- **Mock Events**: Removido código que criava itinerário padrão

---

## [Dezembro 2025] - Sistema de Orçamento Completo

### ✅ Adicionado
- **9 Categorias de Despesas**: Alimentação, Transporte, Hospedagem, Atividades, Compras, Saúde, Lazer, Emergências, Presentes
- **Gráfico de Tendências**: LineChart com dados diários responsivo a filtros
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
- **Contador de Fotos**: Badge nos cards de viagem

---

## Próximas Melhorias

Ver [ROADMAP.md](./ROADMAP.md) para plano completo.

### Prioridade Alta
- Calendário Modal no Edit Trip
- Backend com Supabase
- Autenticação Social

### Prioridade Média
- Dark Mode
- Múltiplas Moedas
- Google Maps Integration
- Internacionalização (i18n)
