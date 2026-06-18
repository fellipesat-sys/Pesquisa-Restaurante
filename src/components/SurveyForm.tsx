import React, { useState, useEffect } from 'react';
import { surveyConfig, SurveyQuestion } from '../config/surveyConfig';
import { supabase } from '../utils/supabaseClient';
import { ArrowLeft, Send, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SurveyFormProps {
  // onAdminClick não é mais necessária pois a engrenagem foi removida
}

export const SurveyForm: React.FC<SurveyFormProps> = () => {
  // Inicialização de estados de configuração do sistema dinâmicos
  const [config, setConfig] = useState({
    restaurant_name: surveyConfig.restaurantName,
    welcome_title: surveyConfig.welcomeTitle,
    welcome_description: surveyConfig.welcomeDescription,
    thanks_title: surveyConfig.thanksTitle,
    thanks_description: surveyConfig.thanksDescription,
    logo_url: surveyConfig.logoUrl
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('configuracoes_sistema')
          .select('*')
          .eq('id', 1)
          .maybeSingle();

        if (data && !error) {
          setConfig({
            restaurant_name: data.restaurant_name,
            welcome_title: data.welcome_title,
            welcome_description: data.welcome_description,
            thanks_title: data.thanks_title,
            thanks_description: data.thanks_description,
            logo_url: data.logo_url
          });
        }
      } catch (err) {
        console.warn('Erro ao carregar configurações dinâmicas:', err);
      }
    };

    fetchConfig();
  }, []);

  // Inicialização de estados baseados no arquivo de configuração
  const [currentStep, setCurrentStep] = useState<'welcome' | 'questions' | 'comment' | 'success'>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalQuestions = surveyConfig.questions.length;
  const currentQuestion: SurveyQuestion = surveyConfig.questions[currentQuestionIndex];

  // Iniciar pesquisa
  const handleStartSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('questions');
    setCurrentQuestionIndex(0);
    setErrorMsg(null);
  };

  // Selecionar resposta de uma pergunta
  const handleSelectOption = (questionField: string, val: string) => {
    setResponses(prev => ({ ...prev, [questionField]: val }));
    
    // Pequeno delay antes de avançar para dar feedback visual da seleção
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setCurrentStep('comment');
      }
    }, 250);
  };

  // Voltar passo
  const handleBack = () => {
    if (currentStep === 'comment') {
      setCurrentStep('questions');
      setCurrentQuestionIndex(totalQuestions - 1);
    } else if (currentStep === 'questions') {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
      } else {
        setCurrentStep('welcome');
      }
    }
  };

  // Enviar a pesquisa para o Supabase
  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    // Mapeia dinamicamente as respostas de acordo com as colunas definidas
    const payload: Record<string, any> = {
      cliente_nome: customerName.trim() || 'Anônimo',
      comentario: comment.trim() || null
    };

    surveyConfig.questions.forEach(q => {
      payload[q.field] = responses[q.field] || '';
    });

    try {
      const { error } = await supabase
        .from('respostas_pesquisa')
        .insert([payload]);

      if (error) throw error;

      // Sucesso!
      setCurrentStep('success');
      // Dispara confetes festivos para encantar o cliente
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#4ade80', '#ffffff']
      });
    } catch (error: any) {
      console.error('Erro ao salvar no Supabase:', error);
      setErrorMsg(
        'Não foi possível salvar sua resposta no momento. Mas não se preocupe, estamos salvando localmente!'
      );
      
      // Backup local em caso de erro para não perder o feedback
      try {
        const backup = JSON.parse(localStorage.getItem('respostas_backup') || '[]');
        backup.push({ ...payload, created_at: new Date().toISOString() });
        localStorage.setItem('respostas_backup', JSON.stringify(backup));
        
        // Exibe tela de sucesso mesmo com backup local
        setCurrentStep('success');
        confetti({ particleCount: 60, spread: 50 });
      } catch (lsError) {
        setErrorMsg('Erro de conexão. Por favor, verifique seu acesso à internet e tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reiniciar formulário
  const handleReset = () => {
    setCustomerName('');
    setResponses({});
    setComment('');
    setCurrentStep('welcome');
    setCurrentQuestionIndex(0);
    setErrorMsg(null);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col justify-between min-h-screen">
      
      {/* Cabeçalho com Logo (Topo) */}
      <header className="text-center mb-6">
        <div className="inline-block relative">
          <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden border-2 border-brand-500 shadow-md bg-white flex items-center justify-center">
            {config.logo_url ? (
              <img 
                src={config.logo_url} 
                alt="Logo do Restaurante" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback se a imagem falhar
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&h=120&fit=crop&q=80';
                }}
              />
            ) : (
              <Sparkles className="w-12 h-12 text-brand-500" />
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            Opinar
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-800">
          {config.restaurant_name}
        </h1>
      </header>

      {/* Container Principal do Formulário */}
      <main className="flex-grow flex items-center justify-center my-4">
        
        {/* PASSO 1: TELA DE BOAS-VINDAS */}
        {currentStep === 'welcome' && (
          <div className="w-full bg-white rounded-3xl p-6 shadow-xl border border-slate-100 fade-in-up">
            <div className="text-center mb-6">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand-600 mb-3">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {config.welcome_title}
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                {config.welcome_description}
              </p>
            </div>

            <form onSubmit={handleStartSurvey} className="space-y-5">
              <div>
                <label htmlFor="customer-name" className="block text-sm font-semibold text-slate-700 mb-2">
                  {surveyConfig.nameLabel}
                </label>
                <input
                  id="customer-name"
                  type="text"
                  placeholder={surveyConfig.inputPlaceholder}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition text-slate-800 bg-slate-50/50"
                  maxLength={50}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-brand-600/30 transition-all flex items-center justify-center gap-2 group text-base"
              >
                {surveyConfig.startBtnText}
                <span className="group-hover:translate-x-1 transition-transform">🚀</span>
              </button>
            </form>
          </div>
        )}

        {/* PASSO 2: PERGUNTAS DA PESQUISA */}
        {currentStep === 'questions' && currentQuestion && (
          <div className="w-full bg-white rounded-3xl p-6 shadow-xl border border-slate-100 fade-in-up relative">
            
            {/* Barra de Progresso e Botão de Voltar */}
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={handleBack}
                className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="text-right">
                <span className="text-xs font-semibold text-brand-600">
                  Etapa {currentQuestionIndex + 1} de {totalQuestions}
                </span>
                <div className="w-24 bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="bg-brand-500 h-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Pergunta */}
            <div className="text-center my-6">
              <h3 className="text-xl font-bold text-slate-900 px-2 leading-snug">
                {currentQuestion.questionText}
              </h3>
            </div>

            {/* Opções de Resposta (Emojis Grandes Clicáveis) */}
            <div className={`grid ${currentQuestion.options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-4 mt-6`}>
              {currentQuestion.options.map((option) => {
                const isSelected = responses[currentQuestion.field] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion.field, option.value)}
                    className={`emoji-btn p-5 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
                      isSelected 
                        ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20' 
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100/70 hover:border-slate-200'
                    }`}
                  >
                    <span className="text-4xl md:text-5xl mb-2 filter drop-shadow-sm select-none">
                      {option.emoji}
                    </span>
                    <span className="text-xs font-bold text-slate-700 text-center line-clamp-1">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PASSO 3: CAMPO DE COMENTÁRIO */}
        {currentStep === 'comment' && (
          <div className="w-full bg-white rounded-3xl p-6 shadow-xl border border-slate-100 fade-in-up">
            
            {/* Cabeçalho do comentário com botão de voltar */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={handleBack}
                className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-semibold text-brand-600">Comentários</span>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {surveyConfig.commentLabel}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {surveyConfig.commentDescription}
              </p>
            </div>

            <form onSubmit={handleSubmitSurvey} className="space-y-4">
              <textarea
                rows={4}
                placeholder={surveyConfig.commentPlaceholder}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition text-slate-800 bg-slate-50/50 text-sm resize-none"
                maxLength={500}
              />

              {errorMsg && (
                <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{errorMsg}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-brand-500/10 transition-all flex items-center justify-center gap-2 text-base ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    {surveyConfig.submitBtnText}
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* PASSO 4: TELA DE AGRADECIMENTO */}
        {currentStep === 'success' && (
          <div className="w-full bg-white rounded-3xl p-6 shadow-xl border border-slate-100 text-center fade-in-up py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-50 text-brand-500 mb-6 scale-110">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              {config.thanks_title}
            </h2>
            
            <p className="text-sm text-slate-500 mt-3 px-2 leading-relaxed">
              {config.thanks_description}
            </p>

            <button
              onClick={handleReset}
              className="mt-8 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-semibold py-2.5 px-6 rounded-xl transition-all text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              {surveyConfig.thanksButtonText}
            </button>
          </div>
        )}
      </main>

      {/* Rodapé simplificado e centralizado sem o ícone de engrenagem */}
      <footer className="text-center pt-4 border-t border-slate-100 flex items-center justify-center text-xs text-slate-400">
        <span>&copy; {new Date().getFullYear()} {config.restaurant_name}</span>
      </footer>
    </div>
  );
};
