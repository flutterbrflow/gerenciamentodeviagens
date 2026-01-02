# 🌍 Gerenciamento de Viagens

<div align="center">

![Travel Management App](https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200&h=400)

**Aplicativo completo para planejar, organizar e documentar suas viagens**

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

## 📱 Sobre o Projeto

Sistema de gerenciamento de viagens com aplicativo mobile (React Native) e versão web, permitindo planejamento completo de viagens, controle de orçamento, gestão de reservas, criação de itinerários detalhados e galeria de memórias fotográficas.

## ✨ Funcionalidades Principais

### 🏠 Minhas Viagens
- **Visualização Intuitiva**: Cards visuais com fotos, destinos e datas
- **Filtros Inteligentes**: Separa viagens próximas e passadas automaticamente
- **Contadores Dinâmicos**: Número real de fotos salvas em cada viagem
- **Contagem Regressiva**: "Faltam X dias" para viagens próximas

### 📸 Memórias (Galeria de Fotos)
- **Upload Inteligente**: Câmera ou galeria nativa com suporte a EXIF
- **Organização Automática**: Fotos agrupadas por viagem
- **Visualizador Profissional**: Galeria full-screen com navegação por swipe
- **Metadados**: Data automática extraída do EXIF ou da viagem

### 🗺️ Detalhes da Viagem

#### Itinerário
- Timeline interativa com horários e ícones personalizados
- Tipos de eventos: voo, hotel, atividades, restaurantes, transporte e mais
- Edição e exclusão de eventos

#### Reservas
- Gestão de comprovantes (voo, hotel, carro, tours, ingressos)
- Referências e datas de reserva
- Organização por tipo

#### Tarefas
- Checklist interativo (preparação, documentos, malas)
- Marcar tarefas como concluídas
- Adição de tarefas personalizadas

#### Orçamento
- **10 Categorias**: Alimentação, Transporte, Hospedagem, Atividades, Compras, Saúde, Lazer, Emergências, Presentes, Outros
- **Filtros Temporais**: Hoje, Semana, Mês, Todo o Período
- **Gráficos Interativos**: Distribuição por categoria e tendências
- **Alertas Inteligentes**: Notificação ao atingir 80% e 100% do orçamento

### ✏️ Editar Viagem (NOVO - Janeiro 2026)
- **Calendários Modernos**: Seleção de datas Ida e Volta com ícones de avião
- **Labels Externos**: "Ida" e "Volta" posicionados acima dos calendários
- **Foto de Capa**: Seleção e visualização de preview
- **Atualização de Destino e Notas**: Edição completa das informações

### 👤 Perfil
- Upload e gerenciamento de avatar
- Estatísticas de viajante (países, viagens, fotos)
- Configurações de preferências

## 🚀 Tecnologias

### Mobile
- **Framework**: React Native com Expo
- **Linguagem**: TypeScript
- **Navegação**: React Navigation (Stack + Bottom Tabs)
- **Persistência**: AsyncStorage
- **Ícones**: MaterialIcons (@expo/vector-icons)
- **Seletor de Imagens**: expo-image-picker
- **Date Picker**: @react-native-community/datetimepicker

### Web
- Next.js 13+
- TypeScript
- Tailwind CSS

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Expo CLI (instalado globalmente)
- Expo Go app (para testes em dispositivo físico)

## 🛠️ Instalação e Execução

### Mobile

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/gerenciamentodeviagens.git

# Entre na pasta mobile
cd gerenciamentodeviagens/mobile

# Instale as dependências
npm install

# Execute o projeto
npx expo start

# OU com cache limpo
npx expo start --clear
```

### Web

```bash
# Entre na pasta web
cd gerenciamentodeviagens/web

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev
```

## 📂 Estrutura do Projeto

```
mobile/
├── src/
│   ├── screens/           # Telas do aplicativo
│   │   ├── HomeScreen.tsx
│   │   ├── TripDetailsScreen.tsx
│   │   ├── MemoriesScreen.tsx
│   │   ├── NewTripScreen.tsx
│   │   ├── BudgetScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── types.ts           # Definições de tipos TypeScript
│   └── utils/
│       └── storage.ts     # Camada de persistência (AsyncStorage)
├── doc/                   # Documentação completa
│   ├── FEATURES.md
│   ├── CHANGELOG.md
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   └── SETUP.md
├── App.tsx                # Ponto de entrada e navegação
└── package.json
```

## 📚 Documentação Completa

- **[FEATURES.md](mobile/doc/FEATURES.md)** - Detalhamento de todas as funcionalidades
- **[CHANGELOG.md](mobile/doc/CHANGELOG.md)** - Histórico de alterações
- **[ARCHITECTURE.md](mobile/doc/ARCHITECTURE.md)** - Arquitetura técnica
- **[ROADMAP.md](mobile/doc/ROADMAP.md)** - Plano de futuras implementações
- **[SETUP.md](mobile/doc/SETUP.md)** - Guia de configuração detalhado

## 🎯 Roadmap

### Em Desenvolvimento
- [ ] Backend com Supabase
- [ ] Autenticação social (Google, Apple)
- [ ] Sincronização multi-dispositivo

### Próximas Versões
- [ ] Dark Mode
- [ ] Suporte a múltiplas moedas
- [ ] Integração com Google Maps
- [ ] Internacionalização (i18n)
- [ ] Export de itinerários em PDF
- [ ] Compartilhamento de viagens

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👨‍💻 Autor

**Julio Cézar Sousa**

## 🙏 Agradecimentos

- Expo Team pela excelente plataforma
- React Native Community
- Material Icons

---

<div align="center">
Desenvolvido com ❤️ usando React Native e Expo
</div>
