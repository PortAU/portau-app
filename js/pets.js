// js/pets.js
import { compressImage } from "./image-utils.js";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.pet-form');
    const fotoInput = document.getElementById('foto');
    const preview = document.getElementById('preview-foto');
    const baySelect = document.getElementById('pet-bay');
    let fotoBase64 = null; // armazenará a imagem comprimida

    // Carrega as baias disponíveis do usuário
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            const userId = user.uid;
            firebase.database().ref(`user-baias/${userId}`).once('value')
                .then((snapshot) => {
                    baySelect.innerHTML = '<option value="">Selecione uma baia</option>';
                    if (snapshot.exists()) {
                        const baias = snapshot.val();
                        for (const baiaId in baias) {
                            const baia = baias[baiaId];
                            const option = document.createElement('option');
                            option.value = baia.nome || baiaId;
                            option.textContent = baia.nome || 'Sem nome';
                            baySelect.appendChild(option);
                        }
                    } else {
                        // Se não houver baias, adiciona mensagem e desabilita o select
                        baySelect.innerHTML = '<option value="">Nenhuma baia disponível</option>';
                        baySelect.disabled = true;
                    }
                })
                .catch((error) => {
                    console.error('Erro ao carregar baias:', error);
                    baySelect.innerHTML = '<option value="">Erro ao carregar baias</option>';
                    baySelect.disabled = true;
                });
        }
    });

    // PREVIEW + COMPRESSÃO DA IMAGEM
    fotoInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Mostrar preview
        const reader = new FileReader();
        reader.onload = () => {
            preview.src = reader.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(file);

        // Comprimir a imagem e deixar salva em fotoBase64
        fotoBase64 = await compressImage(file, 0.7, 900);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Valida se uma baia foi selecionada
        if (!baySelect.value) {
            alert('Por favor, selecione uma baia para o pet.');
            return;
        }

        const userId = auth.currentUser.uid;
        const newPetKey = database.ref().child('pets').push().key;

        const petData = {
            nome: form.querySelector('#pet-name').value,
            adotado: (form.querySelector('#pet-adopted') ? form.querySelector('#pet-adopted').value === 'true' : false),
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
            foto: fotoBase64 || null,

            userId,
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
