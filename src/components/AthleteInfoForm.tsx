import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import nextLogo from '@/assets/next-logo.png';
import { User, MapPin, Calendar, Phone } from 'lucide-react';

interface AthleteInfo {
  fullName: string;
  cityState: string;
  birthDate: string;
  parentPhone: string;
}

interface AthleteInfoFormProps {
  athleteInfo: AthleteInfo;
  onAthleteInfoChange: (info: AthleteInfo) => void;
  onNext: () => void;
}

const AthleteInfoForm = ({ athleteInfo, onAthleteInfoChange, onNext }: AthleteInfoFormProps) => {
  const handleInputChange = (field: keyof AthleteInfo, value: string) => {
    onAthleteInfoChange({
      ...athleteInfo,
      [field]: value
    });
  };

  const isFormValid = athleteInfo.fullName && athleteInfo.cityState && athleteInfo.birthDate && athleteInfo.parentPhone;

  return (
    <div className="min-h-screen bg-gradient-primary relative overflow-hidden pattern-grid">
      {/* Enhanced Geometric Background */}
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
          
          <CardHeader className="relative text-center pb-8 px-6 sm:px-8 lg:px-12">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-blue/15 rounded-full blur-xl"></div>
                <img 
                  src={nextLogo} 
                  alt="Next Academy Logo" 
                  className="relative h-16 sm:h-20 lg:h-24 w-auto filter brightness-0 invert hover-scale"
                />
              </div>
            </div>
            
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-light-text mb-4 text-shimmer">
              Sistema de Qualificação
            </CardTitle>
            <CardDescription className="text-light-text/80 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
              Next Academy - Informações do Atleta
            </CardDescription>
            
            <Badge 
              variant="outline" 
              className="border-primary-blue text-primary-blue mx-auto mt-6 px-6 py-3 text-sm font-semibold hover-scale pulse-glow"
            >
              Etapa 1 de 2
            </Badge>
          </CardHeader>
          
          <CardContent className="relative space-y-8 px-6 sm:px-8 lg:px-12 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Nome Completo */}
              <div className="space-y-3 lg:col-span-2">
                <Label htmlFor="fullName" className="text-light-text font-semibold text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-blue" />
                  Nome Completo *
                </Label>
                <Input
                  id="fullName"
                  value={athleteInfo.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Digite o nome completo do atleta"
                  className="h-12 bg-dark-surface/50 border-border-color text-light-text placeholder:text-muted-text focus:border-primary-blue focus:ring-primary-blue/20 transition-all duration-300 text-base rounded-xl input-glow"
                />
              </div>
              
              {/* Cidade/Estado */}
              <div className="space-y-3">
                <Label htmlFor="cityState" className="text-light-text font-semibold text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-blue" />
                  Cidade/Estado *
                </Label>
                <Input
                  id="cityState"
                  value={athleteInfo.cityState}
                  onChange={(e) => handleInputChange('cityState', e.target.value)}
                  placeholder="Ex: São Paulo/SP"
                  className="h-12 bg-dark-surface/50 border-border-color text-light-text placeholder:text-muted-text focus:border-primary-blue focus:ring-primary-blue/20 transition-all duration-300 text-base rounded-xl input-glow"
                />
              </div>
              
              {/* Data de Nascimento */}
              <div className="space-y-3">
                <Label htmlFor="birthDate" className="text-light-text font-semibold text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-blue" />
                  Data de Nascimento *
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={athleteInfo.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className="h-12 bg-dark-surface/50 border-border-color text-light-text placeholder:text-muted-text focus:border-primary-blue focus:ring-primary-blue/20 transition-all duration-300 text-base rounded-xl input-glow"
                />
              </div>
              
              {/* Telefone dos Responsáveis */}
              <div className="space-y-3 lg:col-span-2">
                <Label htmlFor="parentPhone" className="text-light-text font-semibold text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary-blue" />
                  Telefone dos Responsáveis *
                </Label>
                <MaskedInput
                  id="parentPhone"
                  mask="(99) 99999-9999"
                  value={athleteInfo.parentPhone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('parentPhone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="bg-dark-surface/50 border-border-color text-light-text placeholder:text-muted-text focus:border-primary-blue focus:ring-primary-blue/20"
                />
              </div>
            </div>

            {/* Divisor e Botão */}
            <div className="pt-8 border-t border-primary-blue/20">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-muted-text text-sm order-2 sm:order-1">
                  * Campos obrigatórios
                </div>
                <Button 
                  onClick={onNext}
                  disabled={!isFormValid}
                  className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-button hover:bg-gradient-button-hover text-white font-bold transition-all duration-300 py-4 px-8 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-blue btn-glow hover-scale rounded-xl min-w-[200px]"
                >
                  Iniciar Avaliação
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AthleteInfoForm;