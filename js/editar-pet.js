// =========================
// PEGAR ID DO PET NA URL
// =========================
const urlParams = new URLSearchParams(window.location.search);
const petId = urlParams.get("id");

if (!petId) {
    alert("Erro: nenhum pet selecionado.");
    window.location.href = "home.html";
}

let userId = null;

// =========================
// REFERÊNCIAS
// =========================
const db = firebase.database();

const photoPreview = document.getElementById("pet-photo-preview");
const btnChangePhoto = document.getElementById("btn-change-photo");
const inputPhoto = document.getElementById("pet-photo-input");
const baySelect = document.getElementById("pet-bay");

let currentPhotoBase64 = null;
let newPhotoBase64 = null;

// =========================
// PEGAR USUÁRIO LOGADO
// =========================
firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        alert("Você precisa estar logado.");
        window.location.href = "index.html";
        return;
    }

    userId = user.uid;

    // Carrega as baias disponíveis
    carregarBaias();
    // Depois de ter o userId → carregar os dados do pet
    carregarPet();
});

function carregarBaias() {
    db.ref(`user-baias/${userId}`).once('value')
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

function carregarPet() {
    db.ref("user-pets/" + userId + "/" + petId)
        .once("value")
        .then(snapshot => {
            const pet = snapshot.val();

            if (!pet) {
                alert("Pet não encontrado.");
                return;
            }

            // Preenche inputs
            document.getElementById("pet-name").value = pet.nome || "";
            // Preenche status de adoção (armazenado como booleano)
            const adoptedSelect = document.getElementById("pet-adopted");
            if (adoptedSelect) {
                adoptedSelect.value = (pet.adotado === true || pet.adotado === 'true') ? 'true' : 'false';
            }
            document.getElementById("pet-sex").value = pet.sexo || "";
            document.getElementById("pet-race").value = pet.raca || "";
            document.getElementById("pet-fur").value = pet.pelagem || "";
            document.getElementById("pet-size").value = pet.porte || "";
            document.getElementById("pet-species").value = pet.especie || "";
            document.getElementById("pet-temperament").value = pet.genio || "";
            document.getElementById("pet-bay").value = pet.baia || "";
            document.getElementById("pet-birthdate").value = pet.dataNascimento || "";
            document.getElementById("pet-collection-date").value = pet.dataRecolhimento || "";
            document.getElementById("pet-obs").value = pet.observacoes || "";

            if (pet.foto) {
                currentPhotoBase64 = pet.foto;
                photoPreview.src = pet.foto;
            }
        });
}

// =========================
// BOTÃO "ALTERAR FOTO"
// =========================
btnChangePhoto.addEventListener("click", () => {
    inputPhoto.click();
});

// =========================
// PREVIEW DA NOVA FOTO
// =========================
inputPhoto.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        newPhotoBase64 = e.target.result;
        photoPreview.src = newPhotoBase64;
    };

    reader.readAsDataURL(file);
});

// =========================
// SALVAR ALTERAÇÕES
// =========================
document.getElementById("edit-pet-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Valida se uma baia foi selecionada
    if (!baySelect.value) {
        alert('Por favor, selecione uma baia para o pet.');
        return;
    }

    if (!userId) return alert("Erro de autenticação.");

    const fotoFinal = newPhotoBase64 || currentPhotoBase64;

    const updatedData = {
        nome: document.getElementById("pet-name").value,
        sexo: document.getElementById("pet-sex").value,
        raca: document.getElementById("pet-race").value,
        pelagem: document.getElementById("pet-fur").value,
        porte: document.getElementById("pet-size").value,
        especie: document.getElementById("pet-species").value,
        genio: document.getElementById("pet-temperament").value,
        adotado: (document.getElementById("pet-adopted") ? document.getElementById("pet-adopted").value === 'true' : false),
        baia: document.getElementById("pet-bay").value,
        dataNascimento: document.getElementById("pet-birthdate").value,
        dataRecolhimento: document.getElementById("pet-collection-date").value,
        observacoes: document.getElementById("pet-obs").value,
        foto: fotoFinal
    };

    // Atualiza tanto em user-pets quanto em pets para manter consistência
    await db.ref("user-pets/" + userId + "/" + petId).update(updatedData);
    await db.ref("pets/" + petId).update(updatedData);

    alert("Alterações salvas!");
    window.location.href = "home.html";
});

// =========================
// DELETAR PET
// =========================
document.getElementById("delete-pet").addEventListener("click", async () => {
    if (!confirm("Tem certeza que deseja excluir este pet?")) return;

    await db.ref("user-pets/" + userId + "/" + petId).remove();
    alert("Pet excluído!");
    window.location.href = "home.html";
});
