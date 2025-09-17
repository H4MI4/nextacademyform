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
  copy: string;
  options: {
    text: string;
    points: number;
    isHighlighted?: boolean;
  }[];
  gate?: 'GI' | 'GO' | 'GE';
}
const questions: Question[] = [{
  id: 1,
  question: "Experiência Internacional",
  copy: "Você ou sua família já tiveram alguma experiência internacional?",
  gate: 'GI',
  options: [{
    text: "Nunca viajamos",
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
  question: "Ocupação dos responsáveis",
  copy: "Qual a principal ocupação dos responsáveis pelo atleta?",
  gate: 'GO',
  options: [{
    text: "Alta gestão / Empresários / Executivos",
    points: 24,
    isHighlighted: true
  }, {
    text: "Profissões de nível superior",
    points: 18,
    isHighlighted: true
  }, {
    text: "Técnicas",
    points: 12
  }, {
    text: "Operacionais / Autônomos",
    points: 8
  }, {
    text: "Informal / Desempregado",
    points: 4
  }]
}, {
  id: 3,
  question: "Nível de Escolaridade",
  copy: "Qual é o seu nível de escolaridade atual?",
  gate: 'GE',
  options: [{
    text: "Ensino Médio (1º ao 3º ano)",
    points: 20,
    isHighlighted: true
  }, {
    text: "Ensino Superior (cursando ou completo)",
    points: 16,
    isHighlighted: true
  }, {
    text: "Fundamental II (6º ao 9º ano)",
    points: 10
  }, {
    text: "Fundamental I (1º ao 5º ano)",
    points: 6
  }]
}, {
  id: 4,
  question: "Tempo de conhecimento da Next",
  copy: "Há quanto tempo você conhece a Next Academy?",
  options: [{
    text: "Mais de 2 anos",
    points: 12
  }, {
    text: "Entre 6 meses e 2 anos",
    points: 10
  }, {
    text: "Menos de 6 meses",
    points: 8
  }, {
    text: "Esta é a primeira vez que ouço falar",
    points: 6
  }]
}];
const AthleteQualificationForm = () => {
  const {
    toast
  } = useToast();
  const [currentStep, setCurrentStep] = useState(0); // 0 = info form, 1-4 = questions, 5 = scheduler, 6 = thank you
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
  const isAthleteInfoValid = () => {
    return athleteInfo.fullName && athleteInfo.birthDate && athleteInfo.cityState && athleteInfo.parentName && athleteInfo.parentPhone;
  };
  const isCurrentQuestionAnswered = () => {
    if (currentStep === 0) return isAthleteInfoValid();
    return answers[currentStep] !== undefined;
  };
  const checkGates = (answers: Record<number, number>) => {
    // GI - Internacional: Intercâmbio/curso (16) ou Campeonato/treino (24)
    const gi = answers[1] === 16 || answers[1] === 24;

    // GO - Ocupação: Alta gestão/Empresários (24) ou Nível superior (18)
    const go = answers[2] === 24 || answers[2] === 18;

    // GE - Escolaridade: Ensino Médio (20) ou Superior (16)
    const ge = answers[3] === 20 || answers[3] === 16;
    return {
      gi,
      go,
      ge,
      hasAnyGate: gi || go || ge
    };
  };
  const getScoreCategory = (score: number, answers: Record<number, number>) => {
    const gates = checkGates(answers);
    if (score <= 35) {
      return {
        name: "🎯 SELETIVA",
        points: "0-35 pontos",
        color: "seletiva",
        description: "Entrada Básica",
        icon: Target
      };
    }
    if (score >= 61 && gates.hasAnyGate) {
      return {
        name: "🚀 EMBARQUES",
        points: "≥61 pontos + Gates",
        color: "embarques",
        description: "Qualificação Premium",
        icon: Trophy,
        gates: gates
      };
    }

    // Se score >= 61 mas sem gates, vai para Comercial
    // Ou se score está entre 36-60
    return {
      name: "💼 COMERCIAL",
      points: score >= 61 ? "≥61 pontos (sem gates)" : "36-60 pontos",
      color: "comercial",
      description: score >= 61 ? "Rebaixado - Sem Gates" : "Qualificação Média",
      icon: Award
    };
  };
  const sendSchedulingWebhook = async (leadData: any) => {
    setIsWebhookLoading(true);
    try {
      const webhookUrl = 'https://raulgeremia11.app.n8n.cloud/webhook-test/agendamento-leadscore';
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leadData)
      });
      console.log('Webhook de agendamento enviado com sucesso:', leadData);
      toast({
        title: "✅ Agendamento confirmado",
        description: "Sua vídeo-chamada foi agendada com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao enviar webhook de agendamento:', error);
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
      const webhookUrl = 'https://raulgeremia11.app.n8n.cloud/webhook/teste-B';
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leadData)
      });
      console.log('Webhook enviado com sucesso:', leadData);
      toast({
        title: "✅ Dados enviados",
        description: "Sua qualificação foi processada com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao enviar webhook:', error);
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
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);

      // Se acabou as perguntas e vai para agendamento, enviar primeiro webhook
      if (currentStep === 4) {
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
            maxPossibleScore: 80
          },
          gates: {
            gi_internacional: gates.gi,
            go_ocupacao: gates.go,
            ge_escolaridade: gates.ge,
            hasAnyGate: gates.hasAnyGate
          },
          answers: questions.map(q => ({
            questionId: q.id,
            question: q.question,
            copy: q.copy,
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
          console.log('Erro no primeiro webhook, mas continuando...');
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
        maxPossibleScore: 80
      },
      gates: {
        gi_internacional: gates.gi,
        go_ocupacao: gates.go,
        ge_escolaridade: gates.ge,
        hasAnyGate: gates.hasAnyGate
      },
      answers: questions.map(q => ({
        questionId: q.id,
        question: q.question,
        copy: q.copy,
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
      setCurrentStep(6); // Vai para a página final
    } catch (error) {
      // Em caso de erro no webhook, ainda avança para mostrar o resultado
      setCurrentStep(6);
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
  const progress = currentStep === 0 ? 0 : currentStep <= 4 ? (currentStep - 1) / 4 * 100 : 100;

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
          <Card className="w-full max-w-md card-glow shadow-blue-lg border-primary-blue/10 backdrop-blur-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-blue opacity-10 blur-sm"></div>
            
            <CardHeader className="relative text-center pb-6 px-6">
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
            
            <CardContent className="relative space-y-4 px-6 pb-6">
              {/* Nome Completo */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-light-text font-medium text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-blue" />
                  Nome Completo *
                </Label>
                <p className="text-xs text-muted-text mb-2">Informe seu nome completo conforme documento.</p>
                <Input id="fullName" value={athleteInfo.fullName} onChange={e => handleAthleteInfoChange('fullName', e.target.value)} placeholder="Digite seu nome completo" className="h-12 bg-dark-surface/50 border-border-color text-light-text placeholder:text-muted-text focus:border-primary-blue focus:ring-primary-blue/20 transition-all duration-300 text-sm rounded-xl input-glow" />
              </div>
              
              {/* Data de Nascimento */}
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-light-text font-medium text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-blue" />
                  Data de Nascimento *
                </Label>
                <Input id="birthDate" type="date" value={athleteInfo.birthDate} onChange={e => handleAthleteInfoChange('birthDate', e.target.value)} className="h-12 bg-dark-surface/50 border-border-color text-light-text placeholder:text-muted-text focus:border-primary-blue focus:ring-primary-blue/20 transition-all duration-300 text-sm rounded-xl input-glow" />
              </div>
              
              {/* Cidade/Estado */}
              <div className="space-y-2">
                <Label htmlFor="cityState" className="text-light-text font-medium text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-blue" />
                  Cidade/Estado *
                </Label>
                <p className="text-xs text-muted-text mb-2">Onde você reside atualmente? (Cidade/UF)</p>
                <Input id="cityState" value={athleteInfo.cityState} onChange={e => handleAthleteInfoChange('cityState', e.target.value)} placeholder="Ex: São Paulo/SP" className="h-12 bg-dark-surface/50 border-border-color text-light-text placeholder:text-muted-text focus:border-primary-blue focus:ring-primary-blue/20 transition-all duration-300 text-sm rounded-xl input-glow" />
              </div>
              
              {/* Nome do Responsável */}
              <div className="space-y-2">
                <Label htmlFor="parentName" className="text-light-text font-medium text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary-blue" />
                  Nome do Responsável *
                </Label>
                <Input id="parentName" value={athleteInfo.parentName} onChange={e => handleAthleteInfoChange('parentName', e.target.value)} placeholder="Nome completo do responsável" className="h-12 bg-dark-surface/50 border-border-color text-light-text placeholder:text-muted-text focus:border-primary-blue focus:ring-primary-blue/20 transition-all duration-300 text-sm rounded-xl input-glow" />
              </div>
              
              {/* Telefone dos Responsáveis */}
              <div className="space-y-2">
                <Label htmlFor="parentPhone" className="text-light-text font-medium text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary-blue" />
                  Telefone do Responsável *
                </Label>
                <MaskedInput id="parentPhone" mask="(99) 99999-9999" value={athleteInfo.parentPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAthleteInfoChange('parentPhone', e.target.value)} placeholder="(11) 99999-9999" className="bg-dark-surface/50 border-border-color text-light-text placeholder:text-muted-text focus:border-primary-blue focus:ring-primary-blue/20" />
              </div>

              {/* Botão */}
              <div className="pt-6 border-t border-primary-blue/20">
                <div className="space-y-3">
                  <Button onClick={nextStep} disabled={!isAthleteInfoValid()} className="w-full bg-gradient-button hover:bg-gradient-button-hover text-white font-bold transition-all duration-300 py-3 px-6 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-blue btn-glow hover-scale rounded-xl">
                    Iniciar Qualificação
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                  <p className="text-muted-text text-xs text-center">* Todos os campos são obrigatórios</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>;
  }

  // Render video call scheduler
  if (currentStep === 5) {
    return (
      <VideoCallScheduler 
        athleteInfo={athleteInfo}
        onScheduleComplete={handleScheduleComplete}
        isLoading={isWebhookLoading}
      />
    );
  }

  // Render thank you page with score
  if (currentStep === 6) {
    const totalScore = Object.values(answers).reduce((sum, points) => sum + points, 0);
    const maxScore = 80;
    const scorePercentage = Math.round(totalScore / maxScore * 100);
    return <div className="min-h-screen bg-gradient-primary relative overflow-hidden pattern-grid">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-geometric opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-glow opacity-5"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 right-5 w-32 h-32 bg-primary-blue/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-5 w-40 h-40 bg-accent-blue/5 rounded-full blur-3xl" style={{
        animationDelay: '1s'
      }}></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-embarques/8 rounded-full blur-xl float"></div>
        
        <div className="relative z-10 p-4 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-lg card-glow shadow-blue-lg border-primary-blue/10 backdrop-blur-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-blue opacity-10 blur-sm"></div>
            
            <CardHeader className="relative text-center pb-6 px-8 pt-8">
              {/* Success Animation */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-blue/30 rounded-full blur-2xl animate-ping"></div>
                  <div className="absolute inset-0 bg-primary-blue/20 rounded-full blur-xl"></div>
                  <div className="relative bg-primary-blue/10 p-6 rounded-full border-2 border-primary-blue/30">
                    <CheckCircle className="w-16 h-16 text-primary-blue hover-scale" />
                  </div>
                </div>
              </div>
              
              <CardTitle className="text-2xl font-bold text-light-text mb-4 text-shimmer">
                🎉 Qualificação Concluída!
              </CardTitle>
              <CardDescription className="text-light-text/90 text-base leading-relaxed mb-6">
                Aqui está o resultado da sua avaliação
              </CardDescription>
              
              {/* Next Academy Logo */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-blue/15 rounded-full blur-xl"></div>
                  <img src={nextLogo} alt="Next Academy Logo" className="relative h-8 w-auto filter brightness-0 invert opacity-80" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative space-y-6 px-8 pb-8">
              {/* Score Card */}
              <div className="bg-gradient-to-br from-primary-blue/20 to-accent-blue/15 p-8 rounded-2xl border border-primary-blue/30 backdrop-blur-sm relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-gradient-geometric opacity-5"></div>
                
                <div className="relative text-center">
                  <Trophy className="w-12 h-12 text-primary-blue mx-auto mb-4 hover-scale" />
                  
                  <h3 className="text-light-text font-bold text-lg mb-2">Sua Pontuação</h3>
                  
                  {/* Large score display */}
                  <div className="my-6">
                    <div className="text-6xl font-bold text-primary-blue mb-2 text-shimmer">
                      {totalScore}
                    </div>
                    
                    
                  </div>
                  
                  {/* Progress bar */}
                  
                  
                  <p className="text-light-text/80 text-sm leading-relaxed">
                </p>
                </div>
              </div>
              
              {/* Agendamento Confirmado */}
              {schedulingData && (
                <div className="bg-primary-blue/10 border border-primary-blue/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary-blue/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-primary-blue" />
                    </div>
                    <div>
                      <h4 className="text-light-text font-semibold text-base">Agendamento Confirmado</h4>
                      <p className="text-light-text/70 text-sm">Sua vídeo-chamada foi agendada</p>
                    </div>
                  </div>
                  <div className="bg-dark-surface/30 rounded-lg p-4 border border-primary-blue/20">
                    <p className="text-primary-blue font-semibold text-lg mb-1">
                      {schedulingData.scheduledDate} às {schedulingData.scheduledTime}
                    </p>
                    <p className="text-light-text text-sm mb-2">
                      <strong>Participantes:</strong> {schedulingData.athleteName} + {schedulingData.parentName}
                    </p>
                    <p className="text-light-text/70 text-xs">
                      Nossa equipe entrará em contato via WhatsApp ({schedulingData.parentPhone}) antes da reunião com o link da videochamada.
                    </p>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="space-y-4">
                <h4 className="text-light-text font-semibold text-center mb-4">Próximos Passos</h4>
                
                <div className="flex items-start gap-4 p-4 bg-primary-blue/5 rounded-xl border border-primary-blue/20">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-blue/20 rounded-full flex items-center justify-center mt-1">
                    <span className="text-primary-blue font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="text-light-text font-medium text-sm mb-1">Análise Detalhada</p>
                    <p className="text-light-text/70 text-xs">Nossa equipe analisará seu perfil completo</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-accent-blue/5 rounded-xl border border-accent-blue/20">
                  <div className="flex-shrink-0 w-8 h-8 bg-accent-blue/20 rounded-full flex items-center justify-center mt-1">
                    <span className="text-accent-blue font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="text-light-text font-medium text-sm mb-1">Contato Personalizado</p>
                    <p className="text-light-text/70 text-xs">Retorno em até 48h com oportunidades específicas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-embarques/5 rounded-xl border border-embarques/20">
                  <div className="flex-shrink-0 w-8 h-8 bg-embarques/20 rounded-full flex items-center justify-center mt-1">
                    <span className="text-embarques font-bold text-sm">3</span>
                  </div>
                  <div>
                    <p className="text-light-text font-medium text-sm mb-1">Desenvolvimento</p>
                    <p className="text-light-text/70 text-xs">Orientações para maximizar seu potencial</p>
                  </div>
                </div>
              </div>
              
              {/* Loading indicator */}
              {isWebhookLoading && <div className="flex items-center justify-center gap-3 p-4 bg-primary-blue/10 rounded-xl border border-primary-blue/30">
                  <div className="spinner w-5 h-5"></div>
                  <span className="text-primary-blue font-medium text-sm">Finalizando envio...</span>
                </div>}
              
              {/* Footer message */}
              <div className="text-center pt-4 border-t border-primary-blue/20">
                <p className="text-light-text/60 text-xs">
                  Obrigado por confiar na Next Academy para seu desenvolvimento esportivo
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>;
  }

  // Render questions
  const question = questions[currentStep - 1];
  const selectedAnswer = answers[currentStep];
  return <div className="min-h-screen bg-gradient-primary relative overflow-hidden pattern-grid">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-geometric opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-glow opacity-5"></div>
      
      <div className="absolute top-10 right-5 w-20 h-20 bg-primary-blue/5 rounded-full blur-xl float"></div>
      <div className="absolute bottom-10 left-5 w-24 h-24 bg-accent-blue/3 rounded-full blur-2xl" style={{
      animationDelay: '1s'
    }}></div>
      
      <div className="relative z-10 p-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md card-glow shadow-blue-lg border-primary-blue/10 backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-blue opacity-10 blur-sm"></div>
          
          <CardHeader className="relative text-center pb-4 px-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-blue/15 rounded-full blur-xl"></div>
                <img src={nextLogo} alt="Next Academy Logo" className="relative h-10 w-auto filter brightness-0 invert hover-scale" />
              </div>
            </div>
            
            <Badge variant="outline" className="border-primary-blue text-primary-blue mx-auto mb-4 px-3 py-1 text-xs font-semibold">
              Pergunta {currentStep} de 4
            </Badge>
            
            <CardTitle className="text-lg font-bold text-light-text mb-2">
              {question.question}
              {question.gate && <span className="ml-2 px-2 py-1 bg-primary-blue/20 text-primary-blue text-xs rounded font-normal">
                  Gate {question.gate}
                </span>}
            </CardTitle>
            <CardDescription className="text-light-text/80 text-sm">
              {question.copy}
            </CardDescription>
            
            <div className="mt-4">
              <Progress value={progress} className="h-2 rounded-full bg-dark-surface/50" />
            </div>
          </CardHeader>
          
          <CardContent className="relative space-y-4 px-6 pb-6">
            <RadioGroup value={selectedAnswer?.toString()} onValueChange={value => handleAnswer(currentStep, parseInt(value))} className="space-y-3">
              {question.options.map((option, index) => <div key={index} className={`
                    flex items-center space-x-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-[1.02]
                    border-border-color bg-dark-surface/30
                    ${selectedAnswer === option.points ? 'border-primary-blue bg-primary-blue/10 shadow-blue' : 'hover:border-primary-blue/50'}
                  `}>
                  <RadioGroupItem value={option.points.toString()} id={`option-${index}`} className="text-primary-blue" />
                  <Label htmlFor={`option-${index}`} className="flex-1 text-light-text cursor-pointer text-sm leading-relaxed">
                    {option.text}
                  </Label>
                </div>)}
            </RadioGroup>

            {/* Navigation */}
            <div className="flex justify-between gap-3 pt-4 border-t border-primary-blue/20">
              <Button onClick={prevStep} variant="outline" className="flex-1 border-border-color text-light-text hover:border-primary-blue hover:text-primary-blue py-3 text-sm rounded-xl">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
              
              <Button onClick={nextStep} disabled={!isCurrentQuestionAnswered()} className="flex-1 bg-gradient-button hover:bg-gradient-button-hover text-white font-bold transition-all duration-300 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-blue btn-glow hover-scale rounded-xl">
                {currentStep === 4 ? 'Finalizar' : 'Próxima'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default AthleteQualificationForm;