import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Clock, AlertCircle, Users, CheckCircle } from 'lucide-react';
import { format, addDays, isAfter, isBefore, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import nextLogo from '@/assets/next-logo.png';

interface AthleteInfo {
  fullName: string;
  birthDate: string;
  cityState: string;
  parentName: string;
  parentPhone: string;
}

interface VideoCallSchedulerProps {
  athleteInfo: AthleteInfo;
  onScheduleComplete: (schedulingData: any) => void;
  isLoading: boolean;
}

const VideoCallScheduler: React.FC<VideoCallSchedulerProps> = ({
  athleteInfo,
  onScheduleComplete,
  isLoading
}) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Gerar horários disponíveis (10:00 às 22:00)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 10; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Verificar se o horário já passou (para hoje)
  const isTimeSlotAvailable = (time: string, date: Date) => {
    if (!date) return false;
    
    const now = new Date();
    const isToday = format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
    
    if (!isToday) return true; // Se não for hoje, todos horários estão disponíveis
    
    const [hours, minutes] = time.split(':').map(Number);
    const slotTime = setHours(setMinutes(new Date(date), minutes), hours);
    
    return isAfter(slotTime, now);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleScheduleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "⚠️ Campos obrigatórios",
        description: "Por favor, selecione uma data e horário.",
        variant: "destructive"
      });
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledDateTime = setHours(setMinutes(new Date(selectedDate), minutes), hours);

    const schedulingData = {
      scheduledDate: format(selectedDate, 'yyyy-MM-dd'),
      scheduledTime: selectedTime,
      scheduledDateTime: scheduledDateTime.toISOString(),
      athleteName: athleteInfo.fullName,
      parentName: athleteInfo.parentName,
      parentPhone: athleteInfo.parentPhone,
      timestamp: new Date().toISOString()
    };

    onScheduleComplete(schedulingData);
  };

  const today = new Date();
  const tomorrow = addDays(today, 1);

  return (
    <div className="min-h-screen bg-gradient-primary relative overflow-hidden pattern-grid">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-geometric opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-glow opacity-5"></div>
      
      {/* Mobile-optimized floating elements */}
      <div className="absolute top-10 right-5 w-20 h-20 bg-primary-blue/5 rounded-full blur-xl float"></div>
      <div className="absolute bottom-10 left-5 w-24 h-24 bg-accent-blue/3 rounded-full blur-2xl" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 p-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl card-glow shadow-blue-lg border-primary-blue/10 backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-blue opacity-10 blur-sm"></div>
          
          <CardHeader className="relative text-center pb-6 px-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-blue/15 rounded-full blur-xl"></div>
                <img 
                  src={nextLogo} 
                  alt="Next Academy Logo" 
                  className="relative h-12 w-auto filter brightness-0 invert hover-scale" 
                />
              </div>
            </div>
            
            <CardTitle className="text-xl font-bold text-light-text mb-3 text-shimmer">
              📅 Agende sua vídeo-chamada com a Next Academy
            </CardTitle>
            <CardDescription className="text-light-text/80 text-sm leading-relaxed">
              Escolha o melhor horário para conversar com nossos responsáveis
            </CardDescription>
            
            <Badge variant="outline" className="border-primary-blue text-primary-blue mx-auto mt-4 px-4 py-2 text-xs font-semibold hover-scale pulse-glow">
              Última Etapa
            </Badge>
          </CardHeader>
          
          <CardContent className="relative space-y-6 px-6 pb-6">
            {/* Alerta importante */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-amber-100 text-sm font-medium mb-1">
                    Importante: Presença obrigatória dos responsáveis
                  </p>
                  <p className="text-amber-200/80 text-xs">
                    Os responsáveis DEVEM estar presentes na reunião. Escolha um horário que funcione para todos.
                  </p>
                </div>
              </div>
            </div>

            {/* Informações do agendamento */}
            <div className="bg-dark-surface/30 rounded-xl p-4 border border-primary-blue/20">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-primary-blue" />
                <span className="text-light-text font-medium text-sm">Informações confirmadas:</span>
              </div>
              <div className="space-y-1 text-xs text-light-text/70">
                <p><strong>Atleta:</strong> {athleteInfo.fullName}</p>
                <p><strong>Responsável:</strong> {athleteInfo.parentName}</p>
                <p><strong>Telefone:</strong> {athleteInfo.parentPhone}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Seleção de Data */}
              <div className="space-y-3">
                <Label className="text-light-text font-medium text-sm flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-primary-blue" />
                  Selecione a data
                </Label>
                <div className="bg-dark-surface/50 rounded-xl border border-border-color p-3">
                  <div className="grid grid-cols-1 gap-3">
                    {/* Botão HOJE */}
                    <Button
                      variant={selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') ? "default" : "outline"}
                      onClick={() => handleDateSelect(today)}
                      className={`w-full justify-start transition-all duration-200 ${
                        selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
                          ? 'bg-primary-blue text-white shadow-blue' 
                          : 'bg-dark-surface/50 border-border-color text-light-text hover:border-primary-blue/50'
                      }`}
                    >
                      <CalendarIcon className="w-4 h-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">HOJE</div>
                        <div className="text-xs opacity-80">
                          {format(today, "dd/MM/yyyy - EEEE", { locale: ptBR })}
                        </div>
                      </div>
                    </Button>

                    {/* Botão AMANHÃ */}
                    <Button
                      variant={selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd') ? "default" : "outline"}
                      onClick={() => handleDateSelect(tomorrow)}
                      className={`w-full justify-start transition-all duration-200 ${
                        selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')
                          ? 'bg-primary-blue text-white shadow-blue' 
                          : 'bg-dark-surface/50 border-border-color text-light-text hover:border-primary-blue/50'
                      }`}
                    >
                      <CalendarIcon className="w-4 h-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">AMANHÃ</div>
                        <div className="text-xs opacity-80">
                          {format(tomorrow, "dd/MM/yyyy - EEEE", { locale: ptBR })}
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Seleção de Horário */}
              <div className="space-y-3">
                <Label className="text-light-text font-medium text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-blue" />
                  Selecione o horário
                </Label>
                <div className="bg-dark-surface/50 rounded-xl border border-border-color p-3 max-h-80 overflow-y-auto">
                  {selectedDate ? (
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((time) => {
                        const isAvailable = isTimeSlotAvailable(time, selectedDate);
                        return (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            size="sm"
                            disabled={!isAvailable}
                            onClick={() => setSelectedTime(time)}
                            className={`text-xs transition-all duration-200 ${
                              selectedTime === time 
                                ? 'bg-primary-blue text-white shadow-blue' 
                                : isAvailable 
                                  ? 'bg-dark-surface/50 border-border-color text-light-text hover:border-primary-blue/50' 
                                  : 'opacity-50 cursor-not-allowed'
                            }`}
                          >
                            {time}
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-text text-sm">Selecione uma data primeiro</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resumo da seleção */}
            {selectedDate && selectedTime && (
              <div className="bg-primary-blue/10 border border-primary-blue/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-primary-blue" />
                  <span className="text-light-text font-medium text-sm">Agendamento selecionado:</span>
                </div>
                <p className="text-primary-blue font-semibold">
                  {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
                </p>
              </div>
            )}

            {/* Botão de confirmação */}
            <div className="pt-4 border-t border-primary-blue/20">
              <Button 
                onClick={handleScheduleConfirm}
                disabled={!selectedDate || !selectedTime || isLoading}
                className="w-full bg-gradient-button hover:bg-gradient-button-hover text-white font-bold transition-all duration-300 py-3 px-6 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-blue btn-glow hover-scale rounded-xl"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Confirmando agendamento...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Agendamento
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoCallScheduler;