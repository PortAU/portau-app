document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const petId = urlParams.get('id');

  // Espera o Firebase autenticar o usuário antes de fazer qualquer ação
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      alert('Usuário não autenticado.');
      window.location.href = 'index.html';
      return;
    }

    const userId = user.uid;
    const form = document.getElementById('edit-pet-form');

    // Carrega os dados do pet
    firebase.database().ref(`user-pets/${userId}/${petId}`).once('value')
      .then((snapshot) => {
        const petData = snapshot.val();
        if (petData) {
          document.getElementById('pet-name').value = petData.nome || '';
          document.getElementById('pet-sex').value = petData.sexo || '';
          document.getElementById('pet-race').value = petData.raca || '';
          document.getElementById('pet-fur').value = petData.pelagem || ''; // corrigido para "pelagem"
          document.getElementById('pet-size').value = petData.porte || '';
          document.getElementById('pet-species').value = petData.especie || '';
          document.getElementById('pet-temperament').value = petData.genio || '';
          document.getElementById('pet-bay').value = petData.baia || '';
          document.getElementById('pet-birthdate').value = petData.dataNascimento || '';
          document.getElementById('pet-collection-date').value = petData.dataRecolhimento || '';
          document.getElementById('pet-obs').value = petData.observacoes || '';
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar dados do pet:', error);
        alert('Erro ao carregar dados do pet.');
      });

    // Atualiza os dados
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const updatedData = {
        nome: document.getElementById('pet-name').value,
        sexo: document.getElementById('pet-sex').value,
        raca: document.getElementById('pet-race').value,
        pelagem: document.getElementById('pet-fur').value,
        porte: document.getElementById('pet-size').value,
        especie: document.getElementById('pet-species').value,
        genio: document.getElementById('pet-temperament').value,
        baia: document.getElementById('pet-bay').value,
        dataNascimento: document.getElementById('pet-birthdate').value,
        dataRecolhimento: document.getElementById('pet-collection-date').value,
        observacoes: document.getElementById('pet-obs').value,
        userId: userId,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      };

      const updates = {};
      updates[`/pets/${petId}`] = updatedData;
      updates[`/user-pets/${userId}/${petId}`] = updatedData;

      firebase.database().ref().update(updates)
        .then(() => {
          alert('Pet atualizado com sucesso!');
          window.location.href = 'home.html';
        })
        .catch((error) => {
          console.error('Erro ao atualizar:', error);
          alert('Erro ao atualizar o pet.');
        });
    });

    // Deleta o pet
    document.getElementById('delete-pet').addEventListener('click', () => {
      if (confirm('Tem certeza que deseja deletar este pet?')) {
        const updates = {};
        updates[`/pets/${petId}`] = null;
        updates[`/user-pets/${userId}/${petId}`] = null;

        firebase.database().ref().update(updates)
          .then(() => {
            alert('Pet deletado com sucesso!');
            window.location.href = 'home.html';
          })
          .catch((error) => {
            console.error('Erro ao deletar:', error);
            alert('Erro ao deletar o pet.');
          });
      }
    });
  });
});
