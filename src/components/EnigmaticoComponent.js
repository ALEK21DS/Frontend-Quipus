import React, { useState } from 'react';
import './EnigmaticoComponent.css';

const EnigmaticoComponent = ({ onContinuar }) => {
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [quipuActivado, setQuipuActivado] = useState(false);

  const handleQuipuClick = () => {
    setMostrarMensaje(!mostrarMensaje);
    if (!quipuActivado) {
      setQuipuActivado(true);
    }
  };

  return (
    <div className="enigmatico-page">
      <div className="contenido-enigmatico">
        <div className="titulo-principal">
          <h1>Desafío 1:<br/>El Quipu Enigmático</h1>
        </div>
        
        <div className="descripcion">
          <p>Presten atención:</p>
          
          <p>Las incógnitas, como 'x' o 'x al cuadrado', se representarán con el color rojo.<br/>
          Los números puros, las cantidades, brillarán con el color amarillo.<br/>
          Los operadores, esos símbolos que nos indican si sumamos o restamos, como el 'más' o el 'menos', estarán teñidos de azul.<br/>
          Y finalmente, esos elementos que agrupan y ordenan, los paréntesis, se vestirán de naranja.</p>
        </div>
      </div>

      {/* Niño Quipu flotante */}
      <div className="quipuenigma-container">
        <div className="quipuenigma-mensaje" style={{ display: mostrarMensaje ? 'block' : 'none' }}>
          <div className="mensaje-bubble">
            <p>¡Esa voz dio miedo! ¡Vamos a completar el reto para salir de aquí!</p>
            <div className="bubble-arrow"></div>
          </div>
        </div>
        
        <div className="quipuenigma-personaje" onClick={handleQuipuClick}>
          <img 
            src={require('../assets/img/niñoasombrado.png')} 
            alt="Quipu" 
            className="quipuenigma-img"
          />
          <div className="quipuenigma-texto">Presióname</div>
        </div>
      </div>

      <button 
        className={`btn-continuar ${!quipuActivado ? 'btn-desactivado' : ''}`} 
        onClick={quipuActivado ? onContinuar : undefined}
        disabled={!quipuActivado}
      >
        <span className="btn-texto">Continuar</span>
        <span className="btn-icono">{quipuActivado ? '→' : '⏸'}</span>
      </button>
    </div>
  );
};

export default EnigmaticoComponent;
