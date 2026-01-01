# Funcionalidades (Features) - Mobile

## 1. Minhas Viagens (Home)
- Listagem de viagens "Próximas" e "Passadas".
- Cards com foto de capa, destino e contagem regressiva.
- Acesso rápido para criar nova viagem.
- Visualização do Avatar do usuário (sincronizado com Perfil).

## 2. Memórias (Galeria)
- Visualização em grid das fotos adicionadas.
- **Adicionar Memória**:
  - Seleção da galeria nativa.
  - **Extração de EXIF**: Tenta identificar a data original da foto.
  - **Vínculo com Viagem**: Permite selecionar a qual viagem a foto pertence.
  - Fallback inteligente de datas (EXIF > Viagem > Hoje).

## 3. Detalhes da Viagem
- **Itinerário**: Linha do tempo com eventos (voo, hotel, passeios).
- **Reservas**: Lista de comprovantes e reservas.
- **Tarefas**: Checklist interativo (Check-in, Malas, etc).
- **Editar Viagem** (✅ Janeiro 2026):
  - Alterar destino e notas
  - **Foto de Capa**: Seletor modal de imagem
  - Visualização de preview instantâneo
- **Orçamento** (✅ Completo):
  - 9 categorias padrão + customizadas
  - Gráfico de tendências temporais
  - Filtros por período (Hoje, Semana, Mês, Todos)
  - Configuração de limite e alertas
  - Edição e exclusão de despesas

## 📸 Memórias (Memories)
- **Upload de fotos:** Câmera ou galeria
- **Agrupamento inteligente:** Fotos organizadas por viagem
- **Trip cards:** Cards com foto de capa e contador
- **Full-screen viewer:** Visualizador profissional com swipe
- **Galeria filtrada:** Exibe apenas fotos da viagem selecionada
- **EXIF reading:** Leitura automática de data/localização

---

Status: ✅ Em produção

## 4. Perfil
- Upload e persistência de foto de avatar.
- Estatísticas de viajante (Países, Viagens, Fotos).
- Configurações de preferências (Notificações, Tema - UI apenas).
