// === FUNÇÕES DE AUTENTICAÇÃO ===
function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const erro = document.getElementById("login-erro");

  firebase.auth().signInWithEmailAndPassword(email, senha)
    .then(() => {
      window.location.href = "selecao.html";
    })
    .catch((error) => {
      erro.textContent = "Login falhou: " + error.message;
    });
}

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  });
}

// Verificar autenticação
firebase.auth().onAuthStateChanged((user) => {
  const currentPage = window.location.pathname.split('/').pop();
  
  if (user) {
    // Usuário logado
    if (currentPage === 'index.html') {
      window.location.href = "selecao.html";
    }
  } else {
    // Usuário não logado
    if (currentPage !== 'index.html') {
      window.location.href = "index.html";
    }
  }
});