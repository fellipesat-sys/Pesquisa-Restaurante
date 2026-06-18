import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../utils/supabaseClient';
import { surveyConfig, SurveyQuestion } from '../config/surveyConfig';
import { exportToCSV } from '../utils/csvExporter';
import { 
  LogOut, 
  Download, 
  RefreshCw, 
  Search, 
  Users, 
  RotateCcw, 
  Sparkles, 
  MessageSquare, 
  ChevronDown, 
  Calendar,
  Smile,
  AlertCircle,
  Settings,
  Upload,
  Image
} from 'lucide-react';

interface ResponseData {
  id: string;
  created_at: string;
  cliente_nome: string;
  pergunta_atendimento: string;
  pergunta_comida: string;
  pergunta_ambiente: string;
  pergunta_retorno: string;
  comentario: string | null;
  is_local_backup?: boolean;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [data, setData] = useState<ResponseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Estados para as abas e filtros temporais
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month' | 'year'>('all');

  // Estados para o formulário de configurações dinâmicas
  const [restaurantName, setRestaurantName] = useState('');
  const [welcomeTitle, setWelcomeTitle] = useState('');
  const [welcomeDescription, setWelcomeDescription] = useState('');
  const [thanksTitle, setThanksTitle] = useState('');
  const [thanksDescription, setThanksDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Carregar dados do Supabase
  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Tentar sincronizar backups locais
      await syncLocalBackups();

      // 2. Buscar dados da tabela do Supabase
      const { data: dbData, error } = await supabase
        .from('respostas_pesquisa')
        .select('*')
        .order('created_at', { ascending: sortOrder === 'asc' });

      if (error) throw error;

      setData(dbData || []);
    } catch (err: any) {
      console.error('Erro ao buscar dados:', err);
      setErrorMsg('Não foi possível obter os dados do Supabase. Exibindo dados de backup locais, se houver.');
      
      // Carrega backup local caso falhe a conexão
      try {
        const localBackup = JSON.parse(localStorage.getItem('respostas_backup') || '[]');
        const formattedBackup = localBackup.map((item: any, index: number) => ({
          id: `local-${index}`,
          ...item,
          is_local_backup: true
        }));
        setData(formattedBackup);
      } catch (e) {
        setData([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar configurações dinâmicas do site
  const fetchSystemConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_sistema')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (data && !error) {
        setRestaurantName(data.restaurant_name);
        setWelcomeTitle(data.welcome_title);
        setWelcomeDescription(data.welcome_description);
        setThanksTitle(data.thanks_title);
        setThanksDescription(data.thanks_description);
        setLogoUrl(data.logo_url || '');
      } else {
        // Prefila com os dados estáticos do arquivo se não achar no banco
        setRestaurantName(surveyConfig.restaurantName);
        setWelcomeTitle(surveyConfig.welcomeTitle);
        setWelcomeDescription(surveyConfig.welcomeDescription);
        setThanksTitle(surveyConfig.thanksTitle);
        setThanksDescription(surveyConfig.thanksDescription);
        setLogoUrl(surveyConfig.logoUrl);
      }
    } catch (err) {
      console.warn('Erro ao carregar configurações no admin:', err);
    }
  };

  // Sincronizar backups locais que falharam ao enviar
  const syncLocalBackups = async () => {
    try {
      const backup = JSON.parse(localStorage.getItem('respostas_backup') || '[]');
      if (backup.length === 0) return;

      setIsSyncing(true);
      const successfulInserts: number[] = [];

      for (let i = 0; i < backup.length; i++) {
        const item = { ...backup[i] };
        delete item.is_local_backup; 
        
        const { error } = await supabase
          .from('respostas_pesquisa')
          .insert([item]);
        
        if (!error) {
          successfulInserts.push(i);
        }
      }

      const remainingBackup = backup.filter((_: any, idx: number) => !successfulInserts.includes(idx));
      if (remainingBackup.length > 0) {
        localStorage.setItem('respostas_backup', JSON.stringify(remainingBackup));
      } else {
        localStorage.removeItem('respostas_backup');
      }
    } catch (err) {
      console.warn('Falha ao sincronizar backups locais:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSystemConfig();
  }, [sortOrder]);

  // Filtragem dos dados por período de tempo (Hoje, Mês, Ano, Tudo)
  const timeFilteredData = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return data.filter(item => {
      if (!item.created_at) return true;
      const date = new Date(item.created_at);

      switch (dateFilter) {
        case 'today':
          return date >= startOfToday;
        case 'month':
          return date >= startOfMonth;
        case 'year':
          return date >= startOfYear;
        case 'all':
        default:
          return true;
      }
    });
  }, [data, dateFilter]);

