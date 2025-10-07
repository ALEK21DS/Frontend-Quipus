import React, { useState } from 'react';
import './PaginaInicio.css';
import apiService from '../services/api';

const PaginaInicio = ({ onIniciarSesion, onVerPuntuaciones }) => {
  const [datosUsuario, setDatosUsuario] = useState({
    nombre: '',
    apellido: '',
    curso: '',
    edad: ''
  });
  const [errores, setErrores] = useState({});
  const [mostrarAnimacion, setMostrarAnimacion] = useState(false);
  const [mensajeCarga, setMensajeCarga] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validación en tiempo real para nombre y apellido
    if (name === 'nombre' || name === 'apellido') {
      // Solo permitir letras y caracteres especiales del español
      const valorLimpio = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
      // Convertir a mayúsculas automáticamente
      const valorMayusculas = valorLimpio.toUpperCase();
      setDatosUsuario(prev => ({
        ...prev,
        [name]: valorMayusculas
      }));
    } else {
      setDatosUsuario(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    // Validación del nombre - solo una palabra
    if (!datosUsuario.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    } else if (datosUsuario.nombre.trim().length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (datosUsuario.nombre.trim().includes(' ')) {
      nuevosErrores.nombre = 'El nombre debe ser una sola palabra (sin espacios)';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(datosUsuario.nombre.trim())) {
      nuevosErrores.nombre = 'El nombre solo puede contener letras';
    }
    
    // Validación del apellido - solo una palabra
    if (!datosUsuario.apellido.trim()) {
      nuevosErrores.apellido = 'El apellido es requerido';
    } else if (datosUsuario.apellido.trim().length < 2) {
      nuevosErrores.apellido = 'El apellido debe tener al menos 2 caracteres';
    } else if (datosUsuario.apellido.trim().includes(' ')) {
      nuevosErrores.apellido = 'El apellido debe ser una sola palabra (sin espacios)';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(datosUsuario.apellido.trim())) {
      nuevosErrores.apellido = 'El apellido solo puede contener letras';
    }
    
    if (!datosUsuario.curso.trim()) {
      nuevosErrores.curso = 'El curso es requerido';
    }
    
    // Validación especial: Solo ADMIN puede registrarse como Profesor
    if (datosUsuario.curso === 'Profesor') {
      const esAdmin = datosUsuario.nombre === 'ADMIN' && datosUsuario.apellido === 'ADMIN';
      if (!esAdmin) {
        nuevosErrores.curso = 'Solo el administrador puede registrarse como Profesor';
      }
    }
    
    if (!datosUsuario.edad.trim()) {
      nuevosErrores.edad = 'La edad es requerida';
    } else {
      const edadNum = parseInt(datosUsuario.edad);
      if (isNaN(edadNum) || edadNum < 1 || edadNum > 100) {
        nuevosErrores.edad = 'La edad debe ser un número entre 1 y 100';
      }
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validarFormulario()) {
      setMostrarAnimacion(true);
      setMensajeCarga('Verificando usuario...');
      
      try {
        // Verificar si es admin
        const esAdmin = datosUsuario.nombre === 'ADMIN' && datosUsuario.apellido === 'ADMIN';
        
        let usuario;
        
        // Para todos los usuarios (admin y normales), buscar si ya existe
        setMensajeCarga('Buscando usuario...');
        try {
          const usuariosExistentes = await apiService.buscarUsuario(datosUsuario.nombre, datosUsuario.apellido);
          
          if (usuariosExistentes.success && usuariosExistentes.data.length > 0) {
            // Usuario ya existe, usar el primero encontrado
            usuario = usuariosExistentes.data[0];
            if (esAdmin) {
              setMensajeCarga('Administrador encontrado. Iniciando sesión...');
            } else {
              setMensajeCarga('Usuario encontrado. Iniciando sesión...');
            }
          } else {
            // Usuario no existe, crear nuevo
            if (esAdmin) {
              setMensajeCarga('Configurando acceso de administrador...');
            } else {
              setMensajeCarga('Creando nuevo usuario...');
            }
            usuario = await apiService.crearUsuario({
              nombre: datosUsuario.nombre,
              apellido: datosUsuario.apellido,
              edad: parseInt(datosUsuario.edad),
              curso: datosUsuario.curso
            });
          }
        } catch (error) {
          // Si hay error al buscar, intentar crear usuario nuevo
          if (esAdmin) {
            setMensajeCarga('Configurando acceso de administrador...');
          } else {
            setMensajeCarga('Creando nuevo usuario...');
          }
          usuario = await apiService.crearUsuario({
            nombre: datosUsuario.nombre,
            apellido: datosUsuario.apellido,
            edad: parseInt(datosUsuario.edad),
            curso: datosUsuario.curso
          });
        }
        
        // Agregar flag de admin y datos del usuario
        // Si el usuario viene de la BD, usar su campo esAdmin, sino usar la verificación local
        const datosCompletos = {
          ...usuario,
          esAdmin: usuario.esAdmin !== undefined ? usuario.esAdmin : esAdmin
        };
        
        setMensajeCarga('¡Listo! Iniciando aventura...');
        
        // Pequeña pausa para mostrar el mensaje final
        setTimeout(() => {
          onIniciarSesion(datosCompletos);
        }, 1000);
        
      } catch (error) {
        console.error('Error al procesar usuario:', error);
        
        // Si es un error de conexión, continuar con datos simulados
        if (error.message.includes('Failed to fetch') || error.message.includes('conectar')) {
          console.log('🎮 Continuando en modo offline...');
          
          // Crear usuario simulado
          const usuarioSimulado = {
            id: 'offline_' + Math.random().toString(36).substr(2, 9),
            nombre: datosUsuario.nombre,
            apellido: datosUsuario.apellido,
            edad: parseInt(datosUsuario.edad),
            curso: datosUsuario.curso,
            esAdmin: datosUsuario.nombre === 'ADMIN' && datosUsuario.apellido === 'ADMIN',
            fecha_registro: new Date().toISOString(),
            activo: true
          };
          
          setMensajeCarga('¡Listo! Iniciando aventura (modo offline)...');
          
          setTimeout(() => {
            onIniciarSesion(usuarioSimulado);
          }, 1000);
        } else {
          setErrores({ 
            general: 'Error al conectar con el servidor. Verifica tu conexión a internet.' 
          });
          setMostrarAnimacion(false);
          setMensajeCarga('');
        }
      }
    }
  };

  return (
    <div className="pagina-inicio">
      {/* Header temático - Completamente separado */}
      <div className="header-inicio">
        <div className="titulo-principal">
          <h1>☀️ El Quipu ☀️</h1>
          <div className="subtitulo">
            <p>La computadora de los Incas</p>
            <div className="decoracion-inca"></div>
          </div>
        </div>
      </div>

      {/* Contenido principal en dos secciones */}
      <div className="contenido-principal">
        {/* Sección izquierda - Formulario */}
        <div className="seccion-izquierda">
          <div className="formulario-contenedor">
            <div className="formulario-header">
              <h2>📜 Registro de Estudiante</h2>
              <p>Ingresa tus datos para comenzar tu aventura</p>
            </div>

            <form onSubmit={handleSubmit} className="formulario-datos">
              <div className="campo-grupo">
                <label htmlFor="nombre" className="etiqueta-campo">
                   Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={datosUsuario.nombre}
                  onChange={handleInputChange}
                  className={`input-campo ${errores.nombre ? 'input-error' : ''}`}
                  placeholder="Solo una palabra (ej: Juan)"
                  maxLength="30"
                  autoComplete="off"
                />
              </div>

              <div className="campo-grupo">
                <label htmlFor="apellido" className="etiqueta-campo">
                  Apellido
                </label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={datosUsuario.apellido}
                  onChange={handleInputChange}
                  className={`input-campo ${errores.apellido ? 'input-error' : ''}`}
                  placeholder="Solo una palabra (ej: Pérez)"
                  maxLength="30"
                  autoComplete="off"
                />
              </div>

              <div className="campo-grupo">
                <label htmlFor="curso" className="etiqueta-campo">
                  Curso/Grado
                </label>
                <select
                  id="curso"
                  name="curso"
                  value={datosUsuario.curso}
                  onChange={handleInputChange}
                  className={`input-campo ${errores.curso ? 'input-error' : ''}`}
                >
                  <option value="">Selecciona tu curso</option>
                  <option value="9no">9no Grado</option>
                  <option value="10mo">10mo Grado</option>
                  <option value="1ro Bachillerato">1ro Bachillerato</option>
                  <option value="Profesor">Profesor</option>
                </select>
              </div>

              <div className="campo-grupo">
                <label htmlFor="edad" className="etiqueta-campo">
                  Edad
                </label>
                <input
                  type="number"
                  id="edad"
                  name="edad"
                  value={datosUsuario.edad}
                  onChange={handleInputChange}
                  className={`input-campo ${errores.edad ? 'input-error' : ''}`}
                  placeholder="Ingresa tu edad"
                  min="1"
                  max="100"
                  autoComplete="off"
                />
              </div>

              {/* Mensaje de error general */}
              {errores.general && (
                <div className="mensaje-error-general">
                  ⚠️ {errores.general}
                </div>
              )}

              <div className="botones-formulario">
                <button
                  type="submit"
                  className="btn-iniciar"
                  disabled={mostrarAnimacion}
                >
                  {mostrarAnimacion ? (
                    <>
                      <span className="spinner"></span>
                      {mensajeCarga || 'Iniciando Aventura...'}
                    </>
                  ) : (
                    <>
                      ⚡ Iniciar Aventura Matemática
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  className="btn-puntuaciones"
                  onClick={onVerPuntuaciones}
                >
                  🏆 Ver Puntuaciones
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sección derecha - Beneficios */}
        <div className="seccion-derecha">
          <div className="info-adicional">
            <div className="tarjeta-info">
              <h3>¿Qué vas a lograr jugando?</h3>
              <ul>
                <li><strong>Domina la factorización</strong> - Aprende a factorizar trinomios de forma visual y divertida</li>
                <li><strong>Resuelve ecuaciones cuadráticas</strong> - Convierte las matemáticas en una aventura épica</li>
                <li><strong>Compite y mejora</strong> - Supera tus propios récords y compite con tus compañeros</li>
                <li><strong>Aprende jugando</strong> - Olvídate de memorizar fórmulas, ¡diviértete aprendiendo!</li>
                <li><strong>Progreso garantizado</strong> - Cada ejercicio te acerca más a ser un experto en matemáticas</li>
                <li><strong>Descubre la cultura Inca</strong> - Conoce cómo los Incas resolvían problemas matemáticos</li>
              </ul>
              <div className="mensaje-motivacional">
                <p><strong>¡Prepárate para la aventura matemática más emocionante!</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PaginaInicio;
