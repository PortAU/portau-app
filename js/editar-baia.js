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
    let petsAssociados = [];

    // --- Verifica o usuário logado ---
    auth.onAuthStateChanged(user => {
        if (user) {
            userUid = user.uid;
            
            // --- MODO DE EDIÇÃO: Carrega os dados existentes ---
            submitButton.textContent = "ATUALIZAR";
    
            const baiaRef = database.ref(`user-baias/${userUid}/${baiaId}`);
    
            // Busca os dados da baia específica
            baiaRef.once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
            
                    // --- Preenche o formulário com os dados ---
                    nomeBaiaField.value = data.nome || '';
                    porteField.value = data.porte || '';
                    genioField.value = data.genio || '';
                    idadeField.value = data.idade || '';
                    
                    // --- Carrega pets associados a esta baia ---
                    carregarPetsAssociados(data.nome);
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

    // --- Carrega e exibe pets associados à baia ---
    function carregarPetsAssociados(nomeBaia) {
        database.ref(`user-pets/${userUid}`).once('value')
            .then((snapshot) => {
                petsAssociados = [];
                if (snapshot.exists()) {
                    const pets = snapshot.val();
                    for (const petId in pets) {
                        const pet = pets[petId];
                        if (pet.baia === nomeBaia) {
                            petsAssociados.push({ id: petId, nome: pet.nome });
                        }
                    }
                }
                exibirPetsAssociados();
            })
            .catch(error => {
                console.error("Erro ao carregar pets:", error);
            });
    }

    // --- Exibe lista de pets associados ---
    function exibirPetsAssociados() {
        let container = document.getElementById('pets-associados-container');
        
        // Se o container não existir, cria ele (append no final do form antes dos botões)
        if (!container) {
            container = document.createElement('div');
            container.id = 'pets-associados-container';
            form.insertBefore(container, form.querySelector('.excluir-buttons') || submitButton);
        }

        if (petsAssociados.length === 0) {
            container.innerHTML = `
                <div style="background-color: #f0f0f0; padding: 15px; border-radius: 10px; margin: 20px 0; text-align: center; color: #666;">
                    <p>Nenhum pet associado a esta baia.</p>
                </div>
            `;
        } else {
            let html = `
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #3a9a6c;">
                    <h3 style="color: #3a9a6c; margin-top: 0; font-family: 'Fredoka One', cursive;">Pets associados (${petsAssociados.length})</h3>
                    <ul style="margin: 10px 0; padding-left: 20px;">
            `;
            petsAssociados.forEach(pet => {
                html += `<li style="margin: 8px 0; color: #333;">${pet.nome}</li>`;
            });
            html += `
                    </ul>
                </div>
            `;
            container.innerHTML = html;
        }
    }

    // --- Lógica de Envio do Formulário (Atualizar) ---
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        
        if (!userUid) {
            alert("Você não está logado. Faça login novamente.");
            return;
        }
        
        // Coleta os dados ATUALIZADOS do formulário
        const baiaData = {
            nome: nomeBaiaField.value,
            porte: porteField.value,
            genio: genioField.value,
            idade: idadeField.value
        };

        // Salva os dados usando .update()
        database.ref(`user-baias/${userUid}/${baiaId}`).update(baiaData)
            .then(() => {
                alert("Baia atualizada com sucesso!");
                window.location.href = 'baias.html';
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
            // Verifica se há pets associados
            if (petsAssociados.length > 0) {
                alert(
                    `Não é possível excluir esta baia pois existem ${petsAssociados.length} pet(s) associado(s) a ela:\n\n` +
                    petsAssociados.map(p => `- ${p.nome}`).join('\n') +
                    '\n\nReassigne ou exclua os pets primeiro.'
                );
                return;
            }

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