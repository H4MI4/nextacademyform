# Next Academy Forms - Documentação Técnica

## 📋 Visão Geral do Projeto

Este é um sistema de qualificação de atletas para a Next Academy, desenvolvido em React com TypeScript, usando Vite como bundler e Tailwind CSS para estilização.

### 🎯 Funcionalidades Principais

- **Formulário de Informações do Atleta**: Coleta dados pessoais básicos
- **Sistema de Qualificação**: 4 perguntas com sistema de pontuação
- **Agendamento de Videochamada**: Interface para marcar reuniões
- **Sistema de Gates**: Qualificação baseada em critérios específicos
- **Integração com Webhooks**: Envio automático de dados para sistemas externos

## 🏗️ Arquitetura do Projeto

```
src/
├── components/
│   ├── ui/                     # Componentes base (shadcn/ui)
│   ├── AthleteInfoForm.tsx     # ⚠️ PROBLEMA: Não utilizado
│   ├── AthleteQualificationForm.tsx  # Componente principal
│   └── VideoCallScheduler.tsx  # Agendamento de chamadas
├── pages/
│   ├── Index.tsx              # Página principal
│   └── NotFound.tsx           # Página 404
├── hooks/                     # Custom hooks
├── lib/                       # Utilitários
└── assets/                    # Imagens e recursos
```

## 🚨 Problemas Identificados

### 1. PROBLEMAS CRÍTICOS

#### 🔴 Duplicação de Componentes
- **AthleteInfoForm.tsx** não está sendo usado
- **AthleteQualificationForm.tsx** reimplementa a mesma funcionalidade
- **Solução**: Remover AthleteInfoForm.tsx ou consolidar funcionalidades

#### 🔴 Interface Inconsistente
```typescript
// AthleteInfoForm.tsx
interface AthleteInfo {
  fullName: string;
  cityState: string;
  birthDate: string;
  parentPhone: string; // ❌ Falta parentName
}

// AthleteQualificationForm.tsx  
interface AthleteInfo {
  fullName: string;
  birthDate: string;
  cityState: string;
  parentName: string;  // ✅ Tem parentName
  parentPhone: string;
}
```

#### 🔴 Configuração TypeScript Permissiva
```json
// tsconfig.json - PROBLEMAS:
{
  "noImplicitAny": false,        // ❌ Permite any implícito
  "noUnusedParameters": false,   // ❌ Não detecta parâmetros não usados
  "noUnusedLocals": false,       // ❌ Não detecta variáveis não usadas
  "strictNullChecks": false      // ❌ Não verifica null/undefined
}
```

### 2. PROBLEMAS DE CÓDIGO

#### 🟡 URLs Hardcoded
```typescript
// AthleteQualificationForm.tsx - PROBLEMA:
const webhookUrl = 'https://raulgeremia11.app.n8n.cloud/webhook-test/agendamento-leadscore';
const webhookUrl = 'https://raulgeremia11.app.n8n.cloud/webhook/teste-B';
```
**Solução**: Usar variáveis de ambiente

#### 🟡 Tratamento de Erro Inadequado
```typescript
// Atual - PROBLEMA:
try {
  await fetch(webhookUrl, {...});
} catch (error) {
  console.error('Erro ao enviar webhook:', error); // ❌ Apenas log
}

// Recomendado:
try {
  await fetch(webhookUrl, {...});
} catch (error) {
  // ✅ Log estruturado + fallback + retry
  logger.error('Webhook failed', { error, data, attempt });
  await retryWithBackoff();
}
```

#### 🟡 Validação Insuficiente
```typescript
// Atual - PROBLEMA:
const isAthleteInfoValid = () => {
  return athleteInfo.fullName && athleteInfo.birthDate && 
         athleteInfo.cityState && athleteInfo.parentName && 
         athleteInfo.parentPhone;
};

// Recomendado com Zod:
const athleteSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  birthDate: z.string().refine(isValidDate, "Data inválida"),
  cityState: z.string().regex(/^.+\/.+$/, "Formato: Cidade/UF"),
  parentName: z.string().min(2, "Nome do responsável obrigatório"),
  parentPhone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Telefone inválido")
});
```

### 3. PROBLEMAS DE ESTRUTURA

#### 🟡 Componentes UI Incompletos
- Faltam componentes básicos como DatePicker customizado
- MaskedInput funciona mas poderia ser mais robusto
- Falta de componentes de loading/skeleton

