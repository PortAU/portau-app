// js/baias.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.pet-form');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userId = auth.currentUser.uid;
    const newBaiaKey = database.ref().child('baias').push().key;
    
    const baiaData = {
      nome: form.querySelector('#baia-name').value,
      porte: form.querySelector('#baia-size').value,
      genio: form.querySelector('#baia-temperament').value,
      idade: form.querySelector('#baia-age').value,
      userId: userId,
      createdAt: new Date().toISOString()
    };
    
    const updates = {};
    updates['/baias/' + newBaiaKey] = baiaData;
    updates['/user-baias/' + userId + '/' + newBaiaKey] = baiaData;
    
    database.ref().update(updates)
      .then(() => {
        alert('Baia cadastrada com sucesso!');
        window.location.href = 'baias.html';
      })
      .catch(error => {
        alert('Erro ao cadastrar baia: ' + error.message);
      });
  });
});