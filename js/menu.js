// Espera o documento ser totalmente carregado para executar o código
document.addEventListener('DOMContentLoaded', () => {

    // Seleciona os elementos que vamos usar
    const menuButtons = document.querySelectorAll('.menu-button'); // Todos os botões de menu
    const menuContainer = document.getElementById('side-menu-container');

    // Função para abrir/fechar o menu
    function toggleMenu() {
        menuContainer.classList.toggle('is-open');
    }

    // Adiciona o evento de clique a cada botão de menu encontrado
    menuButtons.forEach(button => {
        button.addEventListener('click', toggleMenu);
    });

    // Adiciona o evento para fechar o menu ao clicar no fundo escuro
    menuContainer.addEventListener('click', (event) => {
        // Verifica se o clique foi no container (fundo) e não no painel do menu
        if (event.target === menuContainer) {
            toggleMenu();
        }
    });

});