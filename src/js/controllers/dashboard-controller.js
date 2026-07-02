/**
 * Controlador: Dashboard Controller
 * Descripción: Gestiona el dashboard del estudiante
 * Autor: Equipo Radiología con Fe
 */

class DashboardController {
  constructor() {
    this.user = null;
    this.userData = null;
    this.init();
  }
  
  /**
   * Inicializa el controlador
   */
  async init() {
    try {
      // Verificar autenticación
      await this.checkAuth();
      
      // Cargar datos usuario
      await this.loadUserData();
      
      // Renderizar datos
      this.renderDashboard();
      
      // Inicializar event listeners
      this.initEventListeners();
      
      console.log('✅ Dashboard inicializado');
    } catch (error) {
      console.error('❌ Error en dashboard:', error);
      window.location.href = '/src/html/login.html';
    }
  }
  
  /**
   * Verifica autenticación
   */
  async checkAuth() {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    
    if (!token || !userId) {
      throw new Error('No autenticado');
    }
    
    if (role !== 'estudiante') {
      throw new Error('Acceso denegado');
    }
    
    this.userId = userId;
    this.userName = localStorage.getItem('userName');
  }
  
  /**
   * Carga datos del usuario
   */
  async loadUserData() {
    const db = firebase.firestore();
    const userDoc = await db.collection('users').doc(this.userId).get();
    
    if (!userDoc.exists) {
      throw new Error('Usuario no encontrado');
    }
    
    this.userData = userDoc.data();
  }
  
  /**
   * Renderiza el dashboard
   */
  renderDashboard() {
    // Greeting
    document.getElementById('user-greeting').textContent = `¡Hola, ${this.userData.nombre}!`;
    document.getElementById('user-status').textContent = `Grupo: ${this.userData.grupo || 'N/A'} | Acceso: Activo`;
    
    // Level
    document.getElementById('current-level').textContent = this.userData.nivel;
    
    // XP
    const xpPerLevel = 100 * (this.userData.nivel - 1) + 50 * Math.pow(this.userData.nivel - 1, 2);
    const progress = (this.userData.xp / xpPerLevel) * 100;
    document.getElementById('xp-progress').style.width = `${Math.min(progress, 100)}%`;
    document.getElementById('xp-text').textContent = `${this.userData.xp} / ${Math.floor(xpPerLevel)} XP`;
    
    // Streak
    document.getElementById('streak-count').textContent = `${this.userData.racha_actual} días`;
  }
  
  /**
   * Inicializa event listeners
   */
  initEventListeners() {
    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }
    
    // Bottom nav
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        this.navigateTo(page);
      });
    });
  }
  
  /**
   * Navega a una página
   */
  navigateTo(page) {
    console.log(`📄 Navegando a: ${page}`);
    // Implementar navegación
  }
  
  /**
   * Cierra sesión
   */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = '/src/html/login.html';
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new DashboardController();
  });
} else {
  new DashboardController();
}