  // Exportar dados filtrados por período para CSV
  const handleExport = () => {
    exportToCSV(timeFilteredData);
  };

  // Inverter ordem de ordenação de data
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // Filtragem final contendo busca + filtro de período
  const filteredData = useMemo(() => {
    return timeFilteredData.filter(item => {
      const nameMatch = (item.cliente_nome || '').toLowerCase().includes(searchTerm.toLowerCase());
      const commentMatch = (item.comentario || '').toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || commentMatch;
    });
  }, [timeFilteredData, searchTerm]);

  // Estatísticas baseadas no período filtrado
  const stats = useMemo(() => {
    const total = timeFilteredData.length;
    if (total === 0) {
      return { total: 0, returnPercentage: 0, satisfactionScore: 0 };
    }

    const returnCount = timeFilteredData.filter(item => item.pergunta_retorno === 'Com certeza!').length;
    const returnPercentage = Math.round((returnCount / total) * 100);

    const satisfiedCount = timeFilteredData.filter(item => {
      const isExcellentAtendimento = item.pergunta_atendimento === 'Excelente';
      const isGoodFood = item.pergunta_comida === 'Gostei' || item.pergunta_comida === 'Incrível!';
      const isCleanEnvironment = item.pergunta_ambiente === 'Impecável!' || item.pergunta_ambiente === 'Normal';
      return isExcellentAtendimento && isGoodFood && isCleanEnvironment;
    }).length;
    const satisfactionScore = Math.round((satisfiedCount / total) * 100);

    return { total, returnPercentage, satisfactionScore };
  }, [timeFilteredData]);

  // Distribuição de respostas por pergunta para alimentar os gráficos
  const questionSummaries = useMemo(() => {
    const total = timeFilteredData.length;
    
    return surveyConfig.questions.map((question: SurveyQuestion) => {
      const optionCounts: Record<string, { count: number; percentage: number }> = {};
      
      question.options.forEach(opt => {
        optionCounts[opt.value] = { count: 0, percentage: 0 };
      });

      if (total > 0) {
        timeFilteredData.forEach(item => {
          const val = item[question.field as keyof ResponseData] as string;
          if (optionCounts[val]) {
            optionCounts[val].count += 1;
          }
        });

        question.options.forEach(opt => {
          optionCounts[opt.value].percentage = Math.round(
            (optionCounts[opt.value].count / total) * 100
          );
        });
      }

      return {
        ...question,
        optionsDistribution: optionCounts
      };
    });
  }, [timeFilteredData]);

