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
      
      // Captura todos os valores dos campos
      const nome = document.getElementById('signup-nome').value.trim();
      const usuario = document.getElementById('signup-usuario').value.trim();
      const senha = document.getElementById('signup-senha').value;
      const confirmarSenha = document.getElementById('signup-confirmar-senha').value;
      const email = document.getElementById('signup-email').value.trim();
      const confirmarEmail = document.getElementById('signup-confirmar-email').value.trim();

      // Validações
      if (!nome) {
        alert('Por favor, insira seu nome completo');
        return;
      }

      if (!usuario) {
        alert('Por favor, insira um usuário');
        return;
      }

      if (senha !== confirmarSenha) {
        alert('As senhas não coincidem');
        return;
      }

      if (email !== confirmarEmail) {
        alert('Os emails não coincidem');
        return;
      }

      if (senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres');
        return;
      }

      auth.createUserWithEmailAndPassword(email, senha)
        .then((userCredential) => {
          // Salva o nome de usuário no displayName do Firebase Auth
          return userCredential.user.updateProfile({
            displayName: nome
          }).then(() => {
            // Salva dados adicionais do usuário no Realtime Database
            const uid = userCredential.user.uid;
            const userData = {
              nome: nome.trim(),
              usuario: usuario.trim(),
              email: email.trim(),
              dataCriacao: new Date().toISOString()
            };
            
            return firebase.database().ref('users/' + uid).set(userData);
          }).catch(error => {
            // Se updateProfile falhar, continua mesmo assim salvando no banco
            const uid = userCredential.user.uid;
            const userData = {
              nome: nome.trim(),
              usuario: usuario.trim(),
              email: email.trim(),
              dataCriacao: new Date().toISOString()
            };
            return firebase.database().ref('users/' + uid).set(userData);
          });
        })
        .then(() => {
          alert('Conta criada com sucesso!');
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