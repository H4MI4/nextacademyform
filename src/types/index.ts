import { z } from 'zod';

// Interface principal para informações do atleta
export interface AthleteInfo {
  fullName: string;
  birthDate: string;
  cityState: string;
  parentName: string;
  parentPhone: string;
}

// Schema de validação com Zod
export const athleteInfoSchema = z.object({
  fullName: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  
  birthDate: z.string()
    .refine((date) => {
      const parsed = new Date(date);
      const now = new Date();
      const minAge = new Date(now.getFullYear() - 50, now.getMonth(), now.getDate());
      const maxAge = new Date(now.getFullYear() - 8, now.getMonth(), now.getDate());
      return parsed >= minAge && parsed <= maxAge;
    }, "Data de nascimento deve ser entre 8 e 50 anos"),
  
  cityState: z.string()
    .min(5, "Cidade/Estado muito curto")
    .regex(/^.+\/.+$/, "Formato deve ser: Cidade/UF")
    .refine((value) => {
      const parts = value.split('/');
      return parts.length === 2 && parts[1].length === 2;
    }, "UF deve ter 2 caracteres"),
  
  parentName: z.string()
    .min(2, "Nome do responsável deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  
  parentPhone: z.string()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Telefone deve estar no formato (11) 99999-9999")
});

// Interface para perguntas do questionário
export interface Question {
  id: number;
  question: string;
  copy: string;
  options: {
    text: string;
    points: number;
    isHighlighted?: boolean;
  }[];
  gate?: 'GI' | 'GO' | 'GE' | 'GN';
}

// Interface para dados de agendamento
export interface SchedulingData {
  scheduledDate: string;
  scheduledTime: string;
  scheduledDateTime: string;
  athleteName: string;
  parentName: string;
  parentPhone: string;
  timestamp: string;
}

// Interface para gates de qualificação
export interface QualificationGates {
  gi: boolean;
  go: boolean;
  ge: boolean;
  gn: boolean;
  hasAnyGate: boolean;
}

// Interface para categoria de pontuação
export interface ScoreCategory {
  name: string;
  points: string;
  color: string;
  description: string;
  icon: any;
  gates?: QualificationGates;
}

// Interface para dados do webhook
export interface WebhookData {
  timestamp: string;
  testType: string;
  athleteInfo: AthleteInfo;
  qualification: {
    totalScore: number;
    category: string;
    description: string;
    maxPossibleScore: number;
  };
  gates: {
    gi_internacional: boolean;
    go_ocupacao: boolean;
    ge_escolaridade: boolean;
    gn_next: boolean;
    hasAnyGate: boolean;
  };
  answers: {
    questionId: number;
    question: string;
    copy: string;
    selectedPoints: number;
    selectedOption: string;
    gate: string | null;
  }[];
  videoCallScheduling?: SchedulingData;
  stage?: string;
  source: string;
  url: string;
}

// Tipos para validação
export type AthleteInfoValidation = z.infer<typeof athleteInfoSchema>;

// Constantes de configuração
export const WEBHOOK_ENDPOINTS = {
  QUALIFICATION: import.meta.env.VITE_WEBHOOK_QUALIFICATION_URL || 'https://raulgeremia11.app.n8n.cloud/webhook/teste-B',
  SCHEDULING: import.meta.env.VITE_WEBHOOK_SCHEDULING_URL || 'https://raulgeremia11.app.n8n.cloud/webhook-test/agendamento-leadscore'
} as const;

export const API_CONFIG = {
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
} as const;
