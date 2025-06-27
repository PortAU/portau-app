// js/editar-pet.js
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const petId = urlParams.get('id');
  const userId = firebase.auth().currentUser.uid;
  const form = document.getElementById('edit-pet-form');

  // Carrega os dados do pet
  firebase.database().ref(`user-pets/${userId}/${petId}`).once('value')
    .then((snapshot) => {
      const petData = snapshot.val();
      if (petData) {
        // Preenche o formulário
        document.getElementById('pet-name').value = petData.nome || '';
        document.getElementById('pet-sex').value = petData.sexo || '';
        document.getElementById('pet-race').value = petData.raca || '';
        document.getElementById('pet-fur').value = petData.pelo || '';
        document.getElementById('pet-size').value = petData.porte || '';
        document.getElementById('pet-species').value = petData.especie || '';
        document.getElementById('pet-temperament').value = petData.genio || '';
        document.getElementById('pet-bay').value = petData.baia || '';
        document.getElementById('pet-birthdate').value = petData.data_nascimento || '';
        document.getElementById('pet-collection-date').value = petData.data_recolhimento || '';
        document.getElementById('pet-obs').value = petData.observacoes || '';
        // ... (preencha todos os campos) ...
      }
    });

  // Atualiza o pet
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const updatedData = {
      nome: form.querySelector('#pet-name').value,
      sexo: form.querySelector('#pet-sex').value,
      raca: form.querySelector('#pet-race').value,
      pelagem: form.querySelector('#pet-fur').value,
      porte: form.querySelector('#pet-size').value,
      especie: form.querySelector('#pet-species').value,
      genio: form.querySelector('#pet-temperament').value,
      baia: form.querySelector('#pet-bay').value,
      dataNascimento: form.querySelector('#pet-birthdate').value,
      dataRecolhimento: form.querySelector('#pet-collection-date').value,
      observacoes: form.querySelector('#pet-obs').value,
      userId: userId,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    };

    // Atualiza em ambas as localizações
    const updates = {};
    updates[`/pets/${petId}`] = updatedData;
    updates[`/user-pets/${userId}/${petId}`] = updatedData;

    firebase.database().ref().update(updates)
      .then(() => {
        alert('Pet atualizado com sucesso!');
        window.location.href = 'home.html';
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
        });
    }
  });
});