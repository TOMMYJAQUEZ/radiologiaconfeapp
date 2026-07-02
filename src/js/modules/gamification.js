/**
 * Módulo: Gamification Manager
 * Descripción: Gestiona XP, niveles, racha y logros
 * Autor: Equipo Radiología con Fe
 * Fecha: 2026-07-02
 */

class GamificationManager {
  constructor() {
    this.db = firebase.firestore();
    this.XP_BASE = 10;
    this.XP_PER_LEVEL = 100;
  }

  /**
   * Añade XP a un usuario
   * @param {string} userId - ID del usuario
   * @param {number} cantidad - Cantidad de XP a añadir
   * @param {number} racha - Racha actual para multiplicador
   */
  async addXP(userId, cantidad, racha = 1) {
    try {
      const user = await this.db.collection('users').doc(userId).get();
      if (!user.exists) throw new Error('Usuario no encontrado');
      
      const userData = user.data();
      const xpAnterior = userData.xp || 0;
      const nivelAnterior = userData.nivel || 1;
      
      // Aplicar multiplicador de racha
      const xpConBonus = Math.floor(cantidad * (1 + (racha - 1) * 0.05));
      const nuevoXP = xpAnterior + xpConBonus;
      
      // Calcular nuevo nivel
      const nuevoNivel = this.calcularNivel(nuevoXP);
      
      // Actualizar usuario
      await this.db.collection('users').doc(userId).update({
        xp: nuevoXP,
        nivel: nuevoNivel,
        updatedAt: new Date()
      });
      
      // Si subió de nivel, desbloquear logro
      if (nuevoNivel > nivelAnterior) {
        await this.unlockAchievement(userId, `nivel_${nuevoNivel}`);
      }
      
      return {
        xpAnterior,
        xpGanado: xpConBonus,
        nuevoXP,
        nivelAnterior,
        nuevoNivel,
        subiNivel: nuevoNivel > nivelAnterior
      };
    } catch (error) {
      console.error('Error añadiendo XP:', error);
      throw error;
    }
  }

  /**
   * Calcula el nivel basado en XP
   * Fórmula: XP_requerido = 100 * (n - 1) + 50 * (n - 1)^2
   */
  calcularNivel(xpTotal) {
    let nivel = 1;
    let xpAcumulado = 0;
    
    for (let n = 1; n <= 50; n++) {
      const xpParaNivel = 100 * (n - 1) + 50 * Math.pow(n - 1, 2);
      if (xpAcumulado + xpParaNivel <= xpTotal) {
        xpAcumulado += xpParaNivel;
        nivel = n + 1;
      } else {
        break;
      }
    }
    
    return Math.min(nivel, 50);
  }

  /**
   * Obtiene XP requerido para el siguiente nivel
   */
  getXPParaSiguienteNivel(nivelActual) {
    const xpParaNivel = 100 * nivelActual + 50 * Math.pow(nivelActual, 2);
    return xpParaNivel;
  }

  /**
   * Incrementa la racha del usuario
   */
  async incrementarRacha(userId) {
    try {
      const user = await this.db.collection('users').doc(userId).get();
      if (!user.exists) throw new Error('Usuario no encontrado');
      
      const userData = user.data();
      const ahora = new Date();
      const ultimoAcceso = userData.ultimo_acceso?.toDate?.() || new Date(0);
      
      // Verificar si es el mismo día
      const mismodia = this.esMismoDia(ultimoAcceso, ahora);
      const diaSiguiente = this.esDiaConsecutivo(ultimoAcceso, ahora);
      
      let nuevoContador = userData.racha_actual || 0;
      
      if (!mismodia && diaSiguiente) {
        // Día consecutivo, incrementar racha
        nuevoContador = (userData.racha_actual || 0) + 1;
      } else if (!mismodia && !diaSiguiente) {
        // Racha rota, reiniciar
        nuevoContador = 1;
      }
      // Si es el mismo día, no cambiar
      
      // Actualizar racha máxima si es necesario
      const nuevaRachaMax = Math.max(userData.racha_maxima || 0, nuevoContador);
      
      // Actualizar usuario
      await this.db.collection('users').doc(userId).update({
        racha_actual: nuevoContador,
        racha_maxima: nuevaRachaMax,
        ultimo_acceso: ahora
      });
      
      // Desbloquear logros de racha
      if (nuevoContador === 3) {
        await this.unlockAchievement(userId, 'racha_3_dias');
      } else if (nuevoContador === 7) {
        await this.unlockAchievement(userId, 'racha_7_dias');
      } else if (nuevoContador === 30) {
        await this.unlockAchievement(userId, 'racha_30_dias');
      }
      
      return { nuevoContador, rachaRota: !mismodia && !diaSiguiente };
    } catch (error) {
      console.error('Error incrementando racha:', error);
      throw error;
    }
  }

