import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import AthleteInfoForm from './AthleteInfoForm';
import nextLogo from '@/assets/next-logo.png';
import { ChevronLeft, ChevronRight, Trophy, Star, Award, Target } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: { text: string; points: number; isHighlighted?: boolean }[];
}

interface AthleteInfo {
  fullName: string;
  cityState: string;
  birthDate: string;
  parentPhone: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: "Qual você acha que é o objetivo da Next Academy?",
    options: [
      { text: "Apenas formar atletas para campeonatos locais", points: 8 },
      { text: "Ser uma escolinha de futebol recreativo", points: 4 },
      { text: "Enviar atletas para jogar e estudar em high schools e universidades americanas, clubes na Europa e base de clubes no Brasil", points: 15, isHighlighted: true },
      { text: "Vender pacotes de treino sem compromisso com futuro acadêmico/esportivo", points: 2 }
    ]
  },
  {
    id: 2,
    question: "Qual a sua idade?",
    options: [
      { text: "Menos de 13 anos", points: 6 },
      { text: "Entre 13 e 15 anos", points: 16, isHighlighted: true },
      { text: "Entre 16 e 18 anos", points: 20, isHighlighted: true },
      { text: "Mais de 18 anos", points: 10 }
    ]
  },
  {
    id: 3,
    question: "Qual a sua escolaridade?",
    options: [
      { text: "Ensino Fundamental I (1º ao 5º ano)", points: 6 },
      { text: "Ensino Fundamental II (6º ao 9º ano)", points: 10 },
      { text: "Ensino Médio (1ª a 3ª Ano)", points: 16, isHighlighted: true },
      { text: "Ensino Superior (cursando ou concluído)", points: 14 }
    ]
  },
  {
    id: 4,
    question: "Qual é o seu nível atual de inglês?",
    options: [
      { text: "Básico (consigo entender poucas palavras)", points: 6 },
      { text: "Intermediário (consigo me comunicar no dia a dia)", points: 14 },
      { text: "Avançado (entendo bem e consigo conversar)", points: 22, isHighlighted: true },
      { text: "Fluente (falo e escrevo com facilidade)", points: 26, isHighlighted: true }
    ]
  },
  {
    id: 5,
    question: "Já fez alguma prova de proficiência de inglês na sua vida? Se SIM, qual nota (Toefl, DUOLINGO, SAT, ACT...)?",
    options: [
      { text: "Já, acima de 80%", points: 10, isHighlighted: true },
      { text: "Já, acima de 60%", points: 6 },
      { text: "Já, acima de 40%", points: 3 },
      { text: "Nunca", points: 0 }
    ]
  },
  {
    id: 6,
    question: "Já possui material de vídeo gravado?",
    options: [
      { text: "Sim", points: 8, isHighlighted: true },
      { text: "Não", points: 0 }
    ]
  },
  {
    id: 7,
    question: "Você ou sua família já tiveram alguma experiência internacional?",
    options: [
      { text: "Nunca viajamos para fora do Brasil", points: 3 },
      { text: "Já viajamos a turismo", points: 8 },
      { text: "Já participei de intercâmbio ou curso no exterior", points: 16, isHighlighted: true },
      { text: "Já participei de campeonato/treino fora do Brasil", points: 24, isHighlighted: true }
    ]
  },
  {
    id: 8,
    question: "Há quanto tempo você conhece a Next Academy?",
    options: [
      { text: "Nunca tinha ouvido falar antes", points: 6 },
      { text: "Conheci recentemente (menos de 6 meses)", points: 8 },
      { text: "Acompanho há algum tempo (6 meses a 2 anos)", points: 10, isHighlighted: true },
      { text: "Já conheço e acompanho há mais de 2 anos", points: 12, isHighlighted: true }
    ]
  },
  {
    id: 9,
    question: "Qual a profissão dos seus pais ou responsáveis?",
    options: [
      { text: "Trabalhos operacionais (ex.: serviços gerais, construção, comércio simples)", points: 6 },
      { text: "Profissões técnicas (ex.: vendedor, motorista, auxiliar administrativo)", points: 10 },
      { text: "Profissões de nível superior (ex.: médico, advogado, gerente, empresário)", points: 14, isHighlighted: true },
      { text: "Empresários, executivos ou cargos de alta gestão", points: 18, isHighlighted: true }
    ]
  },
  {
    id: 10,
    question: "Qual é a renda familiar mensal aproximada?",
    options: [
      { text: "Até R$ 3.000", points: 4 },
      { text: "De R$ 3.001 a R$ 6.000", points: 10 },
      { text: "De R$ 6.001 a R$ 10.000", points: 16, isHighlighted: true },
      { text: "Acima de R$ 10.000", points: 22, isHighlighted: true }
    ]
  },
  {
    id: 11,
    question: "Você tem algum patrocinador ou parceiro que já apoia sua carreira?",
    options: [
      { text: "Não tenho", points: 4 },
      { text: "Tenho apoio de familiares apenas", points: 8 },
      { text: "Tenho ajuda de empresas locais/amigos", points: 12, isHighlighted: true },
      { text: "Tenho patrocinador/parceiro estruturado", points: 18, isHighlighted: true }
    ]
  },
  {
    id: 12,
    question: "Quem mais te apoia na sua carreira esportiva hoje?",
    options: [
      { text: "Ninguém, apenas eu mesmo", points: 4 },
      { text: "Meus amigos e professores", points: 6 },
      { text: "Minha família", points: 12, isHighlighted: true },
      { text: "Minha família e patrocinadores/parceiros", points: 22, isHighlighted: true }
    ]
  },
  {
    id: 13,
    question: "Qual a prioridade do esporte na sua vida hoje?",
    options: [
      { text: "Hobby, diversão e saúde", points: 6 },
      { text: "Desenvolvimento pessoal e disciplina", points: 8 },
      { text: "Formação de carreira e estudo através do esporte", points: 20, isHighlighted: true },
      { text: "Carreira profissional no futebol", points: 16, isHighlighted: true }
    ]
  },
  {
    id: 14,
    question: "O que você espera alcançar ao fazer parte da Next Academy?",
    options: [
      { text: "Fazer amigos e me divertir com o futebol", points: 6 },
      { text: "Melhorar minhas habilidades e competir mais", points: 10 },
      { text: "Estudar e jogar em uma escola/universidade americana", points: 22, isHighlighted: true },
      { text: "Construir uma carreira profissional no futebol", points: 18, isHighlighted: true }
    ]
  }
];

