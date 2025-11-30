// js/editar-baia.js
document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const database = firebase.database();
    
    // --- Seleciona os elementos do formulário pelos IDs ---
    const form = document.getElementById('baia-form');
    const submitButton = document.getElementById('submit-button');
    const nomeBaiaField = document.getElementById('baia-name');
    const porteField = document.getElementById('baia-size');
    const genioField = document.getElementById('baia-temperament');
    const idadeField = document.getElementById('baia-age');

    // --- Pega o ID da Baia da URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const baiaId = urlParams.get('id');

    if (!baiaId) {
        alert("ID da baia não encontrado. Redirecionando...");
        window.location.href = 'baias.html';
        return;
    }

    let userUid = null;

    // --- Verifica o usuário logado ---
    auth.onAuthStateChanged(user => {
        if (user) {
            userUid = user.uid;
            
                    // --- MODO DE EDIÇÃO: Carrega os dados existentes ---
                    console.log(`Modo de edição. Carregando baia ID: ${baiaId}`);
                    // Muda o texto do botão para "ATUALIZAR"
                    submitButton.textContent = "ATUALIZAR";
            
                    const baiaRef = database.ref(`user-baias/${userUid}/${baiaId}`);
            
                    // Busca os dados da baia específica
                    baiaRef.once('value').then((snapshot) => {
                        if (snapshot.exists()) {
                            const data = snapshot.val();
                    
                            // --- Preenche o formulário com os dados ---
                            // usa as mesmas chaves que a criação (`js/baias.js` grava `nome`, `porte`, `genio`, `idade`)
                            nomeBaiaField.value = data.nome || '';
                            porteField.value = data.porte || '';
                            genioField.value = data.genio || '';
                            idadeField.value = data.idade || '';
                        } else {
                            alert("Baia não encontrada.");
                            window.location.href = 'baias.html';
                        }
                    }).catch(error => {
                        console.error("Erro ao carregar dados da baia:", error);
                        alert("Erro ao carregar dados.");
                    });

        } else {
            console.log("Usuário não logado. O auth.js deve redirecionar.");
        }
    });

    // --- Lógica de Envio do Formulário (Atualizar) ---
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        
        if (!userUid) {
            alert("Você não está logado. Faça login novamente.");
            return;
        }
        
        // Coleta os dados ATUALIZADOS do formulário
        // usa as mesmas chaves que a criação (nome, porte, genio, idade)
        const baiaData = {
            nome: nomeBaiaField.value,
            porte: porteField.value,
            genio: genioField.value,
            idade: idadeField.value
            // adicione fotoUrl aqui quando implementar o upload
        };

        // Salva os dados usando .update()
        database.ref(`user-baias/${userUid}/${baiaId}`).update(baiaData)
            .then(() => {
                alert("Baia atualizada com sucesso!");
                window.location.href = 'baias.html'; // Volta para a lista
            })
            .catch(error => {
                console.error("Erro ao atualizar baia:", error);
                alert("Erro ao atualizar baia.");
            });
    });

    // --- BOTÃO DE EXCLUSÃO ---
    const deleteBtn = document.getElementById('delete-baia');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (!confirm('Tem certeza que deseja excluir esta baia?')) return;

            if (!userUid) {
                alert('Erro de autenticação. Faça login novamente.');
                return;
            }

            try {
                // Remove em ambos locais: node global e node do usuário
                await database.ref(`user-baias/${userUid}/${baiaId}`).remove();
                await database.ref(`baias/${baiaId}`).remove();

                alert('Baia excluída!');
                window.location.href = 'baias.html';
            } catch (err) {
                console.error('Erro ao excluir baia:', err);
                alert('Erro ao excluir baia: ' + (err.message || err));
            }
        });
    }
});