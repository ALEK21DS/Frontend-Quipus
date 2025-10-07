import React, { useState, useEffect } from 'react';
import './PuntuacionesComponent.css';
import QuipuPuntuaciones from './QuipuPuntuaciones';
import apiService from '../services/api';

const PuntuacionesComponent = ({ onVolverInicio, onVerNotas, juegoCompletado, datosUsuario, quipuYaMostrado, setQuipuYaMostrado }) => {
  // Estados para controlar el quipu y el blur
  const [mostrarQuipuPuntuaciones, setMostrarQuipuPuntuaciones] = useState(false);
  const [aplicarBlur, setAplicarBlur] = useState(false);
  
  // Estados para las puntuaciones
  const [puntuaciones, setPuntuaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Verificar si el usuario es admin
  const esAdmin = datosUsuario && datosUsuario.esAdmin;

  // Cargar puntuaciones desde la base de datos
  useEffect(() => {
    const cargarPuntuaciones = async () => {
      try {
        setCargando(true);
        const response = await apiService.obtenerTablaPuntuaciones(10, 0);
        
        if (response.success && response.data) {
          setPuntuaciones(response.data);
        }
      } catch (err) {
        console.error('Error al cargar puntuaciones:', err);
        setError('No se pudieron cargar las puntuaciones');
        setPuntuaciones([]);
      } finally {
        setCargando(false);
      }
    };

    cargarPuntuaciones();
  }, []);

  // Mostrar el quipu solo si el juego fue completado Y no se ha mostrado antes
  useEffect(() => {
    if (juegoCompletado && !quipuYaMostrado) {
      setMostrarQuipuPuntuaciones(true);
      handleToggleBlur(true); // Activar el blur inmediatamente
      setQuipuYaMostrado(true); // Marcar que ya se mostró
    }
  }, [juegoCompletado, quipuYaMostrado]);

  // Función que se llama cuando el quipu termina
  const handleQuipuComplete = () => {
    setMostrarQuipuPuntuaciones(false);
    setAplicarBlur(false);
  };

  // Función para activar/desactivar el blur
  const handleToggleBlur = (activar) => {
    setAplicarBlur(activar);
  };

  return (
    <>
      <div className={`puntuaciones-page ${aplicarBlur ? 'blur-activo' : ''}`}>
      
      {/* Botón de notas - Solo visible para admin */}
      {esAdmin && (
        <button 
          className="btn-ver-notas-fixed admin-button"
          onClick={() => onVerNotas(true)}
        >
          👑 Ver Notas (Admin)
        </button>
      )}
      
      <div className="puntuaciones-container">
        <h1 className="puntuaciones-titulo">🏆 Tabla de Puntuaciones</h1>
        
        {/* Mensaje especial para admin */}
        {esAdmin && (
          <div className="admin-message">
            <p>👑 <strong>Modo Administrador</strong> - Tienes acceso completo a las notas de los estudiantes</p>
          </div>
        )}
        
        {/* Mostrar estado de carga o error */}
        {cargando && (
          <div className="mensaje-estado">
            <p>⏳ Cargando puntuaciones...</p>
          </div>
        )}
        
        {error && (
          <div className="mensaje-error">
            <p>❌ {error}</p>
          </div>
        )}
        
        {/* Tabla de puntuaciones */}
        {!cargando && !error && (
        <div className="tabla-puntuaciones">
          <table className="tabla-puntuaciones-table">
            <thead>
              <tr>
                <th>Posición</th>
                <th>Jugador</th>
                <th>Puntuación</th>
              </tr>
            </thead>
            <tbody>
              {puntuaciones.length > 0 ? (
                puntuaciones.map((puntuacion, index) => (
                  <tr key={puntuacion.id || index}>
                    <td>{index + 1}</td>
                    <td>{puntuacion.usuario ? `${puntuacion.usuario.nombre} ${puntuacion.usuario.apellido}` : '-'}</td>
                    <td>{puntuacion.puntuacionTotal || 0}</td>
                  </tr>
                ))
              ) : (
                [...Array(10)].map((_, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
      
      {/* Botón flotante fuera del contenedor */}
      <button 
        className="btn-volver-inicio-fixed"
        onClick={onVolverInicio}
      >
        Volver al Inicio
      </button>
      </div>
      
      {/* Quipu Puntuaciones - aparece automáticamente al cargar la página */}
      {mostrarQuipuPuntuaciones && (
        <QuipuPuntuaciones 
          onQuipuComplete={handleQuipuComplete}
          onToggleBlur={handleToggleBlur}
        />
      )}
    </>
  );
};

export default PuntuacionesComponent;
