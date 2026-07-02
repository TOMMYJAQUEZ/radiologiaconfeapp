/**
 * Archivo: main.js
 * Descripción: Punto de entrada principal de la aplicación
 * Autor: Equipo Radiología con Fe
 * Fecha: 2026-07-02
 */

// Estado global de la aplicación
const AppState = {
  user: null,
  isAuthenticated: false,
  role: null,
  currentPage: 'login',
  theme: 'dark'
};

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Iniciando Radiología con Fe...');
  
  // 1. Registrar Service Worker (PWA)
  registerServiceWorker();
  
  // 2. Aplicar tema
  applyTheme();
  
  // 3. Verificar autenticación
  await checkAuthentication();
  
  // 4. Cargar página inicial
  if (AppState.isAuthenticated) {
    loadPage('dashboard');
  } else {
    loadPage('login');
  }
  
  // 5. Ocultar splash screen
  hideSplash();
});

/**
 * Registra el Service Worker para PWA
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('✅ Service Worker registrado:', registration);
      })
      .catch(error => {
        console.error('❌ Error registrando Service Worker:', error);
      });
  }
}

/**
 * Aplica el tema (claro/oscuro)
 */
function applyTheme() {
  const theme = localStorage.getItem('theme') || AppState.theme;
  document.documentElement.setAttribute('data-theme', theme);
  AppState.theme = theme;
}

/**
 * Verifica si el usuario está autenticado
 */
async function checkAuthentication() {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  
  if (token && userId) {
    try {
      // Aquí se validaría el token con Firebase
      AppState.isAuthenticated = true;
      AppState.user = {
        uid: userId,
        nombre: localStorage.getItem('userName'),
        role: localStorage.getItem('userRole')
      };
      AppState.role = AppState.user.role;
      
      console.log('✅ Usuario autenticado:', AppState.user.nombre);
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      logout();
    }
  } else {
    AppState.isAuthenticated = false;
  }
}

/**
 * Carga una página
 * @param {string} pageName - Nombre de la página a cargar
 */
async function loadPage(pageName) {
  try {
    console.log(`📄 Cargando página: ${pageName}`);
    
    const mainContainer = document.getElementById('main-container');
    const mainContent = document.getElementById('main-content');
    
    // Mostrar contenedor principal
    mainContainer.style.display = 'block';
    
    // Limpiar contenido anterior
    mainContent.innerHTML = '';
    
    // Cargar la página según el tipo
    switch (pageName) {
      case 'login':
        // Ocultar contenedor principal para login
        mainContainer.style.display = 'none';
        window.location.href = '/src/html/login.html';
        break;
        
      case 'dashboard':
        if (!AppState.isAuthenticated) {
          window.location.href = '/src/html/login.html';
          return;
        }
        window.location.href = '/src/html/dashboard.html';
        break;
        
      case 'admin':
        if (AppState.role !== 'admin') {
          console.error('❌ Acceso denegado: No eres administrador');
          return;
        }
        // Cargar panel admin
        break;
        
      case 'anatomia':
        mainContent.innerHTML = '<p>Módulo de Anatomía - En desarrollo</p>';
        break;
        
      case 'quiz':
        mainContent.innerHTML = '<p>Módulo de Quiz - En desarrollo</p>';
        break;
        
      case 'perfil':
        mainContent.innerHTML = '<p>Perfil de usuario - En desarrollo</p>';
        break;
        
      default:
        console.error(`❌ Página desconocida: ${pageName}`);
    }
    
    AppState.currentPage = pageName;
  } catch (error) {
    console.error('❌ Error cargando página:', error);
  }
}

/**
 * Cierra sesión del usuario
 */
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  
  AppState.isAuthenticated = false;
  AppState.user = null;
  
  console.log('✅ Sesión cerrada');
  window.location.href = '/src/html/login.html';
}

/**
 * Oculta la pantalla de splash
 */
function hideSplash() {
  const splash = document.getElementById('splash');
  if (splash) {
    setTimeout(() => {
      splash.style.opacity = '0';
      splash.style.transition = 'opacity 0.5s ease-out';
      setTimeout(() => {
        splash.style.display = 'none';
      }, 500);
    }, 500);
  }
}

/**
 * Navega a una página
 * @param {string} pageName - Nombre de la página
 */
function navigateTo(pageName) {
  loadPage(pageName);
}

/**
 * Cambia el tema
 * @param {string} newTheme - Tema a aplicar (dark/light)
 */
function toggleTheme(newTheme) {
  AppState.theme = newTheme || (AppState.theme === 'dark' ? 'light' : 'dark');
  localStorage.setItem('theme', AppState.theme);
  applyTheme();
  console.log(`🎨 Tema cambiado a: ${AppState.theme}`);
}

// Exportar funciones globales
window.AppState = AppState;
window.loadPage = loadPage;
window.logout = logout;
window.navigateTo = navigateTo;
window.toggleTheme = toggleTheme;
