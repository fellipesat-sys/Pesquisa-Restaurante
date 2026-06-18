import React, { useState } from 'react';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { surveyConfig } from '../config/surveyConfig';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToSurvey: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSurvey }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Compara com a senha configurada no arquivo de configuração
    if (password === surveyConfig.adminPasswordDefault) {
      onLoginSuccess();
    } else {
      setErrorMsg('Senha incorreta! Tente novamente.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col justify-center min-h-screen">
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 fade-in-up">
        
        {/* Voltar para pesquisa */}
        <button
          onClick={onBackToSurvey}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a pesquisa
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand-600 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            Acesso Administrador
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Digite a senha de administrador para acessar o dashboard de relatórios.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              Senha de Acesso
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite a senha..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition text-slate-800 bg-slate-50/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 font-medium">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-900 active:scale-[0.99] text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md text-sm"
          >
            Entrar no Painel
          </button>
        </form>

        {/* Informações de Customização */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-left bg-slate-50 p-4 rounded-2xl">
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            💡 Dica de Configuração:
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            A senha temporária padrão é <strong className="text-slate-600">admin123</strong>.
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-1.5">
            Para alterar a senha, edite o valor da propriedade <code className="text-brand-650 font-mono bg-brand-50/50 px-1 rounded">adminPasswordDefault</code> no arquivo:
          </p>
          <p className="text-[10px] font-mono text-slate-500 mt-1 truncate bg-slate-200/50 p-1.5 rounded">
            src/config/surveyConfig.ts
          </p>
        </div>
      </div>
    </div>
  );
};
