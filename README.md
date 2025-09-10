# 🚀 Mentoria CI/CD - Trunk-Based Development

Este projeto demonstra uma configuração completa de CI/CD usando **Trunk-Based Development** com ambientes fake para aprendizado.

## 🎯 Objetivos

- Demonstrar um pipeline CI/CD completo e funcional
- Implementar Trunk-Based Development best practices
- Simular deployments para ambientes fake (dev, staging, production)
- Mostrar automação de deployments baseada em branches

## 🌳 Trunk-Based Development

Este projeto segue o modelo **Trunk-Based Development**:

- **Branch principal**: `main` (trunk)
- **Feature branches**: curtas e mergeadas rapidamente (< 2 dias)
- **Deploy automático**: para ambiente de desenvolvimento a cada push na `main`
- **Deploy manual**: para staging e production via workflow dispatch

## 🏗️ Arquitetura

```
📦 mentoria-ci-cd/
├── 📂 src/                     # Código fonte da aplicação
├── 📂 config/                  # Configurações globais
├── 📂 environments/            # Configurações por ambiente
├── 📂 scripts/                 # Scripts de build e deploy
├── 📂 test/                    # Testes automatizados
├── 📂 .github/workflows/       # GitHub Actions workflows
└── 📂 deployments/            # Registros de deployment (gerado)
```

## 🚀 Ambientes

### 🔧 Development
- **URL**: https://dev.mentoria-ci-cd.com
- **Deploy**: Automático a cada push na `main`
- **Propósito**: Testes contínuos e desenvolvimento

### 🎭 Staging  
- **URL**: https://staging.mentoria-ci-cd.com
- **Deploy**: Manual via workflow dispatch
- **Propósito**: Testes de aceitação e homologação

### 🏭 Production
- **URL**: https://mentoria-ci-cd.com
- **Deploy**: Manual via workflow dispatch (com aprovação)
- **Propósito**: Ambiente de produção

## 🔄 Workflows

### CI Pipeline (`ci.yml`)
Executado em PRs e pushes:
- 🔍 **Lint**: Verificação de código
- 🧪 **Test**: Execução de testes
- 🔨 **Build**: Construção da aplicação
- 🔒 **Security**: Auditoria de segurança

### CD Pipeline (`cd.yml`)
Executado para deployments:
- 🚀 **Deploy Dev**: Automático na `main`
- 🚀 **Deploy Staging**: Manual
- 🚀 **Deploy Production**: Manual com validações extras

### Trunk-Based Workflow (`trunk-based.yml`)
Validações específicas para trunk-based development:
- 📏 **PR Size Check**: Valida tamanho das mudanças
- 🎯 **Merge Validation**: Validação rápida na main
- 🛡️ **Branch Protection**: Diretrizes e best practices

## 🛠️ Como usar

### Instalação
```bash
npm install
```

### Desenvolvimento Local
```bash
# Executar aplicação
npm start

# Executar em modo desenvolvimento
npm run dev

# Executar testes
npm test

# Executar linting
npm run lint

# Build da aplicação
npm run build
```

### Deploy Simulado
```bash
# Deploy para development
npm run deploy:dev

# Deploy para staging
npm run deploy:staging

# Deploy para production
npm run deploy:production
```

## 🔀 Fluxo de Trabalho (Trunk-Based)

1. **Desenvolvimento**:
   ```bash
   git checkout -b feature/nova-funcionalidade
   # Desenvolver mudanças pequenas
   git commit -m "feat: adiciona nova funcionalidade"
   git push origin feature/nova-funcionalidade
   ```

2. **Pull Request**:
   - Criar PR para `main`
   - CI executará automaticamente
   - Revisar e mergear rapidamente

3. **Deploy Automático**:
   - Merge na `main` → Deploy automático para dev
   - Verificar funcionamento no ambiente de dev

4. **Promoção Manual**:
   - Executar workflow manual para staging
   - Testar em staging
   - Executar workflow manual para production

## 📊 Monitoramento

### Build Info
Cada build gera informações detalhadas:
```json
{
  "buildId": "build-1234567890",
  "commitSha": "abc123...",
  "buildTime": "2024-01-01T12:00:00Z",
  "environment": "production",
  "version": "1.0.0"
}
```

### Deployment Records
Cada deployment é registrado:
```json
{
  "environment": "production",
  "buildId": "build-1234567890",
  "deployedAt": "2024-01-01T12:05:00Z",
  "deployedBy": "usuario",
  "status": "success"
}
```

## 🎯 Best Practices Implementadas

### Trunk-Based Development
- ✅ Branch `main` sempre deployable
- ✅ Feature branches pequenas (< 2 dias)
- ✅ Merges frequentes
- ✅ Deploy automático para dev
- ✅ Feature flags (simulado)

### CI/CD
- ✅ Testes automatizados
- ✅ Build artifacts
- ✅ Deploy automático
- ✅ Aprovação manual para produção
- ✅ Health checks
- ✅ Rollback simulation

### Segurança
- ✅ Security audit
- ✅ Environment separation
- ✅ Approval gates
- ✅ Build provenance

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Mantenha mudanças pequenas e focadas
4. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
5. Push para a branch (`git push origin feature/AmazingFeature`)
6. Abra um Pull Request

## 📝 Licença

Este projeto é licenciado sob a Licença ISC - veja o arquivo LICENSE para detalhes.

## 🚀 Próximos Passos

- [ ] Implementar feature flags reais
- [ ] Adicionar métricas e observabilidade
- [ ] Implementar testes de integração
- [ ] Adicionar notificações (Slack, Discord)
- [ ] Implementar rollback automático
- [ ] Adicionar testes de performance