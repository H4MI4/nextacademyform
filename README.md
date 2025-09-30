# Sistema de Qualificação de Atletas - Next Academy

## 📋 Visão Geral

Sistema de qualificação de atletas para a **Next Academy**, projetado para avaliar o perfil de leads interessados em oportunidades esportivas e acadêmicas nos EUA e Europa. O sistema coleta informações pessoais, aplica um questionário de **5 perguntas** (1 condicional) e calcula uma pontuação de qualificação com base em critérios específicos de **gates** (GI, GO, GE, GN).

**URL do Projeto**: https://lovable.dev/projects/e5f108d6-efaf-4e61-b4f4-2d49c3a57141

---

## 🎯 Funcionalidades Principais

### 1. **Coleta de Informações do Atleta**
- Nome completo
- Data de nascimento
- Cidade/Estado
- Telefone do responsável

### 2. **Questionário de Qualificação (5 Perguntas)**
O sistema avalia o perfil do lead através de 5 perguntas (1 condicional):
- **P1**: Experiência internacional (Gate GI)
- **P2**: Ocupação dos responsáveis (Gate GO)
- **P3**: Nível de escolaridade (Gate GE)
- **P4**: Tempo de conhecimento da Next Academy
- **P5**: Participação em eventos Next (Gate GN - **condicional**)

**Lógica condicional**: A pergunta 5 só aparece se a resposta da pergunta 4 for diferente de "Esta é a primeira vez que ouço falar".

### 3. **Sistema de Pontuação**
- **Pontuação máxima**: 92 pontos
- **Categorização automática** em 2 níveis:
  - 🎯 **SELETIVA**: 0-46 pontos
  - 💼 **COMERCIAL**: 47-92 pontos

### 4. **Sistema de Gates**
Quatro gates de qualificação disponíveis:
- **GI (Internacional)**: Intercâmbio/curso (16 pts) ou Campeonato/treino (24 pts)
- **GO (Ocupação)**: Alta gestão/empresários (24 pts) ou Nível superior (18 pts)
- **GE (Escolaridade)**: Ensino Médio (20 pts) ou Ensino Superior (16 pts)
- **GN (Next Academy)**: Imersão/treinamento com jogadores (12 pts)

### 5. **Integração com Webhook**
Envio automático dos dados para sistema externo via webhook após conclusão do questionário.

---

## 🏗️ Arquitetura do Projeto

```
nextacademyform/
├── src/
│   ├── components/
│   │   ├── ui/                          # Componentes base (shadcn/ui)
│   │   ├── AthleteQualificationForm.tsx # ✅ Formulário principal ativo (5 perguntas)
│   │   ├── LeadQualificationForm.tsx    # (Componente alternativo - não usado)
│   │   ├── AthleteInfoForm.tsx          # (Componente legado - não usado)
│   │   └── VideoCallScheduler.tsx       # Agendamento de videochamadas
│   ├── pages/
│   │   ├── Index.tsx                    # Página inicial
│   │   └── NotFound.tsx                 # Página 404
│   ├── hooks/                           # Custom hooks
│   ├── lib/                             # Utilitários
│   ├── utils/                           # Funções auxiliares
│   ├── types/                           # Definições TypeScript
│   └── assets/                          # Imagens e recursos
├── public/                              # Arquivos estáticos
├── .env.example                         # Exemplo de variáveis de ambiente
├── package.json                         # Dependências do projeto
├── tailwind.config.ts                   # Configuração Tailwind CSS
├── vite.config.ts                       # Configuração Vite
└── tsconfig.json                        # Configuração TypeScript
```

---

## 🛠️ Tecnologias Utilizadas

### Core
- **React 18.3.1** - Biblioteca JavaScript para interfaces
- **TypeScript 5.8.3** - Superset tipado do JavaScript
- **Vite 5.4.19** - Build tool e dev server

### UI/Styling
- **Tailwind CSS 3.4.17** - Framework CSS utility-first
- **shadcn/ui** - Componentes React reutilizáveis
- **Radix UI** - Componentes acessíveis e não estilizados
- **Lucide React** - Biblioteca de ícones

### Form Management
- **React Hook Form 7.61.1** - Gerenciamento de formulários
- **Zod 3.25.76** - Validação de schemas
- **@hookform/resolvers** - Integração Zod + React Hook Form
- **react-input-mask** - Máscaras de input (telefone, etc.)

### State & Data
- **TanStack Query (React Query) 5.83.0** - Gerenciamento de estado assíncrono

### Utils
- **date-fns 4.1.0** - Manipulação de datas
- **clsx / tailwind-merge** - Utilitários CSS
- **class-variance-authority** - Variantes de componentes

---

## 🚀 Instalação e Execução