#### 🟡 Ausência de Testes
```bash
# Não existem:
- src/__tests__/
- *.test.tsx
- *.spec.tsx
- jest.config.js
- vitest.config.ts
```

### 4. PROBLEMAS DE CONFIGURAÇÃO

#### 🟡 ESLint Permissivo
```javascript
// eslint.config.js - PROBLEMA:
rules: {
  "@typescript-eslint/no-unused-vars": "off", // ❌ Muito permissivo
}
```

## 🛠️ Soluções Recomendadas

### Prioridade ALTA

1. **Consolidar Interfaces**
```typescript
// Criar interface única em types/index.ts
export interface AthleteInfo {
  fullName: string;
  birthDate: string;
  cityState: string;
  parentName: string;
  parentPhone: string;
}
```

2. **Configurar Variáveis de Ambiente**
```bash
# .env.local
VITE_WEBHOOK_QUALIFICATION_URL=https://raulgeremia11.app.n8n.cloud/webhook/teste-B
VITE_WEBHOOK_SCHEDULING_URL=https://raulgeremia11.app.n8n.cloud/webhook-test/agendamento-leadscore
VITE_API_TIMEOUT=10000
```

3. **Melhorar TypeScript Config**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Prioridade MÉDIA

4. **Implementar Validação com Zod**
```typescript
import { z } from 'zod';

export const athleteInfoSchema = z.object({
  fullName: z.string().min(2).max(100),
  birthDate: z.string().refine(isValidDate),
  cityState: z.string().regex(/^.+\/.+$/),
  parentName: z.string().min(2).max(100),
  parentPhone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/)
});
```

5. **Melhorar Tratamento de Erros**
```typescript
// utils/webhook.ts
export class WebhookService {
  private async sendWithRetry(url: string, data: any, maxRetries = 3) {
    // Implementar retry com backoff exponencial
  }
  
  private handleError(error: Error, context: string) {
    // Log estruturado + telemetria
  }
}
```

### Prioridade BAIXA

6. **Adicionar Testes**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

7. **Implementar Logging Estruturado**
```typescript
// utils/logger.ts
export const logger = {
  info: (message: string, meta?: object) => {},
  error: (message: string, error: Error, meta?: object) => {},
  warn: (message: string, meta?: object) => {}
};
```

## 📊 Sistema de Pontuação

### Gates de Qualificação
- **GI (Gate Internacional)**: Experiência internacional (16+ pontos)
- **GO (Gate Ocupação)**: Ocupação dos responsáveis (18+ pontos)  
- **GE (Gate Escolaridade)**: Nível educacional (16+ pontos)

### Categorias de Resultado
- **🎯 SELETIVA**: 0-35 pontos
- **💼 COMERCIAL**: 36-60 pontos OU 61+ sem gates
- **🚀 EMBARQUES**: 61+ pontos + pelo menos 1 gate

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run build:dev    # Build em modo desenvolvimento
npm run lint         # Verificação de código
npm run preview      # Preview do build
```

## 🌐 Variáveis de Ambiente

```bash
# .env.local (criar este arquivo)
VITE_WEBHOOK_QUALIFICATION_URL=sua_url_aqui
VITE_WEBHOOK_SCHEDULING_URL=sua_url_aqui
VITE_API_TIMEOUT=10000
VITE_ENVIRONMENT=development
```

## 📱 Responsividade

O projeto está otimizado para:
- ✅ Mobile (320px+)
- ✅ Tablet (768px+)  
- ✅ Desktop (1024px+)

## 🎨 Design System

### Cores Principais
```css
--primary-blue: 217 91% 60%
--accent-blue: 217 91% 65%
--dark-bg: 222 84% 5%
--light-text: 0 0% 98%
```

### Componentes Customizados
- **card-glow**: Efeito de brilho em cards
- **btn-glow**: Animação de brilho em botões
- **text-shimmer**: Texto com efeito shimmer
- **hover-scale**: Escala no hover

## 🚀 Deploy

O projeto está configurado para deploy no Lovable:
- URL: https://lovable.dev/projects/e5f108d6-efaf-4e61-b4f4-2d49c3a57141
- Deploy automático via git push
- Configuração via interface web

## 📞 Suporte

Para dúvidas técnicas:
1. Verificar esta documentação
2. Consultar logs do console
3. Revisar código dos componentes principais
4. Testar em ambiente de desenvolvimento

---

**Última atualização**: 2025-09-17  
**Versão**: 1.0.0  
**Autor**: Sistema de Análise Técnica