const LeadQualificationForm = () => {
  const { toast } = useToast();
  const [showAthleteForm, setShowAthleteForm] = useState(true);
  const [athleteInfo, setAthleteInfo] = useState<AthleteInfo>({
    fullName: '',
    cityState: '',
    birthDate: '',
    parentPhone: ''
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [isWebhookLoading, setIsWebhookLoading] = useState(false);
  const [webhookSent, setWebhookSent] = useState(false);

  const handleAnswer = (questionId: number, points: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: points }));
  };

  const sendWebhookData = async (leadData: any) => {
    setIsWebhookLoading(true);
    try {
      const webhookUrl = 'https://raulgeremia11.app.n8n.cloud/webhook/lead-score';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      toast({
        title: "Dados Enviados",
        description: "As informações foram enviadas com sucesso para análise.",
      });
      
      console.log('Webhook enviado com sucesso:', leadData);
    } catch (error) {
      console.error('Erro ao enviar webhook:', error);
      toast({
        title: "Erro no Envio",
        description: "Não foi possível enviar os dados. As informações foram salvas localmente.",
        variant: "destructive",
      });
    } finally {
      setIsWebhookLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const totalScore = Object.values(answers).reduce((sum, points) => sum + points, 0);
  const progress = (Object.keys(answers).length / questions.length) * 100;

  const checkGates = (answers: Record<number, number>) => {
    // G1 - Inglês: Q4 deve ser Avançado (22) ou Fluente (26)
    const g1 = answers[4] === 22 || answers[4] === 26;
    
    // G2 - Renda: Q10 deve ser R$ 6.001-10.000 (16) ou > R$ 10.000 (22)
    const g2 = answers[10] === 16 || answers[10] === 22;
    
    // G3 - Internacional: Q7 deve ser Intercâmbio (16) ou Campeonato/treino (24)
    const g3 = answers[7] === 16 || answers[7] === 24;
    
    return { g1, g2, g3, hasAnyGate: g1 || g2 || g3 };
  };

  const getScoreCategory = (score: number, answers: Record<number, number>) => {
    const gates = checkGates(answers);
    
    if (score <= 130) {
      return { 
        name: "🎯 SELETIVA", 
        points: "0-130 pontos", 
        color: "seletiva", 
        description: "Entrada Básica",
        icon: Target,
        gradient: "from-seletiva to-seletiva/80"
      };
    }
    
    if (score >= 191 && gates.hasAnyGate) {
      return { 
        name: "🚀 EMBARQUES", 
        points: "≥191 pontos + Gates", 
        color: "embarques", 
        description: "Qualificação Premium",
        icon: Trophy,
        gradient: "from-embarques to-embarques/80",
        gates: gates
      };
    }
    
    // Se score >= 191 mas sem gates, vai para Comercial
    // Ou se score está entre 131-190
    return { 
      name: "💼 COMERCIAL", 
      points: score >= 191 ? "≥191 pontos (sem gates)" : "131-190 pontos", 
      color: "comercial", 
      description: score >= 191 ? "Rebaixado - Sem Gates" : "Qualificação Média",
      icon: Award,
      gradient: "from-comercial to-comercial/80"
    };
  };

  const startQualification = () => {
    setShowAthleteForm(false);
  };

  const resetForm = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
    setShowAthleteForm(true);
    setWebhookSent(false);
    setAthleteInfo({
      fullName: '',
      cityState: '',
      birthDate: '',
      parentPhone: ''
    });
  };

  // Enviar webhook quando mostrar resultado - MUST be before early returns
  useEffect(() => {
    if (showResult && !webhookSent) {
      setWebhookSent(true);
      const category = getScoreCategory(totalScore, answers);
      const gates = checkGates(answers);
      
      // Preparar dados para o webhook
      const leadData = {
        timestamp: new Date().toISOString(),
        athleteInfo: {
          fullName: athleteInfo.fullName,
          cityState: athleteInfo.cityState,
          birthDate: athleteInfo.birthDate,
          parentPhone: athleteInfo.parentPhone,
        },
        qualification: {
          totalScore: totalScore,
          category: category.name,
          description: category.description,
          maxPossibleScore: 253,
        },
        gates: {
          g1_ingles: gates.g1,
          g2_renda: gates.g2,
          g3_internacional: gates.g3,
          hasAnyGate: gates.hasAnyGate,
        },
        answers: questions.map(q => ({
          questionId: q.id,
          question: q.question,
          selectedPoints: answers[q.id] || 0,
          selectedOption: q.options.find(opt => opt.points === answers[q.id])?.text || 'Não respondido',
        })),
        source: 'lead-qualification-form',
        url: window.location.href,
      };
      
      sendWebhookData(leadData);
    }
  }, [showResult, webhookSent, totalScore, answers, athleteInfo]);

  if (showAthleteForm) {
    return (
      <AthleteInfoForm 
        athleteInfo={athleteInfo}
        onAthleteInfoChange={setAthleteInfo}
        onNext={startQualification}
      />
    );
  }

  if (showResult) {
    const category = getScoreCategory(totalScore, answers);
    const CategoryIcon = category.icon;
    
    return (
      <div className="min-h-screen bg-gradient-primary relative overflow-hidden pattern-grid">
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-gradient-geometric opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-glow opacity-5"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-blue/5 rounded-full blur-xl float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent-blue/3 rounded-full blur-2xl" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-primary-blue/4 rounded-full blur-lg float" style={{animationDelay: '2s'}}></div>
        
        <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-4xl card-glow shadow-blue-lg border-primary-blue/10 backdrop-blur-md overflow-hidden">
            {/* Gradient Border Effect */}
            <div className="absolute inset-0 bg-gradient-blue opacity-10 blur-sm"></div>
            
            <CardHeader className="relative text-center pb-8 px-6 sm:px-8 lg:px-12">
              <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-blue/15 rounded-full blur-xl"></div>
                <img 
                  src={nextLogo} 
                  alt="Next Academy Logo" 
                  className="relative h-12 sm:h-16 lg:h-20 w-auto filter brightness-0 invert hover-scale"
                />
              </div>
              </div>
              
              {/* Result Score Circle */}
              <div className="mx-auto w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 bg-gradient-button rounded-full flex items-center justify-center mb-8 shadow-blue-lg pulse-glow relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-button-hover opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative text-2xl sm:text-3xl lg:text-4xl text-white font-bold">{totalScore}</span>
              </div>
              
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-light-text mb-4 text-shimmer">
                Resultado da Qualificação
              </CardTitle>
              <CardDescription className="text-light-text/80 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
                {athleteInfo.fullName} - {athleteInfo.cityState}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative space-y-8 px-6 sm:px-8 lg:px-12 pb-8">
              {/* Category Badge */}
              <div className="text-center">
                <div className={`inline-flex items-center gap-3 text-lg sm:text-xl lg:text-2xl px-8 py-4 mb-6 bg-gradient-to-r ${category.gradient} text-white font-bold rounded-xl shadow-lg hover-scale`}>
                  <CategoryIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                  {category.name}
                </div>
                <p className="text-light-text/90 text-base sm:text-lg lg:text-xl mb-3">{category.description}</p>
                <p className="text-light-text/70 text-sm sm:text-base">{category.points}</p>
                
                {/* Gates Status for Embarques */}
                {category.name.includes("EMBARQUES") && category.gates && (
                  <div className="mt-6 p-4 bg-secondary/20 rounded-xl border border-embarques/30">
                    <h4 className="text-embarques font-bold text-sm sm:text-base mb-3">Gates Ativados:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm">
                      <div className={`p-2 rounded ${category.gates.g1 ? 'bg-embarques/20 text-embarques' : 'bg-muted text-muted-text'}`}>
                        G1 - Inglês {category.gates.g1 ? '✓' : '✗'}
                      </div>
                      <div className={`p-2 rounded ${category.gates.g2 ? 'bg-embarques/20 text-embarques' : 'bg-muted text-muted-text'}`}>
                        G2 - Renda {category.gates.g2 ? '✓' : '✗'}
                      </div>
                      <div className={`p-2 rounded ${category.gates.g3 ? 'bg-embarques/20 text-embarques' : 'bg-muted text-muted-text'}`}>
                        G3 - Internacional {category.gates.g3 ? '✓' : '✗'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Score Details */}
              <div className="space-y-6">
                <div className="flex justify-between items-center text-light-text/80 text-base sm:text-lg">
                  <span>Pontuação Total:</span>
                  <span className="font-bold text-primary-blue text-lg sm:text-xl">{totalScore} pontos</span>
                </div>
                <div className="relative">
                  <Progress value={(totalScore / 253) * 100} className="h-4 sm:h-6 rounded-full overflow-hidden bg-dark-surface/50" />
                  <div className="absolute inset-0 rounded-full shadow-inner"></div>
                </div>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="p-4 sm:p-6 bg-secondary/20 rounded-xl border border-seletiva/30 text-center hover-scale transition-all duration-300 hover:bg-secondary/30">
                  <div className="flex items-center justify-center gap-2 text-seletiva font-bold text-sm sm:text-base mb-2">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                    SELETIVA
                  </div>
                  <div className="text-light-text/70 text-xs sm:text-sm">0-130 pts</div>
                </div>
                <div className="p-4 sm:p-6 bg-secondary/20 rounded-xl border border-comercial/30 text-center hover-scale transition-all duration-300 hover:bg-secondary/30">
                  <div className="flex items-center justify-center gap-2 text-comercial font-bold text-sm sm:text-base mb-2">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                    COMERCIAL
                  </div>
                  <div className="text-light-text/70 text-xs sm:text-sm">131-190 pts</div>
                </div>
                <div className="p-4 sm:p-6 bg-secondary/20 rounded-xl border border-embarques/30 text-center hover-scale transition-all duration-300 hover:bg-secondary/30">
                  <div className="flex items-center justify-center gap-2 text-embarques font-bold text-sm sm:text-base mb-2">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                    EMBARQUES
                  </div>
                  <div className="text-light-text/70 text-xs sm:text-sm">≥191 pts + Gates</div>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                onClick={resetForm} 
                className="w-full bg-gradient-button hover:bg-gradient-button-hover text-white font-bold transition-all duration-300 py-4 sm:py-6 text-base sm:text-lg lg:text-xl shadow-blue-lg btn-glow hover-scale rounded-xl"
              >
                Nova Avaliação
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const currentAnswer = answers[question.id];

  return (
    <div className="min-h-screen bg-gradient-primary relative overflow-hidden pattern-grid">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-geometric opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-glow opacity-5"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary-blue/5 rounded-full blur-xl float"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent-blue/3 rounded-full blur-2xl" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-primary-blue/4 rounded-full blur-lg float" style={{animationDelay: '2s'}}></div>
      
      <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-4xl card-glow shadow-blue-lg border-primary-blue/10 backdrop-blur-md overflow-hidden">
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 bg-gradient-blue opacity-10 blur-sm"></div>
          
          <CardHeader className="relative px-6 sm:px-8 lg:px-12 pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-blue/15 rounded-full blur-xl"></div>
                <img 
                  src={nextLogo} 
                  alt="Next Academy Logo" 
                  className="relative h-10 sm:h-12 lg:h-16 w-auto filter brightness-0 invert hover-scale"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <Badge variant="outline" className="border-primary-blue text-primary-blue px-4 py-2 text-sm font-semibold">
                Pergunta {currentQuestion + 1} de {questions.length}
              </Badge>
              <Badge variant="outline" className="border-primary-blue text-primary-blue px-4 py-2 text-sm font-semibold pulse-glow">
                {totalScore} pontos
              </Badge>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-light-text/70 text-sm mb-2">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-3 sm:h-4 rounded-full overflow-hidden bg-dark-surface/50" />
                <div className="absolute inset-0 rounded-full shadow-inner"></div>
              </div>
            </div>
            
            <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-light-text leading-relaxed">
              {question.question}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative space-y-6 px-6 sm:px-8 lg:px-12 pb-8">
            <RadioGroup 
              value={currentAnswer !== undefined ? currentAnswer.toString() : ""} 
              onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
              className="space-y-4"
            >
              {question.options.map((option, index) => (
                <Label 
                  key={index} 
                  htmlFor={`option-${index}`}
                  className={`flex items-start space-x-4 p-4 sm:p-6 rounded-xl border transition-all duration-300 hover:bg-secondary/20 hover-scale cursor-pointer ${
                    currentAnswer === option.points 
                      ? 'bg-primary-blue/20 border-primary-blue shadow-blue' 
                      : 'border-border-color bg-dark-surface/20'
                  }`}
                >
                  <RadioGroupItem 
                    value={option.points.toString()} 
                    id={`option-${index}`} 
                    className="flex-shrink-0 mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base leading-relaxed text-light-text/90">
                      {option.text}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-text mt-2">
                      {option.points} pontos
                    </div>
                  </div>
                </Label>
              ))}
            </RadioGroup>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
              <Button 
                onClick={prevQuestion} 
                disabled={currentQuestion === 0}
                variant="outline"
                className="order-2 sm:order-1 border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white transition-all duration-300 py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
              <Button 
                onClick={nextQuestion} 
                disabled={currentAnswer === undefined}
                className="order-1 sm:order-2 bg-gradient-button hover:bg-gradient-button-hover text-white font-bold transition-all duration-300 shadow-blue btn-glow hover-scale py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próxima'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeadQualificationForm;