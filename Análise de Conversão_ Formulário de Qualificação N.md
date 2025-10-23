<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Plano de Reestruturação Completa — Next Academy Form

Este plano consolida a análise técnica do sistema (arquitetura, tipos, webhooks, logging) e a análise de conversão (copy, UX, prova social, urgência) para reestruturar o formulário de qualificação e o agendamento de vídeo-chamada visando: aumentar conversões, tornar o código mais robusto, padronizar observabilidade e facilitar manutenção e evolução.

## Objetivos
- Elevar taxa de conversão com copy emocional, prova social e urgência.
- Reduzir atrito de entrada com primeira etapa enxuta (2–3 campos).
- Padronizar tipos e validação (Zod) e centralizar webhooks com retries.
- Unificar o fluxo principal, removendo legados e duplicações.
- Instrumentar métricas e logs para decisões baseadas em dados.

## Arquitetura Alvo
- `src/pages/Index.tsx` (Home):
  - Hero aspiracional (headline + subheadline + prova social + CTA forte).
  - Botão CTA inicia o formulário multi-etapa.
- Formulário multi-etapa (`AthleteQualificationForm`):
  - Etapa 1: Nome Completo + Data de Nascimento.
  - Etapa 2: Cidade/Estado + Nome/Telefone do responsável.
  - Etapa 3: Questionário de qualificação com microcopy por pergunta.
  - Etapa 4: Agendamento de vídeo-chamada (hoje/amanhã + horário).
  - Etapa Final: Mensagem de conclusão forte + próximos passos.
- Utilitários:
  - Tipos e validação: `src/types/index.ts` + `athleteInfoSchema` (Zod).
  - Webhooks: `src/utils/webhook.ts` (retry e backoff) + variáveis `.env`.
  - Logging: `src/utils/logger.ts` configurável por `VITE_LOG_LEVEL`.

## Intervenções de UX/Copy
- Hero
  - Headline: "Transforme Seu Talento no Campo em Uma Bolsa Integral nos EUA"
  - Subheadline: "Descubra em 3 minutos se você tem o perfil para jogar e estudar em universidades americanas — com tudo pago"
  - Prova Social: "✓ 600+ atletas enviados | ✓ Parceria com 100+ universidades"
  - CTA: "Fazer Minha Avaliação Gratuita →"
- Etapas Enxutas
  - Etapa 1: 2 campos (Nome, Data de Nascimento)
  - Etapa 2: 2–3 campos (Cidade/Estado, Responsável)
- Indicador de Progresso
  - Barra com "Etapa X de Y" e percentual.
- Microcopy nas Perguntas (exemplos)
  - "Você já fez alguma viagem para fora do Brasil? (Experiência internacional fortalece sua candidatura)"
  - "Qual a ocupação dos responsáveis? (Contexto socioeconômico ajuda na elegibilidade de bolsas)"
- Prova Social Intersticial
  - Mini-depoimentos rotativos e números de impacto entre etapas.
- Urgência/Escassez
  - "Apenas 15 vagas de entrevista este mês" + contador simples.
- Conclusão
  - "🎉 Sua Pontuação: 54/100 — Você tem alto potencial! Sua entrevista está confirmada para [DATA]. O que vamos conversar: perfil, oportunidades de bolsa, próximos passos."

## Governança Técnica
- Variáveis de Ambiente (`.env` + `.env.example`)
  - `VITE_WEBHOOK_QUALIFICATION`
  - `VITE_WEBHOOK_SCHEDULING`
  - `VITE_LOG_LEVEL` (debug|info|warn|error)
- Webhook Service
  - Usar `WebhookService` com retries e backoff.
  - Remover `fetch` hardcoded nos componentes.
- Tipos e Validação
  - Importar `AthleteInfo`, `Question` e correlatos de `src/types/index.ts`.
  - Validar `athleteInfo` com Zod ao avançar para perguntas.
- Logging
  - Substituir `console.*` por `logger` com contexto (timestamp, etapa, origem).
