<script src="https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js"></script>


// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB9GkSqTIZ0kbVsba_WOdQeVAETrF9qna0",
  authDomain: "wzzm-ce3fc.firebaseapp.com",
  projectId: "wzzm-ce3fc",
  storageBucket: "wzzm-ce3fc.appspot.com",
  messagingSenderId: "249427877153",
  appId: "1:249427877153:web:0e4297294794a5aadeb260",
  measurementId: "G-PLKNZNFCQ8"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para injetar o código na página
function injectCode(html, css, js) {
  // Injeta o HTML
  if (html) {
    document.body.innerHTML = html;
  }

  // Injeta o CSS
  if (css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Injeta o JavaScript
  if (js) {
    const script = document.createElement('script');
    script.textContent = js;
    document.body.appendChild(script);
  }
}

// Função principal para buscar e carregar os dados
async function loadContentFromFirebase() {
  try {
    // Obtém o nome do host da página atual (ex: 'wazzimagiygg.com')
    const host = window.location.hostname;
    
    // Referencia o documento com o nome do host na coleção "HTML2W"
    const docRef = doc(db, "HTML2W", host);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Dados do documento encontrados!");
      const data = docSnap.data();

      // Desestrutura os dados do documento
      const { HTML, CSS, JS } = data;
      
      // Injeta o código na página
      injectCode(HTML, CSS, JS);
      
    } else {
      console.log("Nenhum documento encontrado para este host:", host);
      // Aqui você pode adicionar um fallback, como uma página de erro 404
      // ou um conteúdo padrão.
    }
  } catch (e) {
    console.error("Erro ao carregar dados do Firebase:", e);
    // Lidar com possíveis erros, como falha de conexão.
  }
}

// Chama a função principal para iniciar o processo
loadContentFromFirebase();
