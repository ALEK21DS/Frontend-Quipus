import React, { useState, useEffect } from 'react';
import './QuipuCentroControl.css';

const QuipuCentroControl = ({ onQuipuComplete, onToggleBlur }) => {
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [quipuActivado, setQuipuActivado] = useState(false);
  const [mensajeActual, setMensajeActual] = useState(0);

  const mensajes = [
    "¡Increíble! Has dominado todos los retos matemáticos.",
    "Ahora conoces los secretos de la factorización.",
    "Y dominas el arte de los nudos sagrados.",
    "Es hora de usar el código para salir."
  ];

  // Activar blur cuando aparece el primer mensaje
  useEffect(() => {
    if (mensajeActual === 0 && mostrarMensaje) {
      onToggleBlur(true);
    }
  }, [mensajeActual, mostrarMensaje, onToggleBlur]);

  const handleQuipuClick = () => {
    if (!quipuActivado) {
      setQuipuActivado(true);
      setMostrarMensaje(true);
      setMensajeActual(0);
    } else {
      // Avanzar al siguiente mensaje
      if (mensajeActual < mensajes.length - 1) {
        setMensajeActual(mensajeActual + 1);
      } else {
        // Todos los mensajes mostrados, ocultar quipu y notificar al padre
        onToggleBlur(false); // Desactivar blur
        onQuipuComplete(); // Notificar al padre
        setMostrarMensaje(false);
        setMensajeActual(0);
      }
    }
  };

  return (
    <div className="quipucentro-container">
      {/* Mensaje del quipu */}
      {mostrarMensaje && (
        <div className="quipucentro-mensaje">
          <div className="mensaje-burbuja">
            <p>{mensajes[mensajeActual]}</p>
            {mensajeActual < mensajes.length - 1 && (
              <p className="mensaje-indicador">Haz clic para continuar...</p>
            )}
          </div>
        </div>
      )}

      {/* Personaje Quipu */}
      <div className="quipucentro-personaje" onClick={handleQuipuClick}>
        <img 
          src={require('../assets/img/niñofeliz.png')} 
          alt="Niño sabio" 
          className="quipucentro-img"
        />
      </div>
    </div>
  );
};

export default QuipuCentroControl;
