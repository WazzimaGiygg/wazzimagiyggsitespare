

document.addEventListener('DOMContentLoaded', function() {

    // --- Configuração do Firebase ---
    const firebaseConfig = {
        apiKey: "AIzaSyB9GkSqTIZ0kbVsba_WOdQvAET-rF9qna0",
        authDomain: "wzzm-ce3fc.firebaseapp.com",
        projectId: "wzzm-ce3fc",
        storageBucket: "wzzm-ce3fc.appspot.com",
        messagingSenderId: "249427877153",
        appId: "1:249427877153:web:0e4297294794a5aadeb260",
        measurementId: "G-PLKNZNFCQ8"
    };

    // Acessa o objeto global 'firebase'
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();

    // --- Elementos do DOM ---
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const authStatus = document.getElementById('auth-status');
    const mainDashboard = document.getElementById('main-dashboard');
    const userDisplay = document.getElementById('user-display');
    const articleList = document.getElementById('article-list');
    const articleDetails = document.getElementById('article-details');
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Variáveis para armazenar o ID do artigo selecionado
    let selectedArticleId = null;

    // --- Funções de Navegação ---
    function showSection(sectionId) {
        contentSections.forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(sectionId).style.display = 'block';
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = e.target.dataset.section;
            showSection(`section-${sectionId}`);
            
            if (sectionId === 'all-articles') {
                loadArticles();
                articleDetails.style.display = 'none';
                articleList.style.display = 'block';
            }
        });
    });

    // --- Funções de Login e Logout ---
    loginButton.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).catch(error => {
            console.error("Erro no login:", error);
            alert("Ocorreu um erro ao fazer login. Tente novamente.");
        });
    });

    logoutButton.addEventListener('click', () => {
        auth.signOut();
    });
    
    // --- Monitora o estado da autenticação ---
    auth.onAuthStateChanged(user => {
        if (user) {
            authStatus.style.display = 'none';
            mainDashboard.style.display = 'flex';
            userDisplay.textContent = user.displayName;
            loadArticles();
        } else {
            authStatus.style.display = 'block';
            mainDashboard.style.display = 'none';
        }
    });

    // --- Função para carregar as postagens ---
    async function loadArticles() {
        articleList.innerHTML = 'Carregando artigos...';
        try {
            const snapshot = await db.collection('wazzimagiyggfemboyverse69').orderBy('date', 'desc').get();
            articleList.innerHTML = '';
            
            if (snapshot.empty) {
                articleList.innerHTML = '<p>Nenhum artigo encontrado.</p>';
                return;
            }

            snapshot.forEach(doc => {
                const article = doc.data();
                const articleElement = document.createElement('div');
                articleElement.className = 'article-card';
                articleElement.dataset.id = doc.id;
                
                const date = article.date ? article.date.toDate().toLocaleDateString('pt-BR') : 'Data não disponível';
                
                articleElement.innerHTML = `
                    <h3>${article.title}</h3>
                    <p>Publicado em: ${date}</p>
                    <button class="view-button">Ver Conteúdo</button>
                `;
                
                articleList.appendChild(articleElement);
            });

            // Adiciona evento de clique para cada botão "Ver Conteúdo"
            document.querySelectorAll('.view-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const articleId = e.target.closest('.article-card').dataset.id;
                    viewArticleDetails(articleId);
                });
            });

        } catch (error) {
            console.error("Erro ao carregar artigos: ", error);
            articleList.innerHTML = '<p>Ocorreu um erro ao carregar os artigos.</p>';
        }
    }

    // --- Função para visualizar os detalhes de um artigo ---
    async function viewArticleDetails(articleId) {
        articleDetails.innerHTML = 'Carregando detalhes...';
        articleDetails.style.display = 'block';
        articleList.style.display = 'none';

        try {
            const doc = await db.collection('wazzimagiyggfemboyverse69').doc(articleId).get();

            if (!doc.exists) {
                articleDetails.innerHTML = '<p>Artigo não encontrado.</p>';
                return;
            }

            const article = doc.data();
            const date = article.date ? article.date.toDate().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Data não disponível';
            
            articleDetails.innerHTML = `
                <h2>${article.title}</h2>
                <p><strong>Data:</strong> ${date}</p>
                <div class="article-content">${article.content}</div>
                <button id="back-to-list-button">Voltar à Lista</button>
            `;

            // Adiciona evento ao botão de voltar
            document.getElementById('back-to-list-button').addEventListener('click', () => {
                articleDetails.style.display = 'none';
                articleList.style.display = 'block';
            });

        } catch (error) {
            console.error("Erro ao carregar detalhes do artigo: ", error);
            articleDetails.innerHTML = '<p>Ocorreu um erro ao carregar os detalhes.</p>';
        }
    }
    
    const contentSubmitForm = document.getElementById('content-submit-form');
    if (contentSubmitForm) {
        contentSubmitForm.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }
});
