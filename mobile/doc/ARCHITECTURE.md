# Arquitetura do Projeto - Mobile

## Visão Geral
O aplicativo é construído utilizando **React Native** com **Expo** e **TypeScript**. A navegação é gerenciada pelo `React Navigation` (Stack e Bottom Tabs).

## Gerenciamento de Estado e Dados
- **Estado Local**: Usamos `useState` e `useEffect` do React para estados de UI.
- **Persistência de Dados**:
  - Utilizamos `AsyncStorage` para salvar dados localmente no dispositivo.
  - Criamos uma camada de abstração em `src/utils/storage.ts` para padronizar o acesso aos dados.
  - **Entidades Principais**:
    - `TripsStorage`: Gerencia as viagens.
    - `MemoriesStorage`: Gerencia as memórias (fotos e descrições).
    - `ProfileStorage`: Gerencia dados do perfil do usuário e avatar.

## Padrões de Código
- **Telas (`screens/`)**: Cada tela é um componente funcional. A lógica de busca de dados e renderização fica contida na tela ou em hooks.
- **Estilização**: Utilizamos `StyleSheet.create` do React Native para estilos.
- **Navegação**: Definida em `App.tsx`, com tipos em `src/types.ts`.

## Fluxos Principais
1. **Home**: Lista as viagens (futuras e passadas). Recupera avatar do Perfil.
2. **Memórias**: Galeria de fotos com metadados (Data, Viagem). Modal para adição.
3. **Detalhes da Viagem**: Mostra itinerário, reservas e tarefas.
4. **Perfil**: Edição de avatar e estatísticas.
