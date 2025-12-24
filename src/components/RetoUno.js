import React, { useState, useEffect } from 'react';
import './RetoUno.css';
import apiService from '../services/api';
import ReviewReto1Modal from './ReviewReto1Modal';
import { PUNTOS_POR_PREGUNTA_RETO_1 } from '../constants/puntuacion';

const RetoUno = ({ onVolver, datosUsuario, sesionJuego }) => {
  const [preguntaActual, setPreguntaActual] = useState(1);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState('');
  const [validacion, setValidacion] = useState({
    mostrada: false,
    esCorrecta: null
  });
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [quipuActivado, setQuipuActivado] = useState(false);
  const [mostrarCorona, setMostrarCorona] = useState(false);
  const [coronaDesaparecida, setCoronaDesaparecida] = useState(false);
  const [coronaPresionada, setCoronaPresionada] = useState(false);
  const [enviando, setEnviando] = useState(false);  // Estado de carga
  const [tiempoInicio, setTiempoInicio] = useState(Date.now());  // Para rastrear tiempo de respuesta
  const [respuestasGuardadas, setRespuestasGuardadas] = useState([]); // Guardar todas las respuestas
  const [mostrarReviewModal, setMostrarReviewModal] = useState(false); // Modal de review
  const [mensajeActual, setMensajeActual] = useState(0); // Para controlar la secuencia de mensajes
  const [esVictoria, setEsVictoria] = useState(false); // Para saber si es victoria o derrota

  // Inicializar tiempo cuando se monta el componente
  useEffect(() => {
    setTiempoInicio(Date.now());
  }, []);

  // Limpiar estado cuando cambie la pregunta
  useEffect(() => {
    setRespuestaSeleccionada('');
    setValidacion({
      mostrada: false,
      esCorrecta: null
    });
    setQuipuActivado(false);
    setMostrarMensaje(false);
    setMostrarCorona(false);
    setCoronaDesaparecida(false);
    setCoronaPresionada(false);
    // Inicializar tiempo de inicio para esta pregunta
    setTiempoInicio(Date.now());
  }, [preguntaActual]);

  const manejarSeleccion = (valor) => {
    setRespuestaSeleccionada(valor);
    setValidacion({
      mostrada: false,
      esCorrecta: null,
      mensajeError: null
    });
  };

  const manejarEnviar = async () => {
    // Evitar envíos múltiples
    if (enviando) {
      return;
    }

    if (!respuestaSeleccionada) {
      // Mostrar quipu con mensaje de error cuando no se selecciona nada
      setValidacion({
        mostrada: true,
        esCorrecta: false,
        mensajeError: "Debes seleccionar una opción"
      });
      
      // Mostrar el quipu después de un breve delay
      setTimeout(() => {
        setQuipuActivado(true);
      }, 300);
      return;
    }

    // Activar estado de carga
    setEnviando(true);

    let esCorrecta = false;
    let respuestaUsuarioLetra = '';
    let respuestaCorrectaLetra = '';
    
    // Mapear la respuesta seleccionada a formato A, B, C, D
    const mapeoRespuestas = {
      'x': 'A',           // Variables (x, x²)
      'numeros': 'B',     // Números
      'operadores': 'C',  // Operadores (+, -)
      'parentesis': 'D'   // Paréntesis
    };
    
    respuestaUsuarioLetra = mapeoRespuestas[respuestaSeleccionada] || '';
    
    // Determinar respuesta correcta según la pregunta
    if (preguntaActual === 1) {
      // Pregunta 1: "Escoja de que color es la variable x o x al cuadrado en el Quipu"
      respuestaCorrectaLetra = 'A';  // x = A
      esCorrecta = respuestaSeleccionada === 'x';
    } else if (preguntaActual === 2) {
      // Pregunta 2: "Escoja con que color se representa a los numeros en el Quipu"
      respuestaCorrectaLetra = 'B';  // numeros = B
      esCorrecta = respuestaSeleccionada === 'numeros';
    } else if (preguntaActual === 3) {
      // Pregunta 3: "Escoja con que color se representa a las operaciones (+,-) en el Quipu"
      respuestaCorrectaLetra = 'C';  // operadores = C
      esCorrecta = respuestaSeleccionada === 'operadores';
    } else if (preguntaActual === 4) {
      // Pregunta 4: "Escoje con que color se representa los paréntesis en el Quipu"
      respuestaCorrectaLetra = 'C';  // operadores = C (los paréntesis también son operadores)
      esCorrecta = respuestaSeleccionada === 'operadores';
    }
    
    setValidacion({
      mostrada: true,
      esCorrecta: esCorrecta
    });

    // Guardar respuesta en el backend y en el estado local
    if (sesionJuego && respuestaUsuarioLetra) {
      try {
        // Calcular tiempo real de respuesta en segundos
        const tiempoReal = tiempoInicio ? Math.round((Date.now() - tiempoInicio) / 1000) : 10;
        
        const respuestaData = {
          sesionId: sesionJuego.id,
          preguntaNumero: preguntaActual,
          respuestaCorrecta: respuestaCorrectaLetra,
          respuestaUsuario: respuestaUsuarioLetra,
          tiempoRespuesta: tiempoReal
        };
        
        await apiService.guardarRespuestaReto1(respuestaData);
        
        // Guardar respuesta en el estado local para el review
        setRespuestasGuardadas(prev => {
          const nuevasRespuestas = prev.filter(r => r.preguntaNumero !== preguntaActual);
          return [...nuevasRespuestas, respuestaData];
        });
        
        console.log(`✅ Respuesta ${preguntaActual} guardada en el backend (Correcta: ${respuestaCorrectaLetra}, Usuario: ${respuestaUsuarioLetra}, Es correcta: ${esCorrecta})`);
      } catch (error) {
        console.error('❌ Error al guardar respuesta:', error);
      }
    }

    // Desactivar estado de carga
    setEnviando(false);

    // Mostrar el niño después de la validación
    setTimeout(() => {
      setQuipuActivado(true);
    }, 500);
  };

  const handleCoronaClick = () => {
    // Hacer desaparecer la corona y pergamino
    setMostrarCorona(false);
    setCoronaPresionada(true);
    // Calcular puntuación y mostrar review (enviar nota al backend)
    calcularPuntuacionYMostrarReview();
  };

  const handleQuipuClick = () => {
    // Si hay un mensaje de error, ocultar el quipu
    if (validacion.mensajeError) {
      setValidacion({
        mostrada: false,
        esCorrecta: null,
        mensajeError: null
      });
      setQuipuActivado(false);
      return;
    }

    // NUEVA LÓGICA: Permitir avanzar siempre que se haya seleccionado una respuesta
    // No se bloquea por respuestas incorrectas
    if (preguntaActual < 4) {
      // Avanzar a la siguiente pregunta (el useEffect limpiará el estado)
      setQuipuActivado(false);
      setPreguntaActual(preguntaActual + 1);
    } else {
      // Si es la pregunta 4 (última), calcular respuestas correctas y mostrar mensajes apropiados
      const respuestasCorrectas = respuestasGuardadas.filter(r => r.respuestaUsuario === r.respuestaCorrecta).length;
      const esVictoria = respuestasCorrectas > 2;
      setEsVictoria(esVictoria);
      
      if (mostrarMensaje) {
        // Avanzar al siguiente mensaje en la secuencia
        if (esVictoria) {
          // Secuencia de victoria: "¡Se abrió la puerta..." → "¡Espera! ¿Qué es esto?..." → corona
          if (mensajeActual === 0) {
            setMensajeActual(1);
            setValidacion(prev => ({
              ...prev,
              mensaje: "¡Espera! ¿Qué es esto? ¡Hay algo que brilla!",
              mensajeFinal: false
            }));
          } else if (mensajeActual === 1) {
            // Mostrar la corona después del segundo mensaje
            setMostrarCorona(true);
            setQuipuActivado(false);
          }
        } else {
          // Secuencia de derrota: "Encontre esto. ¡Salgamos de aquí" → corona
          if (mensajeActual === 0) {
            setMostrarCorona(true);
            setQuipuActivado(false);
          }
        }
      } else {
        // Mostrar primer mensaje
        setMostrarMensaje(true);
        if (esVictoria) {
          setValidacion(prev => ({
            ...prev,
            mensaje: "¡Se abrió la puerta, vamos al siguiente reto!",
            mensajeFinal: false
          }));
        } else {
          setValidacion(prev => ({
            ...prev,
            mensaje: "Encontre esto. ¡Salgamos de aquí",
            mensajeFinal: false
          }));
        }
        setMensajeActual(0);
      }
    }
  };

  const calcularPuntuacionYMostrarReview = async () => {
    // Calcular puntuación del reto 1
    let puntuacionReto1 = 0;
    respuestasGuardadas.forEach(respuesta => {
      if (respuesta.respuestaUsuario === respuesta.respuestaCorrecta) {
        puntuacionReto1 += PUNTOS_POR_PREGUNTA_RETO_1;
      }
    });

    // Obtener puntuación actual de la sesión para calcular la nota final acumulada
    let notaFinalAcumulada = puntuacionReto1; // Iniciar con la puntuación del reto 1
    if (sesionJuego) {
      try {
        const sesionActual = await apiService.obtenerSesion(sesionJuego.id);
        const sesionData = sesionActual.data || sesionActual;
        // Sumar puntuaciones de otros retos (reto 2 y reto 3) si existen
        const puntuacionReto2 = sesionData.puntuacionReto2 || 0;
        const puntuacionReto3 = sesionData.puntuacionReto3 || 0;
        notaFinalAcumulada = puntuacionReto1 + puntuacionReto2 + puntuacionReto3;
      } catch (error) {
        console.error('Error al obtener sesión:', error);
        // Si hay error, usar solo la puntuación del reto 1
        notaFinalAcumulada = puntuacionReto1;
      }
    }

    // Calcular nota del juego (0-10): puntuación total dividida entre 10
    const notaJuego = Math.round(notaFinalAcumulada / 10); // Redondear a entero (0-10)

    // Actualizar sesión en el backend con la nota final acumulada
    if (sesionJuego) {
      try {
        await apiService.actualizarSesion(sesionJuego.id, {
          puntuacionReto1: puntuacionReto1,
          puntuacionTotal: notaFinalAcumulada,
          puntuacionNotas: notaJuego
        });
        console.log(`✅ Reto 1 completado. Puntuación: ${puntuacionReto1}/10. Nota final acumulada: ${notaFinalAcumulada}/100. Nota del juego: ${notaJuego}/10`);
      } catch (error) {
        console.error('❌ Error al actualizar sesión:', error);
      }
    }

    // Ocultar quipu y mostrar modal de review
    setQuipuActivado(false);
    setMostrarReviewModal(true);
  };

  const handleContinuarReview = () => {
    setMostrarReviewModal(false);
    onVolver(1); // Volver al centro de control
  };

  const renderOpciones = () => {
    if (preguntaActual === 1) {
      // Orden para pregunta 1: Números, X, Operadores (respuesta correcta en el centro)
      return (
        <>
          {/* Nomenclatura Numérica */}
          <div className="opcion-item">
            <input 
              type="radio" 
              id="opcion-numeros" 
              name="color-variable" 
              value="numeros"
              className="opcion-radio"
              onChange={() => manejarSeleccion('numeros')}
              disabled={validacion.mostrada}
            />
            <label 
              htmlFor="opcion-numeros" 
              className={`opcion-label ${validacion.mostrada && respuestaSeleccionada === 'numeros' ? (validacion.esCorrecta ? 'correcta' : 'incorrecta') : ''}`}
            >
              <div className="nomenclatura-section">
                <div className="nomenclatura-content">
                  <div className="quipu-grid">
                    {[1, 2, 3].map(numero => (
                      <div key={numero} className="quipu-example">
                        <img 
                          src={require(`../assets/img/${numero}.png`)} 
                          alt={`Nudo ${numero}`} 
                          className="quipu-knot-image"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </label>
          </div>
          
          {/* Nomenclatura X */}
          <div className="opcion-item">
            <input 
              type="radio" 
              id="opcion-x" 
              name="color-variable" 
              value="x"
              className="opcion-radio"
              onChange={() => manejarSeleccion('x')}
              disabled={validacion.mostrada}
            />
            <label 
              htmlFor="opcion-x" 
              className={`opcion-label ${validacion.mostrada && respuestaSeleccionada === 'x' ? (validacion.esCorrecta ? 'correcta' : 'incorrecta') : ''}`}
            >
              <div className="nomenclatura-section">
                <div className="test-content">
                  <div className="test-item">
                    <img src={require('../assets/img/x.png')} alt="X" className="test-image" />
                  </div>
                  <div className="test-item">
                    <img src={require('../assets/img/x2.png')} alt="X²" className="test-image" />
                  </div>
                </div>
              </div>
            </label>
          </div>
          
          {/* Nomenclatura Operacional */}
          <div className="opcion-item">
            <input 
              type="radio" 
              id="opcion-operadores" 
              name="color-variable" 
              value="operadores"
              className="opcion-radio"
              onChange={() => manejarSeleccion('operadores')}
              disabled={validacion.mostrada}
            />
            <label 
              htmlFor="opcion-operadores" 
              className={`opcion-label ${validacion.mostrada && respuestaSeleccionada === 'operadores' ? (validacion.esCorrecta ? 'correcta' : 'incorrecta') : ''}`}
            >
              <div className="nomenclatura-section">
                <div className="operational-grid">
                  <div className="operational-item">
                    <img src={require('../assets/img/plus.png')} alt="+" className="operational-image" />
                  </div>
                  <div className="operational-item">
                    <img src={require('../assets/img/minus.png')} alt="-" className="operational-image" />
                  </div>
                  <div className="operational-item">
                    <img src={require('../assets/img/times.png')} alt="×" className="operational-image" />
                  </div>
                </div>
              </div>
            </label>
          </div>
        </>
      );
    } else if (preguntaActual === 2) {
      // Orden para pregunta 2: Operadores, X, Números (respuesta correcta a la derecha)
      return (
        <>
          {/* Nomenclatura Operacional */}
          <div className="opcion-item">
            <input 
              type="radio" 
              id="opcion-operadores" 
              name="color-variable" 
              value="operadores"
              className="opcion-radio"
              onChange={() => manejarSeleccion('operadores')}
              disabled={validacion.mostrada}
            />
            <label 
              htmlFor="opcion-operadores" 
              className={`opcion-label ${validacion.mostrada && respuestaSeleccionada === 'operadores' ? (validacion.esCorrecta ? 'correcta' : 'incorrecta') : ''}`}
            >
              <div className="nomenclatura-section">
                <div className="operational-grid">
                  <div className="operational-item">
                    <img src={require('../assets/img/plus.png')} alt="+" className="operational-image" />
                  </div>
                  <div className="operational-item">
                    <img src={require('../assets/img/minus.png')} alt="-" className="operational-image" />
                  </div>
                  <div className="operational-item">
                    <img src={require('../assets/img/times.png')} alt="×" className="operational-image" />
                  </div>
                </div>
              </div>
            </label>
          </div>
          
          {/* Nomenclatura X */}
          <div className="opcion-item">
            <input 
              type="radio" 
              id="opcion-x" 
              name="color-variable" 
              value="x"
              className="opcion-radio"
              onChange={() => manejarSeleccion('x')}
              disabled={validacion.mostrada}
            />
            <label 
              htmlFor="opcion-x" 
              className={`opcion-label ${validacion.mostrada && respuestaSeleccionada === 'x' ? (validacion.esCorrecta ? 'correcta' : 'incorrecta') : ''}`}
            >
              <div className="nomenclatura-section">
                <div className="test-content">
                  <div className="test-item">
                    <img src={require('../assets/img/x.png')} alt="X" className="test-image" />
                  </div>
                  <div className="test-item">
                    <img src={require('../assets/img/x2.png')} alt="X²" className="test-image" />
                  </div>
                </div>
              </div>
            </label>
          </div>
          
          {/* Nomenclatura Numérica */}
          <div className="opcion-item">
            <input 
              type="radio" 
              id="opcion-numeros" 
              name="color-variable" 
              value="numeros"
              className="opcion-radio"
              onChange={() => manejarSeleccion('numeros')}
              disabled={validacion.mostrada}
            />
            <label 
              htmlFor="opcion-numeros" 
              className={`opcion-label ${validacion.mostrada && respuestaSeleccionada === 'numeros' ? (validacion.esCorrecta ? 'correcta' : 'incorrecta') : ''}`}
            >
              <div className="nomenclatura-section">
                <div className="nomenclatura-content">
                  <div className="quipu-grid">
                    {[1, 2, 3].map(numero => (
                      <div key={numero} className="quipu-example">
                        <img 
                          src={require(`../assets/img/${numero}.png`)} 
                          alt={`Nudo ${numero}`} 
                          className="quipu-knot-image"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </label>
          </div>
        </>
      );
    } else if (preguntaActual === 3) {
      // Orden para pregunta 3: Operadores, X, Números (respuesta correcta a la izquierda)
      return (
        <>
          {/* Nomenclatura Operacional */}
          <div className="opcion-item">
            <input 
              type="radio" 
              id="opcion-operadores" 
              name="color-variable" 
              value="operadores"
              className="opcion-radio"
              onChange={() => manejarSeleccion('operadores')}
              disabled={validacion.mostrada}
            />
            <label 
              htmlFor="opcion-operadores" 
              className={`opcion-label ${validacion.mostrada && respuestaSeleccionada === 'operadores' ? (validacion.esCorrecta ? 'correcta' : 'incorrecta') : ''}`}
            >
              <div className="nomenclatura-section">
                <div className="operational-grid">
                  <div className="operational-item">
                    <img src={require('../assets/img/plus.png')} alt="+" className="operational-image" />
                  </div>
                  <div className="operational-item">
                    <img src={require('../assets/img/minus.png')} alt="-" className="operational-image" />
                  </div>
                  <div className="operational-item">
                    <img src={require('../assets/img/times.png')} alt="×" className="operational-image" />
                  </div>
                </div>
              </div>
            </label>
          </div>
          
          {/* Nomenclatura X */}
          <div className="opcion-item">
            <input 
              type="radio" 
              id="opcion-x" 
              name="color-variable" 
              value="x"
              className="opcion-radio"
              onChange={() => manejarSeleccion('x')}
              disabled={validacion.mostrada}
            />
            <label 
              htmlFor="opcion-x" 
              className={`opcion-label ${validacion.mostrada && respuestaSeleccionada === 'x' ? (validacion.esCorrecta ? 'correcta' : 'incorrecta') : ''}`}
            >
              <div className="nomenclatura-section">
                <div className="test-content">
                  <div className="test-item">
                    <img src={require('../assets/img/x.png')} alt="X" className="test-image" />
                  </div>
                  <div className="test-item">
                    <img src={require('../assets/img/x2.png')} alt="X²" className="test-image" />
                  </div>
                </div>
              </div>
            </label>
          </div>
          
          {/* Nomenclatura Numérica */}
          <div className="opcion-item">
            <input 
              type="radio" 
              id="opcion-numeros" 
              name="color-variable" 
              value="numeros"
              className="opcion-radio"
              onChange={() => manejarSeleccion('numeros')}
              disabled={validacion.mostrada}
            />
            <label 
              htmlFor="opcion-numeros" 
              className={`opcion-label ${validacion.mostrada && respuestaSeleccionada === 'numeros' ? (validacion.esCorrecta ? 'correcta' : 'incorrecta') : ''}`}
            >
              <div className="nomenclatura-section">
                <div className="nomenclatura-content">
                  <div className="quipu-grid">
                    {[1, 2, 3].map(numero => (
                      <div key={numero} className="quipu-example">
                        <img 
                          src={require(`../assets/img/${numero}.png`)} 
                          alt={`Nudo ${numero}`} 
                          className="quipu-knot-image"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </label>
          </div>
        </>
      );
    } else {
      // Orden para pregunta 4: X, Números, Operadores (con paren.png) - respuesta correcta a la derecha
      return (
        <>
          {/* Nomenclatura X */}
          <div className="opcion-item">
            <input 
              type="radio" 
              id="opcion-x" 
              name="color-variable" 
              value="x"
              className="opcion-radio"
              onChange={() => manejarSeleccion('x')}
              disabled={validacion.mostrada}
            />
            <label 
              htmlFor="opcion-x" 
              className={`opcion-label ${validacion.mostrada && respuestaSeleccionada === 'x' ? (validacion.esCorrecta ? 'correcta' : 'incorrecta') : ''}`}
            >
              <div className="nomenclatura-section">
                <div className="test-content">
                  <div className="test-item">
                    <img src={require('../assets/img/x.png')} alt="X" className="test-image" />
                  </div>
                  <div className="test-item">
                    <img src={require('../assets/img/x2.png')} alt="X²" className="test-image" />
                  </div>
                </div>
              </div>
            </label>
          </div>
          
          {/* Nomenclatura Numérica */}
          <div className="opcion-item">
            <input 
              type="radio" 
              id="opcion-numeros" 
              name="color-variable" 
              value="numeros"
              className="opcion-radio"
              onChange={() => manejarSeleccion('numeros')}
              disabled={validacion.mostrada}
            />
            <label 
              htmlFor="opcion-numeros" 
              className={`opcion-label ${validacion.mostrada && respuestaSeleccionada === 'numeros' ? (validacion.esCorrecta ? 'correcta' : 'incorrecta') : ''}`}
            >
              <div className="nomenclatura-section">
                <div className="nomenclatura-content">
                  <div className="quipu-grid">
                    {[1, 2, 3].map(numero => (
                      <div key={numero} className="quipu-example">
                        <img 
                          src={require(`../assets/img/${numero}.png`)} 
                          alt={`Nudo ${numero}`} 
                          className="quipu-knot-image"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </label>
          </div>
          
          {/* Nomenclatura Operacional con paréntesis */}
          <div className="opcion-item">
            <input 
              type="radio" 
              id="opcion-operadores" 
              name="color-variable" 
              value="operadores"
              className="opcion-radio"
              onChange={() => manejarSeleccion('operadores')}
              disabled={validacion.mostrada}
            />
            <label 
              htmlFor="opcion-operadores" 
              className={`opcion-label ${validacion.mostrada && respuestaSeleccionada === 'operadores' ? (validacion.esCorrecta ? 'correcta' : 'incorrecta') : ''}`}
            >
              <div className="nomenclatura-section">
                <div className="operational-grid">
                  <div className="operational-item">
                    <img src={require('../assets/img/paren.png')} alt="()" className="operational-image" />
                  </div>
                  <div className="operational-item">
                    <img src={require('../assets/img/paren.png')} alt="()" className="operational-image" />
                  </div>
                  <div className="operational-item">
                    <img src={require('../assets/img/paren.png')} alt="()" className="operational-image" />
                  </div>
                </div>
              </div>
            </label>
          </div>
        </>
      );
    }
  };

  return (
    <div className={`reto-uno-page ${mostrarCorona ? 'blur-background' : ''}`}>
      {/* Solo imagen de fondo */}
      <header className="App-header">
        <div className="header-content">
          <h1 className="main-title">El Quipu Matemático</h1>
          <p className="subtitle">Resuelve el primer desafío usando los colores del Quipu</p>
          
          {datosUsuario && (
            <div className="info-usuario">
              <span className="user-name">Hola, {datosUsuario.nombre}</span>
              <div className="user-details">
                <span className="detail-item">📚 {datosUsuario.curso}</span>
                <span className="detail-item">🌙 {datosUsuario.edad} años</span>
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* App Container */}
      <div className="app-container">
        <div className="pregunta-container">
          <h2 className="pregunta-titulo">
            {preguntaActual === 1 
              ? "Escoja de que color es la variable x o x al cuadrado en el Quipu"
              : preguntaActual === 2
              ? "Escoja con que color se representa a los numeros en el Quipu"
              : preguntaActual === 3
              ? "Escoja con que color se representa a las operaciones (+,-) en el Quipu"
              : "Escoje con que color se representa los paréntesis en el Quipu"
            }
          </h2>
          
          <div className="opciones-container" key={preguntaActual}>
            {renderOpciones()}
          </div>
          
          <button 
            className="btn-enviar" 
            onClick={manejarEnviar}
            disabled={validacion.mostrada || enviando}
            style={{
              opacity: enviando ? 0.6 : 1,
              cursor: enviando ? 'not-allowed' : 'pointer'
            }}
          >
            {enviando ? '⏳ Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>

      {/* Niño Quipu flotante */}
      {quipuActivado && (
        <div className="quipuretouno-container">
          {/* El mensaje aparece automáticamente cuando hay validación */}
          {validacion.mostrada && (
            <div className="quipuretouno-mensaje">
              <div className="mensaje-bubble">
                <p>
                  {validacion.mensajeError
                    ? validacion.mensajeError
                    : preguntaActual === 4 && validacion.mostrada && validacion.mensaje
                    ? validacion.mensaje
                    : validacion.esCorrecta 
                    ? "¡Sí, lo logramos, vamos a la siguiente!" 
                    : "¡No, nos equivocamos!"
                  }
                </p>
                <div className="bubble-arrow"></div>
              </div>
            </div>
          )}
          
          <div className="quipuretouno-personaje" onClick={handleQuipuClick}>
            <img 
              src={require(`../assets/img/${coronaPresionada ? 'niñoestudio.png' : preguntaActual === 4 && validacion.mostrada && validacion.mensaje && validacion.mensaje.includes('Espera') ? 'niñopensando2.png' : preguntaActual === 4 && validacion.mostrada && esVictoria ? 'niñofeliz.png' : preguntaActual === 4 && validacion.mostrada && !esVictoria ? 'niñoasombrado.png' : validacion.mensajeError ? 'niñocautela.png' : validacion.esCorrecta ? 'niñofeliz.png' : 'niñoasombrado.png'}`)} 
              alt="Quipu" 
              className="quipuretouno-img"
            />
            <div className="quipuretouno-texto">
              {preguntaActual === 4 && validacion.mostrada
                ? "Continuar"
                : "Presióname"
              }
            </div>
          </div>
        </div>
      )}

      {/* Corona y pergamino que aparecen en el centro */}
      {mostrarCorona && (
        <div className="corona-container">
          <img 
            src={require('../assets/img/pergaminoizquierda.png')} 
            alt="Pergamino" 
            className="pergamino-img"
          />
          <img 
            src={require('../assets/img/corona.png')} 
            alt="Corona" 
            className="corona-img clickeable"
            onClick={handleCoronaClick}
          />
        </div>
      )}

      {/* Texto de instrucción cuando aparece la corona */}
      {mostrarCorona && (
        <div className="instruccion-corona">
          <p>Presiona la corona</p>
        </div>
      )}

      {/* Modal de Review */}
      {mostrarReviewModal && (
        <ReviewReto1Modal 
          respuestas={respuestasGuardadas}
          onContinuar={handleContinuarReview}
        />
      )}
    </div>
  );
};

export default RetoUno;