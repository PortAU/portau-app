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
    const inputQuantidadeMinima = document.getElementById('item-quantidade-minima');
    const inputValidade = document.getElementById('item-validade');

    // Inputs editar
    const editId = document.getElementById('edit-item-id');
    const editNome = document.getElementById('edit-item-nome');
    const editQuantidadeRacao = document.getElementById('edit-item-quantidade');
    const editQuantidadeMedicamento = document.getElementById('edit-item-quantidade-medicamento');
    const editQuantidadeMinima = document.getElementById('edit-item-quantidade-minima');
    const editValidade = document.getElementById('edit-item-validade');

    // Estado
    let currentTab = 'racao';
    let userUid = null;
    let userName = '';
    let allItems = [];
    let selectedItemForDelete = null;
    let itemsRefListener = null;

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

            // defaults
            if (inputQuantidadeMinima && (inputQuantidadeMinima.value === '' || inputQuantidadeMinima.value == null)) {
                inputQuantidadeMinima.value = '10';
            }
        }
    }

    function showMainMenu() {
        if (mainMenu) mainMenu.classList.remove('hidden');
        if (adicionarSection) adicionarSection.classList.add('hidden');
        if (editarSection) editarSection.classList.add('hidden');
        if (consultarSection) consultarSection.classList.add('hidden');
        if (excluirSection) excluirSection.classList.add('hidden');
        if (itemsList) itemsList.classList.remove('hidden');
        loadItems();
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
        if (currentTab === 'medicamentos' && inputQuantidadeMinima) inputQuantidadeMinima.value = '10';
    });

    // Load items and listen for changes
    function loadItems() {
        if (!userUid) return;
        if (itemsRefListener) itemsRefListener.off();

        const ref = database.ref(`user-estoque/${userUid}/${currentTab}`);
        itemsRefListener = ref;
        ref.on('value', snapshot => {
            allItems = [];
            if (!snapshot.exists()) {
                renderItems([]);
                updateResumo();
                return;
            }
            snapshot.forEach(child => {
                const key = child.key;
                if (key === 'historico') return; // ignora nó histórico
                allItems.push({ id: key, ...child.val() });
            });
            renderItems(allItems, false);
            updateResumo();
        }, err => {
            console.error('Erro carregando itens:', err);
        });
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
                inner += `<p>Quantidade mínima: ${item.quantidadeMinima != null ? item.quantidadeMinima : '-'}</p>`;
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
            const quantidade = (inputQuantidadeRacao.value || '').trim();
            const tipo = (itemTipoRacao.value || '').trim();
            if (!quantidade) return alert('Preencha a quantidade da ração.');
            itemData.quantidade = quantidade;
            itemData.tipo = tipo;
        } else {
            // medicamentos
            const quantidade = parseInt(inputQuantidadeMedicamento.value, 10);
            const quantidadeMin = parseInt(inputQuantidadeMinima.value, 10);
            const dataValidade = inputValidade.value || '';
            const tipo = (itemTipoMedicamento.value || '').trim();

            if (isNaN(quantidade) || quantidade < 0) return alert('Preencha quantidade válida do medicamento.');
            if (isNaN(quantidadeMin) || quantidadeMin < 0) return alert('Preencha quantidade mínima válida.');
            if (!dataValidade) return alert('Preencha a data de validade.');
            if (!tipo) return alert('Selecione o tipo do medicamento.');

            itemData.quantidade = quantidade;
            itemData.quantidadeMinima = quantidadeMin;
            itemData.dataValidade = dataValidade; // yyyy-mm-dd
            itemData.tipo = tipo;
        }

        const newKey = database.ref().child(`user-estoque/${userUid}/${currentTab}`).push().key;
        const updates = {};
        updates[`user-estoque/${userUid}/${currentTab}/${newKey}`] = itemData;

        database.ref().update(updates)
            .then(() => {
                registrarMovimentacao(currentTab, nome, itemData.quantidade, 'entrada');
                alert('Item adicionado com sucesso.');
                formAdicionar.reset();
                if (currentTab === 'medicamentos') inputQuantidadeMinima.value = '10';
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
            editQuantidadeMinima.value = item.quantidadeMinima != null ? item.quantidadeMinima : '';
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

        const itemData = {
            nome,
            updatedAt: firebase.database.ServerValue.TIMESTAMP,
            updatedBy: userName,
            updatedByUid: userUid
        };

        if (currentTab === 'racao') {
            const quantidade = (editQuantidadeRacao.value || '').trim();
            const tipo = (editItemTipoRacao.value || '').trim();
            itemData.quantidade = quantidade;
            itemData.tipo = tipo;
        } else {
            const quantidade = parseInt(editQuantidadeMedicamento.value, 10);
            const quantidadeMin = parseInt(editQuantidadeMinima.value, 10);
            const dataValidade = editValidade.value || '';
            const tipo = (editItemTipoMedicamento.value || '').trim();

            if (isNaN(quantidade) || quantidade < 0) return alert('Quantidade inválida.');
            if (isNaN(quantidadeMin) || quantidadeMin < 0) return alert('Quantidade mínima inválida.');
            if (!dataValidade) return alert('Preencha a validade.');
            if (!tipo) return alert('Selecione o tipo.');

            itemData.quantidade = quantidade;
            itemData.quantidadeMinima = quantidadeMin;
            itemData.dataValidade = dataValidade;
            itemData.tipo = tipo;
        }

        database.ref(`user-estoque/${userUid}/${currentTab}/${itemId}`).update(itemData)
            .then(() => {
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
        database.ref(`user-estoque/${userUid}/${currentTab}/${itemId}`).remove()
            .then(() => {
                alert('Item excluído.');
                registrarMovimentacao(currentTab, `Exclusão:${itemId}`, 0, 'exclusao');
                loadItems();
            })
            .catch(err => {
                console.error('Erro ao excluir:', err);
                alert('Erro ao excluir item: ' + (err.message || err));
            });
    }

    // Movimentações
    function registrarMovimentacao(categoria, itemNome, quantidade, acao) {
        const histRef = database.ref(`user-estoque/${userUid}/historico`);
        const entry = {
            categoria,
            itemNome,
            quantidade,
            acao,
            usuario: userName,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            data: new Date().toISOString()
        };
        histRef.push(entry).catch(err => console.error('Erro registrando histórico:', err));
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

        // carregar últimas movimentações
        database.ref(`user-estoque/${userUid}/historico`).orderByChild('timestamp').limitToLast(10).once('value')
            .then(snapshot => {
                let html = '<p><strong>Últimas movimentações:</strong></p>';
                const movs = [];
                snapshot.forEach(s => movs.push(s.val()));
                movs.reverse().forEach(m => {
                    const simbolo = m.acao === 'entrada' ? '➕' : (m.acao === 'exclusao' ? '🗑️' : '➖');
                    const data = new Date(m.data || m.timestamp || Date.now());
                    html += `<p>${simbolo} ${m.itemNome} - ${m.quantidade} (${m.usuario}) - ${data.toLocaleString()}</p>`;
                });
                resumoContent.innerHTML = `<p>Total de unidades disponíveis: <span id="total-unidades">${totalUnits}</span></p>${html}`;
            })
            .catch(err => {
                console.error('Erro carregando histórico:', err);
            });
    }

    // Inicial
    updateLabels();
    toggleFieldsByTab();
});