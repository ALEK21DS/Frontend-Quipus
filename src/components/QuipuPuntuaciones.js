import React, { useState, useEffect } from 'react';
import './QuipuPuntuaciones.css';

const QuipuPuntuaciones = ({ onQuipuComplete, onToggleBlur }) => {
  const [mostrarMensaje, setMostrarMensaje] = useState(true); // Mostrar mensaje desde el inicio
  const [quipuActivado, setQuipuActivado] = useState(true); // Quipu activado desde el inicio
  const [mensajeActual, setMensajeActual] = useState(0);

  const mensajes = [
    "¡Excelente trabajo completando los desafíos!",
    "Has demostrado gran habilidad matemática.",
    "Tu nombre quedará registrado en la historia.",
    "¡Sigue así, gran matemático!"
  ];

  // El blur inicial ahora se maneja en PuntuacionesComponent, no es necesario aquí

  const handleQuipuClick = () => {
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
  };

  return (
    <div className="quipu-puntuaciones-container">
      {/* Mensaje del quipu */}
      {mostrarMensaje && (
        <div className="quipu-puntuaciones-mensaje">
          <div className="mensaje-burbuja">
            <p>{mensajes[mensajeActual]}</p>
            {mensajeActual < mensajes.length - 1 && (
              <p className="mensaje-indicador">Haz clic para continuar...</p>
            )}
          </div>
        </div>
      )}

      {/* Personaje Quipu */}
      <div className="quipu-puntuaciones-personaje" onClick={handleQuipuClick}>
        <img 
          src={require('../assets/img/niñofeliz.png')} 
          alt="Niño sabio" 
          className="quipu-puntuaciones-img"
        />
      </div>
    </div>
  );
};

export default QuipuPuntuaciones;
