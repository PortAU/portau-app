document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const baiaId = urlParams.get('id');

  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      alert('Usuário não autenticado.');
      window.location.href = 'index.html';
      return;
    }
    
    const userId = user.uid;
    const form = document.getElementById('edit-baia-form');

    // Carrega os dados da baia
    firebase.database().ref(`user-baias/${userId}/${baiaId}`).once('value')
      .then((snapshot) => {
        const baiaData = snapshot.val();
        if (baiaData) {
          document.getElementById('baia-name').value = baiaData.nome || '';
          document.getElementById('baia-size').value = baiaData.porte || '';
          document.getElementById('baia-temperament').value = baiaData.genio || '';
          document.getElementById('baia-age').value = baiaData.idade || '';
        }
      })
      .catch(error => {
        alert('Erro ao carregar dados da baia: ' + error.message);
      });

    // Atualiza a baia
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const updatedData = {
        nome: form.querySelector('#baia-name').value,
        porte: form.querySelector('#baia-size').value,
        genio: form.querySelector('#baia-temperament').value,
        idade: form.querySelector('#baia-age').value,
        userId: userId,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      };

      const updates = {};
      updates[`/baias/${baiaId}`] = updatedData;
      updates[`/user-baias/${userId}/${baiaId}`] = updatedData;

      firebase.database().ref().update(updates)
        .then(() => {
          alert('Baia atualizada com sucesso!');
          window.location.href = 'baias.html';
        })
        .catch(error => {
          alert('Erro ao atualizar: ' + error.message);
        });
    });

    // Deleta a baia
    document.getElementById('delete-baia').addEventListener('click', () => {
      if (confirm('Tem certeza que deseja deletar esta baia? Todos os animais relacionados serão desvinculados!')) {

        // Atualiza todos os pets vinculados a esta baia para remover a referência
        firebase.database().ref(`user-pets/${userId}`).orderByChild('baia').equalTo(baiaId).once('value')
          .then((snapshot) => {
            const updates = {};

            snapshot.forEach((childSnapshot) => {
              updates[`user-pets/${userId}/${childSnapshot.key}/baia`] = null;
              updates[`pets/${childSnapshot.key}/baia`] = null;
            });

            // Deleta a baia
            updates[`/baias/${baiaId}`] = null;
            updates[`/user-baias/${userId}/${baiaId}`] = null;

            return firebase.database().ref().update(updates);
          })
          .then(() => {
            alert('Baia deletada com sucesso!');
            window.location.href = 'baias.html';
          })
          .catch(error => {
            alert('Erro ao deletar: ' + error.message);
          });
      }
    });
  });
});
