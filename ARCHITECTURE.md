# Arquitetura do Projeto

## Estrutura de Pastas

```
src/
├── assets/           # Arquivos estáticos (imagens, fontes, etc)
├── boot/            # Inicializadores do Quasar
├── components/      # Componentes Vue reutilizáveis
├── composables/     # Composables Vue
├── core/           # Núcleo da aplicação
│   ├── database/   # Configuração e entidades do banco
│   ├── middleware/ # Middlewares globais
│   ├── services/   # Serviços base
│   ├── types/      # Tipos e interfaces globais
│   └── utils/      # Funções utilitárias
├── i18n/           # Internacionalização
├── layouts/        # Layouts do Quasar
├── pages/          # Páginas da aplicação
├── plugins/        # Plugins Vue/Quasar
├── router/         # Configuração de rotas
├── stores/         # Stores Pinia
└── types/          # Tipos específicos da aplicação
```

## Camadas

1. **Core**: Contém a lógica central e reutilizável do sistema
2. **Features**: Implementadas através das pastas pages e components
3. **Data**: Gerenciada através do core/database e stores
4. **Presentation**: Implementada nas pastas layouts, pages e components
5. **Infrastructure**: Presente em core/services e plugins

## Padrões

- Singleton para serviços globais
- Repository pattern para acesso a dados
- Middleware pattern para cross-cutting concerns
- Composables para lógica reutilizável de componentes
