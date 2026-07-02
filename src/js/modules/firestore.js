/**
 * Módulo: Firestore Manager
 * Descripción: Operaciones CRUD con Firestore
 * Autor: Equipo Radiología con Fe
 * Fecha: 2026-07-02
 */

class FirestoreManager {
  constructor() {
    this.db = firebase.firestore();
  }

  /**
   * Obtiene usuario por ID
   */
  async getUser(userId) {
    try {
      const doc = await this.db.collection('users').doc(userId).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  }

  /**
   * Crea nuevo usuario
   */
  async createUser(userId, userData) {
    try {
      const docData = {
        uid: userId,
        email: userData.email,
        nombre: userData.nombre,
        rol: userData.rol || 'estudiante',
        createdAt: new Date(),
        updatedAt: new Date(),
        xp: 0,
        nivel: 1,
        racha_actual: 0,
        racha_maxima: 0,
        avatar: userData.avatar || 'default',
        grupo: userData.grupo || 'General',
        acceso: userData.acceso || {
          inicio: new Date(),
          fin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          activo: true
        }
      };
      
      await this.db.collection('users').doc(userId).set(docData);
      return docData;
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza usuario
   */
  async updateUser(userId, updates) {
    try {
      await this.db.collection('users').doc(userId).update({
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las preguntas de un tema
   */
  async getQuestionsByTheme(tema, limit = 20) {
    try {
      const snapshot = await this.db
        .collection('quizzes/preguntas')
        .where('tema', '==', tema)
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error obteniendo preguntas:', error);
      throw error;
    }
  }

  /**
   * Obtiene pregunta por ID
   */
  async getQuestion(preguntaId) {
    try {
      const doc = await this.db
        .collection('quizzes/preguntas')
        .doc(preguntaId)
        .get();
      
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      console.error('Error obteniendo pregunta:', error);
      throw error;
    }
  }

  /**
   * Crea nueva pregunta
   */
  async createQuestion(preguntaData) {
    try {
      const docRef = await this.db
        .collection('quizzes/preguntas')
        .add({
          ...preguntaData,
          createdAt: new Date(),
          updatedAt: new Date(),
          estadisticas: {
            veces_preguntada: 0,
            veces_correcta: 0,
            porcentaje_acierto: 0
          }
        });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creando pregunta:', error);
      throw error;
    }
  }

  /**
   * Actualiza estadísticas de pregunta
   */
  async updateQuestionStats(preguntaId, esCorrecta) {
    try {
      const docRef = this.db.collection('quizzes/preguntas').doc(preguntaId);
      const doc = await docRef.get();
      
      if (!doc.exists) throw new Error('Pregunta no encontrada');
      
      const stats = doc.data().estadisticas || {};
      const veces_preguntada = (stats.veces_preguntada || 0) + 1;
      const veces_correcta = (stats.veces_correcta || 0) + (esCorrecta ? 1 : 0);
      const porcentaje_acierto = (veces_correcta / veces_preguntada) * 100;
      
      await docRef.update({
        'estadisticas.veces_preguntada': veces_preguntada,
        'estadisticas.veces_correcta': veces_correcta,
        'estadisticas.porcentaje_acierto': Math.round(porcentaje_acierto),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error actualizando estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtiene estructura anatómica
   */
  async getAnatomicalStructure(sistema, estructura) {
    try {
      const doc = await this.db
        .collection('anatomia/sistemas')
        .doc(sistema)
        .collection('estructuras')
        .doc(estructura)
        .get();
      
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      console.error('Error obteniendo estructura:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los sistemas anatómicos
   */
  async getAnatomicalSystems() {
    try {
      const snapshot = await this.db
        .collection('anatomia/sistemas')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error obteniendo sistemas:', error);
      throw error;
    }
  }

  /**
   * Guarda respuesta de quiz
   */
  async saveQuizResponse(userId, responseData) {
    try {
      await this.db
        .collection('users')
        .doc(userId)
        .collection('quiz_responses')
        .add({
          ...responseData,
          timestamp: new Date()
        });
      
      return true;
    } catch (error) {
      console.error('Error guardando respuesta:', error);
      throw error;
    }
  }

  /**
   * Obtiene grupos de estudiantes
   */
  async getStudentGroups() {
    try {
      const snapshot = await this.db
        .collection('grupos')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error obteniendo grupos:', error);
      throw error;
    }
  }

  /**
   * Obtiene estudiantes de un grupo
   */
  async getGroupStudents(grupoId) {
    try {
      const snapshot = await this.db
        .collection('users')
        .where('grupo', '==', grupoId)
        .where('rol', '==', 'estudiante')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error obteniendo estudiantes del grupo:', error);
      throw error;
    }
  }

  /**
   * Batch update para operaciones múltiples
   */
  async batchUpdate(updates) {
    try {
      const batch = this.db.batch();
      
      updates.forEach(({ ref, data }) => {
        batch.update(ref, data);
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error en batch update:', error);
      throw error;
    }
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FirestoreManager;
}
