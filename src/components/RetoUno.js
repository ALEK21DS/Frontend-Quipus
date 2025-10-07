import React, { useState, useEffect } from 'react';
import './RetoUno.css';
import apiService from '../services/api';

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

    // Guardar respuesta en el backend
    if (sesionJuego && respuestaUsuarioLetra) {
      try {
        // Calcular tiempo real de respuesta en segundos
        const tiempoReal = tiempoInicio ? Math.round((Date.now() - tiempoInicio) / 1000) : 10;
        
        await apiService.guardarRespuestaReto1({
          sesionId: sesionJuego.id,
          preguntaNumero: preguntaActual,
          respuestaCorrecta: respuestaCorrectaLetra,
          respuestaUsuario: respuestaUsuarioLetra,
          tiempoRespuesta: tiempoReal
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
    // Hacer desaparecer la corona y pergamino, mostrar el mensaje final
    setMostrarCorona(false);
    setCoronaPresionada(true);
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

    // Si la respuesta es incorrecta, reiniciar el ejercicio
    if (validacion.mostrada && !validacion.esCorrecta && !validacion.mensajeFinal) {
      setValidacion({
        mostrada: false,
        esCorrecta: null,
        mensajeError: null
      });
      setRespuestaSeleccionada('');
      setQuipuActivado(false);
      return;
    }

    if (preguntaActual < 4) {
      // Avanzar a la siguiente pregunta (el useEffect limpiará el estado)
      setPreguntaActual(preguntaActual + 1);
    } else {
      // Si es la pregunta 4 (última), mostrar mensaje final y regresar al centro de control
      if (mostrarMensaje) {
        if (coronaPresionada) {
          // Si ya se presionó la corona, regresar al centro de control con reto completado
          onVolver(1);
        } else {
          // Mostrar la corona después del mensaje final
          setMostrarCorona(true);
        }
      } else {
        // Mostrar mensaje final
        setMostrarMensaje(true);
        // Cambiar el mensaje después de un breve delay
        setTimeout(() => {
          setValidacion(prev => ({
            ...prev,
            mensajeFinal: true
          }));
        }, 300);
      }
    }
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
                {coronaPresionada ? (
                  <>
                    <p>¡Es una corona! Y viene con un papel. ¡Dice:</p>
                    <p className="mensaje-as">AS</p>
                  </>
                ) : (
                  <p>
                    {validacion.mensajeError
                      ? validacion.mensajeError
                      : preguntaActual === 4 && validacion.esCorrecta && validacion.mensajeFinal
                      ? "¡Espera! ¿Qué es esto? ¡Hay algo que brilla!"
                      : preguntaActual === 4 && validacion.esCorrecta
                      ? "¡Se abrió la puerta, vamos al siguiente reto!"
                      : validacion.esCorrecta 
                      ? "¡Sí, lo logramos, vamos a la siguiente!" 
                      : "¡No, nos equivocamos! Corrígelo"
                    }
                  </p>
                )}
                <div className="bubble-arrow"></div>
              </div>
            </div>
          )}
          
          <div className="quipuretouno-personaje" onClick={handleQuipuClick}>
            <img 
              src={require(`../assets/img/${coronaPresionada ? 'niñoestudio.png' : preguntaActual === 4 && validacion.mostrada && validacion.esCorrecta && validacion.mensajeFinal ? 'niñopensando2.png' : validacion.mensajeError ? 'niñocautela.png' : validacion.esCorrecta ? 'niñofeliz.png' : 'niñoasombrado.png'}`)} 
              alt="Quipu" 
              className="quipuretouno-img"
            />
            <div className="quipuretouno-texto">
              {coronaPresionada
                ? "Finalizar"
                : preguntaActual === 4 && validacion.mostrada && validacion.esCorrecta && validacion.mensajeFinal
                ? "Continuar"
                : preguntaActual === 4 && validacion.mostrada && validacion.esCorrecta
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
    </div>
  );
};

export default RetoUno;