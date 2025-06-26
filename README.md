# PortAu SJPA 🐾

> Aplicativo PWA para gestão de animais e baias da ONG SJPA.

---

## 🎯 Objetivo

O projeto **PortAu SJPA** tem como objetivo desenvolver um aplicativo para registrar e gerenciar os animais abrigados na ONG SJPA, com o propósito de substituir o procedimento atual. O aplicativo será intuitivo e acessível para que até mesmo idosos, possam utilizá-lo em sua totalidade.

O foco é criar uma ferramenta que centralize as informações, facilite o acesso aos dados dos pets e otimize a rotina dos voluntários e administradores da ONG.

**Status do Projeto:** `Em Desenvolvimento (Layout e Estrutura Front-end Concluídos)`

---

## ✨ Funcionalidades e Telas Implementadas

Até o momento, a estrutura visual e a navegação das seguintes telas foram concluídas:

* **Autenticação e Acesso:**
    * Tela de Login
    * Tela de Criação de Conta de Usuário
    * Tela de Recuperação de Senha

* **Módulo Principal:**
    * Tela Home (Listagem de Pets) com busca.
    * Tela de Listagem de Baias com busca.
    * Navegação fixa entre as seções "Pets" e "Baias".
    * Menu lateral deslizante com acesso ao perfil e suporte.

* **Cadastros:**
    * Formulário de Cadastro de Animal.
    * Formulário de Cadastro de Baia.

* **Menu e Configurações:**
    * Tela de Perfil do Usuário.
    * Tela de Suporte com links de contato.

---

## 🚀 Tecnologias Utilizadas

A estrutura base do front-end foi construída utilizando as seguintes tecnologias web:

* **HTML5:** Para a estruturação semântica de todas as páginas.
* **CSS3:** Para toda a estilização, layouts responsivos (com Flexbox e Grid) e animações.
* **JavaScript (Vanilla):** Para a interatividade do menu lateral.
* **PWA (Progressive Web App):** A estrutura inicial foi criada com um `manifest.json` para permitir a "instalação" do aplicativo em dispositivos móveis.

---

## 📁 Estrutura do Projeto

O projeto segue a seguinte organização de pastas e arquivos:

PORTAU-APP/
├── css/
│   └── style.css
├── images/
│   ├── logo.png
│   └── ... (ícones do app)
├── js/
│   └── menu.js
│
├── baias.html
├── cadastrar-animal.html
├── cadastrar-baia.html
├── criar-conta.html
├── esqueci-senha.html
├── home.html
├── perfil.html
├── suporte.html
│
├── index.html       (Página de Login)
├── manifest.json    (Configuração do PWA)
└── README.md        (Este arquivo)


## 🏃 Como Executar o Projeto

Como este é um projeto front-end puro até o momento, não há necessidade de um servidor ou instalação de dependências.

1.  Clone ou baixe o repositório para a sua máquina.
2.  Abra a pasta do projeto no seu editor de código (como o VS Code).
3.  Abra o arquivo `index.html` em qualquer navegador web moderno (Chrome, Firefox, Edge).

---

## 🔮 Próximos Passos

Os próximos passos planejados para o desenvolvimento do projeto são:

* [ ] Implementar a lógica de autenticação de usuários.
* [ ] Conectar o front-end a um banco de dados para salvar e carregar os dados.
* [ ] Desenvolver o back-end (API) para gerenciar as informações.
* [ ] Implementar a funcionalidade de upload de fotos.
* [ ] Finalizar a configuração do Service Worker (`sw.js`) para funcionalidades offline do PWA.

---

_Desenvolvido com o objetivo de facilitar o cuidado e a gestão dos animais da SJPA._