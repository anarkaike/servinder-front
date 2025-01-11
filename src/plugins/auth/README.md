# Auth Plugin

Plugin responsável pelo gerenciamento de autenticação e autorização do sistema.

## Estrutura
```
auth/
├── components/     # Componentes específicos de auth
├── composables/    # Hooks e lógica reutilizável
├── models/        # Modelos de dados
│   ├── user.ts
│   ├── role.ts
│   └── permission.ts
├── services/      # Serviços de negócio
├── store/         # Estado global do plugin
└── types/         # Types e interfaces
```
