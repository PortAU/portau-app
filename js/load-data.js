document.addEventListener('DOMContentLoaded', () => {
    console.log('load-data.js iniciado');

    const container = document.querySelector('.animal-list');
    const searchBar = document.getElementById('search-bar');

    if (!container || !searchBar) {
        console.error('Container .animal-list ou #search-bar não encontrado');
        return;
    }

    let userUid = null;
    let isBaiasPage = false;
    let path = '';
    let allDataSnapshot = null;

    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            console.warn('Usuário não autenticado, redirecionando...');
            window.location.href = 'index.html';
            return;
        }

        userUid = user.uid;
        isBaiasPage = window.location.pathname.includes('baias.html');
        path = isBaiasPage ? `user-baias/${userUid}` : `user-pets/${userUid}`;

        console.log(`Monitorando path: ${path}`);
        container.innerHTML = '<div>Carregando...</div>';

        const dataRef = firebase.database().ref(path);

        dataRef.on('value', (snapshot) => {
            allDataSnapshot = snapshot;
            renderList(searchBar.value);
        }, (error) => {
            console.error('Erro no listener:', error);
            container.innerHTML = `<div class="error-state"><p>Erro ao carregar dados</p></div>`;
        });
    });

    searchBar.addEventListener('input', (event) => {
        renderList(event.target.value);
    });

    function renderList(searchTerm = '') {
        container.innerHTML = '';
        const term = searchTerm.toLowerCase();
        let itemsFound = 0;

        if (!allDataSnapshot || !allDataSnapshot.exists()) {
            container.innerHTML = `
            <div class="empty-state">
                <p>${isBaiasPage ? 'Nenhuma baia cadastrada ainda' : 'Nenhum pet cadastrado ainda'}</p>
            </div>`;
            return;
        }

        allDataSnapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const itemId = childSnapshot.key;

            let searchableText = '';
            if (isBaiasPage) {
                const baiaName = data.nome || data.nomeBaia || '';
                searchableText = `${baiaName} ${data.porte || ''} ${data.genio || ''}`.toLowerCase();
            } else {
                searchableText = `${data.nome || ''} ${data.especie || ''} ${data.raca || ''}`.toLowerCase();
            }

            if (!searchableText.includes(term)) return;
            itemsFound++;

            const card = document.createElement('div');
            card.className = 'animal-card';
            card.style.cursor = 'pointer';
            card.dataset.itemId = itemId;

            // FOTO (trata base64 e URL externa)
            let fotoHTML = '';
            if (!isBaiasPage) {
                let foto = data.foto; // seu editar-pet.js salva em "foto"
                // valida e fallback
                if (!foto || String(foto).trim() === '' || foto === 'undefined' || foto === 'null') {
                    foto = "images/placeholder.png";
                }

                // se for base64 (data:) não aplica cache buster; senão aplica ?v=
                const fotoFinal = String(foto).startsWith('data:')
                    ? foto
                    : `${foto}?v=${Date.now()}`;

                // define tamanho e object-fit aqui para garantir aparência correta
                fotoHTML = `
                    <img 
                        src="${fotoFinal}" 
                        class="animal-photo" 
                        alt="Foto do animal"
                        style="width:90px;height:90px;object-fit:cover;border-radius:12px;"
                        onerror="this.onerror=null;this.src='images/placeholder.png';"
                    />
                `;
            }

            if (isBaiasPage) {
                const baiaName = data.nome || data.nomeBaia || 'Sem nome';
                card.innerHTML = `
                    <div class="animal-info">
                        <h3>${baiaName}</h3>
                        <p>Porte: ${data.porte || '-'}</p>
                        <p>Gênio: ${data.genio || '-'}</p>
                        <p>Idade: ${data.idade || '-'}</p>
                    </div>`;
            } else {
                card.innerHTML = `
                    ${fotoHTML}
                    <div class="animal-info">
                        <h3>${data.nome || 'Sem nome'}</h3>
                        <p>Espécie: ${data.especie || '-'}</p>
                        <p>Raça: ${data.raca || '-'}</p>
                        <p>Baia: ${data.baia || '-'}</p>
                        <p>Status: ${data.adotado ? 'Adotado' : 'Disponível'}</p>
                    </div>`;
            }

            container.appendChild(card);
        });

        if (itemsFound === 0 && term.length > 0) {
            container.innerHTML = `
            <div class="empty-state">
                <p>Nenhum resultado encontrado para "${term}"</p>
            </div>`;
        }
    }

    container.addEventListener('click', (event) => {
        const card = event.target.closest('.animal-card');
        if (card && card.dataset.itemId) {
            const itemId = card.dataset.itemId;
            if (isBaiasPage) {
                window.location.href = `editar-baia.html?id=${itemId}`;
            } else {
                window.location.href = `editar-pet.html?id=${itemId}`;
            }
        }
    });
});
