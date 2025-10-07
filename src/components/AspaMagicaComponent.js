import React, { useState } from 'react';
import './AspaMagicaComponent.css';

const AspaMagicaComponent = ({ onContinuar }) => {
  // Estados para el quipu
  const [quipuActivado, setQuipuActivado] = useState(false);
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [botonHabilitado, setBotonHabilitado] = useState(false);

  const handleQuipuClick = () => {
    setMostrarMensaje(!mostrarMensaje);
    
    // Si es la primera vez que se hace clic, activar el quipu y habilitar el botón
    if (!quipuActivado) {
      setQuipuActivado(true);
      setBotonHabilitado(true);
    }
  };

  return (
    <div className="aspa-magica-page">
      <div className="contenido-aspa-magica">
        <div className="titulo-principal">
          <h1>Desafío 2:<br/>El Secreto del Aspa Mágica</h1>
        </div>
        
        <div className="descripcion">
          <p>¡Han honrado a los ancestros, exploradores! Ahora, el camino se adentra en un secreto más profundo: el método del Aspa. Nuestros sabios lo usaban para desentrañar complejos patrones, como hoy factorizan los trinomios ax²+bx+c.</p>
          
          <p>Imaginen cada trinomio como un enigma. El aspa es su herramienta para encontrar los 'hilos gemelos' que, al unirse, revelan la verdad oculta. Su misión es clara: apliquen el aspa para descifrar el trinomio que les aguarda. Cada factor que descubran será una pieza crucial de la clave que abre el siguiente misterio. ¡Que la agudeza andina los guíe!</p>
        </div>
      </div>

      <button 
        className={`btn-continuar ${!botonHabilitado ? 'deshabilitado' : ''}`}
        onClick={onContinuar}
        disabled={!botonHabilitado}
      >
        <span className="btn-texto">Continuar</span>
        <span className="btn-icono">→</span>
      </button>

      {/* Quipu flotante */}
      <div className="quipuaspamagica-container">
        <div className="quipuaspamagica-mensaje" style={{ display: mostrarMensaje ? 'block' : 'none' }}>
          <div className="mensaje-bubble">
            <p>¡Vamos, hagámoslo! Nos irá mejor que en el anterior.</p>
            <div className="bubble-arrow"></div>
          </div>
        </div>
        
        <div className="quipuaspamagica-personaje" onClick={handleQuipuClick}>
          <img 
            src={require('../assets/img/niñoorgulloso.png')} 
            alt="Quipu" 
            className="quipuaspamagica-img"
          />
          <div className="quipuaspamagica-texto">Presióname</div>
        </div>
      </div>
    </div>
  );
};

export default AspaMagicaComponent;
