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

    // --- Elementos do DOM ---
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const userDisplay = document.getElementById('user-display');
    const loggedUserDisplay = document.getElementById('logged-user-display');
    const contentSubmitForm = document.getElementById('content-submit-form');
    const loading = document.getElementById('loading');
    const resultDiv = document.getElementById('result');

    // --- Monitora o estado da autenticação ---
    auth.onAuthStateChanged(user => {
        if (user) {
            userDisplay.textContent = `Logado como: ${user.displayName}`;
            loggedUserDisplay.textContent = user.displayName;
            loginButton.style.display = 'none';
            logoutButton.style.display = 'inline-block';
            contentSubmitForm.style.display = 'block';
        } else {
            userDisplay.textContent = 'Não logado';
            loggedUserDisplay.textContent = '';
            loginButton.style.display = 'inline-block';
            logoutButton.style.display = 'none';
            contentSubmitForm.style.display = 'none';
        }
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

    // --- Lógica de Submissão do Formulário ---
    contentSubmitForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loading.style.display = 'block';
        resultDiv.innerHTML = '';

        const user = auth.currentUser;
        if (!user) {
            alert("Você precisa estar logado para publicar.");
            loading.style.display = 'none';
            return;
        }

        const title = document.getElementById('title').value;
        const content = document.getElementById('content-textarea').value;

        try {
            await db.collection('wazzimagiyggfemboyverse69').add({
                title: title,
                date: firebase.firestore.FieldValue.serverTimestamp(),
                content: content,
                author_uid: user.uid
            });

            resultDiv.innerHTML = `<p style="color: green;">Documento publicado com sucesso!</p>`;
            contentSubmitForm.reset();
        } catch (error) {
            console.error("Erro ao publicar: ", error);
            resultDiv.innerHTML = `<p style="color: red;">Ocorreu um erro ao publicar o conteúdo. Tente novamente.</p>`;
        } finally {
            loading.style.display = 'none';
        }
    });

})();
