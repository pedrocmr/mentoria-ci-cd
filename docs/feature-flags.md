# Sistema de Feature Flags para Trunk-Based Development

Este documento explica como usar o sistema de feature flags implementado para permitir que equipes grandes trabalhem usando apenas a branch principal (main).

## 🎯 Objetivos do Sistema

O sistema de feature flags permite:

- **Trunk-Based Development**: Múltiplas equipes trabalhando simultaneamente na branch main
- **Deploy Seguro**: Features podem ser deployadas mas mantidas desabilitadas até estarem prontas
- **Rollout Gradual**: Ativação progressiva de features para diferentes percentuais de usuários
- **Controle por Equipe**: Diferentes equipes podem ver diferentes features durante o desenvolvimento
- **Toggles de Emergência**: Desativação rápida de features em caso de problemas

## 🏗️ Arquitetura do Sistema

### Componentes Principais

1. **FeatureFlagService**: Serviço central para gerenciamento de flags
2. **Feature Flag Middleware**: Middleware para fácil integração
3. **Configuração por Ambiente**: Different flag states per environment
4. **API Endpoints**: APIs para consulta e gerenciamento de flags

## 📋 Tipos de Feature Flags

### 1. Flags Booleanas Simples

```javascript
// environments/development.js
features: {
  newDashboard: true,
  oldFeature: false
}
```

### 2. Flags Baseadas em Percentual

```javascript
features: {
  experimentalSearch: 30,  // 30% dos usuários
  betaFeatures: 50         // 50% dos usuários
}
```

### 3. Flags por Equipe

```javascript
features: {
  userProfileRedesign: {
    default: false,
    teams: {
      frontend: true,    // Equipe frontend vê a feature
      qa: true,         // Equipe QA testa a feature
      backend: false    // Equipe backend não precisa ainda
    }
  }
}
```

### 4. Flags por Ambiente

```javascript
features: {
  advancedLogging: {
    environments: {
      development: true,
      staging: true,
      production: false  // Nunca em produção
    }
  }
}
```

### 5. Flags Complexas (Combinadas)

```javascript
features: {
  aiRecommendations: {
    default: false,
    percentage: 10,      // 10% dos usuários por padrão
    teams: {
      datascience: true, // Equipe de dados sempre vê
      product: true      // Equipe de produto para testes
    }
  }
}
```

## 🚀 Como Usar na Aplicação

### Verificação Básica de Flag

```javascript
const FeatureFlagService = require('./src/featureFlags.js');
const featureFlagService = new FeatureFlagService(config);

// Verificação simples
if (featureFlagService.isEnabled('newDashboard')) {
  // Código da nova dashboard
}

// Verificação com contexto
if (featureFlagService.isEnabled('teamFeature', { team: 'frontend', userId: 'user123' })) {
  // Código específico para equipe frontend
}
```

### Usando o Middleware

```javascript
const { createFeatureFlagMiddleware } = require('./src/featureFlagMiddleware.js');

// Em uma aplicação Express (exemplo)
app.use(createFeatureFlagMiddleware(featureFlagService));

app.get('/api/data', (req, res) => {
  if (req.featureFlags.isEnabled('newAPI')) {
    // Nova versão da API
    res.json({ version: 'v2', data: getNewData() });
  } else {
    // Versão antiga da API
    res.json({ version: 'v1', data: getOldData() });
  }
});
```

### Usando Feature Gates

```javascript
const { createFeatureFlagGate } = require('./src/featureFlagMiddleware.js');
const gate = createFeatureFlagGate(featureFlagService);

// Execução condicional
gate.when('newFeature', 
  () => console.log('Feature habilitada!'),
  () => console.log('Feature desabilitada')
);

// Valor condicional
const apiUrl = gate.value('newAPI', 'https://api-v2.com', 'https://api-v1.com');
```

### Para Equipes Específicas

```javascript
const { TeamFeatureGate } = require('./src/featureFlagMiddleware.js');

// Equipe Frontend
const frontendGate = new TeamFeatureGate(featureFlagService, 'frontend');
if (frontendGate.isEnabled('userProfileRedesign')) {
  // Código da nova interface
}

// Equipe Backend
const backendGate = new TeamFeatureGate(featureFlagService, 'backend');
if (backendGate.isEnabled('newPaymentGateway')) {
  // Código do novo gateway de pagamento
}
```

## 🌍 APIs Disponíveis

### GET / 
Endpoint principal com informações sobre feature flags ativas

```bash
curl "http://localhost:3000/?team=frontend&userId=user123"
```

### GET /api/features
Lista todas as feature flags

```bash
# Todas as flags
curl "http://localhost:3000/api/features"

# Flags para uma equipe específica
curl "http://localhost:3000/api/features?team=frontend&userId=user123"

# Flag específica
curl "http://localhost:3000/api/features?flag=newDashboard&team=qa"
```

### GET /api/features/check
Verificação otimizada de uma flag específica

```bash
curl "http://localhost:3000/api/features/check?flag=newFeature&userId=user123"
```

### GET /api/features/metadata
Metadados do sistema de feature flags

