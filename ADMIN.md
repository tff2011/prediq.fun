# Admin Panel - Prediq.fun

## Acesso

- URL: `/admin/login`
- Usuário padrão: `admin`
- Senha padrão: `admin123`

**IMPORTANTE**: Altere a senha após o primeiro login!

## Funcionalidades

### Dashboard
- Estatísticas gerais: total de eventos, eventos ao vivo, mercados, usuários
- Volume total de apostas

### Gestão de Eventos
- Criar novos eventos com informações detalhadas
- Editar eventos existentes
- Definir eventos como "Em destaque"
- Gerenciar status: Upcoming, Live, Ended, Cancelled
- Associar mercados de previsão aos eventos

### Categorias Disponíveis
- Politics (Política)
- Sports (Esportes)
- Crypto (Cripto)
- Economics (Economia)
- Entertainment (Entretenimento)
- Technology (Tecnologia)
- Science (Ciência)
- Other (Outros)

## Desenvolvimento

### Criar novo admin via API
```bash
# Use a rota admin.createInitialAdmin apenas se não houver admins
```

### Executar seed de dados
```bash
npm run db:seed
```

### Estrutura de Segurança
- Autenticação via JWT
- Tokens expiram em 7 dias
- Middleware de proteção nas rotas admin
- Senhas criptografadas com bcrypt

## Notas Técnicas

- Os eventos são atualizados automaticamente de UPCOMING para LIVE baseado na data
- Mercados são criados separadamente e vinculados aos eventos
- O sistema suporta múltiplos níveis de admin: SUPER_ADMIN, ADMIN, MODERATOR