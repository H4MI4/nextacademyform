import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import nextLogo from '@/assets/next-logo.png';
import { ChevronLeft, ChevronRight, Trophy, Award, Target, User, MapPin, Calendar, Phone, Users, CheckCircle } from 'lucide-react';
import VideoCallScheduler from './VideoCallScheduler';
import { webhookService } from '@/utils/webhook';
import { logger } from '@/utils/logger';
interface AthleteInfo {
  fullName: string;
  birthDate: string;
  cityState: string;
  parentName: string;
  parentPhone: string;
}
interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    points: number;
    isHighlighted?: boolean;
  }[];
  gate?: 'GI' | 'GO' | 'GE' | 'GN';
  isConditional?: boolean;
  showIf?: (answers: Record<number, number>) => boolean;
}

const questions: Question[] = [{
  id: 1,
  question: "Você já fez alguma viagem para fora do Brasil?",
  gate: 'GI',
  options: [{
    text: "Nunca viajei",
    points: 3
  }, {
    text: "Turismo",
    points: 8
  }, {
    text: "Intercâmbio/curso",
    points: 16,
    isHighlighted: true
  }, {
    text: "Campeonato/treino",
    points: 24,
    isHighlighted: true
  }]
}, {
  id: 2,
  question: "Qual a profissão dos seus responsáveis?",
  gate: 'GO',
  options: [{
    text: "Alta gestão / Empresários / Executivos",
    points: 24,
    isHighlighted: true
  }, {
    text: "Nível superior (médicos, advogados, engenheiros)",
    points: 18,
    isHighlighted: true
  }, {
    text: "Nível técnico (técnicos, supervisores)",
    points: 12
  }, {
    text: "Operacional (vendedores, operadores)",
    points: 8
  }, {
    text: "Serviços gerais (limpeza, segurança)",
    points: 4
  }]
}, {
  id: 3,
  question: "Qual sua escolaridade?",
  gate: 'GE',
  options: [{
    text: "Ensino Médio Completo",
    points: 20,
    isHighlighted: true
  }, {
    text: "Graduação Completa",
    points: 10,
    isHighlighted: true
  }, {
    text: "Cursando Ensino Médio",
    points: 15
  }, {
    text: "Cursando Ensino Superior",
    points: 12
  }, {
    text: "Ensino Fundamental (6º ao 9º ano)",
    points: 13
  }, {
    text: "Ensino Fundamental (1º ao 5º ano)",
    points: 8
  }, {
    text: "Não frequento a escola",
    points: 6
  }]
}, {
  id: 4,
  question: "Há quanto tempo você conhece a Next Academy?",
  options: [{
    text: "Mais de 2 anos",
    points: 12
  }, {
    text: "Entre 1 e 2 anos",
    points: 10
  }, {
    text: "Entre 6 meses e 1 ano",
    points: 8
  }, {
    text: "Menos de 6 meses",
    points: 7
  }, {
    text: "Esta é a primeira vez que ouço falar",
    points: 6
  }]
}, {
  id: 5,
  question: "Já participou de algum evento da Next Academy?",
  gate: 'GN',
  isConditional: true,
  showIf: (answers) => {
    // Mostra apenas se não respondeu "Esta é a primeira vez que ouço falar" na pergunta 4
    return answers[4] !== 6;
  },
  options: [{
    text: "Nunca participei",
    points: 0
  }, {
    text: "Seletiva (peneira)",
    points: 4
  }, {
    text: "Torneio organizado pela Next",
    points: 8
  }, {
    text: "Imersão/treinamento com jogadores",
    points: 12,
    isHighlighted: true
  }]
}];

