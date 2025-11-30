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

    // Formulários
    const formAdicionar = document.getElementById('form-adicionar');
    const formEditar = document.getElementById('form-editar');
    const formFiltro = document.getElementById('form-filtro');
    const btnFiltrar = document.getElementById('btn-filtrar');
    const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');

    // Abas
    const tabButtons = document.querySelectorAll('.tab-button');
    const labelNome = document.getElementById('label-nome');
    const labelFiltroNome = document.getElementById('label-filtro-nome');
    const labelTipo = document.getElementById('label-tipo');

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

    // Inputs adicionar
    const inputNome = document.getElementById('item-nome');
    const inputQuantidadeRacao = document.getElementById('item-quantidade');
    const inputQuantidadeMedicamento = document.getElementById('item-quantidade-medicamento');
    const inputValidade = document.getElementById('item-validade');

    // Inputs editar
    const editId = document.getElementById('edit-item-id');
    const editNome = document.getElementById('edit-item-nome');
    const editQuantidadeRacao = document.getElementById('edit-item-quantidade');
    const editQuantidadeMedicamento = document.getElementById('edit-item-quantidade-medicamento');
    const editValidade = document.getElementById('edit-item-validade');

    // Estado
    let currentTab = 'racao';
    let userUid = null;
    let userName = '';
    let allItems = [];
    let selectedItemForDelete = null;
    let itemsRefListener = null;
    const searchBar = document.getElementById('search-bar');

    // Auth
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        userUid = user.uid;
        userName = user.displayName || user.email || 'Usuário';
        loadItems();
        showMainMenu();
    });

    // Search handling
    function applySearchFilter() {
        if (!searchBar) return;
        const term = (searchBar.value || '').toLowerCase().trim();
        if (!term) {
            // show all
            renderItems(allItems);
            return;
        }

        const filtered = allItems.filter(item => {
            const nome = (item.nome || '').toString().toLowerCase();
            const tipo = (item.tipo || '').toString().toLowerCase();
            if (currentTab === 'racao') {
                return nome.includes(term) || tipo.includes(term);
            } else {
                // medicamentos: busca por nome, tipo e validade
                const validade = (item.dataValidade || '').toString().toLowerCase();
                return nome.includes(term) || tipo.includes(term) || validade.includes(term);
            }
        });

        renderItems(filtered);
    }

    if (searchBar) {
        searchBar.addEventListener('input', () => {
            applySearchFilter();
        });
    }

    // Tabs
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            updateLabels();
            toggleFieldsByTab();
            loadItems();
            showMainMenu();
        });
    });

    function updateLabels() {
        if (currentTab === 'racao') {
            labelNome.textContent = 'Nome da Ração';
            labelTipo.textContent = 'Tipo';
            if (labelFiltroNome) labelFiltroNome.textContent = 'Nome';
        } else {
            labelNome.textContent = 'Nome do Medicamento';
            labelTipo.textContent = 'Tipo';
            if (labelFiltroNome) labelFiltroNome.textContent = 'Nome';
        }
    }

    function toggleFieldsByTab() {
        if (currentTab === 'racao') {
            camposMedicamentos.classList.add('hidden');
            groupQuantidadeRacao.classList.remove('hidden');
            itemTipoRacao.classList.remove('hidden');
            itemTipoMedicamento.classList.add('hidden');
            filtrosMedicamentos.classList.add('hidden');

            camposEditMedicamentos.classList.add('hidden');
            groupEditQuantidadeRacao.classList.remove('hidden');
            editItemTipoRacao.classList.remove('hidden');
            editItemTipoMedicamento.classList.add('hidden');
        } else {
            camposMedicamentos.classList.remove('hidden');
            groupQuantidadeRacao.classList.add('hidden');
            itemTipoRacao.classList.add('hidden');
            itemTipoMedicamento.classList.remove('hidden');
            filtrosMedicamentos.classList.remove('hidden');

            camposEditMedicamentos.classList.remove('hidden');
            groupEditQuantidadeRacao.classList.add('hidden');
            editItemTipoRacao.classList.add('hidden');
            editItemTipoMedicamento.classList.remove('hidden');
        }
    }

    function showMainMenu() {
        if (mainMenu) mainMenu.classList.remove('hidden');
        if (adicionarSection) adicionarSection.classList.add('hidden');
        if (editarSection) editarSection.classList.add('hidden');
        if (consultarSection) consultarSection.classList.add('hidden');
        if (excluirSection) excluirSection.classList.add('hidden');
        if (itemsList) itemsList.classList.remove('hidden');
        // Listener já está ativo, não precisa recarregar
    }

    // Menu actions (guards for buttons)
    if (btnAdicionar) btnAdicionar.addEventListener('click', () => {
        if (mainMenu) mainMenu.classList.add('hidden');
        if (adicionarSection) adicionarSection.classList.remove('hidden');
        if (editarSection) editarSection.classList.add('hidden');
        if (consultarSection) consultarSection.classList.add('hidden');
        if (excluirSection) excluirSection.classList.add('hidden');
        if (itemsList) itemsList.classList.add('hidden');

        if (formAdicionar) formAdicionar.reset();
    });

    // Load items and listen for changes
    // Load items and listen for changes
    function loadItems() {
        if (!userUid) return;
        
        // Desliga listener anterior ANTES de criar um novo
        if (itemsRefListener) {
            itemsRefListener.off('value');
        }

        const ref = database.ref(`user-estoque/${userUid}/${currentTab}`);
        
        // Configura o novo listener
        ref.on('value', snapshot => {
            console.log(`📥 Dados carregados para ${currentTab}:`, snapshot.numChildren());
            allItems = [];
            
            if (!snapshot.exists()) {
                console.log(`ℹ️ Nenhum item encontrado para ${currentTab}`);
                renderItems([]);
                updateResumo();
                return;
            }
            
            snapshot.forEach(child => {
                const key = child.key;
                // Ignora nós especiais que não são itens
                if (key === 'historico') return;
                allItems.push({ id: key, ...child.val() });
            });
            
            console.log(`✅ ${allItems.length} itens carregados`);
            // Aplica filtro de busca (se houver) ou renderiza tudo
            applySearchFilter();
            updateResumo();
        }, err => {
            console.error('❌ Erro carregando itens:', err);
        });
        
        // Guarda referência para poder desligar depois
        itemsRefListener = ref;
    }

    // Render list
    function renderItems(items, forDelete = false) {
        itemsList.innerHTML = '';
        itemsList.classList.remove('hidden');

        if (!items || items.length === 0) {
            itemsList.innerHTML = '<div class="empty-state"><p>Nenhum item encontrado.</p></div>';
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'estoque-item-card';
            card.dataset.id = item.id;

            let inner = `<h4>${item.nome || '-'}</h4>`;
            if (currentTab === 'racao') {
                inner += `<p>Quantidade: ${item.quantidade || '-'}</p>`;
                inner += `<p>Tipo: ${item.tipo || '-'}</p>`;
            } else {
                inner += `<p>Quantidade: ${item.quantidade != null ? item.quantidade : '-'}</p>`;
                inner += `<p>Validade: ${item.dataValidade || '-'}</p>`;
                inner += `<p>Tipo: ${item.tipo || '-'}</p>`;
            }

            inner += `<div class="item-actions">`;
            inner += `<button class="btn-edit" data-id="${item.id}">Editar</button>`;
            inner += `<button class="btn-delete" data-id="${item.id}">Excluir</button>`;
            inner += `</div>`;

            card.innerHTML = inner;
            itemsList.appendChild(card);
        });

        // attach action handlers
        itemsList.querySelectorAll('.btn-edit').forEach(b => {
            b.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                openEditForm(id);
            });
        });
        itemsList.querySelectorAll('.btn-delete').forEach(b => {
            b.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                confirmarExcluir(id);
            });
        });
    }

    // Adicionar item
    formAdicionar.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!userUid) return alert('Usuário não autenticado.');

        const nome = (inputNome.value || '').trim();
        if (!nome) return alert('Preencha o nome.');

        const itemData = {
            nome,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            createdBy: userName,
            createdByUid: userUid
        };

        if (currentTab === 'racao') {
            const quantidade = parseInt(inputQuantidadeRacao.value, 10);
            const tipo = (itemTipoRacao.value || '').trim();
            if (isNaN(quantidade) || quantidade < 0) return alert('Preencha quantidade válida da ração.');
            itemData.quantidade = quantidade;
            itemData.tipo = tipo;
        } else {
            // medicamentos
            const quantidade = parseInt(inputQuantidadeMedicamento.value, 10);
            const dataValidade = inputValidade.value || '';
            const tipo = (itemTipoMedicamento.value || '').trim();

            if (isNaN(quantidade) || quantidade < 0) return alert('Preencha quantidade válida do medicamento.');
            if (!dataValidade) return alert('Preencha a data de validade.');
            if (!tipo) return alert('Selecione o tipo do medicamento.');

            itemData.quantidade = quantidade;
            itemData.dataValidade = dataValidade; // yyyy-mm-dd
            itemData.tipo = tipo;
        }

        const newKey = database.ref().child(`user-estoque/${userUid}/${currentTab}`).push().key;
        const updates = {};
        updates[`user-estoque/${userUid}/${currentTab}/${newKey}`] = itemData;

        database.ref().update(updates)
            .then(() => {
                // Tenta registrar movimentação, mas não bloqueia o sucesso do item
                registrarMovimentacao(currentTab, nome, itemData.quantidade, 'entrada');
                alert('Item adicionado com sucesso.');
                formAdicionar.reset();
                loadItems();
                showMainMenu();
            })
            .catch(err => {
                console.error('Erro ao salvar item:', err);
                alert('Erro ao salvar item: ' + (err.message || err));
            });
    });

    // Abrir edição
    function openEditForm(itemId) {
        const item = allItems.find(i => i.id === itemId);
        if (!item) return alert('Item não encontrado.');
        editId.value = itemId;
        editNome.value = item.nome || '';
        if (currentTab === 'racao') {
            editQuantidadeRacao.value = item.quantidade || '';
            editItemTipoRacao.value = item.tipo || '';
        } else {
            editQuantidadeMedicamento.value = item.quantidade != null ? item.quantidade : '';
            editValidade.value = item.dataValidade || '';
            editItemTipoMedicamento.value = item.tipo || '';
        }
        mainMenu.classList.add('hidden');
        adicionarSection.classList.add('hidden');
        editarSection.classList.remove('hidden');
        consultarSection.classList.add('hidden');
        excluirSection.classList.add('hidden');
        itemsList.classList.add('hidden');
    }

    // Editar submit
    formEditar.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!userUid) return alert('Usuário não autenticado.');
        const itemId = editId.value;
        const nome = (editNome.value || '').trim();
        if (!itemId || !nome) return alert('Erro: dados inválidos.');

        // Busca o item anterior para comparação e registro de mudanças
        const itemAnterior = allItems.find(i => i.id === itemId);

        const itemData = {
            nome,
            updatedAt: firebase.database.ServerValue.TIMESTAMP,
            updatedBy: userName,
            updatedByUid: userUid
        };

        let quantidadeNova = 0;
        let mudancas = [];

        if (currentTab === 'racao') {
            const quantidade = parseInt(editQuantidadeRacao.value, 10);
            const tipo = (editItemTipoRacao.value || '').trim();
            if (isNaN(quantidade) || quantidade < 0) return alert('Quantidade inválida.');
            itemData.quantidade = quantidade;
            itemData.tipo = tipo;
            quantidadeNova = quantidade;

            if (itemAnterior.quantidade !== quantidade) {
                mudancas.push(`quantidade: ${itemAnterior.quantidade} → ${quantidade}`);
            }
            if (itemAnterior.tipo !== tipo) {
                mudancas.push(`tipo: ${itemAnterior.tipo} → ${tipo}`);
            }
        } else {
            const quantidade = parseInt(editQuantidadeMedicamento.value, 10);
            const dataValidade = editValidade.value || '';
            const tipo = (editItemTipoMedicamento.value || '').trim();

            if (isNaN(quantidade) || quantidade < 0) return alert('Quantidade inválida.');
            if (!dataValidade) return alert('Preencha a validade.');
            if (!tipo) return alert('Selecione o tipo.');

            itemData.quantidade = quantidade;
            itemData.dataValidade = dataValidade;
            itemData.tipo = tipo;
            quantidadeNova = quantidade;

            if (itemAnterior.quantidade !== quantidade) {
                mudancas.push(`quantidade: ${itemAnterior.quantidade} → ${quantidade}`);
            }
            if (itemAnterior.dataValidade !== dataValidade) {
                mudancas.push(`validade: ${itemAnterior.dataValidade} → ${dataValidade}`);
            }
            if (itemAnterior.tipo !== tipo) {
                mudancas.push(`tipo: ${itemAnterior.tipo} → ${tipo}`);
            }
        }

        database.ref(`user-estoque/${userUid}/${currentTab}/${itemId}`).update(itemData)
            .then(() => {
                // Tenta registrar a edição, mas não bloqueia o sucesso da atualização
                const descricaoMudancas = mudancas.length > 0 ? mudancas.join('; ') : 'sem alterações';
                registrarMovimentacao(currentTab, nome, quantidadeNova, 'edicao', descricaoMudancas);
                alert('Item atualizado com sucesso.');
                loadItems();
                showMainMenu();
            })
            .catch(err => {
                console.error('Erro ao atualizar:', err);
                alert('Erro ao atualizar item: ' + (err.message || err));
            });
    });

    // Excluir
    function confirmarExcluir(itemId) {
        if (!confirm('Confirma exclusão deste item?')) return;
        
        // Busca o item para obter o nome antes de deletar
        const item = allItems.find(i => i.id === itemId);
        if (!item) return alert('Item não encontrado.');
        
        const nomeItem = item.nome;
        const quantidadeItem = item.quantidade || 0;
        
        database.ref(`user-estoque/${userUid}/${currentTab}/${itemId}`).remove()
            .then(() => {
                // Tenta registrar a exclusão, mas não bloqueia o sucesso da remoção
                registrarMovimentacao(currentTab, nomeItem, quantidadeItem, 'exclusao');
                alert('Item excluído.');
                loadItems();
            })
            .catch(err => {
                console.error('Erro ao excluir:', err);
                alert('Erro ao excluir item: ' + (err.message || err));
            });
    }

    // Movimentações - Registra operações CRUD com detalhes completos
    // Nota: Falhas neste registro NÃO devem bloquear a operação principal
    function registrarMovimentacao(categoria, itemNome, quantidade, acao, descricao = '') {
        if (!userUid) {
            console.warn('Não foi possível registrar movimentação: usuário não autenticado');
            return;
        }
        
        const histRef = database.ref(`user-estoque/${userUid}/historico`);
        
        // Define emoji e texto descritivo para cada ação
        let acaoDescrita = '';
        switch(acao) {
            case 'entrada':
                acaoDescrita = 'Adicionado';
                break;
            case 'edicao':
                acaoDescrita = 'Editado';
                break;
            case 'exclusao':
                acaoDescrita = 'Excluído';
                break;
            default:
                acaoDescrita = 'Modificado';
        }
        
        const entry = {
            categoria,
            itemNome,
            quantidade,
            acao,
            acaoDescrita,
            descricao,
            usuario: userName,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            data: new Date().toISOString()
        };
        
        console.log('Registrando movimentação:', entry);
        
        // Registra de forma assíncrona sem bloquear a operação principal
        histRef.push(entry)
            .then((ref) => {
                console.log(`✓ Histórico registrado com sucesso: ${ref.key}`);
                // Atualiza a visualização do resumo imediatamente
                updateResumo();
            })
            .catch(err => {
                console.error('✗ Erro ao registrar histórico:', err.message, err.code);
                console.warn('Detalhes do erro:', err);
            });
    }

    // Resumo
    function parseQuantity(q) {
        if (q == null) return 0;
        if (typeof q === 'number') return q;
        const s = String(q);
        const parsed = parseInt(s.replace(/[^0-9-]/g, ''), 10);
        return isNaN(parsed) ? 0 : parsed;
    }

    function updateResumo() {
        const totalUnits = allItems.reduce((acc, item) => acc + parseQuantity(item.quantidade), 0);
        totalUnidades.textContent = totalUnits;

        // Carrega últimas 15 movimentações com listener (atualiza em tempo real)
        database.ref(`user-estoque/${userUid}/historico`)
            .orderByChild('timestamp')
            .limitToLast(15)
            .on('value', snapshot => {
                let html = '<p><strong>Últimas movimentações:</strong></p>';
                
                if (!snapshot.exists()) {
                    html += '<p style="color: #999; font-style: italic;">Nenhuma movimentação registrada ainda.</p>';
                    resumoContent.innerHTML = `<p><strong>Total de unidades disponíveis: <span id="total-unidades">${totalUnits}</span></strong></p>${html}`;
                    return;
                }
                
                html += '<div style="max-height: 300px; overflow-y: auto;">';
                const movs = [];
                snapshot.forEach(s => movs.push(s.val()));
                movs.reverse().forEach(m => {
                    // Verifica se o objeto de movimentação está completo
                    if (!m || !m.itemNome || !m.acao) {
                        console.warn('Movimentação inválida:', m);
                        return;
                    }
                    
                    // Define ícone baseado na ação
                    let simbolo = '';
                    let cor = '';
                    switch(m.acao) {
                        case 'entrada':
                            simbolo = '➕';
                            cor = '#4caf50';
                            break;
                        case 'edicao':
                            simbolo = '✏️';
                            cor = '#2196f3';
                            break;
                        case 'exclusao':
                            simbolo = '🗑️';
                            cor = '#f44336';
                            break;
                        default:
                            simbolo = '⚙️';
                            cor = '#ff9800';
                    }
                    
                    const data = new Date(m.data || m.timestamp || Date.now());
                    const horaFormatada = data.toLocaleString('pt-BR');
                    const categoria = m.categoria === 'racao' ? '(Ração)' : '(Medicamento)';
                    
                    // Monta a descrição da movimentação com ou sem detalhes
                    let descricaoCompleta = `${m.acaoDescrita || m.acao}`;
                    if (m.descricao) {
                        descricaoCompleta += `: ${m.descricao}`;
                    }
                    
                    html += `<p style="border-left: 3px solid ${cor}; padding-left: 10px; margin: 8px 0; font-size: 0.9em;">
                        ${simbolo} <strong>${m.itemNome}</strong> ${categoria} - ${descricaoCompleta} 
                        <br/><small>Qtd: ${m.quantidade} | ${m.usuario} | ${horaFormatada}</small>
                    </p>`;
                });
                html += '</div>';
                resumoContent.innerHTML = `<p><strong>Total de unidades disponíveis: <span id="total-unidades">${totalUnits}</span></strong></p>${html}`;
            }, err => {
                console.error('Erro carregando histórico:', err);
                // Se houver erro, mostra pelo menos o total
                resumoContent.innerHTML = `<p><strong>Total de unidades disponíveis: <span id="total-unidades">${totalUnits}</span></strong></p><p style="color: #f44336;">Erro ao carregar histórico</p>`;
            });
    }

    // Inicial
    updateLabels();
    toggleFieldsByTab();
});