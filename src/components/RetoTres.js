import React, { useState } from 'react';
import './RetoTres.css';

const RetoTres = ({ onContinuar, onVolverCentroControl }) => {
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [codigoValidado, setCodigoValidado] = useState(false);
  const [mostrarQuipu, setMostrarQuipu] = useState(false);
  const [mostrarQuipuCorrecto, setMostrarQuipuCorrecto] = useState(false);
  const [paginaDesactivada, setPaginaDesactivada] = useState(false);

  const handleClaveChange = (e) => {
    const valor = e.target.value.toUpperCase();
    setClave(valor);
    setError('');
    // Resetear validación si el usuario cambia el código
    if (codigoValidado) {
      setCodigoValidado(false);
    }
    // Ocultar quipus si se está escribiendo
    if (mostrarQuipu) {
      setMostrarQuipu(false);
    }
    if (mostrarQuipuCorrecto) {
      setMostrarQuipuCorrecto(false);
    }
  };

  const handleEnviar = () => {
    if (clave === 'ASPA') {
      setMostrarQuipuCorrecto(true);
      setError('');
      setMostrarQuipu(false);
      setPaginaDesactivada(true);
      setCodigoValidado(false);
    } else {
      setError('Código incorrecto. Intenta nuevamente.');
      setCodigoValidado(false);
      setMostrarQuipu(true);
      setMostrarQuipuCorrecto(false);
      setPaginaDesactivada(true);
    }
  };

  const handleContinuar = () => {
    if (codigoValidado) {
      onContinuar();
    }
  };

  const handleQuipuClick = () => {
    setMostrarQuipu(false);
    setError('');
    setPaginaDesactivada(false);
  };

  const handleQuipuCorrectoClick = () => {
    setMostrarQuipuCorrecto(false);
    setCodigoValidado(true);
    setPaginaDesactivada(false);
  };

  return (
    <div className={`reto-tres-page ${paginaDesactivada ? 'pagina-desactivada' : ''}`}>
      <div className="contenido-reto-tres">
        <div className="titulo-principal">
          <h1>Desafío 3: Factorización de Ecuaciones Cuadráticas</h1>
        </div>
        
        <div className="descripcion">
          <p>¡Escribe el código para continuar con el reto!</p>
          
          <div className="campo-clave">
            <label htmlFor="clave" className="etiqueta-clave">
              🏛️ Ingresa el código:
            </label>
            <input
              type="text"
              id="clave"
              value={clave}
              onChange={handleClaveChange}
              placeholder="Escribe aquí el código..."
              className={`input-clave ${error ? 'input-error' : ''}`}
              maxLength="10"
              autoComplete="off"
            />
            {error && (
              <span className="mensaje-error">{error}</span>
            )}
            
            <button 
              className="reto-tres-btn-enviar"
              onClick={handleEnviar}
              disabled={!clave.trim()}
            >
              <span className="btn-texto">Enviar</span>
              <span className="btn-icono">⚡</span>
            </button>
          </div>
        </div>
      </div>

      <button 
        className={`btn-continuar ${!codigoValidado ? 'deshabilitado' : ''}`}
        onClick={handleContinuar}
        disabled={!codigoValidado}
      >
        <span className="btn-texto">Continuar</span>
        <span className="btn-icono">→</span>
      </button>

      <button 
        className="btn-volver-flotante"
        onClick={() => onVolverCentroControl && onVolverCentroControl()}
      >
        <span className="btn-texto">Volver</span>
        <span className="btn-icono">←</span>
      </button>

      {/* Quipu para código incorrecto */}
      {mostrarQuipu && (
        <div className="quipureto3-container">
          <div className="quipureto3-mensaje">
            <div className="mensaje-bubble">
              <p>¡No, no es correcto! Recuerda las palabras de los pergaminos de los retos anteriores.</p>
              <div className="bubble-arrow"></div>
            </div>
          </div>
          
          <div className="quipureto3-personaje" onClick={handleQuipuClick}>
            <img 
              src={require('../assets/img/niñoestudio.png')} 
              alt="Quipu" 
              className="quipureto3-img"
            />
            <div className="quipureto3-texto">Presióname</div>
          </div>
        </div>
      )}

      {/* Quipu para código correcto */}
      {mostrarQuipuCorrecto && (
        <div className="quipureto3-container">
          <div className="quipureto3-mensaje">
            <div className="mensaje-bubble">
              <p>¡Muy bien, ahora vamos a completar este último reto y salgamos de aquí!</p>
              <div className="bubble-arrow"></div>
            </div>
          </div>
          
          <div className="quipureto3-personaje" onClick={handleQuipuCorrectoClick}>
            <img 
              src={require('../assets/img/niñoorgulloso.png')} 
              alt="Quipu" 
              className="quipureto3-img"
            />
            <div className="quipureto3-texto">¡Genial!</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetoTres;
