import React, { useState, useEffect } from 'react';
import './PaginaCentroControl.css';
import QuipuCentroControl from './QuipuCentroControl';
import QuipoIndicaciones from './QuipoIndicaciones';

const PaginaCentroControl = ({ onSeleccionarReto, retosCompletados = [], onSalirRuinas }) => {
  const [mostrarModalCodigo, setMostrarModalCodigo] = useState(false);
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [enviandoCodigo, setEnviandoCodigo] = useState(false);
  
  // Estados para controlar el quipu y el botón
  const [mostrarQuipuFinal, setMostrarQuipuFinal] = useState(false);
  const [mostrarBotonSalirFinal, setMostrarBotonSalirFinal] = useState(false);
  const [aplicarBlur, setAplicarBlur] = useState(false);
  
  // Estados para controlar el quipo de indicaciones
  const [mostrarQuipoIndicaciones, setMostrarQuipoIndicaciones] = useState(false);
  const [bloquearInteraccion, setBloquearInteraccion] = useState(false);

  // Controlar cuándo mostrar el quipu
  useEffect(() => {
    const todosLosRetosCompletados = retosCompletados.includes(1) && retosCompletados.includes(2) && retosCompletados.includes(3);
    if (todosLosRetosCompletados) {
      setMostrarQuipuFinal(true);
      setMostrarBotonSalirFinal(false);
    } else {
      setMostrarQuipuFinal(false);
      setMostrarBotonSalirFinal(false);
    }
  }, [retosCompletados]);

  // Función que se llama cuando el quipu termina
  const handleQuipuComplete = () => {
    setMostrarQuipuFinal(false);
    setMostrarBotonSalirFinal(true);
    setAplicarBlur(false);
  };

  // Función para activar/desactivar el blur
  const handleToggleBlur = (activar) => {
    setAplicarBlur(activar);
  };

  // Función que se llama cuando el quipo de indicaciones termina
  const handleQuipoIndicacionesComplete = () => {
    setMostrarQuipoIndicaciones(false);
    setBloquearInteraccion(false);
  };

  // Función para manejar la selección de retos con validación
  const handleSeleccionarReto = (retoId) => {
    // Si se intenta acceder al Reto 3 sin completar los retos 1 y 2
    if (retoId === 3 && (!retosCompletados.includes(1) || !retosCompletados.includes(2))) {
      setMostrarQuipoIndicaciones(true);
      setBloquearInteraccion(true);
      return;
    }
    
    // Si no hay bloqueo, proceder normalmente
    if (!bloquearInteraccion) {
      onSeleccionarReto(retoId);
    }
  };

  const retos = [
    {
      id: 1,
      titulo: "Reto 1",
      descripcion: "Quipo Enigmático",
      imagen: retosCompletados.includes(1) ? require('../assets/img/corona.png') : require('../assets/img/reto1.png'),
      dificultad: "Fácil",
      completado: retosCompletados.includes(1)
    },
    {
      id: 2,
      titulo: "Reto 2", 
      descripcion: "Aspa Mágica",
      imagen: retosCompletados.includes(2) ? require('../assets/img/corona.png') : require('../assets/img/reto2.1.png'),
      dificultad: "Medio",
      completado: retosCompletados.includes(2)
    },
    {
      id: 3,
      titulo: "Reto 3",
      descripcion: "Factorización Avanzada",
      imagen: retosCompletados.includes(3) ? require('../assets/img/corona.png') : require('../assets/img/reto3.png'),
      dificultad: "Difícil",
      completado: retosCompletados.includes(3)
    }
  ];

  const handleSalirClick = () => {
    setMostrarModalCodigo(true);
    setCodigoIngresado('');
    setMensajeError('');
  };

  const handleEnviarCodigo = () => {
    if (enviandoCodigo) return; // Evitar múltiples envíos
    
    setEnviandoCodigo(true);
    setMensajeError('');
    
    // Simular un pequeño delay para procesar
    setTimeout(() => {
      if (codigoIngresado.toUpperCase() === 'QUIP') {
        setMostrarModalCodigo(false);
        // Navegar al componente de puntuaciones usando la función prop
        if (onSalirRuinas) {
          onSalirRuinas();
        }
      } else {
        setMensajeError('Código incorrecto. Inténtalo de nuevo.');
        setEnviandoCodigo(false);
      }
    }, 500);
  };

  const handleCerrarModal = () => {
    if (enviandoCodigo) return; // No permitir cerrar mientras está enviando
    setMostrarModalCodigo(false);
    setCodigoIngresado('');
    setMensajeError('');
    setEnviandoCodigo(false);
  };

  return (
    <>
      <div className={`pagina-centro-control ${aplicarBlur ? 'blur-activo' : ''}`}>
        <div className="contenido-centro-control">
          <div className="header-centro-control">
            <h1>Centro de Control</h1>
            <p className="subtitulo-centro">Selecciona tu desafío matemático</p>
          </div>
          
          <div className="retos-grid">
            {retos.map((reto) => (
              <div key={reto.id} className={`reto-card ${reto.completado ? 'completado' : ''} ${bloquearInteraccion ? 'bloqueado' : ''}`} onClick={() => !reto.completado && !bloquearInteraccion && handleSeleccionarReto(reto.id)}>
                {/* Badge de clave sobrepuesto a toda la tarjeta para que quede por encima del círculo */}
                {reto.completado && (reto.id === 1 || reto.id === 2) && (
                  <div className={`reto-clave-badge ${reto.id === 1 ? 'clave-as' : 'clave-pa'}`}>
                    {reto.id === 1 ? 'AS' : 'PA'}
                  </div>
                )}
                <div className="reto-imagen">
                  <img src={reto.imagen} alt={reto.titulo} />
                </div>
                <div className="reto-contenido">
                  <h3 className="reto-titulo">{reto.titulo}</h3>
                  <p className="reto-descripcion">{reto.descripcion}</p>
                  <span className={`reto-dificultad dificultad-${reto.dificultad.toLowerCase()}`}>
                    {reto.dificultad}
                  </span>
                </div>
                <div className={`reto-boton ${reto.completado ? 'completado-boton' : ''}`}>
                  {reto.completado ? (
                    <div className="reto-completado-indicador">
                      <span className="completado-texto">✓ Completado</span>
                    </div>
                  ) : (
                    <span className="reto-icono">→</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Botón flotante para salir cuando todos los retos estén completados y el quipu haya terminado */}
        {mostrarBotonSalirFinal && (
          <div className="boton-salir-flotante">
            <button 
              className="btn-salir-ruinas"
              onClick={handleSalirClick}
              title="Salir de las ruinas con el código QUIP"
            >
              Salgamos de aquí
            </button>
          </div>
        )}
        
        {/* Modal para ingresar código */}
        {mostrarModalCodigo && (
          <div className="modal-overlay-codigo">
            <div className="modal-codigo">
              <div className="modal-codigo-header">
                <h2>Ingresa el código para abrir las puertas</h2>
                <button className="btn-cerrar-modal" onClick={handleCerrarModal}>×</button>
              </div>
              <div className="modal-codigo-body">
                <div className="input-codigo-container">
                  <input
                    type="text"
                    value={codigoIngresado}
                    onChange={(e) => setCodigoIngresado(e.target.value)}
                    placeholder="Ingresa el código aquí..."
                    className="input-codigo"
                    maxLength="10"
                    autoFocus
                    autoComplete="off"
                  />
                  {mensajeError && (
                    <p className="mensaje-error">{mensajeError}</p>
                  )}
                </div>
              </div>
              <div className="modal-codigo-footer">
                <button 
                  className="btn-enviar-codigo" 
                  onClick={handleEnviarCodigo}
                  disabled={enviandoCodigo}
                >
                  {enviandoCodigo ? (
                    <>
                      <span className="spinner"></span>
                      Verificando...
                    </>
                  ) : (
                    'Enviar'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Quipu Centro Control - FUERA del contenedor principal para evitar blur */}
      {mostrarQuipuFinal && (
        <QuipuCentroControl 
          onQuipuComplete={handleQuipuComplete}
          onToggleBlur={handleToggleBlur}
        />
      )}
      
      {/* Quipo Indicaciones - DENTRO del contenedor principal como los quipus de los retos */}
      {mostrarQuipoIndicaciones && (
        <QuipoIndicaciones 
          onQuipoComplete={handleQuipoIndicacionesComplete}
        />
      )}
    </>
  );
};

export default PaginaCentroControl;
