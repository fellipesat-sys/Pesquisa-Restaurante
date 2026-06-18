# 🍽️ Pesquisa de Satisfação - Restaurante

Este é um projeto completo de Pesquisa de Satisfação para Restaurantes desenvolvido com **React**, **TypeScript**, **Vite** e **Tailwind CSS**, integrado ao banco de dados **Supabase** e pronto para produção no **Vercel**.

Ele é dividido em duas partes principais:
1. **Área do Cliente (Mobile-First):** Um formulário moderno, rápido e intuitivo para os clientes responderem suas avaliações através de emojis amigáveis.
2. **Painel Admin (/admin ou ⚙️):** Um painel com indicadores, estatísticas visuais baseadas nas respostas e tabela detalhada com exportação em CSV.

---

## 🛠️ PASSO 1: Configuração do Supabase (Banco de Dados)

1. Acesse o site oficial do [Supabase](https://supabase.com) e crie uma conta gratuita (ou faça login).
2. Clique em **New Project** (Novo Projeto).
3. Insira o nome do projeto (ex: `Pesquisa Restaurante`), defina uma senha segura para o banco de dados e escolha a região mais próxima de você (ex: `South America (São Paulo)`).
4. Aguarde de 1 a 2 minutos enquanto o banco de dados é provisionado.
5. No menu lateral esquerdo, clique no ícone de **SQL Editor** (Editor SQL).
6. Clique em **New Query** (Nova consulta) e cole todo o conteúdo do arquivo [`supabase-schema.sql`](file:///C:/Users/Fellipe/.gemini/antigravity/scratch/restaurante-pesquisa/supabase-schema.sql) que está na raiz deste projeto.
7. Clique no botão **Run** (Executar) no canto inferior direito. Isso criará a tabela e as políticas de segurança.

---

## 🔑 PASSO 2: Copiar e Inserir as Chaves do Supabase

1. No Supabase, no menu lateral esquerdo, clique em **Project Settings** (ícone de engrenagem) e vá em **API**.
2. Copie os seguintes valores:
   - **Project URL:** algo parecido com `https://xyzabc.supabase.co`
   - **API Keys (anon public):** uma chave longa iniciada por `eyJ...`
3. Na raiz deste projeto local, crie um arquivo chamado `.env` (ou duplique o arquivo `.env.example`).
4. Insira os dados copiados correspondentes conforme o exemplo:
   ```env
   VITE_SUPABASE_URL=https://xyzabc.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
   ```

---

## 💻 PASSO 3: Testando Localmente

Para rodar o projeto na sua máquina de forma local:

1. Instale o Node.js em sua máquina (caso não possua).
2. Abra o terminal na pasta do projeto e execute:
   ```bash
   # Instalar dependências
   npm install

   # Iniciar o servidor de desenvolvimento
   npm run dev
   ```
3. Abra o navegador no endereço indicado no terminal (normalmente `http://localhost:5173`).

---

## 🚀 PASSO 4: Publicar no GitHub

Para salvar seu projeto no GitHub (necessário para o deploy automático no Vercel):

1. Crie uma conta ou faça login no [GitHub](https://github.com).
2. Clique em **New Repository** (Novo Repositório), defina um nome (ex: `restaurante-pesquisa`) e clique em **Create Repository** (não adicione README nem .gitignore, o projeto já tem).
3. No terminal da sua pasta local, execute os seguintes comandos (copie e cole):

```bash
# Inicializar repositório Git local
git init

# Adicionar todos os arquivos
git add .

# Criar o primeiro commit
git commit -m "Primeira versao"

# Definir a branch principal como main
git branch -M main

# Conectar ao repositório criado no GitHub (Substitua URL_DO_REPOSITORIO pela sua URL real)
git remote add origin URL_DO_REPOSITORIO

# Enviar os arquivos para o GitHub
git push -u origin main
```

---

## 🌐 PASSO 5: Implantar no Vercel (Publicação Online)

### 1. Criar a conta
1. Acesse o site do [Vercel](https://vercel.com).
2. Cadastre-se gratuitamente clicando em **Sign Up** e selecione a opção de login com o seu **GitHub**.

### 2. Importar o Repositório
1. Na Dashboard do Vercel, clique em **Add New...** e escolha **Project**.
2. O Vercel listará seus repositórios do GitHub. Localize o repositório `restaurante-pesquisa` e clique em **Import**.

### 3. Configurar Variáveis de Ambiente e Fazer Deploy
1. Na tela de importação, expanda a aba **Environment Variables** (Variáveis de Ambiente).
2. Adicione as duas variáveis copiadas do Supabase no PASSO 2:
   - Nome: `VITE_SUPABASE_URL` | Valor: `[Cole sua URL aqui]`
   - Nome: `VITE_SUPABASE_ANON_KEY` | Valor: `[Cole sua chave anon aqui]`
3. Clique no botão **Deploy** no rodapé.
4. Aguarde cerca de 1 minuto. Pronto! Sua aplicação estará no ar e um link gratuito `.vercel.app` será gerado.

### 4. Atualizações Futuras
Sempre que você alterar o código localmente e fizer um push para o GitHub (`git add .`, `git commit -m "update"`, `git push`), o Vercel fará a atualização automática do site em produção em segundos.

---

## 🏷️ PASSO 6: Configurando Domínio Próprio (Opcional)

Se você desejar usar seu próprio domínio (ex: `www.meurestaurante.com.br`):
1. No painel do seu projeto no Vercel, acesse **Settings** > **Domains**.
2. Digite seu domínio e clique em **Add**.
3. O Vercel mostrará as configurações de DNS necessárias (normalmente adicionar um registro `A` ou `CNAME` na plataforma onde você comprou o domínio, como Registro.br ou GoDaddy).
4. Após atualizar na plataforma de domínio, o Vercel ativará o SSL (HTTPS) automaticamente.

---

## 🔒 Acesso e Alteração de Senha Administrativa

- O painel administrativo pode ser acessado adicionando `#/admin` no final da URL do seu site (ou clicando no ícone de engrenagem discreto no rodapé da página inicial).
- A senha padrão configurada é **`admin123`**.
- Para alterar a senha de acesso, abra o arquivo `src/config/surveyConfig.ts` no seu editor e altere o valor da chave `adminPasswordDefault`:
  ```typescript
  adminPasswordDefault: "sua_nova_senha_aqui"
  ```
  Salve e envie as mudanças para o GitHub para atualizar em produção.

---

## 📋 Checklist de Validação

Use esta lista para garantir que tudo está funcionando:

- [ ] **Supabase conectado:** Nenhuma mensagem de aviso amigável no console.
- [ ] **Formulário salvando respostas:** Envie uma resposta teste e verifique se ela aparece no banco de dados do Supabase.
- [ ] **Dashboard carregando dados:** Acesse `[URL]/#admin`, digite a senha e verifique se mostra as métricas e a quantidade total de respostas.
- [ ] **Gráficos funcionando:** Verifique se as barras de distribuição mudam proporcionalmente com as respostas de teste enviadas.
- [ ] **Exportação CSV funcionando:** Clique em "Exportar CSV" e confirme se o download é feito com acentos corretos e pode ser aberto no Excel.
- [ ] **Login administrativo funcionando:** Tente fazer login no painel com a senha padrão (e valide se uma senha incorreta é rejeitada).
- [ ] **Deploy no Vercel funcionando:** Verifique se o site carrega no link público sem erros.
