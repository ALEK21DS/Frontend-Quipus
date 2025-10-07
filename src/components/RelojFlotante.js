import React, { useState, useEffect } from 'react';
import './RelojFlotante.css';

const RelojFlotante = ({ tiempoInicial = 30, onTiempoAgotado }) => {
  const [tiempoRestante, setTiempoRestante] = useState(tiempoInicial); // Usar segundos directamente

  useEffect(() => {
    let intervalId;

    // Iniciar automáticamente el conteo
    intervalId = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          if (onTiempoAgotado) {
            onTiempoAgotado();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [onTiempoAgotado]);

  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
  };

  const getColorTiempo = () => {
    if (tiempoRestante <= 300) return '#ff4444'; // Rojo cuando quedan 5 minutos o menos
    if (tiempoRestante <= 600) return '#ffaa00'; // Naranja cuando quedan 10 minutos o menos
    return '#FFD700'; // Dorado cuando hay tiempo suficiente (color del juego)
  };

  return (
    <div className="reloj-flotante">
      <div className="reloj-contenido">
        <div className="reloj-tiempo" style={{ color: getColorTiempo() }}>
          {formatearTiempo(tiempoRestante)}
        </div>
      </div>
    </div>
  );
};

export default RelojFlotante;
