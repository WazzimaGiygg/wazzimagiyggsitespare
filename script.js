(function() {
    // --- Configuração do Firebase ---
    const firebaseConfig = {
        apiKey: "AIzaSyB9GkSqTIZ0kbVsba_WOdQeVAETrF9qna0",
        authDomain: "wzzm-ce3fc.firebaseapp.com",
        projectId: "wzzm-ce3fc",
        storageBucket: "wzzm-ce3fc.appspot.com",
        messagingSenderId: "249427877153",
        appId: "1:249427877153:web:0e4297294794a5aadeb260",
        measurementId: "G-PLKNZNFCQ8"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();
    const storage = firebase.storage();

    // --- Elementos do DOM ---
    const DOM = {
        authStatus: document.getElementById('auth-status'),
        mainDashboard: document.getElementById('main-dashboard'),
        loginButton: document.getElementById('login-button'),
        logoutButton: document.getElementById('logout-button'),
        articleList: document.getElementById('article-list'),
        articleDetails: document.getElementById('article-details'),
        sections: document.querySelectorAll('.content-section'),
        navLinks: document.querySelectorAll('.nav-link'),
        filterLinks: document.querySelectorAll('.nav-link-filter'),
        contentSubmitForm: document.getElementById('content-submit-form'),
        loading: document.getElementById('loading'),
        resultDiv: document.getElementById('result'),
        userDisplay: document.getElementById('user-display'),
        editForm: document.getElementById('form-edicao-artigo'),
        cancelEditBtn: document.getElementById('cancelar-edicao'),
        profileLink: document.getElementById('profile-link'),
        historyList: document.getElementById('history-list'),
        cancelHistoryBtn: document.getElementById('cancelar-historico'),
        profileTabs: document.querySelectorAll('.profile-tabs a'),
        tabContents: document.querySelectorAll('.tab-content')
    };

    // --- Estado da Aplicação ---
    let selectedArticleDocId = null;
    let selectedArticleData = null;

    // --- Funções Auxiliares ---
    function navigateTo(sectionId) {
        DOM.sections.forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(`section-${sectionId}`).style.display = 'block';
    }

    function getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }

    // --- Inicialização da Autenticação ---
    function initAuth() {
        auth.onAuthStateChanged(user => {
            if (user) {
                DOM.authStatus.style.display = 'none';
                DOM.mainDashboard.style.display = 'flex';
                DOM.userDisplay.textContent = user.displayName;
                carregarArtigos();
            } else {
                DOM.authStatus.style.display = 'block';
                DOM.mainDashboard.style.display = 'none';
            }
        });

        DOM.loginButton.addEventListener('click', () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider).catch(error => {
                console.error("Erro no login:", error);
                alert("Ocorreu um erro ao fazer login. Tente novamente.");
            });
        });

        DOM.logoutButton.addEventListener('click', () => {
            auth.signOut();
            navigateTo('all-articles');
        });
    }

    // --- Lógica do Painel e Artigos ---
    function carregarArtigos(filtroCategoria = 'todos') {
        DOM.articleList.innerHTML = '<p>Carregando artigos...</p>';
        let query = db.collection('wazzimagiyggfemboyverse69').orderBy('date', 'desc');

        if (filtroCategoria !== 'todos') {
            query = query.where('sector', '==', filtroCategoria);
        }

        query.get().then(snapshot => {
            DOM.articleList.innerHTML = '';
            if (snapshot.empty) {
                DOM.articleList.innerHTML = '<p>Nenhum artigo encontrado.</p>';
                return;
            }
            snapshot.forEach(doc => {
                const item = doc.data();
                const listItem = document.createElement('div');
                listItem.className = 'article-list-item';
                listItem.setAttribute('data-doc-id', doc.id);
                listItem.innerHTML = `<h4>${item.title}</h4><p>${item.content ? item.content.substring(0, 100) + '...' : ''}</p>`;
                listItem.addEventListener('click', () => carregarDetalhesArtigo(doc.id, item));
                DOM.articleList.appendChild(listItem);
            });
        }).catch(error => {
            console.error("Erro ao carregar artigos:", error);
            DOM.articleList.innerHTML = '<p>Erro ao carregar artigos.</p>';
        });
    }

    async function carregarDetalhesArtigo(docId, item) {
        selectedArticleDocId = docId;
        selectedArticleData = item;
        document.querySelectorAll('.article-list-item').forEach(el => el.classList.remove('selected'));
        const clickedItem = document.querySelector(`[data-doc-id="${docId}"]`);
        if (clickedItem) clickedItem.classList.add('selected');

        let imageHtml = '';
        if (item.image_reference && item.image_reference.includes('[IMAGEM_ID:')) {
            const imageDocId = item.image_reference.split(':')[1].slice(0, -1);
            try {
                const imageDoc = await db.collection('imagenscode').doc(imageDocId).get();
                if (imageDoc.exists) {
                    const imageData = imageDoc.data();
                    imageHtml = `<img src="data:image/png;base64,${imageData.base64_code}" style="max-width:100%; height:auto;">`;
                }
            } catch (error) {
                console.error("Erro ao carregar imagem:", error);
            }
        }

        DOM.articleDetails.innerHTML = `
            <h2>${item.title}</h2>
            <div class="info">
                <p><strong>Setor:</strong> ${item.sector}</p>
                <p><strong>UID do Documento:</strong> ${docId}</p>
                <p><strong>Autor:</strong> ${item.author_uid || 'N/A'}</p>
            </div>
            ${imageHtml}
            <div class="article-content">
                ${item.content || '<p>Sem descrição.</p>'}
            </div>
            <div class="article-actions">
                <button id="edit-article-button">Editar</button>
                <button id="view-history-button">Histórico</button>
            </div>
        `;
        document.getElementById('edit-article-button').addEventListener('click', abrirFormularioEdicao);
        document.getElementById('view-history-button').addEventListener('click', abrirHistoricoArtigo);
    }

    // --- Lógica de Edição de Artigo ---
    function abrirFormularioEdicao() {
        navigateTo('edit-article');
        document.getElementById('edicao-titulo').value = selectedArticleData.title;
        document.getElementById('edicao-setor').value = selectedArticleData.sector;
        document.getElementById('edicao-conteudo').value = selectedArticleData.content;
    }

    function initEditForm() {
        DOM.editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const novoTitulo = document.getElementById('edicao-titulo').value;
            const novoSetor = document.getElementById('edicao-setor').value;
            const novoConteudo = document.getElementById('edicao-conteudo').value;
            
            if (selectedArticleDocId) {
                try {
                    await db.collection('wazzimagiyggfemboyverse69').doc(selectedArticleDocId).update({
                        title: novoTitulo,
                        sector: novoSetor,
                        content: novoConteudo,
                        ultimaEdicao: firebase.firestore.FieldValue.serverTimestamp(),
                        editor_uid: auth.currentUser.uid,
                    });
                    alert("Artigo atualizado com sucesso!");
                    navigateTo('all-articles');
                    carregarArtigos();
                } catch (error) {
                    console.error("Erro ao atualizar o artigo:", error);
                    alert("Ocorreu um erro ao atualizar o artigo.");
                }
            }
        });

        DOM.cancelEditBtn.addEventListener('click', () => {
            navigateTo('all-articles');
        });
    }

    // --- Lógica de Criação de Novo Artigo ---
    function initNewArticleForm() {
        DOM.contentSubmitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            DOM.loading.style.display = 'block';
            DOM.resultDiv.innerHTML = '';
            
            const user = auth.currentUser;
            if (!user) {
                alert("Você precisa estar logado para publicar.");
                DOM.loading.style.display = 'none';
                return;
            }

            const title = document.getElementById('title').value;
            const sector = document.getElementById('sector').value;
            const content = document.getElementById('content-textarea').value;
            const termsConsent = document.getElementById('terms-consent').checked;
            const imageFile = document.getElementById('image-upload').files[0];

            try {
                let imageUrlCode = null;
                if (imageFile) {
                    const imageBase64 = await getBase64(imageFile);
                    const imageRef = await db.collection('imagenscode').add({
                        base64_code: imageBase64,
                        original_name: imageFile.name,
                        upload_date: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    imageUrlCode = `[IMAGEM_ID:${imageRef.id}]`;
                    DOM.resultDiv.innerHTML += `<p>Imagem salva com sucesso! ID: <strong>${imageRef.id}</strong></p>`;
                }

                await db.collection('wazzimagiyggfemboyverse69').add({
                    title: title,
                    sector: sector,
                    date: firebase.firestore.FieldValue.serverTimestamp(),
                    content: content,
                    author_uid: user.uid,
                    agreed_terms: termsConsent,
                    image_reference: imageUrlCode
                });

                DOM.resultDiv.innerHTML += `<p>Documento publicado com sucesso.</p>`;
                DOM.contentSubmitForm.reset();
            } catch (error) {
                console.error("Erro ao publicar: ", error);
                DOM.resultDiv.innerHTML = `<p style="color:red;">Ocorreu um erro ao publicar o conteúdo. Tente novamente.</p>`;
            } finally {
                DOM.loading.style.display = 'none';
            }
        });
    }

    // --- Lógica de navegação e filtros ---
    function initNavigation() {
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(e.target.dataset.section);
            });
        });

        DOM.filterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const filtro = e.target.dataset.filter;
                carregarArtigos(filtro);
            });
        });

        DOM.profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('profile-section');
            carregarMinhasContribuicoes();
            carregarPaginaPessoal();
        });
    }

    // --- Lógica do Perfil (simplificada para o exemplo) ---
    function initProfile() {
        DOM.profileTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                DOM.profileTabs.forEach(t => t.classList.remove('active'));
                DOM.tabContents.forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(`tab-${e.target.dataset.tab}`).classList.add('active');
            });
        });
    }

    function carregarMinhasContribuicoes() {
        const userId = auth.currentUser.uid;
        const contributionsList = document.getElementById('contributions-list');
        contributionsList.innerHTML = '<li>Carregando suas contribuições...</li>';

        db.collection('wazzimagiyggfemboyverse69')
            .where('author_uid', '==', userId)
            .orderBy('date', 'desc')
            .get()
            .then(snapshot => {
                contributionsList.innerHTML = '';
                if (snapshot.empty) {
                    contributionsList.innerHTML = '<li>Nenhuma contribuição encontrada.</li>';
                    return;
                }
                snapshot.forEach(doc => {
                    const item = doc.data();
                    const li = document.createElement('li');
                    li.textContent = `${item.title} (${new Date(item.date.seconds * 1000).toLocaleDateString()})`;
                    contributionsList.appendChild(li);
                });
            })
            .catch(error => {
                console.error("Erro ao carregar contribuições:", error);
                contributionsList.innerHTML = '<li>Erro ao carregar contribuições.</li>';
            });
    }

    function carregarPaginaPessoal() {
        // Implementar lógica de carregamento da página pessoal
    }

    // --- Lógica do Histórico (placeholder) ---
    function abrirHistoricoArtigo() {
        navigateTo('article-history');
        DOM.historyList.innerHTML = '<p>Funcionalidade de Histórico em desenvolvimento ou com erro no código original.</p>';
        DOM.cancelHistoryBtn.addEventListener('click', () => {
            navigateTo('all-articles');
        });
    }

    // --- Iniciar a Aplicação ---
    initAuth();
    initNewArticleForm();
    initEditForm();
    initNavigation();
    initProfile();
})();
