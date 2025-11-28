// js/estoque.js
document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const database = firebase.database();
    
    // Elementos do DOM
    const mainMenu = document.getElementById('main-menu');
    const adicionarSection = document.getElementById('adicionar-section');
    const editarSection = document.getElementById('editar-section');
    const consultarSection = document.getElementById('consultar-section');
    const excluirSection = document.getElementById('excluir-section');
    const itemsList = document.getElementById('items-list');
    const resumoContent = document.getElementById('resumo-content');
    const totalUnidades = document.getElementById('total-unidades');
    
    // Botões do menu principal
    const btnAdicionar = document.getElementById('btn-adicionar');
    const btnConsultar = document.getElementById('btn-consultar');
    const btnExcluir = document.getElementById('btn-excluir');
    
    // Formulários
    const formAdicionar = document.getElementById('form-adicionar');
    const formEditar = document.getElementById('form-editar');
    const formFiltro = document.getElementById('form-filtro');
    const btnFiltrar = document.getElementById('btn-filtrar');
    const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');
    
    // Botões de exclusão
    const btnExcluirSim = document.getElementById('btn-excluir-sim');
    const btnExcluirNao = document.getElementById('btn-excluir-nao');
    
    // Abas
    const tabButtons = document.querySelectorAll('.tab-button');
    const labelNome = document.getElementById('label-nome');
    const labelFiltroNome = document.getElementById('label-filtro-nome');
    const labelTipo = document.getElementById('label-tipo');
    const excluirTitle = document.getElementById('excluir-title');
    
    // Campos específicos
    const camposMedicamentos = document.getElementById('campos-medicamentos');
    const camposEditMedicamentos = document.getElementById('campos-edit-medicamentos');
    const filtrosMedicamentos = document.getElementById('filtros-medicamentos');
    const groupQuantidadeRacao = document.getElementById('group-quantidade-racao');
    const groupEditQuantidadeRacao = document.getElementById('group-edit-quantidade-racao');
    const itemTipoRacao = document.getElementById('item-tipo-racao');
    const itemTipoMedicamento = document.getElementById('item-tipo-medicamento');
    const editItemTipoRacao = document.getElementById('edit-item-tipo-racao');
    const editItemTipoMedicamento = document.getElementById('edit-item-tipo-medicamento');
    const filtroTipoRacao = document.getElementById('filtro-tipo-racao');
    const filtroTipoMedicamento = document.getElementById('filtro-tipo-medicamento');
    
    // Estado da aplicação
    let currentTab = 'racao';
    let userUid = null;
    let userName = '';
    let allItems = [];
    let selectedItemForDelete = null;

    // Autenticação
    auth.onAuthStateChanged(user => {
        if (!user) {
            console.warn('Usuário não autenticado, redirecionando...');
            window.location.href = 'index.html';
            return;
        }
        
        console.log('Usuário autenticado:', user.uid);
        userUid = user.uid;
        
        // Busca o nome do usuário
        database.ref('users/' + userUid).once('value').then(snapshot => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                userName = userData.nome || userData.username || user.email || 'Usuário';
            } else {
                userName = user.displayName || user.email || 'Usuário';
            }
            loadItems();
        });
    });

    // Navegação entre abas
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            currentTab = button.dataset.tab;
            updateLabels();
            toggleFieldsByTab();
            loadItems();
            showMainMenu();
        });
    });

    // Atualiza os labels e campos conforme a aba
    function updateLabels() {
        if (currentTab === 'racao') {
            labelNome.textContent = 'Nome da Ração';
            labelFiltroNome.textContent = 'Nome da Ração';
            labelTipo.textContent = 'Tipo';
            excluirTitle.textContent = 'Excluir ração?';
            
            // Atualiza placeholders para ração
            document.getElementById('item-nome').placeholder = 'Ex: Pedigree Adulto';
            document.getElementById('item-tipo-racao').placeholder = 'Ex: Premium';
        } else {
            labelNome.textContent = 'Nome do Medicamento';
            labelFiltroNome.textContent = 'Nome do Medicamento';
            labelTipo.textContent = 'Tipo de Medicamento';
            excluirTitle.textContent = 'Excluir medicamento?';
            
            // Atualiza placeholders para medicamentos
            document.getElementById('item-nome').placeholder = 'Ex: Drontal Plus';
            document.getElementById('item-quantidade-medicamento').placeholder = '50';
        }
    }

    // Mostra/esconde campos conforme a aba
    function toggleFieldsByTab() {
        if (currentTab === 'racao') {
            // Ração - Adicionar
            groupQuantidadeRacao.classList.remove('hidden');
            camposMedicamentos.classList.add('hidden');
            itemTipoRacao.classList.remove('hidden');
            itemTipoMedicamento.classList.add('hidden');
            
            // Ração - Editar
            groupEditQuantidadeRacao.classList.remove('hidden');
            camposEditMedicamentos.classList.add('hidden');
            editItemTipoRacao.classList.remove('hidden');
            editItemTipoMedicamento.classList.add('hidden');
            
            // Filtros
            filtroTipoRacao.classList.remove('hidden');
            filtroTipoMedicamento.classList.add('hidden');
            filtrosMedicamentos.classList.add('hidden');
            
            // Remove required
            document.getElementById('item-quantidade-medicamento').removeAttribute('required');
            document.getElementById('item-validade').removeAttribute('required');
            itemTipoMedicamento.removeAttribute('required');
        } else {
            // Medicamentos - Adicionar
            groupQuantidadeRacao.classList.add('hidden');
            camposMedicamentos.classList.remove('hidden');
            itemTipoRacao.classList.add('hidden');
            itemTipoMedicamento.classList.remove('hidden');
            
            // Medicamentos - Editar
            groupEditQuantidadeRacao.classList.add('hidden');
            camposEditMedicamentos.classList.remove('hidden');
            editItemTipoRacao.classList.add('hidden');
            editItemTipoMedicamento.classList.remove('hidden');
            
            // Filtros
            filtroTipoRacao.classList.add('hidden');
            filtroTipoMedicamento.classList.remove('hidden');
            filtrosMedicamentos.classList.remove('hidden');
            
            // Adiciona required
            document.getElementById('item-quantidade-medicamento').setAttribute('required', 'required');
            document.getElementById('item-validade').setAttribute('required', 'required');
            itemTipoMedicamento.setAttribute('required', 'required');
        }
    }

    // Mostra o menu principal e esconde outras seções
    function showMainMenu() {
        mainMenu.classList.remove('hidden');
        adicionarSection.classList.add('hidden');
        editarSection.classList.add('hidden');
        consultarSection.classList.add('hidden');
        excluirSection.classList.add('hidden');
        itemsList.classList.add('hidden');
    }

    // Navegação do menu
    btnAdicionar.addEventListener('click', () => {
        mainMenu.classList.add('hidden');
        adicionarSection.classList.remove('hidden');
        formAdicionar.reset();
        
        // Define valor padrão para quantidade mínima
        if (currentTab === 'medicamentos') {
            document.getElementById('item-quantidade-minima').value = 10;
        }
    });

    btnConsultar.addEventListener('click', () => {
        mainMenu.classList.add('hidden');
        consultarSection.classList.remove('hidden');
        itemsList.classList.remove('hidden');
        renderItems(allItems, false, true); // modo consulta com editar
    });

    btnExcluir.addEventListener('click', () => {
        if (allItems.length === 0) {
            alert('Não há itens para excluir.');
            return;
        }
        mainMenu.classList.add('hidden');
        itemsList.classList.remove('hidden');
        renderItems(allItems, true); // modo exclusão
    });

    // Botão cancelar edição
    btnCancelarEdicao.addEventListener('click', () => {
        showMainMenu();
    });

    // Função para registrar movimentação no histórico
    function registrarMovimentacao(tipo, itemNome, quantidade, acao) {
        const movimentacao = {
            tipo: tipo,
            itemNome: itemNome,
            quantidade: quantidade,
            acao: acao, // 'entrada' ou 'saida'
            usuario: userName,
            userId: userUid,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            data: new Date().toISOString()
        };
        
        database.ref(`user-estoque/${userUid}/historico`).push(movimentacao);
    }

    // Formulário de adicionar
    formAdicionar.addEventListener('submit', (e) => {
        e.preventDefault();
        
        console.log('Formulário submetido!'); // Debug
        
        const nome = document.getElementById('item-nome').value.trim();
        
        if (!nome) {
            alert('Por favor, preencha o nome do item.');
            return;
        }
        
        let itemData = {
            nome: nome,
            categoria: currentTab,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            createdBy: userName,
            createdByUid: userUid
        };
        
        if (currentTab === 'racao') {
            const quantidade = document.getElementById('item-quantidade').value.trim();
            const tipo = itemTipoRacao.value.trim();
            
            if (!quantidade || !tipo) {
                alert('Por favor, preencha todos os campos.');
                return;
            }
            
            itemData.quantidade = quantidade;
            itemData.tipo = tipo;
            
            console.log('Dados da ração:', itemData); // Debug
        } else {
            // Medicamentos
            const quantidadeMed = document.getElementById('item-quantidade-medicamento').value;
            const quantidadeMin = document.getElementById('item-quantidade-minima').value || '10';
            const validade = document.getElementById('item-validade').value;
            const tipo = itemTipoMedicamento.value;
            
            console.log('Valores medicamentos:', {quantidadeMed, quantidadeMin, validade, tipo}); // Debug
            
            if (!quantidadeMed || !validade || !tipo) {
                alert('Por favor, preencha todos os campos obrigatórios (Nome, Quantidade, Validade e Tipo).');
                return;
            }
            
            itemData.quantidade = parseInt(quantidadeMed);
            itemData.quantidadeMinima = parseInt(quantidadeMin);
            itemData.unidade = 'unidades';
            itemData.dataValidade = validade;
            itemData.tipo = tipo;
            
            console.log('Dados do medicamento:', itemData); // Debug
        }
        
        const newItemKey = database.ref().child(`user-estoque/${userUid}/${currentTab}`).push().key;
        
        console.log('Salvando no Firebase...', newItemKey); // Debug
        
        database.ref(`user-estoque/${userUid}/${currentTab}/${newItemKey}`).set(itemData)
            .then(() => {
                console.log('Salvo com sucesso!'); // Debug
                // Registra no histórico
                registrarMovimentacao(
                    currentTab,
                    nome,
                    itemData.quantidade,
                    'entrada'
                );
                
                alert(`${currentTab === 'racao' ? 'Ração' : 'Medicamento'} adicionado com sucesso!`);
                formAdicionar.reset();
                
                // Define valor padrão novamente após reset
                if (currentTab === 'medicamentos') {
                    document.getElementById('item-quantidade-minima').value = '10';
                }
                
                loadItems();
                showMainMenu();
            })
            .catch(error => {
                console.error('Erro ao adicionar item:', error);
                alert('Erro ao adicionar item: ' + error.message);
            });
    });

    // Formulário de editar
    formEditar.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const itemId = document.getElementById('edit-item-id').value;
        const nome = document.getElementById('edit-item-nome').value.trim();
        
        if (!itemId || !nome) {
            alert('Erro ao editar item.');
            return;
        }
        
        let itemData = {
            nome: nome,
            updatedAt: firebase.database.ServerValue.TIMESTAMP,
            updatedBy: userName,
            updatedByUid: userUid
        };
        
        if (currentTab === 'racao') {
            const quantidade = document.getElementById('edit-item-quantidade').value.trim();
            const tipo = editItemTipoRacao.value.trim();
            
            itemData.quantidade = quantidade;
            itemData.tipo = tipo;
        } else {
            const quantidadeMed = document.getElementById('edit-item-quantidade-medicamento').value;
            const quantidadeMin = document.getElementById('edit-item-quantidade-minima').value;
            const validade = document.getElementById('edit-item-validade').value;
            const tipo = editItemTipoMedicamento.value;
            
            itemData.quantidade = parseInt(quantidadeMed);
            itemData.quantidadeMinima = parseInt(quantidadeMin);
            itemData.dataValidade = validade;
            itemData.tipo = tipo;
        }
        
        database.ref(`user-estoque/${userUid}/${currentTab}/${itemId}`).update(itemData)
            .then(() => {
                alert('Item atualizado com sucesso!');
                loadItems();
                showMainMenu();
            })
            .catch(error => {
                console.error('Erro ao atualizar:', error);
                alert('Erro ao atualizar item: ' + error.message);
            });
    });

    // Função para editar item
    function editarItem(itemId) {
        const item = allItems.find(i => i.id === itemId);
        if (!item) return;
        
        // Esconde tudo e mostra seção de editar
        mainMenu.classList.add('hidden');
        consultarSection.classList.add('hidden');
        itemsList.classList.add('hidden');
        editarSection.classList.remove('hidden');
        
        // Preenche o formulário
        document.getElementById('edit-item-id').value = itemId;
        document.getElementById('edit-item-nome').value = item.nome;
        
        if (currentTab === 'racao') {
            document.getElementById('edit-item-quantidade').value = item.quantidade;
            editItemTipoRacao.value = item.tipo;
        } else {
            document.getElementById('edit-item-quantidade-medicamento').value = item.quantidade;
            document.getElementById('edit-item-quantidade-minima').value = item.quantidadeMinima || 10;
            document.getElementById('edit-item-validade').value = item.dataValidade;
            editItemTipoMedicamento.value = item.tipo;
        }
    }

    // Filtrar itens
    btnFiltrar.addEventListener('click', () => {
        const filtroNome = document.getElementById('filtro-nome').value.toLowerCase().trim();
        
        let filtered = allItems;
        
        if (currentTab === 'racao') {
            const filtroTipo = filtroTipoRacao.value.toLowerCase().trim();
            
            filtered = allItems.filter(item => {
                const matchNome = !filtroNome || item.nome.toLowerCase().includes(filtroNome);
                const matchTipo = !filtroTipo || item.tipo.toLowerCase().includes(filtroTipo);
                return matchNome && matchTipo;
            });
        } else {
            // Medicamentos
            const filtroTipo = filtroTipoMedicamento.value;
            const filtroQtdMin = document.getElementById('filtro-quantidade-min').value;
            const filtroValidade = document.getElementById('filtro-validade').value;
            const filtroEstoque = document.getElementById('filtro-estoque').value;
            
            filtered = allItems.filter(item => {
                const matchNome = !filtroNome || item.nome.toLowerCase().includes(filtroNome);
                const matchTipo = !filtroTipo || item.tipo === filtroTipo;
                const matchQtd = !filtroQtdMin || item.quantidade >= parseInt(filtroQtdMin);
                
                let matchValidade = true;
                if (filtroValidade) {
                    const status = getValidadeStatus(item.dataValidade);
                    if (filtroValidade === 'valido') matchValidade = status === 'valido';
                    else if (filtroValidade === 'proximo') matchValidade = status === 'proximo';
                    else if (filtroValidade === 'vencido') matchValidade = status === 'vencido';
                }
                
                let matchEstoque = true;
                if (filtroEstoque) {
                    const statusEstoque = getEstoqueStatus(item.quantidade, item.quantidadeMinima);
                    if (filtroEstoque === 'esgotado') matchEstoque = statusEstoque === 'esgotado';
                    else if (filtroEstoque === 'baixo') matchEstoque = statusEstoque === 'baixo';
                    else if (filtroEstoque === 'normal') matchEstoque = statusEstoque === 'normal';
                }
                
                return matchNome && matchTipo && matchQtd && matchValidade && matchEstoque;
            });
        }
        
        renderItems(filtered, false, true);
    });

    // Verifica o status da validade
    function getValidadeStatus(dataValidade) {
        if (!dataValidade) return 'valido';
        
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const validade = new Date(dataValidade + 'T00:00:00');
        const diferenca = validade - hoje;
        const diasRestantes = Math.ceil(diferenca / (1000 * 60 * 60 * 24));
        
        if (diasRestantes < 0) return 'vencido';
        if (diasRestantes <= 30) return 'proximo';
        return 'valido';
    }

    // Verifica o status do estoque
    function getEstoqueStatus(quantidade, quantidadeMinima = 10) {
        if (quantidade === 0) return 'esgotado';
        if (quantidade <= quantidadeMinima) return 'baixo';
        return 'normal';
    }

    // Formata a data para exibição
    function formatarData(dataString) {
        if (!dataString) return '';
        const data = new Date(dataString + 'T00:00:00');
        return data.toLocaleDateString('pt-BR');
    }

    // Carregar itens do Firebase
    function loadItems() {
        if (!userUid) return;
        
        const itemsRef = database.ref(`user-estoque/${userUid}/${currentTab}`);
        
        itemsRef.on('value', (snapshot) => {
            allItems = [];
            
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    allItems.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });
            }
            
            updateResumo();
        });
    }

    // Renderizar itens na lista
    function renderItems(items, deleteMode = false, editMode = false) {
        itemsList.innerHTML = '';
        
        if (items.length === 0) {
            itemsList.innerHTML = '<div class="empty-state"><p>Nenhum item encontrado</p></div>';
            return;
        }
        
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'estoque-card';
            
            // Adiciona classes de cor para medicamentos
            if (currentTab === 'medicamentos') {
                if (item.dataValidade) {
                    const statusValidade = getValidadeStatus(item.dataValidade);
                    if (statusValidade === 'vencido') card.classList.add('card-vencido');
                    else if (statusValidade === 'proximo') card.classList.add('card-proximo-vencimento');
                }
                
                const statusEstoque = getEstoqueStatus(item.quantidade, item.quantidadeMinima);
                if (statusEstoque === 'esgotado') card.classList.add('card-esgotado');
                else if (statusEstoque === 'baixo') card.classList.add('card-estoque-baixo');
            }
            
            let infoHTML = `
                <div class="estoque-info">
                    <h3>${item.nome}</h3>
                    <p>Quantidade: ${item.quantidade}${item.unidade ? ' ' + item.unidade : ''}</p>
                    <p>Tipo: ${item.tipo}</p>
            `;
            
            if (currentTab === 'medicamentos') {
                // Alertas de estoque
                const statusEstoque = getEstoqueStatus(item.quantidade, item.quantidadeMinima);
                if (statusEstoque === 'esgotado') {
                    infoHTML += `<p style="color:#d32f2f;font-weight:bold;">⚠️ ESGOTADO</p>`;
                } else if (statusEstoque === 'baixo') {
                    infoHTML += `<p style="color:#f57c00;font-weight:bold;">⚠️ ESTOQUE BAIXO (Mín: ${item.quantidadeMinima || 10})</p>`;
                }
                
                // Alertas de validade
                if (item.dataValidade) {
                    const statusValidade = getValidadeStatus(item.dataValidade);
                    let statusTexto = '';
                    
                    if (statusValidade === 'vencido') statusTexto = ' ⚠️ VENCIDO';
                    else if (statusValidade === 'proximo') statusTexto = ' ⚠️ Vence em breve';
                    
                    infoHTML += `<p>Validade: ${formatarData(item.dataValidade)}${statusTexto}</p>`;
                }
            }
            
            infoHTML += '</div>';
            
            let botoesHTML = '';
            if (deleteMode) {
                botoesHTML = `<button class="btn-delete-item" data-id="${item.id}">🗑️</button>`;
            } else if (editMode) {
                botoesHTML = `<button class="btn-edit-item" data-id="${item.id}">✏️</button>`;
            }
            
            card.innerHTML = infoHTML + botoesHTML;
            
            if (deleteMode) {
                card.querySelector('.btn-delete-item').addEventListener('click', () => {
                    selectedItemForDelete = item.id;
                    itemsList.classList.add('hidden');
                    excluirSection.classList.remove('hidden');
                });
            } else if (editMode) {
                card.querySelector('.btn-edit-item').addEventListener('click', () => {
                    editarItem(item.id);
                });
            }
            
            itemsList.appendChild(card);
        });
    }

    // Confirmar exclusão
    btnExcluirSim.addEventListener('click', () => {
        if (!selectedItemForDelete) return;
        
        // Busca o item para registrar no histórico
        const item = allItems.find(i => i.id === selectedItemForDelete);
        
        database.ref(`user-estoque/${userUid}/${currentTab}/${selectedItemForDelete}`).remove()
            .then(() => {
                // Registra no histórico
                if (item) {
                    registrarMovimentacao(
                        currentTab,
                        item.nome,
                        item.quantidade,
                        'saida'
                    );
                }
                
                alert('Item excluído com sucesso!');
                selectedItemForDelete = null;
                loadItems();
                showMainMenu();
            })
            .catch(error => {
                console.error('Erro ao excluir:', error);
                alert('Erro ao excluir item.');
            });
    });

    // Cancelar exclusão
    btnExcluirNao.addEventListener('click', () => {
        selectedItemForDelete = null;
        showMainMenu();
    });

    // Atualizar resumo
    function updateResumo() {
        const total = allItems.length;
        totalUnidades.textContent = total;
        
        // Carrega o histórico
        database.ref(`user-estoque/${userUid}/historico`).orderByChild('timestamp').limitToLast(10).once('value')
            .then(snapshot => {
                let historicoHTML = '<p><strong>Últimas movimentações:</strong></p>';
                let movimentacoes = [];
                
                snapshot.forEach(childSnapshot => {
                    movimentacoes.unshift(childSnapshot.val());
                });
                
                if (movimentacoes.length > 0) {
                    movimentacoes.forEach(mov => {
                        const cor = mov.acao === 'entrada' ? '#4caf50' : '#f44336';
                        const simbolo = mov.acao === 'entrada' ? '➕' : '➖';
                        const data = new Date(mov.data);
                        const dataFormatada = data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
                        
                        historicoHTML += `<p style="color:${cor};"><strong>${simbolo} ${mov.itemNome}</strong> - ${mov.quantidade} (${mov.usuario}) - ${dataFormatada}</p>`;
                    });
                } else {
                    historicoHTML += '<p>Nenhuma movimentação registrada.</p>';
                }
                
                let detalhes = '<p><strong>Estoque atual:</strong></p>';
                
                if (currentTab === 'medicamentos') {
                    let vencidos = 0;
                    let proximos = 0;
                    let esgotados = 0;
                    let baixos = 0;
                    
                    allItems.forEach(item => {
                        const statusValidade = getValidadeStatus(item.dataValidade);
                        const statusEstoque = getEstoqueStatus(item.quantidade, item.quantidadeMinima);
                        
                        if (statusValidade === 'vencido') vencidos++;
                        else if (statusValidade === 'proximo') proximos++;
                        
                        if (statusEstoque === 'esgotado') esgotados++;
                        else if (statusEstoque === 'baixo') baixos++;
                        
                        detalhes += `<p>• ${item.nome} - ${item.quantidade} ${item.unidade || ''}`;
                        if (item.dataValidade) {
                            detalhes += ` (Val: ${formatarData(item.dataValidade)})`;
                        }
                        detalhes += '</p>';
                    });
                    
                    if (vencidos > 0 || proximos > 0 || esgotados > 0 || baixos > 0) {
                        let alertas = '<p><strong>Alertas:</strong></p>';
                        if (esgotados > 0) alertas += `<p style="color:#d32f2f;font-weight:bold;">⚠️ ${esgotados} medicamento(s) esgotado(s)</p>`;
                        if (baixos > 0) alertas += `<p style="color:#f57c00;font-weight:bold;">⚠️ ${baixos} medicamento(s) com estoque baixo</p>`;
                        if (vencidos > 0) alertas += `<p style="color:#d32f2f;font-weight:bold;">⚠️ ${vencidos} medicamento(s) vencido(s)</p>`;
                        if (proximos > 0) alertas += `<p style="color:#f9a825;font-weight:bold;">⚠️ ${proximos} medicamento(s) próximo(s) ao vencimento</p>`;
                        detalhes = alertas + detalhes;
                    }
                } else {
                    allItems.forEach(item => {
                        detalhes += `<p>• ${item.nome} - ${item.quantidade}</p>`;
                    });
                }
                
                if (total > 0) {
                    resumoContent.innerHTML = `
                        <p>Total de itens: <span>${total}</span></p>
                        ${historicoHTML}
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                        ${detalhes}
                    `;
                } else {
                    resumoContent.innerHTML = '<p>Nenhum item cadastrado ainda.</p>';
                }
            });
    }

    // Busca em tempo real
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            
            if (term === '') {
                renderItems(allItems, false, true);
            } else {
                const filtered = allItems.filter(item => 
                    item.nome.toLowerCase().includes(term) ||
                    item.tipo.toLowerCase().includes(term)
                );
                renderItems(filtered, false, true);
            }
        });
    }
    
    // Inicializa os campos corretos
    toggleFieldsByTab();
});