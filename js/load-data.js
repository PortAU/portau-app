document.addEventListener('DOMContentLoaded', () => {
  console.log('load-data.js iniciado');
  const container = document.querySelector('.animal-list');

  if (!container) {
    console.error('Container .animal-list não encontrado');
    return;
  }

  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      console.warn('Usuário não autenticado, redirecionando...');
      window.location.href = 'index.html';
      return;
    }

    console.log('Usuário autenticado:', user.uid);
    const isBaiasPage = window.location.pathname.includes('baias.html');
    const path = isBaiasPage ? `user-baias/${user.uid}` : `user-pets/${user.uid}`;

    console.log(`Monitorando path: ${path}`);
    container.innerHTML = '<div>Carregando...</div>';

    const dataRef = firebase.database().ref(path);

    dataRef.on('value', (snapshot) => {
      console.log('Dados recebidos:', snapshot.val());
      container.innerHTML = '';

      if (!snapshot.exists()) {
        console.warn('Nenhum dado encontrado para o path:', path);
        container.innerHTML = `
          <div class="empty-state">
            <p>Nenhum ${isBaiasPage ? 'baia' : 'pet'} cadastrado ainda</p>
          </div>
        `;
        return;
      }

      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        const itemId = childSnapshot.key;
        console.log(`Processando item ${itemId}:`, data);

        const card = document.createElement('div');
        card.className = 'animal-card';
        card.innerHTML = `
          <div class="animal-info">
            <h3>${data.nome || 'Sem nome'}</h3>
            ${isBaiasPage ? `
              <p>Porte: ${data.porte || '-'}</p>
              <p>Gênio: ${data.genio || '-'}</p>
            ` : `
              <p>Espécie: ${data.especie || '-'}</p>
              <p>Raça: ${data.raca || '-'}</p>
            `}
          </div>
        `;
        container.appendChild(card);
      });
    }, (error) => {
      console.error('Erro no listener:', error);
      container.innerHTML = `
        <div class="error-state">
          <p>Erro ao carregar dados</p>
          <button onclick="window.location.reload()">Tentar novamente</button>
        </div>
      `;
    });
  });
});