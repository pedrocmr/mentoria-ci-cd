# 🚀 Mentoria CI/CD - Trunk-Based Development com Feature Flags

Este projeto demonstra uma configuração completa de CI/CD usando **Trunk-Based Development** com **Feature Flags** para permitir que equipes grandes trabalhem usando apenas a branch principal.

## 🎯 Objetivos

- Demonstrar um pipeline CI/CD completo e funcional
- Implementar Trunk-Based Development best practices
- **Sistema de Feature Flags** para desenvolvimento em equipe
- Simular deployments para ambientes fake (dev, staging, production)
- Mostrar como múltiplas equipes podem trabalhar na branch principal simultaneamente

## 🚩 Sistema de Feature Flags

### Por que Feature Flags?

As **Feature Flags** revolucionam o desenvolvimento trunk-based ao permitir:

- ✅ **Múltiplas equipes** trabalhando simultaneamente na `main`
- ✅ **Deploy seguro** de features não finalizadas
- ✅ **Rollout gradual** com percentuais configuráveis
- ✅ **Controle por equipe** durante o desenvolvimento
- ✅ **Emergency toggles** para desabilitar features rapidamente

### Tipos de Feature Flags Suportados

1. **Flags Booleanas**: `true`/`false` simples
2. **Flags por Percentual**: `30` (30% dos usuários)
3. **Flags por Equipe**: Diferentes equipes veem diferentes features
4. **Flags por Ambiente**: Configurações específicas por ambiente
5. **Flags Complexas**: Combinação de percentual + equipe + ambiente

### Exemplo de Configuração

```javascript
// environments/development.js
features: {
  // Equipe Frontend trabalhando na nova dashboard
  newDashboard: {
    teams: { frontend: true, qa: true }
  },
  
  // Equipe Backend trabalhando no sistema de pagamento
  newPaymentGateway: {
    teams: { backend: true, qa: true }
  },
  
  // Feature com rollout gradual
  aiRecommendations: {
    default: false,
    percentage: 10,  // 10% dos usuários
    teams: {
      datascience: true  // Equipe de dados sempre vê
    }
  }
}
```

## 🌳 Trunk-Based Development

Este projeto segue o modelo **Trunk-Based Development** com feature flags:

- **Branch principal**: `main` (trunk) - sempre deployable
- **Feature branches**: curtas e mergeadas rapidamente (< 2 dias)
- **Features protegidas**: por flags durante desenvolvimento
- **Deploy contínuo**: diário sem medo de quebrar produção
- **Rollout controlado**: features ativadas gradualmente

## 🏗️ Arquitetura

```
📦 mentoria-ci-cd/
├── 📂 src/                     # Código fonte da aplicação
│   ├── 🚩 featureFlags.js      # Serviço de feature flags
│   ├── 🛠️ featureFlagMiddleware.js # Middleware e helpers
│   └── 🌐 index.js            # Aplicação principal com APIs
├── 📂 config/                  # Configurações globais
├── 📂 environments/            # Configurações por ambiente (com flags)
├── 📂 examples/                # Simulações de desenvolvimento em equipe
├── 📂 scripts/                 # Scripts de build e deploy
├── 📂 test/                    # Testes automatizados + feature flags
├── 📂 docs/                    # Documentação detalhada
├── 📂 .github/workflows/       # GitHub Actions workflows
└── 📂 deployments/            # Registros de deployment (gerado)
```

## 🚀 Ambientes e Feature Flags

### 🔧 Development
- **URL**: https://dev.mentoria-ci-cd.com
- **Deploy**: Automático a cada push na `main`  
- **Features**: Habilitadas por equipe para desenvolvimento paralelo
- **Propósito**: Testes contínuos e desenvolvimento colaborativo

### 🎭 Staging  
- **URL**: https://staging.mentoria-ci-cd.com
- **Deploy**: Manual via workflow dispatch
- **Features**: Maioria habilitada para testes completos
- **Propósito**: Validação final antes da produção

### 🏭 Production
- **URL**: https://mentoria-ci-cd.com
- **Deploy**: Manual via workflow dispatch (com aprovação)
- **Features**: Rollout conservador e gradual
- **Propósito**: Ambiente de produção com máxima estabilidade

