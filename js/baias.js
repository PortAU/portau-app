document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.pet-form');

  // Aguarda usuário autenticado para usar userId
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      alert('Usuário não autenticado.');
      window.location.href = 'index.html';
      return;
    }

    const userId = user.uid;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newBaiaKey = firebase.database().ref().child('baias').push().key;

      const baiaData = {
        nome: form.querySelector('#baia-name').value,
        porte: form.querySelector('#baia-size').value,
        genio: form.querySelector('#baia-temperament').value,
        idade: form.querySelector('#baia-age').value,
        userId: userId,
        createdAt: new Date().toISOString()
      };

      const updates = {};
      updates[`/baias/${newBaiaKey}`] = baiaData;
      updates[`/user-baias/${userId}/${newBaiaKey}`] = baiaData;

      firebase.database().ref().update(updates)
        .then(() => {
          alert('Baia cadastrada com sucesso!');
          window.location.href = 'baias.html';
        })
        .catch(error => {
          alert('Erro ao cadastrar baia: ' + error.message);
        });
    });
  });
});
