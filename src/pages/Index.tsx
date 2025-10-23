import React, { useState } from 'react';
import AthleteQualificationForm from '@/components/AthleteQualificationForm';
import nextLogo from '@/assets/next-logo.png';
import { Button } from '@/components/ui/button';
import { Users, CalendarDays, Eye, ShieldCheck } from 'lucide-react';

const Index = () => {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return <AthleteQualificationForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-primary relative overflow-hidden pattern-grid">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-geometric opacity-10 mix-blend-soft-light"></div>
      <div className="absolute inset-0 bg-gradient-glow opacity-5"></div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(ellipse at center, rgba(56,104,255,0.08), transparent 70%)' }}
      />

      {/* Layout wrapper: logo top, centered main block, footer urgency */}
      <div className="relative z-10 min-h-screen flex flex-col px-4 md:px-8 lg:px-16">
        {/* Logo on top with clear breathing space */}
        <div className="flex justify-center pt-8 md:pt-12 lg:pt-16">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-blue/15 rounded-full blur-xl"></div>
            {/* Reduzido para 50% do tamanho atual: 120px -> 60px, 144px -> 72px, 168px -> 84px */}
            <img src={nextLogo} alt="Next Academy Logo" className="relative h-[60px] md:h-[72px] lg:h-[84px] w-auto filter brightness-0 invert" />
          </div>
        </div>

        {/* Main block: vertically centered between logo and footer */}
        <div className="flex-1 flex items-center justify-center mt-12 md:mt-16">
          <div className="max-w-[600px] w-full text-center max-h-[70vh]">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-light-text mb-4 md:mb-6 fade-in-up text-shimmer">
              Agende sua Entrevista
            </h1>
            {/* Description */}
            <p className="text-light-text/80 text-base md:text-lg lg:text-xl mb-4 max-w-[600px] mx-auto fade-in-up delay-200">
              Responda a um questionário rápido e agende sua avaliação com a Next Academy.
            </p>

            {/* Chips (icons/info) */}
            <div className="flex items-center justify-center gap-3 md:gap-3 mb-8 flex-wrap fade-in-up">
              <span className="inline-flex items-center gap-3 rounded-full border border-primary-blue/40 bg-[hsl(var(--dark-surface)/0.4)] px-3 py-1.5 text-xs md:text-sm text-primary-blue">
                <Users className="w-4 h-4" /> 2,4 mil atletas nos Estados Unidos
              </span>
              <span className="inline-flex items-center gap-3 rounded-full border border-primary-blue/40 bg-[hsl(var(--dark-surface)/0.4)] px-3 py-1.5 text-xs md:text-sm text-primary-blue">
                <CalendarDays className="w-4 h-4" /> +130 unidades pelo Brasil
              </span>
              <span className="inline-flex items-center gap-3 rounded-full border border-primary-blue/40 bg-[hsl(var(--dark-surface)/0.4)] px-3 py-1.5 text-xs md:text-sm text-primary-blue">
                <Eye className="w-4 h-4" /> aprimoramento contínuo
              </span>
            </div>

            {/* CTA */}
            <Button
              onClick={() => setShowForm(true)}
              className="w-full md:w-auto mt-6 mb-16 bg-[hsl(var(--primary-blue))] hover:bg-[hsl(var(--primary-blue-dark))] text-white font-bold px-6 md:px-8 lg:px-8 py-3 md:py-4 lg:py-4 rounded-xl shadow-[var(--shadow-blue-lg)] btn-glow transition-transform duration-200 hover:-translate-y-0.5"
            >
              Fazer minha avaliação gratuita
            </Button>

            {/* Security text */}
            <div className="flex items-center justify-center gap-2 md:gap-3 text-[13px] md:text-sm text-primary-blue/90 mb-2">
              <ShieldCheck className="w-4 h-4" /> Avaliação segura • Ambiente protegido
            </div>
            {/* Final note */}
            <p className="text-xs md:text-sm lg:text-base text-muted-text">Sem compromisso. Leva menos de 3 minutos.</p>
          </div>
        </div>

        {/* Footer urgency container with strong separation */}
        <div className="max-w-[600px] w-full mx-auto mt-12 md:mt-16 pb-6 md:pb-8">
          <div className="p-3 md:p-4 border border-primary-blue/20 rounded-xl bg-primary-blue/5 fade-in-up text-center">
            <p className="text-sm md:text-base lg:text-lg text-light-text/80">
              Vagas limitadas. Garanta sua chance...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
