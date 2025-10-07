import React, { useState, useEffect } from 'react';
import './QuipoIndicaciones.css';

const QuipoIndicaciones = ({ onQuipoComplete }) => {
  const [mostrarMensaje, setMostrarMensaje] = useState(true); // Mostrar mensaje desde el inicio
  const [quipoActivado, setQuipoActivado] = useState(true); // Quipu activado desde el inicio
  const [mensajeActual, setMensajeActual] = useState(0);

  // Un solo mensaje con énfasis
  const mensajes = [
    "¡Deberíamos completar los retos en orden!"
  ];

  const handleQuipoClick = () => {
    // Con un solo mensaje, al hacer clic, se completa
    onQuipoComplete(); // Notificar al padre que el quipu ha terminado
    setMostrarMensaje(false); // Ocultar el mensaje
    setMensajeActual(0); // Resetear el índice del mensaje
  };

  return (
    <div className="quipo-indicaciones-container">
      {/* Mensaje del quipu */}
      {mostrarMensaje && (
        <div className="quipo-indicaciones-mensaje">
          <div className="mensaje-burbuja">
            <p>{mensajes[mensajeActual]}</p>
            {/* No hay indicador de "Haz clic para continuar..." si solo hay un mensaje */}
          </div>
        </div>
      )}

      {/* Personaje Quipu */}
      <div className="quipo-indicaciones-personaje" onClick={handleQuipoClick}>
        <img 
          src={require('../assets/img/niñopensando.png')} 
          alt="Niño pensando" 
          className="quipo-indicaciones-img"
        />
      </div>
    </div>
  );
};

export default QuipoIndicaciones;