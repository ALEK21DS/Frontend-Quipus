import React, { useState } from 'react';
import './PaginaEntrada.css';

const PaginaEntrada = ({ onContinuar, datosUsuario, onVerNotas }) => {
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [quipuActivado, setQuipuActivado] = useState(false);
  
  // Verificar si el usuario es admin
  const esAdmin = datosUsuario && datosUsuario.esAdmin;

  const handleQuipuClick = () => {
    setMostrarMensaje(!mostrarMensaje);
    if (!quipuActivado) {
      setQuipuActivado(true);
    }
  };

  return (
    <div className="pagina-entrada">
      <div className="contenido-entrada">
        <div className="titulo-principal">
          <h1>Los Nudos del Saber:<br/>Aventura Matemática</h1>
        </div>
        
        <div className="descripcion">
          <p>En lo alto de los Andes, los sabios amautas del Imperio Incaico escondieron su conocimiento más valioso dentro de un quipu sagrado, temiendo que su sabiduría fuera olvidada. A diferencia de otros, este quipu no guarda datos contables, sino mensajes cifrados mediante trinomios.</p>
          
          <p>Durante una excursión, tú descubres una sala secreta en las ruinas de Machu Pirámide, un antiguo templo que fusiona elementos de culturas precolombinas. Al centro, un quipu cuelga sobre un pedestal con una advertencia tallada en piedra:</p>
          
          <p>"Quien domine el arte de la factorización y entienda el lenguaje de los nudos, accederá al saber perdido."</p>
          
          <p>La puerta se cierra tras ustedes. El sistema de seguridad se activa.<br/>
          Tienen 30 minutos para descifrar el quipu, resolver los trinomios y escapar antes de quedar encerrados.</p>
        </div>
      </div>

      {/* Niño Quipu flotante */}
      <div className="quipuentrada-container">
        <div className="quipuentrada-mensaje" style={{ display: mostrarMensaje ? 'block' : 'none' }}>
          <div className="mensaje-bubble">
            <p>¡Hola! Mi nombre es Quipu, te ayudaré en tu aventura</p>
            <div className="bubble-arrow"></div>
          </div>
        </div>
        
        <div className="quipuentrada-personaje" onClick={handleQuipuClick}>
          <img 
            src={require('../assets/img/niñosaludando.png')} 
            alt="Quipu" 
            className="quipuentrada-img"
          />
          <div className="quipuentrada-texto">Presióname</div>
        </div>
      </div>

      {/* Botón flotante de notas para admin */}
      {esAdmin && (
        <button 
          className="btn-notas-flotante"
          onClick={() => onVerNotas(false)}
          title="Ver Notas de Estudiantes"
        >
          📝
        </button>
      )}

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

export default PaginaEntrada;