## 🛠️ Como usar

### Instalação
```bash
npm install
```

### Desenvolvimento Local
```bash
# Executar aplicação
npm start

# Executar testes (incluindo feature flags)
npm test

# Executar apenas testes de feature flags
npm run test:features

# Simular desenvolvimento em equipe
npm run simulate:teams

# Executar linting
npm run lint

# Build da aplicação
npm run build
```

### APIs de Feature Flags

```bash
# Ver aplicação com feature flags
curl "http://localhost:3000/?team=frontend&userId=user123"

# Listar todas as feature flags
curl "http://localhost:3000/api/features?team=backend"

# Verificar flag específica
curl "http://localhost:3000/api/features/check?flag=newDashboard&team=qa"

# Ver metadados do sistema
curl "http://localhost:3000/api/features/metadata"
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

## 👥 Fluxo de Trabalho - Equipes Grandes

### Cenário: 5 Equipes Trabalhando Simultaneamente

```bash
# 🌳 Trunk-Based Development Simulation
npm run simulate:teams
```

**Equipes exemplo**:
- **Frontend Team**: Nova interface de usuário
- **Backend Team**: Sistema de pagamentos
- **Mobile Team**: APIs mobile e notificações
- **Data Science Team**: Sistema de recomendações IA
- **QA Team**: Testa todas as features

### Fluxo Diário

1. **📅 Segunda**: Todas as equipes fazem push na `main`
   - Features protegidas por flags
   - CI/CD roda mas features ficam invisíveis

2. **📅 Terça**: Frontend completa feature
   - Flag atualizada para incluir QA: `{ teams: { frontend: true, qa: true } }`
   - QA pode testar imediatamente

3. **📅 Quarta**: Backend precisa de testes de integração
   - Flag habilitada para todos: `newPaymentGateway: true`
   - Toda a equipe pode testar integração

4. **📅 Quinta**: Deploy para staging
   - Features promovidas com rollout maior
   - QA faz testes finais

5. **📅 Sexta**: Deploy para produção
   - Rollout conservador: `aiRecommendations: 5` (5% dos usuários)
   - Monitoramento e aumento gradual

## 🚩 Exemplos de Uso das Feature Flags

### No Código da Aplicação

```javascript
const { TeamFeatureGate } = require('./src/featureFlagMiddleware.js');

// Feature específica por equipe
const frontendGate = new TeamFeatureGate(featureFlagService, 'frontend');

if (frontendGate.isEnabled('newDashboard')) {
  // Renderizar nova dashboard
  return renderNewDashboard();
} else {
  // Manter dashboard atual
  return renderOldDashboard();
}

