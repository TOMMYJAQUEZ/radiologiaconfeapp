/**
 * Módulo: Quiz Manager
 * Descripción: Gestiona toda la lógica de quizzes
 * Autor: Equipo Radiología con Fe
 * Fecha: 2026-07-02
 */

class QuizManager {
  constructor() {
    this.db = firebase.firestore();
    this.currentQuiz = null;
    this.currentQuestion = 0;
    this.responses = [];
    this.startTime = null;
    this.mode = null; // 'estudio' o 'examen'
  }

  /**
   * Inicia un nuevo quiz
   * @param {string} tema - Tema del quiz
   * @param {string} modo - Modo: 'estudio' o 'examen'
   */
  async startQuiz(tema, modo = 'estudio') {
    try {
      console.log(`⏳ Iniciando quiz de ${tema} en modo ${modo}`);
      
      // Obtener preguntas del tema
      const querySnapshot = await this.db
        .collection('quizzes/preguntas')
        .where('tema', '==', tema)
        .limit(modo === 'examen' ? 30 : 20)
        .get();
      
      if (querySnapshot.empty) {
        throw new Error(`No hay preguntas para el tema: ${tema}`);
      }
      
      // Convertir a array y mezclar
      let preguntas = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      preguntas = this.shuffle(preguntas);
      
      this.currentQuiz = {
        tema,
        modo,
        preguntas,
        totalPreguntas: preguntas.length
      };
      
      this.currentQuestion = 0;
      this.responses = [];
      this.startTime = new Date();
      this.mode = modo;
      
      return this.getCurrentQuestion();
    } catch (error) {
      console.error('Error iniciando quiz:', error);
      throw error;
    }
  }

  /**
   * Obtiene la pregunta actual
   */
  getCurrentQuestion() {
    if (!this.currentQuiz || this.currentQuestion >= this.currentQuiz.totalPreguntas) {
      return null;
    }
    
    const pregunta = this.currentQuiz.preguntas[this.currentQuestion];
    
    // En modo examen, no mostrar respuesta correcta
    if (this.mode === 'examen') {
      return this.sanitizeQuestion(pregunta);
    }
    
    return pregunta;
  }

  /**
   * Responde una pregunta
   * @param {string} respuesta - ID de la opción seleccionada
   */
  async answerQuestion(respuesta) {
    try {
      const pregunta = this.getCurrentQuestion();
      const esCorrecta = pregunta.opciones.find(o => o.id === respuesta)?.es_correcta || false;
      
      const response = {
        pregunta_id: pregunta.id,
        respuesta_usuario: respuesta,
        es_correcta: esCorrecta,
        tiempo_respuesta: this.getElapsedSeconds(),
        tema: this.currentQuiz.tema,
        modo: this.mode,
        timestamp: new Date()
      };
      
      this.responses.push(response);
      
      // Calcular XP (solo modo estudio muestra feedback inmediato)
      let xpGanado = 0;
      if (esCorrecta) {
        xpGanado = this.calculateXP(pregunta.dificultad);
      }
      
      return {
        esCorrecta,
        xpGanado,
        explicacion: pregunta.explicacion,
        respuestaCorrecta: pregunta.opciones.find(o => o.es_correcta)?.id
      };
    } catch (error) {
      console.error('Error respondiendo pregunta:', error);
      throw error;
    }
  }

  /**
   * Avanza a la siguiente pregunta
   */
  nextQuestion() {
    if (this.currentQuestion < this.currentQuiz.totalPreguntas - 1) {
      this.currentQuestion++;
      return this.getCurrentQuestion();
    }
    return null;
  }

  /**
   * Retrocede a la pregunta anterior
   */
  previousQuestion() {
    if (this.currentQuestion > 0) {
      this.currentQuestion--;
      return this.getCurrentQuestion();
    }
    return null;
  }

  /**
   * Termina el quiz y calcula resultados
   */
  async finishQuiz(userId) {
    try {
      console.log('✅ Finalizando quiz...');
      
      // Calcular estadísticas
      const correctas = this.responses.filter(r => r.es_correcta).length;
      const incorrectas = this.responses.filter(r => !r.es_correcta).length;
      const porcentaje = (correctas / this.responses.length) * 100;
      
      // Calcular XP total
      let xpTotal = 0;
      this.responses.forEach(response => {
        if (response.es_correcta) {
          const pregunta = this.currentQuiz.preguntas.find(p => p.id === response.pregunta_id);
          xpTotal += this.calculateXP(pregunta.dificultad);
        }
      });
      
      // En modo examen, bonus por porcentaje
      if (this.mode === 'examen') {
        xpTotal = Math.floor(100 + (porcentaje / 100) * 50);
      }
      
      // Guardar respuestas en Firestore
      const batch = this.db.batch();
      
      this.responses.forEach((response, index) => {
        const ref = this.db
          .collection('users')
          .doc(userId)
          .collection('quiz_responses')
          .doc();
        batch.set(ref, response);
      });
      
      await batch.commit();
      
      // Retornar resultados
      return {
        totalPreguntas: this.responses.length,
        correctas,
        incorrectas,
        porcentaje: Math.round(porcentaje),
        xpGanado: xpTotal,
        duracion: this.getElapsedSeconds(),
        tema: this.currentQuiz.tema,
        modo: this.mode,
        responses: this.responses
      };
    } catch (error) {
      console.error('Error finalizando quiz:', error);
      throw error;
    }
  }

  /**
   * Calcula XP basado en dificultad
   */
  calculateXP(dificultad) {
    const xpMap = {
      'basico': 5,
      'intermedio': 10,
      'avanzado': 15
    };
    return xpMap[dificultad] || 10;
  }

  /**
   * Obtiene segundos transcurridos
   */
  getElapsedSeconds() {
    return Math.floor((new Date() - this.startTime) / 1000);
  }

  /**
   * Mezcla un array (Fisher-Yates)
   */
  shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Sanitiza pregunta para modo examen (oculta respuesta correcta)
   */
  sanitizeQuestion(pregunta) {
    const sanitized = { ...pregunta };
    sanitized.opciones = sanitized.opciones.map(o => ({
      id: o.id,
      texto: o.texto
    }));
    delete sanitized.explicacion;
    return sanitized;
  }

  /**
   * Obtiene estadísticas del usuario en un tema
   */
  async getUserStats(userId, tema) {
    try {
      const snapshot = await this.db
        .collection('users')
        .doc(userId)
        .collection('quiz_responses')
        .where('tema', '==', tema)
        .get();
      
      const responses = snapshot.docs.map(doc => doc.data());
      const correctas = responses.filter(r => r.es_correcta).length;
      const promedio = responses.length > 0 
        ? Math.round((correctas / responses.length) * 100)
        : 0;
      
      return {
        totalQuizzes: responses.length,
        correctas,
        promedio,
        responses
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuizManager;
}
