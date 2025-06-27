// js/load-data.js
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.animal-list')) {
    const isBaiasPage = window.location.pathname.includes('baias.html');
    const userId = auth.currentUser.uid;
    const path = isBaiasPage ? 'user-baias/' + userId : 'user-pets/' + userId;
    
    database.ref(path).on('value', (snapshot) => {
      const container = document.querySelector('.animal-list');
      container.innerHTML = '';
      
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        const card = document.createElement('div');
        card.className = 'animal-card';
        
        card.innerHTML = `
          <div class="animal-info">
            ${isBaiasPage ? 
              `<p><strong>${data.nome}</strong></p>
               <p><strong>Porte:</strong> ${data.porte}</p>
               <p><strong>Gênio:</strong> ${data.genio}</p>
               <p><strong>Idade:</strong> ${data.idade}</p>` :
              `<p><strong>Nome:</strong> ${data.nome}</p>
               <p><strong>Sexo:</strong> ${data.sexo}</p>
               <p><strong>Raça:</strong> ${data.raca}</p>
               <p><strong>Gênio:</strong> ${data.genio}</p>`}
          </div>
        `;
        
        container.appendChild(card);
      });
    });
  }
});