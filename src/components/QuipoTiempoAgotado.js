import React, { useState } from 'react';
import './QuipoTiempoAgotado.css';

const QuipoTiempoAgotado = ({ onVolverInicio }) => {
  const [mostrarMensaje, setMostrarMensaje] = useState(true);
  const [quipoActivado, setQuipoActivado] = useState(true);
  const [mensajeActual, setMensajeActual] = useState(0);
  const [mostrarPerdido, setMostrarPerdido] = useState(false);

  const mensajes = [
    "¡Oh no, se nos acabó el tiempo, nos quedamos encerrados!"
  ];

  const handleQuipoClick = () => {
    // Ocultar el quipo y mostrar el mensaje de "perdido"
    setMostrarMensaje(false);
    setQuipoActivado(false);
    setMostrarPerdido(true);
  };

  const handleVolverInicio = () => {
    onVolverInicio(); // Volver al inicio con recarga
  };

  return (
    <div className="quipo-tiempo-agotado-container">
      <div className="quipo-tiempo-agotado-content">
        {/* Mensaje del quipo */}
        {mostrarMensaje && (
          <div className="quipo-tiempo-agotado-mensaje">
            <div className="mensaje-burbuja">
              <p>{mensajes[mensajeActual]}</p>
            </div>
          </div>
        )}

        {/* Personaje Quipo */}
        {quipoActivado && (
          <div className="quipo-tiempo-agotado-personaje" onClick={handleQuipoClick}>
            <img 
              src={require('../assets/img/niñoasombrado.png')} 
              alt="Niño asombrado" 
              className="quipo-tiempo-agotado-img"
            />
            <div className="quipo-tiempo-agotado-texto">
              <p>Presióname</p>
            </div>
          </div>
        )}

        {/* Mensaje de "Has perdido" */}
        {mostrarPerdido && (
          <div className="mensaje-perdido">
            <h1>¡Has perdido!!</h1>
          </div>
        )}

        {/* Botón Volver al Inicio */}
        {mostrarPerdido && (
          <button className="btn-volver-inicio" onClick={handleVolverInicio}>
            <span className="btn-texto">Volver al inicio</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuipoTiempoAgotado;

