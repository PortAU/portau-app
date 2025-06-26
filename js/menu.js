// Espera o documento ser totalmente carregado para executar o código
document.addEventListener('DOMContentLoaded', () => {

    // Seleciona os elementos que vamos usar
    const menuButtons = document.querySelectorAll('.header-icon'); // Seleciona pela classe unificada
    const menuContainer = document.getElementById('side-menu-container');

    // Função para abrir/fechar o menu
    function toggleMenu() {
        // Verifica se os elementos foram encontrados antes de usar
        if (menuContainer) {
            menuContainer.classList.toggle('is-open');
        }
    }

    // Adiciona o evento de clique a cada botão de menu encontrado
    if (menuButtons.length > 0) {
        menuButtons.forEach(button => {
            // Verifica se o botão não é o de voltar antes de adicionar o evento
            if (!button.classList.contains('back-button')) {
                button.addEventListener('click', toggleMenu);
            }
        });
    }

    // Adiciona o evento para fechar o menu ao clicar no fundo escuro
    if (menuContainer) {
        menuContainer.addEventListener('click', (event) => {
            // Verifica se o clique foi no container (fundo) e não no painel do menu
            if (event.target === menuContainer) {
                toggleMenu();
            }
        });
    }
});


// --- REGISTRO DO SERVICE WORKER (VERSÃO ATUALIZADA) ---

// Verifica se o navegador suporta Service Workers
if ('serviceWorker' in navigator) {
    // Usa o evento 'load' para garantir que o registro não atrase o carregamento da página
    window.addEventListener('load', () => {
        // Caminho atualizado para o novo local do arquivo e definição do escopo
        navigator.serviceWorker.register('/js/sw.js', { scope: '/' })
            .then(registration => {
                console.log('Service Worker registrado com sucesso! Escopo:', registration.scope);
            })
            .catch(error => {
                console.log('Falha ao registrar o Service Worker:', error);
            });
    });
}