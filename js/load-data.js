document.addEventListener('DOMContentLoaded', () => {
    console.log('load-data.js iniciado');
    
    // --- Elementos do DOM ---
    const container = document.querySelector('.animal-list');
    const searchBar = document.getElementById('search-bar'); // Pega a barra de busca pelo ID
    
    if (!container || !searchBar) {
        console.error('Container .animal-list ou #search-bar não encontrado');
        return;
    }

    // --- Variáveis de Estado ---
    let userUid = null;
    let isBaiasPage = false;
    let path = '';
    let allDataSnapshot = null; // Armazena a lista completa de dados

    // --- Inicialização do Firebase ---
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            console.warn('Usuário não autenticado, redirecionando...');
            window.location.href = 'index.html';
            return;
        }

        console.log('Usuário autenticado:', user.uid);
        userUid = user.uid;
        isBaiasPage = window.location.pathname.includes('baias.html');
        path = isBaiasPage ? `user-baias/${user.uid}` : `user-pets/${user.uid}`;

        console.log(`Monitorando path: ${path}`);
        container.innerHTML = '<div>Carregando...</div>';

        const dataRef = firebase.database().ref(path);

        // --- Listener de Dados do Firebase ---
        // Ouve por mudanças nos dados em tempo real
        dataRef.on('value', (snapshot) => {
            console.log('Dados recebidos:', snapshot.val());
            
            // Salva o snapshot completo na variável de estado
            allDataSnapshot = snapshot; 
            
            // Renderiza a lista com o termo de busca atual (se houver)
            renderList(searchBar.value);

        }, (error) => {
            console.error('Erro no listener:', error);
            container.innerHTML = `<div class="error-state"><p>Erro ao carregar dados</p></div>`;
        });
    });

    // --- Listener da Barra de Busca ---
    // Dispara a cada tecla digitada
    searchBar.addEventListener('input', (event) => {
        const searchTerm = event.target.value;
        renderList(searchTerm); // Re-renderiza a lista com o filtro
    });

    /**
     * Função principal que renderiza a lista de cards, aplicando um filtro
     * @param {string} searchTerm - O texto para filtrar a lista
     */
    function renderList(searchTerm = '') {
        container.innerHTML = ''; // Limpa a lista atual
        const term = searchTerm.toLowerCase();
        let itemsFound = 0;

        if (!allDataSnapshot || !allDataSnapshot.exists()) {
            console.warn('Nenhum dado encontrado para o path:', path);
            container.innerHTML = `
            <div class="empty-state">
                <p>Nenhum ${isBaiasPage ? 'baia' : 'pet'} cadastrado ainda</p>
            </div>
            `;
            return;
        }

        allDataSnapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const itemId = childSnapshot.key;
            
            // --- Lógica de Filtro ---
            let searchableText = '';
            if (isBaiasPage) {
                // Combina todos os campos da baia em um texto de busca
                searchableText = `${data.nomeBaia || ''} ${data.porte || ''} ${data.genio || ''} ${data.idade || ''}`.toLowerCase();
            } else {
                // Combina todos os campos do pet em um texto de busca
                searchableText = `${data.nome || ''} ${data.especie || ''} ${data.raca || ''}`.toLowerCase();
            }

            // Se o texto do card incluir o termo da busca, mostre o card
            if (searchableText.includes(term)) {
                itemsFound++;
                
                const card = document.createElement('div');
                card.className = 'animal-card';
                card.style.cursor = 'pointer';
                // Adiciona o ID ao card para o clique funcionar
                card.dataset.itemId = itemId; 

                // Gera o HTML do card
                if (isBaiasPage) {
                    card.innerHTML = `
                    <div class="animal-info">
                        <h3>${data.nomeBaia || 'Sem nome'}</h3>
                        <p>Porte: ${data.porte || '-'}</p>
                        <p>Gênio: ${data.genio || '-'}</p>
                        <p>Idade: ${data.idade || '-'}</p>
                    </div>`;
                } else {
                    card.innerHTML = `
                    <div class="animal-info">
                        <h3>${data.nome || 'Sem nome'}</h3>
                        <p>Espécie: ${data.especie || '-'}</p>
                        <p>Raça: ${data.raca || '-'}</p>
                    </div>`;
                }
                container.appendChild(card);
            }
        }); // Fim do forEach

        // Mensagem caso a busca não retorne nada
        if (itemsFound === 0 && term.length > 0) {
            container.innerHTML = `
            <div class="empty-state">
                <p>Nenhum resultado encontrado para "${term}"</p>
            </div>
            `;
        }
    }
    
    // --- Listener de Clique (Event Delegation) ---
    // Adiciona um único listener na lista-pai, em vez de um em cada card
    container.addEventListener('click', (event) => {
        // Encontra o card clicado
        const card = event.target.closest('.animal-card');
        
        if (card && card.dataset.itemId) {
            const itemId = card.dataset.itemId;
            
            // Redireciona para a página de edição correta
            if (isBaiasPage) {
                window.location.href = `editar-baia.html?id=${itemId}`;
            } else {
                window.location.href = `editar-pet.html?id=${itemId}`;
            }
        }
    });
}); 