const AthleteQualificationForm = () => {
  const {
    toast
  } = useToast();
  const [currentStep, setCurrentStep] = useState(0); // 0 = info form, 1-5 = questions, 6 = scheduler, 7 = thank you
  const [athleteInfo, setAthleteInfo] = useState<AthleteInfo>({
    fullName: '',
    birthDate: '',
    cityState: '',
    parentName: '',
    parentPhone: ''
  });
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isWebhookLoading, setIsWebhookLoading] = useState(false);
  const [schedulingData, setSchedulingData] = useState<any>(null);
  const handleAthleteInfoChange = (field: keyof AthleteInfo, value: string) => {
    setAthleteInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleAnswer = (questionId: number, points: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: points
    }));
  };

  // Função para obter perguntas visíveis baseado nas respostas atuais
  const getVisibleQuestions = () => {
    return questions.filter(q => {
      if (!q.isConditional) return true;
      return q.showIf ? q.showIf(answers) : true;
    });
  };

  // Função para obter a pergunta atual baseada no step
  const getCurrentQuestion = () => {
    const visibleQuestions = getVisibleQuestions();
    return visibleQuestions[currentStep - 2];
  };

  // Função para calcular o total de perguntas visíveis
  const getTotalQuestions = () => {
    return getVisibleQuestions().length;
  };
  const isAthleteInfoValidStep0 = () => {
    return athleteInfo.fullName && athleteInfo.birthDate;
  };
  const isAthleteInfoValidStep1 = () => {
    return athleteInfo.cityState && athleteInfo.parentName && athleteInfo.parentPhone;
  };
  const isCurrentQuestionAnswered = () => {
    if (currentStep === 0) return isAthleteInfoValidStep0();
    if (currentStep === 1) return isAthleteInfoValidStep1();
    const currentQuestion = getCurrentQuestion();
    return currentQuestion ? answers[currentQuestion.id] !== undefined : false;
  };
  const checkGates = (answers: Record<number, number>) => {
    // GI - Internacional: Intercâmbio/curso (16) ou Campeonato/treino (24)
    const gi = answers[1] === 16 || answers[1] === 24;

    // GO - Ocupação: Alta gestão/Empresários (24) ou Nível superior (18)
    const go = answers[2] === 24 || answers[2] === 18;

    // GE - Escolaridade: Médio Completo (20) ou Graduação Completa (10)
    const ge = answers[3] === 20 || answers[3] === 10;

    // GN - Next: Imersão/treinamento com jogadores (12)
    const gn = answers[5] === 12;

    return {
      gi,
      go,
      ge,
      gn,
      hasAnyGate: gi || go || ge || gn
    };
  };
  const getScoreCategory = (score: number, answers: Record<number, number>) => {
    const gates = checkGates(answers);
    
    if (score <= 46) {
      return {
        name: "🎯 SELETIVA",
        points: "0-46 pontos",
        color: "seletiva",
        description: "Entrada Básica",
        icon: Target
      };
    }

    // Score de 47 a 92 pontos = COMERCIAL
    return {
      name: "💼 COMERCIAL",
      points: "47-92 pontos",
      color: "comercial",
      description: "Qualificação Comercial",
      icon: Award,
      gates: gates
    };
  };
  const sendSchedulingWebhook = async (leadData: any) => {
    setIsWebhookLoading(true);
    try {
      await webhookService.sendSchedulingData(leadData as any);
      logger.info('Agendamento enviado com sucesso', { athlete: leadData?.athleteInfo?.fullName });
      toast({
        title: "✅ Agendamento confirmado",
        description: "Sua vídeo-chamada foi agendada com sucesso!"
      });
    } catch (error) {
      logger.error('Erro ao enviar webhook de agendamento', error as Error);
      toast({
        title: "⚠️ Aviso",
        description: "Agendamento salvo localmente. Nossa equipe entrará em contato.",
        variant: "destructive"
      });
    } finally {
      setIsWebhookLoading(false);
    }
  };

  const sendWebhookData = async (leadData: any) => {
    setIsWebhookLoading(true);
    try {
      await webhookService.sendQualificationData(leadData as any);
      logger.info('Dados de qualificação enviados', { athlete: leadData?.athleteInfo?.fullName });
      toast({
        title: "✅ Dados enviados",
        description: "Sua qualificação foi processada com sucesso!"
      });
    } catch (error) {
      logger.error('Erro ao enviar webhook de qualificação', error as Error);
      toast({
        title: "⚠️ Aviso",
        description: "Dados salvos localmente. Nossa equipe entrará em contato.",
        variant: "destructive"
      });
    } finally {
      setIsWebhookLoading(false);
    }
  };
  const nextStep = async () => {
    const totalQuestions = getTotalQuestions();
    const maxStep = totalQuestions + 3; // +3 para scheduler e thank you com duas etapas de identificação
    
    if (currentStep < maxStep) {
      setCurrentStep(prev => prev + 1);

      // Se acabou as perguntas e vai para agendamento, enviar primeiro webhook
      if (currentStep === totalQuestions + 1) {
        const totalScore = Object.values(answers).reduce((sum, points) => sum + points, 0);
        const category = getScoreCategory(totalScore, answers);
        const gates = checkGates(answers);
        
        const leadData = {
          timestamp: new Date().toISOString(),
          testType: 'ab-athlete-mobile-pre-scheduling',
          athleteInfo: athleteInfo,
          qualification: {
            totalScore: totalScore,
            category: category.name,
            description: category.description,
            maxPossibleScore: 92
          },
          gates: {
            gi_internacional: gates.gi,
            go_ocupacao: gates.go,
            ge_escolaridade: gates.ge,
            gn_next: gates.gn,
            hasAnyGate: gates.hasAnyGate
          },
          answers: getVisibleQuestions().map(q => ({
            questionId: q.id,
            question: q.question,
            selectedPoints: answers[q.id] || 0,
            selectedOption: q.options.find(opt => opt.points === answers[q.id])?.text || 'Não respondido',
            gate: q.gate || null
          })),
          stage: 'entered-scheduling-screen',
          source: 'athlete-qualification-form-ab',
          url: window.location.href
        };

        try {
          await sendWebhookData(leadData);
        } catch (error) {
          logger.warn('Erro no primeiro webhook, mas continuando...');
        }
      }
    }
  };

  const handleScheduleComplete = async (schedulingDataReceived: any) => {
    setSchedulingData(schedulingDataReceived);
    
    // Agora sim calculamos o score e enviamos tudo junto
    const totalScore = Object.values(answers).reduce((sum, points) => sum + points, 0);
    const category = getScoreCategory(totalScore, answers);
    const gates = checkGates(answers);
    
    const leadData = {
      timestamp: new Date().toISOString(),
      testType: 'ab-athlete-mobile',
      athleteInfo: athleteInfo,
      qualification: {
        totalScore: totalScore,
        category: category.name,
        description: category.description,
        maxPossibleScore: 92
      },
      gates: {
        gi_internacional: gates.gi,
        go_ocupacao: gates.go,
        ge_escolaridade: gates.ge,
        gn_next: gates.gn,
        hasAnyGate: gates.hasAnyGate
      },
      answers: getVisibleQuestions().map(q => ({
        questionId: q.id,
        question: q.question,
        selectedPoints: answers[q.id] || 0,
        selectedOption: q.options.find(opt => opt.points === answers[q.id])?.text || 'Não respondido',
        gate: q.gate || null
      })),
      videoCallScheduling: schedulingDataReceived,
      source: 'athlete-qualification-form-ab',
      url: window.location.href
    };

    try {
      await sendSchedulingWebhook(leadData);
      const totalQuestions = getTotalQuestions();
      setCurrentStep(totalQuestions + 3); // Vai para a página final
    } catch (error) {
      const totalQuestions = getTotalQuestions();
      setCurrentStep(totalQuestions + 3);
    }
  };
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  const resetForm = () => {
    setCurrentStep(0);
    setAnswers({});
    setAthleteInfo({
      fullName: '',
      birthDate: '',
      cityState: '',
      parentName: '',
      parentPhone: ''
    });
  };
  const totalQuestions = getTotalQuestions();
  const progress = currentStep <= 1 ? 0 : currentStep <= totalQuestions + 1 ? ((currentStep - 2) / totalQuestions) * 100 : 100;

  // Render identificação form
  if (currentStep === 0) {
    return <div className="min-h-screen bg-gradient-primary relative overflow-hidden pattern-grid">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-geometric opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-glow opacity-5"></div>
        
        {/* Mobile-optimized floating elements */}
        <div className="absolute top-10 right-5 w-20 h-20 bg-primary-blue/5 rounded-full blur-xl float"></div>
        <div className="absolute bottom-10 left-5 w-24 h-24 bg-accent-blue/3 rounded-full blur-2xl" style={{
        animationDelay: '1s'
      }}></div>
        
        <div className="relative z-10 p-4 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md md:max-w-2xl lg:max-w-3xl card-glow shadow-blue-lg border-primary-blue/10 backdrop-blur-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-blue opacity-10 blur-sm"></div>
            
            <CardHeader className="relative text-center pb-8 md:pb-10 px-6 md:px-10">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-blue/15 rounded-full blur-xl"></div>
                  <img src={nextLogo} alt="Next Academy Logo" className="relative h-12 w-auto filter brightness-0 invert hover-scale" />
                </div>
              </div>
              
              <CardTitle className="text-xl font-bold text-light-text mb-3 text-shimmer">
            </CardTitle>
              <CardDescription className="text-light-text/80 text-sm leading-relaxed">
            </CardDescription>
              
              <Badge variant="outline" className="border-primary-blue text-primary-blue mx-auto mt-4 px-4 py-2 text-xs font-semibold hover-scale pulse-glow">
                Etapa 1 de 2
              </Badge>
            </CardHeader>
            
            <CardContent className="relative space-y-6 md:space-y-8 px-6 md:px-10 pb-6 md:pb-10">
              {/* Nome Completo */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-light-text font-medium text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-blue" />
                  Nome Completo *
                </Label>
                <p className="text-xs text-muted-text mb-2">Informe seu nome completo conforme documento.</p>
                <Input id="fullName" value={athleteInfo.fullName} onChange={e => handleAthleteInfoChange('fullName', e.target.value)} placeholder="Digite seu nome completo" className="h-12 md:h-14 bg-dark-surface/50 border-border-color text-light-text placeholder:text-muted-text focus:border-primary-blue focus:ring-primary-blue/20 transition-all duration-300 text-sm rounded-xl input-glow" />
              </div>
              
              {/* Data de Nascimento */}
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-light-text font-medium text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-blue" />
                  Data de Nascimento *
                </Label>
                <Input id="birthDate" type="date" value={athleteInfo.birthDate} onChange={e => handleAthleteInfoChange('birthDate', e.target.value)} className="h-12 md:h-14 bg-dark-surface/50 border-border-color text-light-text placeholder:text-muted-text focus:border-primary-blue focus:ring-primary-blue/20 transition-all duration-300 text-sm rounded-xl input-glow" />
              </div>

              {/* Botão */}
              <div className="pt-6 border-t border-primary-blue/20">
                <div className="space-y-3">
                  <Button onClick={nextStep} disabled={!isAthleteInfoValidStep0()} className="w-full bg-gradient-button hover:bg-gradient-button-hover text-white font-bold transition-all duration-300 py-4 md:py-5 px-6 md:px-8 text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-blue btn-glow hover-scale rounded-xl">
                    Continuar
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>;
  }

  // Render identificação etapa 2
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-primary relative overflow-hidden pattern-grid">
        <div className="absolute inset-0 bg-gradient-geometric opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-glow opacity-5"></div>
        <div className="relative z-10 p-4 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md md:max-w-2xl lg:max-w-3xl card-glow shadow-blue-lg border-primary-blue/10 backdrop-blur-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-blue opacity-10 blur-sm"></div>
            
            <CardHeader className="relative text-center pb-8 md:pb-10 px-6 md:px-10">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-blue/15 rounded-full blur-xl"></div>
                  <img src={nextLogo} alt="Next Academy Logo" className="relative h-10 md:h-12 lg:h-14 w-auto filter brightness-0 invert" />
                </div>
              </div>
              <Badge variant="outline" className="border-primary-blue text-primary-blue mx-auto mt-2 px-4 py-2 text-xs font-semibold">
                Etapa 2 de 2
              </Badge>
            </CardHeader>
            <CardContent className="relative space-y-6 md:space-y-8 px-6 md:px-10 pb-6 md:pb-10">
              <div className="space-y-2">
                <Label htmlFor="cityState" className="text-light-text font-medium text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-blue" />
                  Cidade/Estado *
                </Label>
                <Input id="cityState" value={athleteInfo.cityState} onChange={e => handleAthleteInfoChange('cityState', e.target.value)} placeholder="Ex: São Paulo/SP" className="h-12 md:h-14 bg-dark-surface/50 border-border-color text-light-text placeholder:text-muted-text focus:border-primary-blue focus:ring-primary-blue/20 transition-all duration-300 text-sm rounded-xl input-glow" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentName" className="text-light-text font-medium text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary-blue" />
                  Nome do Responsável *
                </Label>
                <Input id="parentName" value={athleteInfo.parentName} onChange={e => handleAthleteInfoChange('parentName', e.target.value)} placeholder="Nome completo do responsável" className="h-12 md:h-14 bg-dark-surface/50 border-border-color text-light-text placeholder:text-muted-text focus:border-primary-blue focus:ring-primary-blue/20 transition-all duration-300 text-sm rounded-xl input-glow" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone" className="text-light-text font-medium text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary-blue" />
                  Telefone do Responsável *
                </Label>
                <MaskedInput id="parentPhone" mask="(99) 99999-9999" value={athleteInfo.parentPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAthleteInfoChange('parentPhone', e.target.value)} placeholder="(11) 99999-9999" className="bg-dark-surface/50 border-border-color text-light-text placeholder:text-muted-text focus:border-primary-blue focus:ring-primary-blue/20 md:h-14" />
              </div>
              <div className="flex justify-between gap-3 pt-4 border-t border-primary-blue/20">
                <Button onClick={prevStep} variant="outline" className="flex-1 border-border-color text-light-text hover:border-primary-blue hover:text-primary-blue py-3 md:py-4 text-sm md:text-base rounded-xl">
                  <ChevronLeft className="w-4 h-4 ml-2" />
                  Voltar
                </Button>
                <Button onClick={nextStep} disabled={!isAthleteInfoValidStep1()} className="flex-1 bg-gradient-button hover:bg-gradient-button-hover text-white font-bold transition-all duration-300 py-3 md:py-4 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-blue btn-glow hover-scale rounded-xl">
                  Começar perguntas
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
           </Card>
        </div>
      </div>
    );
  }

  // Render video call scheduler
  if (currentStep === totalQuestions + 2) {
    return (
      <VideoCallScheduler 
        athleteInfo={athleteInfo}
        onScheduleComplete={handleScheduleComplete}
        isLoading={isWebhookLoading}
      />
    );
  }

  // Render thank you page with score
  if (currentStep === totalQuestions + 3) {
    const totalScore = Object.values(answers).reduce((sum, points) => sum + points, 0);
    
    return (
      <div className="min-h-screen bg-gradient-primary relative overflow-hidden pattern-grid">
        {/* Background Effects - mantendo padrão atual */}
        <div className="absolute inset-0 bg-gradient-geometric opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-glow opacity-5"></div>
        
        {/* Floating elements menores para não interferir no print */}
        <div className="absolute top-10 right-5 w-16 h-16 bg-primary-blue/5 rounded-full blur-xl float"></div>
        <div className="absolute bottom-10 left-5 w-20 h-20 bg-accent-blue/3 rounded-full blur-2xl" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10 p-3 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md md:max-w-2xl lg:max-w-3xl card-glow shadow-blue-lg border-primary-blue/10 backdrop-blur-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-blue opacity-10 blur-sm"></div>
            
            {/* Header Compacto - Parabéns */}
            <CardHeader className="relative text-center py-6 md:py-10 px-6 md:px-10">
              <div className="flex justify-center mb-3">
                <div className="w-12 md:w-14 h-12 md:h-14 bg-primary-blue/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 md:w-7 h-6 md:h-7 text-primary-blue" />
                </div>
              </div>
              
              <CardTitle className="text-xl md:text-2xl font-bold text-light-text mb-1 text-shimmer">
                 🏆 Parabéns!
               </CardTitle>
              <CardDescription className="text-light-text/80 text-sm md:text-base">
                 Avaliação concluída
               </CardDescription>
            </CardHeader>
            
            <CardContent className="relative p-6 md:p-10 space-y-6 md:space-y-8">
              
              {/* Pontuação - Destaque Principal Compacto */}
              <div className="text-center py-6 md:py-8 bg-gradient-to-br from-primary-blue/20 to-accent-blue/15 rounded-xl border border-primary-blue/30 backdrop-blur-sm">
              <h3 className="text-light-text font-semibold text-base md:text-lg mb-2">Sua Pontuação</h3>
              <div className="text-5xl md:text-6xl font-bold text-primary-blue mb-1 text-shimmer">
                   {totalScore}
                 </div>
               </div>

               {/* Entrevista Marcada - Compacta */}
               {schedulingData && (
                <div className="bg-primary-blue/10 border border-primary-blue/20 rounded-xl p-4 md:p-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary-blue" />
              <h4 className="font-semibold text-light-text text-base md:text-lg">Entrevista marcada</h4>
                </div>
                
              <div className="space-y-1 text-sm md:text-base text-light-text/90">
              <p className="font-medium text-primary-blue text-base md:text-lg">
                       {new Date(schedulingData.scheduledDate).toLocaleDateString('pt-BR')} às {schedulingData.scheduledTime}
                     </p>
                     <p><strong>Atleta:</strong> {schedulingData.athleteName}</p>
                     <p><strong>Responsável:</strong> {schedulingData.parentName}</p>
              <p className="text-sm md:text-base text-light-text/60 italic">
                       Telefone do responsável: {schedulingData.parentPhone}
                     </p>
                   </div>
                 </div>
               )}

               {/* Respostas do Formulário - Ultra Compactas */}
              <div className="bg-dark-surface/30 border border-primary-blue/20 rounded-xl p-4 md:p-6">
              <h4 className="font-semibold text-light-text mb-2 flex items-center gap-2 text-base md:text-lg">
                   <CheckCircle className="w-4 h-4 text-primary-blue" />
                   Respostas
                 </h4>
                 
                 <div className="space-y-2">
                   {getVisibleQuestions().map((q, index) => {
                     const selectedOption = q.options.find(opt => opt.points === answers[q.id]);
                     return (
                       <div key={q.id} className="border-l-2 border-primary-blue/30 pl-2 py-1">
                         <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium text-light-text/70">
                             P{index + 1}
                           </div>
                         </div>
              <div className="text-sm md:text-base text-light-text/90 mb-1 leading-tight line-clamp-2">
                           {q.question}
                         </div>
              <div className="text-sm md:text-base font-medium text-primary-blue/90 leading-tight">
                           {selectedOption?.text || 'Não respondido'}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>

               {/* Loading indicator */}
               {isWebhookLoading && (
                 <div className="flex items-center justify-center gap-2 p-2 bg-primary-blue/10 rounded-xl">
                   <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-blue"></div>
              <span className="text-primary-blue font-medium text-sm">Finalizando...</span>
                 </div>
               )}
               
               {/* Footer Compacto */}
              <div className="text-center pt-4 md:pt-6 border-t border-primary-blue/20">
                <div className="flex justify-center mb-1">
              <img src={nextLogo} alt="Next Academy" className="h-4 w-auto filter brightness-0 invert opacity-60" />
                 </div>
                <p className="text-light-text/60 text-sm">
                   Obrigado pela confiança!
                 </p>
               </div>
               
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render questions
  const question = getCurrentQuestion();
  const selectedAnswer = question ? answers[question.id] : undefined;
  return <div className="min-h-screen bg-gradient-primary relative overflow-hidden pattern-grid">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-geometric opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-glow opacity-5"></div>
      
      <div className="absolute top-10 right-5 w-20 h-20 bg-primary-blue/5 rounded-full blur-xl float"></div>
      <div className="absolute bottom-10 left-5 w-24 h-24 bg-accent-blue/3 rounded-full blur-2xl" style={{
      animationDelay: '1s'
    }}></div>
      
      <div className="relative z-10 p-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md md:max-w-2xl lg:max-w-3xl card-glow shadow-blue-lg border-primary-blue/10 backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-blue opacity-10 blur-sm"></div>
          
          <CardHeader className="relative text-center py-6 md:py-8 px-6 md:px-10">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-blue/15 rounded-full blur-xl"></div>
                <img src={nextLogo} alt="Next Academy Logo" className="relative h-10 w-auto filter brightness-0 invert hover-scale" />
              </div>
            </div>
            
            <Badge variant="outline" className="border-primary-blue text-primary-blue mx-auto mt-2 px-4 py-2 text-xs font-semibold">
              Pergunta {currentStep - 1} de {totalQuestions}
            </Badge>
            
            <CardTitle className="text-xl md:text-2xl font-bold text-light-text mb-2">
              {question?.question}
            </CardTitle>
            
            <div className="mt-4">
              <Progress value={progress} className="h-2 rounded-full bg-dark-surface/50" />
            </div>
          </CardHeader>
          
          <CardContent className="relative space-y-6 md:space-y-8 px-6 md:px-10 pb-6 md:pb-10">
            <RadioGroup
              key={question?.id}
              name={`q-${question?.id}`}
              value={selectedAnswer !== undefined ? selectedAnswer.toString() : ""}
              onValueChange={value => handleAnswer(question?.id || 0, parseInt(value))}
              className="space-y-3"
            >
              {question?.options?.map((option, index) => (
                <div
                  key={index}
                  className={`
                    flex items-center space-x-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-[1.02]
                    border-border-color bg-dark-surface/30
                    ${selectedAnswer === option.points ? 'border-primary-blue bg-primary-blue/10 shadow-blue' : 'hover:border-primary-blue/50'}
                  `}
                >
                  <RadioGroupItem value={option.points.toString()} id={`q-${question?.id}-option-${index}`} className="text-primary-blue" />
                  <Label htmlFor={`q-${question?.id}-option-${index}`} className="flex-1 text-light-text cursor-pointer text-sm md:text-base leading-relaxed">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Navigation */}
            <div className="flex justify-between gap-3 pt-4 border-t border-primary-blue/20">
              <Button onClick={prevStep} variant="outline" className="flex-1 border-border-color text-light-text hover:border-primary-blue hover:text-primary-blue py-3 md:py-4 text-sm md:text-base rounded-xl">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
              
              <Button onClick={nextStep} disabled={!isCurrentQuestionAnswered()} className="flex-1 bg-gradient-button hover:bg-gradient-button-hover text-white font-bold transition-all duration-300 py-3 md:py-4 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-blue btn-glow hover-scale rounded-xl">
                {currentStep === totalQuestions + 1 ? 'Finalizar' : 'Próxima'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default AthleteQualificationForm;