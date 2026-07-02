/**
 * Controlador: Auth Controller
 * Descripción: Gestiona la autenticación y login
 * Autor: Equipo Radiología con Fe
 */

class AuthController {
  constructor() {
    this.form = document.getElementById('login-form');
    this.googleBtn = document.getElementById('google-login');
    this.errorDiv = document.getElementById('general-error');
    this.errorText = document.getElementById('error-text');
    
    this.initEventListeners();
  }
  
  /**
   * Inicializa event listeners
   */
  initEventListeners() {
    this.form.addEventListener('submit', (e) => this.handleEmailLogin(e));
    this.googleBtn.addEventListener('click', () => this.handleGoogleLogin());
  }
  
  /**
   * Maneja login con email/password
   */
  async handleEmailLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      // Validar inputs
      this.validateForm(email, password);
      
      // Mostrar loading
      this.setLoading(true);
      
      // Autenticar con Firebase
      const userCred = await firebase.auth().signInWithEmailAndPassword(email, password);
      
      // Obtener token
      const token = await userCred.user.getIdToken();
      
      // Obtener documento usuario
      const userDoc = await firebase.firestore().collection('users').doc(userCred.user.uid).get();
      
      if (!userDoc.exists) {
        throw new Error('Usuario no registrado en la base de datos');
      }
      
      const userData = userDoc.data();
      
      // Validar acceso por fechas
      if (userData.rol === 'estudiante') {
        this.validateAccessWindow(userData.acceso);
      }
      
      // Guardar datos localmente
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', userCred.user.uid);
      localStorage.setItem('userRole', userData.rol);
      localStorage.setItem('userName', userData.nombre);
      
      // Redirigir según rol
      if (userData.rol === 'admin') {
        window.location.href = '/src/html/admin.html';
      } else {
        window.location.href = '/src/html/dashboard.html';
      }
      
    } catch (error) {
      this.showError(error.message);
      console.error('Error login:', error);
    } finally {
      this.setLoading(false);
    }
  }
  
  /**
   * Maneja login con Google
   */
  async handleGoogleLogin() {
    try {
      this.setLoading(true);
      
      const provider = new firebase.auth.GoogleAuthProvider();
      const userCred = await firebase.auth().signInWithPopup(provider);
      
      // Obtener token
      const token = await userCred.user.getIdToken();
      
      // Verificar si usuario existe
      let userDoc = await firebase.firestore().collection('users').doc(userCred.user.uid).get();
      
      if (!userDoc.exists) {
        // Crear usuario nuevo
        await firebase.firestore().collection('users').doc(userCred.user.uid).set({
          uid: userCred.user.uid,
          email: userCred.user.email,
          nombre: userCred.user.displayName || 'Usuario',
          rol: 'estudiante',
          createdAt: new Date(),
          updatedAt: new Date(),
          xp: 0,
          nivel: 1,
          racha_actual: 0,
          avatar: userCred.user.photoURL || 'default'
        });
        
        userDoc = await firebase.firestore().collection('users').doc(userCred.user.uid).get();
      }
      
      const userData = userDoc.data();
      
      // Guardar datos localmente
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', userCred.user.uid);
      localStorage.setItem('userRole', userData.rol);
      localStorage.setItem('userName', userData.nombre);
      
      // Redirigir
      if (userData.rol === 'admin') {
        window.location.href = '/src/html/admin.html';
      } else {
        window.location.href = '/src/html/dashboard.html';
      }
      
    } catch (error) {
      this.showError('Error al conectar con Google');
      console.error('Google auth error:', error);
    } finally {
      this.setLoading(false);
    }
  }
  
  /**
   * Valida el formulario
   */
  validateForm(email, password) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !emailRegex.test(email)) {
      throw new Error('Email inválido');
    }
    
    if (!password || password.length < 8) {
      throw new Error('Contraseña debe tener al menos 8 caracteres');
    }
  }
  
  /**
   * Valida ventana de acceso
   */
  validateAccessWindow(acceso) {
    const ahora = new Date();
    const inicio = acceso.inicio.toDate ? acceso.inicio.toDate() : new Date(acceso.inicio);
    const fin = acceso.fin.toDate ? acceso.fin.toDate() : new Date(acceso.fin);
    
    if (ahora < inicio) {
      throw new Error(`Acceso no disponible hasta ${inicio.toLocaleDateString()}`);
    }
    
    if (ahora > fin) {
      throw new Error('Acceso ha expirado');
    }
  }
  
  /**
   * Muestra error
   */
  showError(message) {
    this.errorText.textContent = message;
    this.errorDiv.style.display = 'block';
    setTimeout(() => {
      this.errorDiv.style.display = 'none';
    }, 5000);
  }
  
  /**
   * Establece estado de loading
   */
  setLoading(isLoading) {
    const btn = this.form.querySelector('button[type="submit"]');
    btn.disabled = isLoading;
    btn.textContent = isLoading ? 'Cargando...' : 'INICIAR SESIÓN';
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AuthController();
  });
} else {
  new AuthController();
}
