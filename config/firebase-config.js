/**
 * Configuración: Firebase Config
 * Descripción: Inicialización de Firebase
 * Autor: Equipo Radiología con Fe
 */

// Reemplazar con tus credenciales de Firebase
const firebaseConfig = {
  apiKey: "AIzaSy...", // Reemplazar
  authDomain: "radiologia-con-fe.firebaseapp.com",
  projectId: "radiologia-con-fe",
  storageBucket: "radiologia-con-fe.appspot.com",
  messagingSenderId: "...", // Reemplazar
  appId: "...", // Reemplazar
  measurementId: "..." // Reemplazar (opcional)
};

// Inicializar Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Obtener referencias
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Configurar persistencia de sesión
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    console.log('✅ Persistencia de sesión configurada');
  })
  .catch((error) => {
    console.error('❌ Error configurando persistencia:', error);
  });

// Exportar referencias
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { auth, db, storage };
}