  // Upload do logotipo diretamente do computador para o Supabase Storage
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Upload do arquivo para a pasta 'logos' do Storage
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Pegar a URL pública da foto salva no Supabase
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setLogoUrl(publicUrl);
      alert('Foto carregada com sucesso! Lembre-se de clicar em "Salvar Configurações" no final do formulário.');
    } catch (err: any) {
      console.error('Erro no upload da logo:', err);
      alert('Erro ao carregar a imagem. Verifique se criou a pasta "logos" com acesso público no menu Storage do seu Supabase.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Salvar configurações de textos e logo na tabela 'configuracoes_sistema'
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      const { error } = await supabase
        .from('configuracoes_sistema')
        .update({
          restaurant_name: restaurantName,
          welcome_title: welcomeTitle,
          welcome_description: welcomeDescription,
          thanks_title: thanksTitle,
          thanks_description: thanksDescription,
          logo_url: logoUrl
        })
        .eq('id', 1);

      if (error) throw error;
      alert('Configurações salvas com sucesso! O site principal dos seus clientes já está atualizado em tempo real.');
    } catch (err: any) {
      console.error('Erro ao salvar configurações:', err);
      alert('Erro ao salvar as configurações. Verifique se rodou o script SQL de atualização de tabelas no painel do Supabase.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 min-h-screen flex flex-col">
      
      {/* Cabeçalho do Painel Admin */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-brand-500 text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Painel Admin
            </span>
            {isSyncing && (
              <span className="text-[10px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1 font-semibold">
                <RefreshCw className="w-3 h-3 animate-spin" /> Sincronizando dados locais...
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Pesquisa de Satisfação
          </h1>
          <p className="text-sm text-slate-400">
            Acompanhe a opinião dos clientes e gerencie a identidade visual da sua pesquisa.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExport}
            disabled={timeFilteredData.length === 0}
            className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-brand-500/10 text-xs transition"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs transition"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </header>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-150 flex items-start gap-3 text-xs leading-relaxed">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-bold">Aviso importante:</span> {errorMsg}
          </div>
        </div>
      )}

      {/* Abas de Navegação (Dashboard vs Configurações) */}
      <div className="flex border-b border-slate-100 mb-6">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-1.5 py-2.5 px-4 font-bold text-sm border-b-2 transition ${
            activeTab === 'dashboard'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <Smile className="w-4.5 h-4.5" />
          Dashboard e Relatórios
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 py-2.5 px-4 font-bold text-sm border-b-2 transition ${
            activeTab === 'settings'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <Settings className="w-4.5 h-4.5" />
          Configurações do Site
        </button>
      </div>

      {/* VISÃO 1: DASHBOARD E RELATÓRIOS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 fade-in-up">
          
          {/* Seletor de Período dos Gráficos (Dia, Mês, Ano, Tudo) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-650">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Período dos Relatórios:</span>
            </div>
            <div className="flex items-center gap-1">
              {(['all', 'today', 'month', 'year'] as const).map((filter) => {
                const labels = { all: 'Tudo', today: 'Hoje', month: 'Este Mês', year: 'Este Ano' };
                const isActive = dateFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setDateFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/50'
                    }`}
                  >
                    {labels[filter]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Indicadores Rápidos (Métricas) */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Card 1: Total de Pesquisas */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Total no Período
                </span>
                <span className="text-3xl font-extrabold text-slate-950 mt-1 block">
                  {stats.total}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Intenção de Retorno */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Taxa de Retorno
                </span>
                <span className="text-3xl font-extrabold text-brand-600 mt-1 block">
                  {stats.returnPercentage}%
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100">
                <RotateCcw className="w-6 h-6 animate-spin-slow" />
              </div>
            </div>

            {/* Card 3: Satisfação Geral */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Clientes Satisfeitos
                </span>
                <span className="text-3xl font-extrabold text-slate-900 mt-1 block">
                  {stats.satisfactionScore}%
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center border border-yellow-100">
                <Smile className="w-6 h-6" />
              </div>
            </div>
          </section>

          {/* Gráficos Visuais por Pergunta */}
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-500" />
              Resumos Visuais das Perguntas
            </h2>

            {timeFilteredData.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-100/80 text-slate-400">
                Aguardando primeiras respostas para gerar os gráficos neste período.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {questionSummaries.map((summary) => (
                  <div key={summary.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100/80 flex flex-col justify-between">
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">
                        {summary.questionText}
                      </h3>
                    </div>

                    {/* Gráfico de Barras Horizontais */}
                    <div className="space-y-4">
                      {summary.options.map((opt) => {
                        const dist = summary.optionsDistribution[opt.value] || { count: 0, percentage: 0 };
                        return (
                          <div key={opt.value} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-650">
                              <span className="flex items-center gap-1.5">
                                <span className="text-lg filter drop-shadow-sm select-none">{opt.emoji}</span>
                                <span>{opt.label}</span>
                              </span>
                              <span className="text-slate-400">
                                {dist.count} ({dist.percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
                              <div 
                                className="bg-brand-500 h-full rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${dist.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Tabela Detalhada com Lista de Respostas */}
          <section className="flex-grow flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4.5 h-4.5 text-slate-700" />
                Respostas Detalhadas ({filteredData.length})
              </h2>

              <div className="flex items-center gap-2">
                {/* Campo de Busca */}
                <div className="relative max-w-xs w-full">
                  <input
                    type="text"
                    placeholder="Buscar cliente ou comentário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition text-xs text-slate-800 bg-white"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                {/* Ordenação por Data */}
                <button
                  onClick={toggleSortOrder}
                  className="flex items-center gap-1 text-xs border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-xl text-slate-650 transition"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{sortOrder === 'desc' ? 'Recentes' : 'Antigos'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {filteredData.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100/80 text-slate-400">
                Nenhuma resposta encontrada para esta data ou busca.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {filteredData.map((item) => {
                    const date = item.created_at ? new Date(item.created_at).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A';

                    return (
                      <div 
                        key={item.id} 
                        className={`bg-white rounded-2xl p-5 shadow-sm border transition hover:shadow-md ${
                          item.is_local_backup ? 'border-brand-300 bg-brand-50/10' : 'border-slate-100/90'
                        }`}
                      >
                        <div className="flex items-start justify-between border-b border-slate-50 pb-3 mb-3">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                              {item.cliente_nome || 'Anônimo'}
                              {item.is_local_backup && (
                                <span className="text-[9px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded font-bold uppercase">
                                  Offline
                                </span>
                              )}
                            </h4>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              Respondido em: {date}
                            </span>
                          </div>
                        </div>

                        {/* Resumos das Respostas */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 text-xs mb-3">
                          <div>
                            <span className="text-slate-400 block font-medium">Atendimento</span>
                            <span className="font-bold text-slate-755 text-slate-700">{item.pergunta_atendimento}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Comida</span>
                            <span className="font-bold text-slate-755 text-slate-700">{item.pergunta_comida}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Ambiente</span>
                            <span className="font-bold text-slate-755 text-slate-700">{item.pergunta_ambiente}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Voltaria?</span>
                            <span className="font-bold text-slate-755 text-slate-700">{item.pergunta_retorno}</span>
                          </div>
                        </div>

                        {/* Comentário */}
                        {item.comentario ? (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Comentário / Sugestão:
                            </span>
                            <p className="text-xs text-slate-650 italic leading-relaxed">
                              "{item.comentario}"
                            </p>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Sem comentário adicional</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* VISÃO 2: CONFIGURAÇÕES DO SITE (DINÂMICAS) */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/80 space-y-6 fade-in-up">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <Settings className="w-4.5 h-4.5 text-brand-500" />
              Identidade Visual e Textos
            </h3>
            <p className="text-xs text-slate-450 text-slate-400 mt-1">
              Configure as informações e a aparência da tela de pesquisa do cliente.
            </p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-5">
            {/* Nome do Restaurante */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                Nome do Restaurante
              </label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-250 border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition text-sm text-slate-800 bg-slate-50/50"
                required
              />
            </div>

            {/* Logo do Restaurante (Upload do PC) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                  Foto do Logo (Enviar do seu PC)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                  disabled={isUploadingLogo}
                />
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                  Envie uma imagem quadrada. Ela será salva na pasta 'logos' no seu Supabase Storage.
                </p>
              </div>

              <div className="flex items-center justify-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50 min-h-24">
                {isUploadingLogo ? (
                  <div className="flex flex-col items-center gap-1.5 text-xs text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin text-brand-500" />
                    <span>Enviando imagem...</span>
                  </div>
                ) : logoUrl ? (
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-white">
                      <img src={logoUrl} alt="Visualização" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Prévia do Logo</span>
                      <button 
                        type="button" 
                        onClick={() => setLogoUrl('')} 
                        className="text-[10px] text-red-600 hover:underline mt-0.5"
                      >
                        Remover Foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 flex flex-col items-center gap-1">
                    <Image className="w-5 h-5" />
                    <span>Sem imagem de logo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Boas-Vindas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                  Título de Boas-vindas
                </label>
                <input
                  type="text"
                  value={welcomeTitle}
                  onChange={(e) => setWelcomeTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition text-sm text-slate-800 bg-slate-50/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                  Descrição de Boas-vindas
                </label>
                <input
                  type="text"
                  value={welcomeDescription}
                  onChange={(e) => setWelcomeDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition text-sm text-slate-800 bg-slate-50/50"
                  required
                />
              </div>
            </div>

            {/* Agradecimento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                  Título de Agradecimento
                </label>
                <input
                  type="text"
                  value={thanksTitle}
                  onChange={(e) => setThanksTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition text-sm text-slate-800 bg-slate-50/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                  Descrição de Agradecimento
                </label>
                <input
                  type="text"
                  value={thanksDescription}
                  onChange={(e) => setThanksDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition text-sm text-slate-800 bg-slate-50/50"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="submit"
                disabled={isSavingConfig || isUploadingLogo}
                className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-brand-500/10 text-xs transition active:scale-95"
              >
                {isSavingConfig ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Salvar Configurações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