- TypeScript
  - Habilitar `strict`, `noImplicitAny`, `strictNullChecks` em `tsconfig.json` e ajustar tipos.
- Limpeza de Legados
  - Remover/arquivar `AthleteInfoForm.tsx` e alinhar ou retirar `LeadQualificationForm.tsx` se não utilizado.

## Webhooks: Payloads e Estágios
- Pré-agendamento (ao entrar na tela de agendamento)
  - `testType`: `ab-athlete-mobile-pre-scheduling`
  - `stage`: `entered-scheduling-screen`
  - `athleteInfo`: conforme `AthleteInfo`
  - `qualification`: `{ totalScore, category, description, maxPossibleScore }`
  - `gates`: `{ gi_internacional, go_ocupacao, ge_escolaridade, gn_next, hasAnyGate }`
  - `answers`: `[ { questionId, question, selectedPoints, selectedOption, gate } ]`
  - `source`, `timestamp`, `url`
- Final (após confirmar agendamento)
  - `testType`: `ab-athlete-mobile`
  - `videoCallScheduling`: `{ date, time, timezone, confirmationId }`
  - Demais campos iguais ao pré-agendamento.

## Métricas e Instrumentação
- Conversão geral do formulário.
- Drop-off por etapa.
- Sucesso/falha de webhooks (taxa, retries, erro).
- Conversão de agendamento e no-show rate (futuro).
- Pontuação média e distribuição por categoria.

## Testes
- Unitários
  - Cálculo de score e gates.
  - Validação Zod de `athleteInfo`.
- Integração
  - `WebhookService` com retries (mock de `fetch`).
  - Fluxo completo até `onScheduleComplete`.
- E2E (opcional)
  - Cenário feliz e falhas de webhook.

## Roadmap por Sprints
- Sprint 1 (Fundação Técnica)
  - Unificar tipos e validações (Zod).
  - Centralizar webhooks e env; atualizar `.env.example`.
  - Substituir `console.*` por `logger` em pontos críticos.
  - Aceitação: build sem erros, payloads enviados via `WebhookService`.
- Sprint 2 (UX/Copy Inicial)
  - Implementar Hero, CTA, prova social e urgência na Home.
  - Reestruturar Etapa 1 e 2 (campos enxutos) + barra de progresso.
  - Aceitação: testes de usabilidade e queda no abandono inicial.
- Sprint 3 (Questionário + Agendamento + Conclusão)
  - Microcopy por pergunta; ajustes nas opções destacadas.
  - Refinar `VideoCallScheduler` e mensagem final.
  - Aceitação: métricas de conversão por etapa e confirmação de agendamento.
- Sprint 4 (Observabilidade + Testes + A/B)
  - Instrumentar métricas e eventos.
  - Planejar A/B de CTAs, headlines e urgência.
  - Aceitação: relatórios de métricas e resultados preliminares de A/B.

## Checklist de Implementação
- Atualizar Home com Hero + prova social + CTA.
- Dividir a primeira etapa em duas etapas leves.
- Adicionar barra de progresso em todas as etapas.
- Inserir microcopy nas perguntas.
- Integrar `WebhookService` e `.env` nos dois estágios.
- Unificar tipos e remover duplicações/legados.
- Padronizar logging com `logger`.
- Habilitar `strict` no TypeScript e corrigir tipos.

## Riscos e Mitigações
- Quebra de tipos ao habilitar `strict` → Mitigar com Zod e ajustes incrementais.
- Falhas de webhook em produção → Retry/backoff e alertas via logs.
- Queda temporária de conversão ao mudar copy → A/B testing e monitoração diária.

## Próximos Passos
1. Aplicar Sprint 1 (fundação técnica) no código.
2. Atualizar `.env.example` e configurar variáveis no ambiente.
3. Implementar Home com Hero/CTA e medir impacto inicial.

---
Este plano serve como documento vivo. Ajustes de escopo e priorização devem ser guiados por métricas de conversão e feedback dos usuários/operadores.

