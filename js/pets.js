// js/pets.js
import { compressImage } from "./image-utils.js";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.pet-form');
    const fotoInput = document.getElementById('foto');
    const preview = document.getElementById('preview-foto');
    let fotoBase64 = null; // armazenará a imagem comprimida

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
