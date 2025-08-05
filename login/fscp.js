<script src="https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js"></script>


const firebaseConfig = {
  apiKey: "AIzaSyA6lP7RpS41ASYfl5w0qEqdt1-rIzDRK7A",
  authDomain: "wazzimagiyggwork.firebaseapp.com",
  projectId: "wazzimagiyggwork",
  storageBucket: "wazzimagiyggwork.firebasestorage.app",
  messagingSenderId: "583826772348",
  appId: "1:583826772348:web:6463bb7f1e6acaf4dd94f9",
  measurementId: "G-KTE45H31LZ"
};

// Inicialize o Firebase e seus serviços
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Crie o provedor de autenticação do Google
const provider = new GoogleAuthProvider();

// Funções de login e cadastro
async function loginComGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Acessa o token de credencial do Google. Pode ser usado para acessar APIs do Google.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    // Se o login for bem-sucedido, salva os dados do usuário no Firestore.
    // O ID do documento será o UID do usuário do Firebase.
    const userRef = doc(db, "usuario", user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      nome: user.displayName,
      email: user.email,
      fotoUrl: user.photoURL,
      // Você pode adicionar mais campos aqui, como a data de cadastro, por exemplo.
      dataCadastro: new Date()
    }, { merge: true }); // O merge: true é útil para não sobrescrever dados existentes.

    console.log("Usuário logado e dados salvos com sucesso!", user);

  } catch (error) {
    // Lidar com erros de login.
    const errorCode = error.code;
    const errorMessage = error.message;

    // O email da conta do usuário que foi usada.
    const email = error.customData.email;

    // O tipo de credencial do Auth que foi usado.
    const credential = GoogleAuthProvider.credentialFromError(error);

    console.error("Erro durante o login com o Google:", errorMessage);
  }
}

// Para usar a função, você pode chamá-la de um botão, por exemplo:
// <button onclick="loginComGoogle()">Login com Google</button>
// Certifique-se de que a função esteja acessível no escopo global ou em um módulo.