  /**
   * Desbloquea un logro para el usuario
   */
  async unlockAchievement(userId, achievementId) {
    try {
      const logrosRef = this.db
        .collection('users')
        .doc(userId)
        .collection('achievements');
      
      // Verificar si ya existe
      const existing = await logrosRef.doc(achievementId).get();
      if (existing.exists) {
        return; // Ya desbloqueado
      }
      
      // Obtener definición del logro
      const achievement = ACHIEVEMENTS_DEFINITIONS[achievementId];
      if (!achievement) {
        console.warn(`Logro desconocido: ${achievementId}`);
        return;
      }
      
      // Guardar logro desbloqueado
      await logrosRef.doc(achievementId).set({
        id: achievementId,
        nombre: achievement.nombre,
        descripcion: achievement.descripcion,
        icono: achievement.icono,
        xpReward: achievement.xpReward,
        unlockedAt: new Date()
      });
      
      // Añadir XP del logro
      if (achievement.xpReward) {
        await this.addXP(userId, achievement.xpReward);
      }
      
      console.log(`🏆 Logro desbloqueado: ${achievement.nombre}`);
    } catch (error) {
      console.error('Error desbloqueando logro:', error);
    }
  }

  /**
   * Obtiene logros desbloqueados del usuario
   */
  async getUserAchievements(userId) {
    try {
      const snapshot = await this.db
        .collection('users')
        .doc(userId)
        .collection('achievements')
        .get();
      
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error obteniendo logros:', error);
      throw error;
    }
  }

  /**
   * Verifica si es el mismo día
   */
  esMismoDia(fecha1, fecha2) {
    return fecha1.getDate() === fecha2.getDate() &&
           fecha1.getMonth() === fecha2.getMonth() &&
           fecha1.getFullYear() === fecha2.getFullYear();
  }

  /**
   * Verifica si es día consecutivo
   */
  esDiaConsecutivo(fecha1, fecha2) {
    const diff = Math.floor((fecha2 - fecha1) / (1000 * 60 * 60 * 24));
    return diff === 1;
  }

  /**
   * Obtiene leaderboard
   */
  async getLeaderboard(limit = 50) {
    try {
      const snapshot = await this.db
        .collection('users')
        .where('rol', '==', 'estudiante')
        .orderBy('xp', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map((doc, index) => ({
        posicion: index + 1,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error obteniendo leaderboard:', error);
      throw error;
    }
  }
}

// Definiciones de Logros
const ACHIEVEMENTS_DEFINITIONS = {
  'primer_paso': {
    nombre: 'Primer Paso',
    descripcion: 'Completar primer quiz',
    icono: '🎯',
    xpReward: 10
  },
  'racha_3_dias': {
    nombre: 'Racha de 3 Días',
    descripcion: 'Mantener racha por 3 días consecutivos',
    icono: '🔥',
    xpReward: 25
  },
  'racha_7_dias': {
    nombre: 'Semana Dorada',
    descripcion: 'Mantener racha por 7 días consecutivos',
    icono: '🔥🔥',
    xpReward: 100
  },
  'racha_30_dias': {
    nombre: '30 Días de Gloria',
    descripcion: 'Mantener racha por 30 días consecutivos',
    icono: '🔥🔥🔥',
    xpReward: 300
  },
  'nivel_5': {
    nombre: 'Novato',
    descripcion: 'Alcanzar nivel 5',
    icono: '⭐',
    xpReward: 50
  },
  'nivel_10': {
    nombre: 'Aprendiz',
    descripcion: 'Alcanzar nivel 10',
    icono: '⭐⭐',
    xpReward: 100
  },
  'maestro_craneo': {
    nombre: 'Maestro del Cráneo',
    descripcion: 'Lograr 95%+ en 10 quizzes de cráneo',
    icono: '🧠',
    xpReward: 50
  }
};

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GamificationManager, ACHIEVEMENTS_DEFINITIONS };
}
