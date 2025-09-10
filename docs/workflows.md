# 📋 Workflows Documentation

## 🔄 CI Pipeline (`ci.yml`)

### Triggers
- Push para branches `main` e `develop`
- Pull requests para branch `main`

### Jobs
1. **🔍 Lint** - Verificação de código
2. **🧪 Test** - Execução de testes
3. **🔨 Build** - Build da aplicação
4. **🔒 Security** - Auditoria de segurança

### Artifacts
- Build artifacts com retenção de 30 dias
- Build info JSON com metadados

## 🚀 CD Pipeline (`cd.yml`)

### Triggers
- Push para branch `main` (deploy automático para dev)
- Workflow dispatch manual (staging/production)

### Environments

#### Development
- **Trigger**: Automático (push main)
- **URL**: https://dev.mentoria-ci-cd.com
- **Approval**: Não requerida

#### Staging
- **Trigger**: Manual (workflow dispatch)
- **URL**: https://staging.mentoria-ci-cd.com
- **Approval**: GitHub environment protection

#### Production
- **Trigger**: Manual (workflow dispatch)
- **URL**: https://mentoria-ci-cd.com
- **Approval**: GitHub environment protection
- **Extra**: Security audit obrigatório

## 🌳 Trunk-Based Development (`trunk-based.yml`)

### Objetivo
Enforçar best practices de trunk-based development.

### Features
- Validação de tamanho de PR
- Merge validation rápida
- Guidelines e documentação automática

### Métricas
- Arquivos alterados
- Linhas adicionadas/removidas
- Recomendações automáticas

## 📊 Environment Variables

### Build Time
- `BUILD_ID`: ID único do build
- `COMMIT_SHA`: SHA do commit
- `NODE_ENV`: Ambiente (dev/staging/production)

### Deploy Time
- `DEPLOYED_AT`: Timestamp do deployment
- `GITHUB_ACTOR`: Usuário que executou
- Variáveis específicas do environment

## 🛡️ Security

### Protections
- Branch protection rules
- Environment approvals
- Security audit obrigatório
- Secrets management

### Best Practices
- Nunca commit de secrets
- Audit logs automáticos
- Approval gates para produção