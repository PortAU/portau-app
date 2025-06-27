// js/auth.js
document.addEventListener('DOMContentLoaded', () => {
  // Login (mantém igual)
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = loginForm['username'].value;
      const password = loginForm['password'].value;
      
      auth.signInWithEmailAndPassword(email, password)
        .then(() => {
          window.location.href = 'home.html';
        })
        .catch(error => {
          alert('Erro ao fazer login: ' + error.message);
        });
    });
  }

  // Cadastro (adaptado para Realtime Database)
  const signupForm = document.querySelector('.signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = signupForm.querySelector('input[type="email"]').value;
      const password = signupForm.querySelector('input[type="password"]').value;
      
      auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          // Salva dados adicionais do usuário no Realtime Database
          return database.ref('users/' + userCredential.user.uid).set({
            nome: signupForm.querySelector('input[type="text"]').value,
            email: email,
            endereco: {
              rua: signupForm.querySelector('input[placeholder="Rua*"]').value,
              numero: signupForm.querySelector('input[placeholder="Número"]').value,
              bairro: signupForm.querySelector('input[placeholder="Bairro*"]').value,
              cep: signupForm.querySelector('input[placeholder="CEP"]').value,
              complemento: signupForm.querySelector('input[placeholder="Complemento"]').value
            }
          });
        })
        .then(() => {
          window.location.href = 'home.html';
        })
        .catch(error => {
          alert('Erro ao criar conta: ' + error.message);
        });
    });
  }

  // Verificação de autenticação (mantém igual)
  auth.onAuthStateChanged(user => {
    if (user && (window.location.pathname.includes('index.html') || 
                 window.location.pathname.includes('criar-conta.html'))) {
      window.location.href = 'home.html';
    } else if (!user && !window.location.pathname.includes('index.html') && 
               !window.location.pathname.includes('criar-conta.html') &&
               !window.location.pathname.includes('esqueci-senha.html')) {
      window.location.href = 'index.html';
    }
  });
});