```bash
curl "http://localhost:3000/api/features/metadata"
```

## 🌳 Fluxo de Trabalho Trunk-Based Development

### 1. Desenvolvedor Cria Feature

```bash
# Criar branch feature (curta duração)
git checkout -b feature/nova-funcionalidade

# Desenvolver com feature flag desabilitada por padrão
# Em environments/development.js:
features: {
  novaFuncionalidade: {
    default: false,
    teams: {
      minhEquipe: true  // Só minha equipe vê durante desenvolvimento
    }
  }
}
```

### 2. Integração Contínua

```bash
# Merge para main (feature ainda desabilitada)
git checkout main
git merge feature/nova-funcionalidade

# CI/CD faz deploy mas feature permanece invisível
# até ser explicitamente habilitada
```

### 3. Testes em Staging

```javascript
// environments/staging.js
features: {
  novaFuncionalidade: true  // Habilita para testes completos
}
```

### 4. Rollout Gradual em Produção

```javascript
// environments/production.js - Fase 1
features: {
  novaFuncionalidade: 5  // 5% dos usuários
}

// Fase 2 (após validação)
features: {
  novaFuncionalidade: 25  // 25% dos usuários
}

// Fase 3 (rollout completo)
features: {
  novaFuncionalidade: true  // 100% dos usuários
}
```

## 🔧 Configuração por Ambiente

### Development
- Features habilitadas para desenvolvimento e testes
- Flags por equipe permitem trabalho paralelo
- Debug e logging habilitados

### Staging
- Mirrors production behavior para testes finais
- Maioria das features habilitadas para QA
- Percentuais mais altos para melhor cobertura de testes

### Production
- Rollouts conservadores e gradual
- Flags críticas sempre desabilitadas
- Logs de debug desabilitados

## 🚨 Boas Práticas

### 1. Nomenclatura de Flags
```javascript
// ✅ Bom - descritivo e claro
newUserDashboard: true
paymentGatewayV2: false

// ❌ Ruim - vago ou técnico demais
feature1: true
enableNewStuff: false
```

### 2. Limpeza de Flags
```javascript
// Remover flags antigas após rollout completo
// Manter histórico em logs para auditoria
```

### 3. Documentação
```javascript
features: {
  // Feature desenvolvida pelo time Frontend (Sprint 23)
  // Remove logo após validação em produção
  newUserProfile: {
    default: false,
    teams: { frontend: true }
  }
}
```

### 4. Testes
```javascript
// Testar ambos os cenários: flag habilitada e desabilitada
test('should work with new feature enabled', () => {
  featureFlags.setRuntimeOverride('newFeature', true);
  // teste com feature habilitada
});

test('should work with new feature disabled', () => {
  featureFlags.setRuntimeOverride('newFeature', false);
  // teste com feature desabilitada
});
```

## 🎓 Exemplo Completo: Equipe Grande

Imagine uma empresa com 5 equipes trabalhando simultaneamente:

### Cenário
- **Frontend Team**: Nova interface de usuário
- **Backend Team**: Nova API de pagamentos
- **Mobile Team**: Notificações push
- **Data Science Team**: Sistema de recomendações IA
- **QA Team**: Precisa testar tudo

### Configuração
```javascript
// environments/development.js
features: {
  // Frontend team
  newUserInterface: {
    teams: { frontend: true, qa: true }
  },
  
  // Backend team  
  paymentAPIv2: {
    teams: { backend: true, qa: true }
  },
  
  // Mobile team
  pushNotifications: {
    teams: { mobile: true, qa: true }
  },
  
  // Data Science team
  aiRecommendations: {
    teams: { datascience: true, qa: true, product: true }
  }
}
```

### Resultado
- Cada equipe pode trabalhar independentemente na branch main
- QA vê todas as features para testes integrados
- Produção permanece estável
- Deploy acontece diariamente sem riscos

## 🔍 Monitoramento e Debug

### Logs Automáticos
```javascript
// O sistema automaticamente loga:
console.log('🚩 Feature Flag Service initialized for development environment');
console.log('📊 Loaded 15 feature flags');
console.log('🔄 Runtime override set for newFeature: true');
```

### Endpoints de Debug
```bash
# Ver todas as flags ativas
curl "http://localhost:3000/api/features"

# Ver metadados do sistema
curl "http://localhost:3000/api/features/metadata"
```

### Headers HTTP
O middleware adiciona headers úteis para debug:
```
X-Feature-newDashboard: enabled
X-Feature-betaFeatures: disabled
```

## 🚀 Benefícios Realizados

1. **Desenvolvimento Paralelo**: Múltiplas equipes na branch main sem conflitos
2. **Deploy Contínuo**: Deploy diário sem medo de quebrar produção
3. **Rollback Instantâneo**: Desabilitar feature sem redeploy
4. **Testes Realistas**: QA testa em ambiente similar à produção
5. **Feedback Rápido**: Rollout gradual permite ajustes baseados em dados reais

Este sistema de feature flags torna o trunk-based development prático e seguro para equipes de qualquer tamanho! 🎉