### Pré-requisitos
- **Node.js** 16+ (recomendado: usar [nvm](https://github.com/nvm-sh/nvm))
- **npm** ou **bun**

### Passos

```bash
# 1. Clone o repositório
git clone <YOUR_GIT_URL>

# 2. Entre no diretório
cd nextacademyform

# 3. Instale as dependências
npm install
# ou
bun install

# 4. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite o arquivo .env.local com suas credenciais

# 5. Inicie o servidor de desenvolvimento
npm run dev
# ou
bun dev
```

O projeto estará disponível em `http://localhost:5173`

---

## ⚙️ Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run build:dev    # Build em modo desenvolvimento
npm run lint         # Executa verificação de código (ESLint)
npm run preview      # Preview do build de produção
```

---

## 🌐 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Webhook para envio de dados de qualificação
VITE_WEBHOOK_QUALIFICATION_URL=https://raulgeremia11.app.n8n.cloud/webhook/lead-score

# Webhook para agendamento de videochamadas (se aplicável)
VITE_WEBHOOK_SCHEDULING_URL=https://raulgeremia11.app.n8n.cloud/webhook-test/agendamento-leadscore

# Timeout para requisições (ms)
VITE_API_TIMEOUT=10000

# Ambiente
VITE_ENVIRONMENT=development
```

⚠️ **Nota**: Atualmente as URLs de webhook estão hardcoded em `AthleteQualificationForm.tsx` (linhas 242 e 270). Recomenda-se refatorar para usar variáveis de ambiente.

---

## 📊 Sistema de Pontuação Detalhado

### Distribuição de Pontos por Pergunta

| # | Pergunta | Gate | Pontos Min | Pontos Max | Opções |
|---|----------|------|------------|------------|--------|
| 1 | Viagem para fora do Brasil | GI | 3 | 24 | Nunca (3), Turismo (8), Intercâmbio/curso (16)*, Campeonato/treino (24)* |
| 2 | Ocupação dos responsáveis | GO | 4 | 24 | Serviços gerais (4), Operacional (8), Técnico (12), Superior (18)*, Alta gestão (24)* |
| 3 | Nível de escolaridade | GE | 6 | 20 | Não frequenta (6), Fund. I (8), Fund. II (12), Superior (16)*, Médio (20)* |
| 4 | Tempo de conhecimento da Next | - | 6 | 12 | Primeira vez (6), < 6 meses (7), 6m-1a (8), 1-2a (10), > 2a (12) |
| 5 | Participação em eventos Next¹ | GN | 0 | 12 | Nunca (0), Seletiva (4), Torneio (8), Imersão (12)* |

**Total**: 92 pontos  
¹ *Pergunta condicional - só aparece se P4 ≠ "Primeira vez"*  
\* *Opções destacadas que ativam gates*

### Categorias de Qualificação

#### 🎯 SELETIVA (0-46 pontos)
- **Descrição**: Entrada Básica
- **Perfil**: Leads que precisam de mais desenvolvimento ou não atendem aos critérios mínimos
- **Ação Recomendada**: Direcionamento para programas de base ou desenvolvimento inicial

#### 💼 COMERCIAL (47-92 pontos)
- **Descrição**: Qualificação Comercial
- **Perfil**: Leads com bom potencial, podendo ter gates ativados
- **Ação Recomendada**: Abordagem comercial, processo de agendamento de videochamada
- **Gates Exibidos**: O sistema mostra quais gates foram ativados (GI, GO, GE, GN)

### Lógica dos Gates

```typescript
// GI - Internacional (Pergunta 1)
Intercâmbio/curso (16 pontos) OU Campeonato/treino (24 pontos)

// GO - Ocupação (Pergunta 2)
Alta gestão/Empresários/Executivos (24 pontos) OU Nível superior (18 pontos)

// GE - Escolaridade (Pergunta 3)
Ensino Médio (20 pontos) OU Ensino Superior (16 pontos)

// GN - Next Academy (Pergunta 5 - condicional)
Imersão/treinamento com jogadores (12 pontos)
```

---

## 📱 Responsividade

O sistema é totalmente responsivo e otimizado para:
- 📱 **Mobile**: 320px+
- 📱 **Tablet**: 768px+
- 💻 **Desktop**: 1024px+

---

## 🎨 Design System

### Paleta de Cores (Tailwind Custom)

```css
/* Cores Principais */
--primary-blue: 217 91% 60%
--accent-blue: 217 91% 65%
--dark-bg: 222 84% 5%
--light-text: 0 0% 98%

/* Cores de Categoria */
--seletiva: Amarelo/Laranja
--comercial: Azul
--embarques: Verde
```

### Efeitos Customizados
- **card-glow**: Brilho suave em cards
- **btn-glow**: Animação de brilho em botões
- **text-shimmer**: Efeito shimmer em textos
- **hover-scale**: Escala no hover
- **pulse-glow**: Pulsação suave
- **pattern-grid**: Background com padrão de grade

---

## 🔌 Integração com Webhook

### Endpoints

**1. Webhook de Qualificação** (após responder todas as perguntas):
```
POST https://raulgeremia11.app.n8n.cloud/webhook/teste-B
```

**2. Webhook de Agendamento** (após agendar videochamada):
```
POST https://raulgeremia11.app.n8n.cloud/webhook-test/agendamento-leadscore
```

### Payload Enviado (Webhook de Agendamento)

```json
{
  "timestamp": "2025-09-30T18:30:00.000Z",
  "testType": "ab-athlete-mobile",
  "athleteInfo": {
    "fullName": "João Silva",
    "birthDate": "2005-03-15",
    "cityState": "São Paulo/SP",
    "parentName": "Maria Silva",
    "parentPhone": "(11) 98765-4321"
  },
  "qualification": {
    "totalScore": 68,
    "category": "💼 COMERCIAL",
    "description": "Qualificação Comercial",
    "maxPossibleScore": 92
  },
  "gates": {
    "gi_internacional": true,
    "go_ocupacao": false,
    "ge_escolaridade": true,
    "gn_next": false,
    "hasAnyGate": true
  },
  "answers": [
    {
      "questionId": 1,
      "question": "Você já fez alguma viagem para fora do Brasil?",
      "selectedPoints": 16,
      "selectedOption": "Intercâmbio/curso",
      "gate": "GI"
    },
    {
      "questionId": 2,
      "question": "Qual a principal ocupação dos responsáveis pelo atleta?",
      "selectedPoints": 12,
      "selectedOption": "Nível técnico (técnicos, supervisores)",
      "gate": "GO"
    }
    // ... demais respostas
  ],
  "videoCallScheduling": {
    "athleteName": "João Silva",
    "parentName": "Maria Silva",
    "parentPhone": "(11) 98765-4321",
    "scheduledDate": "2025-10-15",
    "scheduledTime": "14:00"
  },
  "source": "athlete-qualification-form-ab",
  "url": "https://..."
}
```

---

## 🐛 Problemas Conhecidos

### ⚠️ Críticos
1. **URLs hardcoded**: Webhook URLs estão no código (linhas 242 e 270 de `AthleteQualificationForm.tsx`)
2. **Componentes não utilizados**: `LeadQualificationForm.tsx` e `AthleteInfoForm.tsx` existem mas não são usados
3. **TypeScript permissivo**: Configuração com `strict: false` permite erros sutis

### 🟡 Médios
4. **Falta de retry**: Webhooks não têm mecanismo de retry em caso de falha de rede
5. **Validação básica**: Validação de formulário usa apenas checagem simples (poderia usar Zod)
6. **Tratamento de erro**: Erros apenas logados no console, sem telemetria

### Recomendações
- Migrar URLs de webhook para variáveis de ambiente (`.env.local`)
- Remover componentes não utilizados (`LeadQualificationForm.tsx`, `AthleteInfoForm.tsx`)
- Implementar retry logic com backoff exponencial nos webhooks
- Adicionar validação com Zod schemas para dados do formulário
- Melhorar logging estruturado e adicionar monitoramento de erros

---

## 📦 Deploy

### Via Lovable
1. Acesse [Lovable](https://lovable.dev/projects/e5f108d6-efaf-4e61-b4f4-2d49c3a57141)
2. Clique em **Share → Publish**
3. Deploy automático

### Via Build Manual
```bash
npm run build
# Os arquivos estarão em dist/
```

### Domínio Customizado
Para conectar um domínio customizado:
1. Vá em **Project > Settings > Domains**
2. Clique em **Connect Domain**
3. Siga as instruções

📖 [Documentação sobre domínios customizados](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## 📞 Suporte e Contribuição

### Estrutura de Desenvolvimento
1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Relatando Bugs
- Descreva o comportamento esperado vs atual
- Inclua screenshots se relevante
- Especifique navegador e sistema operacional

---

## 📄 Licença

Este projeto é proprietário da **Next Academy**.

---

## 📝 Changelog

### Versão Atual (2025-09-30)
- ✅ Sistema de qualificação com 5 perguntas (1 condicional)
- ✅ 2 categorias de qualificação (SELETIVA 0-46, COMERCIAL 47-92)
- ✅ Sistema de 4 gates (GI, GO, GE, GN)
- ✅ Lógica condicional (P5 só aparece se P4 ≠ "Primeira vez")
- ✅ Integração com 2 webhooks (qualificação + agendamento)
- ✅ Agendamento de videochamada integrado
- ✅ Interface responsiva e mobile-first
- ✅ Validação de formulários em tempo real
- ✅ Tela de resultado com pontuação e resumo das respostas

---

**Última atualização**: 30 de setembro de 2025  
**Versão**: 1.0.0  
**Desenvolvido para**: Next Academy
