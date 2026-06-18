export interface SurveyQuestionOption {
  value: string;
  emoji: string;
  label: string;
}

export interface SurveyQuestion {
  id: string;
  field: string; // O nome da coluna correspondente no banco de dados
  questionText: string;
  options: SurveyQuestionOption[];
}

export interface SurveyConfig {
  restaurantName: string;
  welcomeTitle: string;
  welcomeDescription: string;
  startBtnText: string;
  inputPlaceholder: string;
  nameLabel: string;
  commentLabel: string;
  commentDescription: string;
  commentPlaceholder: string;
  submitBtnText: string;
  thanksTitle: string;
  thanksDescription: string;
  thanksButtonText: string;
  logoUrl: string;
  adminPasswordDefault: string;
  questions: SurveyQuestion[];
}

export const surveyConfig: SurveyConfig = {
  restaurantName: "Sabores & Aromas",
  welcomeTitle: "Sua opinião é muito importante!",
  welcomeDescription: "Ajude-nos a melhorar sua experiência. Leva menos de 1 minuto.",
  startBtnText: "Iniciar Pesquisa",
  inputPlaceholder: "Digite seu nome (ex: João)...",
  nameLabel: "Seu Nome (Opcional)",
  commentLabel: "Deseja deixar alguma sugestão ou elogio? (Opcional)",
  commentDescription: "Escreva abaixo o que você achou do restaurante ou sugestões de melhoria.",
  commentPlaceholder: "Escreva seu feedback aqui...",
  submitBtnText: "Enviar Pesquisa",
  thanksTitle: "Muito Obrigado!",
  thanksDescription: "Sua resposta foi enviada com sucesso! Agradecemos o seu tempo e preferência.",
  thanksButtonText: "Responder Novamente",
  // Logo placeholder editável
  logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&h=120&fit=crop&q=80",
  // Senha padrão para a Área Administrativa
  adminPasswordDefault: "admin@2026",
  questions: [
    {
      id: "q1",
      field: "pergunta_atendimento",
      questionText: "Como foi o seu atendimento hoje?",
      options: [
        { value: "Ruim", emoji: "🙁", label: "Ruim" },
        { value: "Regular", emoji: "😐", label: "Regular" },
        { value: "Excelente", emoji: "😊", label: "Excelente" }
      ]
    },
    {
      id: "q2",
      field: "pergunta_comida",
      questionText: "O que você achou da nossa comida?",
      options: [
        { value: "Não gostei", emoji: "😞", label: "Não gostei" },
        { value: "Gostei", emoji: "😊", label: "Gostei" },
        { value: "Incrível!", emoji: "😍", label: "Incrível!" }
      ]
    },
    {
      id: "q3",
      field: "pergunta_ambiente",
      questionText: "Como estava o ambiente do restaurante?",
      options: [
        { value: "Sujo/Desorganizado", emoji: "🧹", label: "Sujo" },
        { value: "Normal", emoji: "😐", label: "Normal" },
        { value: "Impecável!", emoji: "✨", label: "Impecável!" }
      ]
    },
    {
      id: "q4",
      field: "pergunta_retorno",
      questionText: "Você voltaria a comer conosco?",
      options: [
        { value: "Não", emoji: "❌", label: "Não" },
        { value: "Com certeza!", emoji: "🚀", label: "Com certeza!" }
      ]
    }
  ]
};
