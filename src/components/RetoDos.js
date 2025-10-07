import React, { useState, useRef, useEffect } from 'react';
import './RetoDos.css';
import apiService from '../services/api';

const RetoDos = ({ datosUsuario, onVolverCentroControl, sesionJuego }) => {
  const [blanks, setBlanks] = useState({
    'blank-1': null,
    'blank-2': null,
    'blank-3': null,
    'blank-4': null,
  });

  const [options, setOptions] = useState([
    { id: 'opt-1', text: 'factores' },
    { id: 'opt-2', text: 'ax²+bx+c' },
    { id: 'opt-3', text: 'descomponer' },
    { id: 'opt-4', text: 'factorizacion' },
  ]);

  // Generador simple de IDs únicos para reinsertar opciones sin colisiones
  const idCounterRef = useRef(5);
  const makeOptionId = () => `opt-${idCounterRef.current++}-${Math.random().toString(36).slice(2,6)}`;

  // Estados para el quipu
  const [quipuActivado, setQuipuActivado] = useState(false);
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [quipuImagen, setQuipuImagen] = useState('niñoasombrado.png');
  const [quipuMensaje, setQuipuMensaje] = useState('');
  const [paginaDesactivada, setPaginaDesactivada] = useState(false);
  const [enviando, setEnviando] = useState(false);  // Estado de carga
  const [tiempoInicio, setTiempoInicio] = useState(Date.now());  // Para rastrear tiempo de respuesta
  
  // Inicializar tiempo cuando se monta el componente
  useEffect(() => {
    setTiempoInicio(Date.now());
  }, []);
  
  // Estados para la corona y pergamino del Reto 2
  const [mostrarCoronaReto2, setMostrarCoronaReto2] = useState(false);
  const [coronaPresionadaReto2, setCoronaPresionadaReto2] = useState(false);
  const [coronaDesaparecidaReto2, setCoronaDesaparecidaReto2] = useState(false);

  const handleDragStart = (e, optionId) => {
    if (paginaDesactivada) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('optionId', optionId);
  };

  const handleDragOver = (e) => {
    if (paginaDesactivada) {
      e.preventDefault();
      return;
    }
    e.preventDefault(); // Permite soltar
  };

  const handleDrop = (e, blankId) => {
    if (paginaDesactivada) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    const optionId = e.dataTransfer.getData('optionId');
    const draggedOption = options.find(opt => opt.id === optionId);

    if (draggedOption && !Object.values(blanks).includes(draggedOption.text)) {
      setBlanks(prevBlanks => {
        // Si ya hay una opción en este blank, la devolvemos a las opciones
        const oldOptionText = prevBlanks[blankId];
        if (oldOptionText) {
          setOptions(prevOptions => {
            const yaExiste = prevOptions.some(opt => opt.text === oldOptionText);
            if (yaExiste) return prevOptions; // evitar duplicados por texto
            return [...prevOptions, { id: makeOptionId(), text: oldOptionText }];
          });
        }
        return {
          ...prevBlanks,
          [blankId]: draggedOption.text,
        };
      });
      setOptions(prevOptions => prevOptions.filter(opt => opt.id !== optionId));
    }
  };

  const handleRemoveOption = (blankId) => {
    if (paginaDesactivada) return;
    const optionText = blanks[blankId];
    if (optionText) {
      setOptions(prevOptions => {
        const yaExiste = prevOptions.some(opt => opt.text === optionText);
        if (yaExiste) return prevOptions; // evitar duplicados por texto
        return [...prevOptions, { id: makeOptionId(), text: optionText }];
      });
      setBlanks(prevBlanks => ({ ...prevBlanks, [blankId]: null }));
    }
  };

  const handleEnviar = async () => {
    // Evitar envíos múltiples
    if (enviando) {
      return;
    }

    // Verificar si todos los campos están llenos
    const todosLlenos = Object.values(blanks).every(valor => valor !== null && valor !== '');
    
    if (!todosLlenos) {
      // Campos no llenos - desactivar página
      setQuipuImagen('niñoenojado.png');
      setQuipuMensaje('¡Se necesita llenar el texto!');
      setQuipuActivado(true);
      setMostrarMensaje(true);
      setPaginaDesactivada(true);
      return;
    }

    // Activar estado de carga
    setEnviando(true);

    const respuestasCorrectas = {
      'blank-1': 'factorizacion',
      'blank-2': 'descomponer',
      'blank-3': 'ax²+bx+c',
      'blank-4': 'factores'
    };

    // Contar cuántas respuestas son correctas
    let correctas = 0;
    Object.keys(respuestasCorrectas).forEach(key => {
      if (blanks[key] === respuestasCorrectas[key]) {
        correctas++;
      }
    });

    const todasCorrectas = correctas === 4;

    // Guardar respuesta en el backend
    if (sesionJuego) {
      try {
        // Convertir las respuestas a un string JSON para guardar en el backend
        const respuestaUsuario = JSON.stringify(blanks);
        const respuestaCorrectaString = JSON.stringify(respuestasCorrectas);
        
        // Calcular tiempo real de respuesta en segundos
        const tiempoReal = tiempoInicio ? Math.round((Date.now() - tiempoInicio) / 1000) : 10;
        
        await apiService.guardarRespuestaReto2({
          sesionId: sesionJuego.id,
          respuestaCorrecta: respuestaCorrectaString,
          respuestaUsuario: respuestaUsuario,
          casillasCorrectas: correctas,
          totalCasillas: 4,
          tiempoRespuesta: tiempoReal
        });
        console.log(`✅ Reto 2 guardado: ${correctas}/4 casillas correctas`);
      } catch (error) {
        console.error('❌ Error al guardar respuesta del Reto 2:', error);
      }
    }

    // Desactivar estado de carga
    setEnviando(false);

    if (todasCorrectas) {
      // Respuesta correcta - desactivar página
      setQuipuImagen('niñofeliz.png');
      setQuipuMensaje('¡Sí, lo logramos y mira!');
      setQuipuActivado(true);
      setMostrarMensaje(true);
      setPaginaDesactivada(true);
    } else {
      // Respuesta incorrecta - desactivar página
      setQuipuImagen('niñoasombrado.png');
      setQuipuMensaje('¡Oh no! Algo está mal, corrígelo.');
      setQuipuActivado(true);
      setMostrarMensaje(true);
      setPaginaDesactivada(true);
    }
  };

  const handleQuipuClick = () => {
    setMostrarMensaje(!mostrarMensaje);
    
    // Si es el mensaje de "Se necesita llenar el texto", reactivar la página al hacer clic
    if (quipuMensaje === '¡Se necesita llenar el texto!' && mostrarMensaje) {
      setQuipuActivado(false);
      setPaginaDesactivada(false);
    }
    
    // Si es el mensaje de respuesta incorrecta, reactivar y reiniciar las palabras
    if (quipuMensaje === '¡Oh no! Algo está mal, corrígelo.' && mostrarMensaje) {
      // Reiniciar todas las palabras a sus opciones originales
      setBlanks({
        'blank-1': null,
        'blank-2': null,
        'blank-3': null,
        'blank-4': null,
      });
      
      setOptions([
        { id: 'opt-1', text: 'factores' },
        { id: 'opt-2', text: 'ax²+bx+c' },
        { id: 'opt-3', text: 'descomponer' },
        { id: 'opt-4', text: 'factorizacion' },
      ]);
      
      setQuipuActivado(false);
      setPaginaDesactivada(false);
    }
    
    // Si es el mensaje de respuesta correcta, mostrar corona y pergamino
    if (quipuMensaje === '¡Sí, lo logramos y mira!' && mostrarMensaje) {
      setMostrarCoronaReto2(true);
      setTimeout(() => {
        setCoronaPresionadaReto2(true);
      }, 500);
    }
    
    // Si es el mensaje final con "PA", volver al centro de control
    if (coronaDesaparecidaReto2 && coronaPresionadaReto2 && mostrarMensaje) {
      // Volver al centro de control marcando el reto 2 como completado
      if (onVolverCentroControl) {
        onVolverCentroControl(2); // Pasar el ID del reto 2
      }
    }
  };

  const handleCoronaClickReto2 = () => {
    setCoronaDesaparecidaReto2(true);
    setCoronaPresionadaReto2(true);
    setMostrarCoronaReto2(false);
    
    // Cambiar inmediatamente el quipu al mensaje final
    setQuipuImagen('niñoestudio.png');
    setQuipuMensaje('¡Genial! Conseguimos otra corona, pero en este pedazo dice: PA');
    setMostrarMensaje(true);
  };

  return (
    <div className={`reto-dos-page ${paginaDesactivada ? 'desactivada' : ''} ${mostrarCoronaReto2 ? 'blur-background' : ''}`}>
      {/* Header con información del usuario */}
      <header className="reto-dos-header">
        <div className="header-content">
          <h1 className="main-title">El Aspa Mágica</h1>
          <p className="subtitle">Descubre los secretos del aspa matemático</p>
          
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
      
      {/* Contenido principal */}
      <div className="reto-dos-container">
        <div className="reto-dos-contenido-principal">
          <div className="reto-dos-ejercicio-drag-drop">
            <p className="reto-dos-texto-ejercicio">
              "Exploradores, han mostrado ingenio. Ahora, el saber que buscan se encuentra en este antiguo pergamino, donde se esconde la clave de la{' '}
              <span
                id="blank-1"
                className="reto-dos-drag-blank"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'blank-1')}
                onClick={() => handleRemoveOption('blank-1')}
              >
                {blanks['blank-1'] || ''}
              </span>
              . Para nuestros sabios, el método del Aspa era la herramienta para{' '}
              <span
                id="blank-2"
                className="reto-dos-drag-blank"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'blank-2')}
                onClick={() => handleRemoveOption('blank-2')}
              >
                {blanks['blank-2'] || ''}
              </span>{' '}
              una expresión compleja, como un trinomio de la forma{' '}
              <span
                id="blank-3"
                className="reto-dos-drag-blank"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'blank-3')}
                onClick={() => handleRemoveOption('blank-3')}
              >
                {blanks['blank-3'] || ''}
              </span>{' '}
              y así revelar sus dos{' '}
              <span
                id="blank-4"
                className="reto-dos-drag-blank"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'blank-4')}
                onClick={() => handleRemoveOption('blank-4')}
              >
                {blanks['blank-4'] || ''}
              </span>{' '}
              ocultos.""
            </p>
            
            <div className="reto-dos-opciones-container">
              {options.map(option => (
                <div
                  key={option.id}
                  id={option.id}
                  className="reto-dos-drag-option"
                  draggable
                  onDragStart={(e) => handleDragStart(e, option.id)}
                >
                  {option.text}
                </div>
              ))}
            </div>
            
            <div className="reto-dos-boton-enviar-container">
              <button 
                className="reto-dos-btn-enviar" 
                onClick={handleEnviar}
                disabled={enviando}
                style={{
                  opacity: enviando ? 0.6 : 1,
                  cursor: enviando ? 'not-allowed' : 'pointer'
                }}
              >
                {enviando ? '⏳ Enviando...' : 'Enviar Respuestas'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quipu flotante */}
      {quipuActivado && (
        <div className="quipuretodos-container">
          <div className="quipuretodos-mensaje" style={{ display: mostrarMensaje ? 'block' : 'none' }}>
            <div className="mensaje-bubble">
              <p>
                {coronaDesaparecidaReto2 ? (
                  <>
                    ¡Genial! Conseguimos otra corona, pero en este pedazo dice:
                    <br />
                    <strong className="mensaje-pa">PA</strong>
                  </>
                ) : (
                  quipuMensaje
                )}
              </p>
              <div className="bubble-arrow"></div>
            </div>
          </div>
          
          <div className="quipuretodos-personaje" onClick={handleQuipuClick}>
            <img 
              src={require(`../assets/img/${coronaDesaparecidaReto2 ? 'niñoestudio.png' : quipuImagen}`)} 
              alt="Quipu" 
              className="quipuretodos-img"
            />
            <div className="quipuretodos-texto">
              {coronaPresionadaReto2 ? 'Finalizar' : 'Presióname'}
            </div>
          </div>
        </div>
      )}

      {/* Corona y pergamino del Reto 2 */}
      {mostrarCoronaReto2 && (
        <div className="corona-container-reto2">
          <img
            src={require('../assets/img/corona.png')}
            alt="Corona"
            className="corona-img-reto2 clickeable-reto2"
            onClick={handleCoronaClickReto2}
          />
          <img
            src={require('../assets/img/pergaminoderecha.png')}
            alt="Pergamino"
            className="pergamino-img-reto2"
          />
        </div>
      )}

      {/* Instrucción para presionar la corona del Reto 2 */}
      {mostrarCoronaReto2 && (
        <div className="instruccion-corona-reto2">
          <p>Presiona la corona</p>
        </div>
      )}
    </div>
  );
};

export default RetoDos;