// Feature com percentual
if (featureFlagService.isEnabled('experimentalSearch', { userId: req.user.id })) {
  // 30% dos usuários veem busca experimental
  return new ExperimentalSearchService();
}
```

### Emergency Toggle

```javascript
// 🚨 Emergência: Desabilitar feature problemática
featureFlagService.setRuntimeOverride('problematicFeature', false);
// Feature desabilitada instantaneamente sem redeploy!
```

## 🔄 Workflows com Feature Flags

### CI Pipeline (`ci.yml`)
- 🔍 **Lint**: Verificação de código
- 🧪 **Test**: Testes incluindo cenários com flags habilitadas/desabilitadas
- 🔨 **Build**: Construção da aplicação
- 🔒 **Security**: Auditoria de segurança
- 🚩 **Feature Flag Tests**: Validação do sistema de flags

### CD Pipeline (`cd.yml`)  
- 🚀 **Deploy Dev**: Automático na `main` com flags por equipe
- 🚀 **Deploy Staging**: Manual com flags habilitadas para QA
- 🚀 **Deploy Production**: Manual com rollout gradual controlado

### Trunk-Based Workflow (`trunk-based.yml`)
- 📏 **PR Size Check**: Valida tamanho das mudanças (trunk-based style)
- 🎯 **Merge Validation**: Validação rápida na main
- 🚩 **Feature Flag Validation**: Verifica configuração de flags
- 🛡️ **Branch Protection**: Diretrizes e best practices

## 📊 Monitoramento e Observabilidade

### Feature Flag Metadata
```json
{
  "environment": "production",
  "totalFlags": 15,
  "runtimeOverrides": 2,
  "enabledFeatures": ["newDashboard", "paymentValidation"],
  "rolloutStatus": {
    "experimentalSearch": "5% rollout",
    "aiRecommendations": "disabled"
  }
}
```

### Deployment com Feature Flags
```json
{
  "buildId": "build-1234567890",
  "commitSha": "abc123...",
  "environment": "production",
  "featureFlags": {
    "newDashboard": { "enabled": false, "reason": "waiting_validation" },
    "paymentValidation": { "enabled": true, "rollout": "100%" }
  }
}
```

## 🎯 Best Practices Implementadas

### Trunk-Based Development + Feature Flags
- ✅ Branch `main` sempre deployable
- ✅ Feature branches pequenas (< 2 dias)  
- ✅ Merges frequentes sem conflitos
- ✅ **Features isoladas por flags**
- ✅ **Desenvolvimento paralelo de equipes**
- ✅ **Deploy contínuo sem riscos**

### Feature Flag Management
- ✅ **Configuração por ambiente**
- ✅ **Flags por equipe e percentual**
- ✅ **Runtime overrides para emergências**
- ✅ **APIs para consulta e debug**
- ✅ **Testes automatizados de cenários**
- ✅ **Documentação completa**

### CI/CD
- ✅ Testes com diferentes estados de flags
- ✅ Build artifacts com metadata de flags
- ✅ Deploy automático com proteção
- ✅ Approval gates para produção
- ✅ Health checks pós-deployment

## 📚 Documentação Completa

- 📖 **[Feature Flags Guide](./docs/feature-flags.md)**: Guia completo do sistema
- 🌳 **[Trunk-Based Workflow](./docs/workflows.md)**: Detalhes dos workflows
- 🎮 **[Team Simulation](./examples/team-development-simulation.js)**: Exemplo prático

## 🎓 Cenários de Aprendizado

### Para Desenvolvedores
- Como trabalhar na main branch sem conflitos
- Uso de feature flags no código
- Testes de features habilitadas/desabilitadas

### Para DevOps
- Configuração de pipelines com feature flags
- Deploy contínuo com segurança
- Monitoring de feature rollouts

### Para Product Managers
- Controle de rollout de features
- A/B testing com percentuais
- Emergency feature toggles

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. **Use feature flags** para proteger features em desenvolvimento
4. Mantenha mudanças pequenas e focadas (trunk-based style)
5. Commit suas mudanças (`git commit -m 'feat: add amazing feature'`)
6. Push para a branch (`git push origin feature/AmazingFeature`)  
7. Abra um Pull Request

## 🎉 Benefícios Alcançados

### ✅ Para Equipes Pequenas
- Deploy contínuo sem medo
- Features testadas antes do rollout
- Rollback instantâneo sem redeploy

### ✅ Para Equipes Grandes  
- **Múltiplas equipes na main simultaneamente**
- **Zero conflitos de merge**
- **Desenvolvimento paralelo eficiente**
- **QA testa features individuais e integradas**
- **Product owners controlam rollouts**

### ✅ Para a Organização
- **Time-to-market reduzido**
- **Riscos de deploy minimizados**
- **Feedback rápido dos usuários**
- **Capacidade de resposta a problemas**

## 📝 Licença

Este projeto é licenciado sob a Licença ISC - veja o arquivo LICENSE para detalhes.

## 🚀 Próximos Passos

- [x] ✅ **Sistema de feature flags completo**  
- [x] ✅ **Desenvolvimento trunk-based para equipes grandes**
- [x] ✅ **APIs de feature flags**
- [x] ✅ **Testes automatizados**
- [x] ✅ **Simulação de desenvolvimento em equipe**
- [x] ✅ **Documentação completa**
- [ ] 🔄 Integração com ferramentas externas (LaunchDarkly, etc.)
- [ ] 📊 Métricas e observabilidade avançada
- [ ] 🔔 Notificações de deploy (Slack, Discord)
- [ ] 🔄 Rollback automático baseado em métricas
- [ ] 🧪 A/B testing framework

---

**🌳 Agora sua equipe pode usar trunk-based development com segurança, independentemente do tamanho! 🚩**