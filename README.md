# TopPronto Admin Dashboard

Um painel administrativo completo para gerenciar candidaturas de chauffeurs, solicitações de empresas, contatos e ofertas de emprego para a TopPronto.

## Funcionalidades

### 🔐 Autenticação
- Login seguro com Supabase Auth
- Proteção de rotas administrativas
- Gestão de sessões

### 📊 Dashboard
- Visão geral com estatísticas em tempo real
- Cards de métricas principais
- Atividade recente
- Gráficos de performance

### 👥 Gestão de Chauffeurs
- Lista de todas as candidaturas
- Filtros por status (pendente/aprovado/rejeitado)
- Busca por nome, email ou cidade
- Aprovação/rejeição de candidatos
- Exportação para CSV

### 🏢 Gestão de Empresas
- Lista de solicitações empresariais
- Filtros por status (novo/contatado/convertido/rejeitado)
- Atualização de status de relacionamento
- Informações de contato diretas
- Exportação de dados

### 💬 Gestão de Contatos
- Mensagens recebidas através do site
- Marcação como lido/não lido
- Links diretos para resposta por email
- Filtros e busca

### 💼 Ofertas de Emprego
- Criação e gestão de ofertas
- Visualização de candidaturas
- Ativação/desativação de ofertas
- Gestão de status das candidaturas

## Stack Tecnológica

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **State Management:** React Query
- **Forms:** React Hook Form
- **Router:** React Router v6
- **Internacionalização:** i18next
- **Icons:** Lucide React
- **Styling:** Tailwind CSS

## Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
   Preencha com suas credenciais do Supabase.

4. Configure o Supabase:
   - Execute as migrations SQL para criar as tabelas
   - Configure as políticas RLS
   - Crie um usuário admin na tabela `admin_users`

5. Execute o projeto:
   ```bash
   npm run dev
   ```

## Configuração do Supabase

### 1. Executar Migrations
Execute o arquivo `supabase/migrations/create_admin_tables.sql` no SQL Editor do Supabase.

### 2. Criar Usuário Admin
Após executar as migrations, crie um usuário admin:

```sql
-- 1. Primeiro, crie um usuário no Supabase Auth
-- 2. Depois, adicione-o à tabela admin_users
INSERT INTO admin_users (user_id, email, role, is_active)
VALUES ('seu-user-id-do-auth', 'admin@toppronto.com', 'admin', true);
```

### 3. Dados de Teste (Opcional)
Para testar o sistema, você pode inserir alguns dados de exemplo:

```sql
-- Inserir alguns chauffeurs de teste
INSERT INTO drivers (first_name, last_name, email, phone, city, has_vehicle, vehicle_type, experience_years) VALUES
('João', 'Silva', 'joao@email.com', '11999999999', 'São Paulo', true, 'Moto', 3),
('Maria', 'Santos', 'maria@email.com', '11888888888', 'Rio de Janeiro', false, null, 1);

-- Inserir algumas empresas de teste
INSERT INTO enterprises (name, email, phone, contact_person, position, contact_method, city, industry, vehicle_type, monthly_deliveries, order_preference) VALUES
('Empresa XYZ', 'contato@xyz.com', '1133333333', 'Pedro Costa', 'Gerente', 'email', 'São Paulo', 'E-commerce', 'Moto', '100-500', 'aplicativo');
```

## Segurança

- Row Level Security (RLS) habilitado em todas as tabelas
- Políticas de acesso baseadas em usuários admin autenticados
- Validação de entrada de dados
- Proteção contra acesso não autorizado

## Deploy

Para fazer o deploy da aplicação:

1. Build do projeto:
   ```bash
   npm run build
   ```

2. Configure as variáveis de ambiente no serviço de hospedagem

3. Deploy dos arquivos da pasta `dist`

## Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── layout/          # Layout components (Sidebar, Header)
│   ├── stats/           # Components de estatísticas
│   └── ui/              # UI components base
├── hooks/               # Custom hooks
├── lib/                 # Configurações e utilitários
├── pages/               # Páginas da aplicação
├── services/            # API services
└── App.tsx              # Componente principal
```

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.