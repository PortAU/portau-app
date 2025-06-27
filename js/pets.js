// js/pets.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.pet-form');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userId = auth.currentUser.uid;
    const newPetKey = database.ref().child('pets').push().key;
    
    const petData = {
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
      createdAt: new Date().toISOString()
    };
    
    const updates = {};
    updates['/pets/' + newPetKey] = petData;
    updates['/user-pets/' + userId + '/' + newPetKey] = petData;
    
    database.ref().update(updates)
      .then(() => {
        alert('Pet cadastrado com sucesso!');
        window.location.href = 'home.html';
      })
      .catch(error => {
        alert('Erro ao cadastrar pet: ' + error.message);
      });
  });
});