import React, { useState, useEffect } from 'react';
import './NotasComponent.css';
import apiService from '../services/api';

const NotasComponent = ({ onVolver }) => {
  // Estados para búsqueda y filtrado
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroApellido, setFiltroApellido] = useState('');
  const [filtroCurso, setFiltroCurso] = useState('');
  const [filtroEdad, setFiltroEdad] = useState('');

  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina] = useState(50); // 50 registros por página
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  // Datos de notas desde la base de datos
  const [datosNotas, setDatosNotas] = useState([]);
  const [cargando, setCargando] = useState(true); // Solo para la carga inicial
  const [cargandoTabla, setCargandoTabla] = useState(false); // Para actualizaciones de filtros
  const [error, setError] = useState(null);

  // Cargar notas desde la base de datos con paginación y filtros
  useEffect(() => {
    const cargarNotas = async () => {
      try {
        // Solo mostrar carga completa en la primera carga
        if (datosNotas.length === 0) {
          setCargando(true);
        } else {
          // Para actualizaciones, solo mostrar carga en la tabla
          setCargandoTabla(true);
        }
        
        const offset = (paginaActual - 1) * registrosPorPagina;
        const response = await apiService.obtenerTodasNotas(
          registrosPorPagina, 
          offset, 
          filtroCurso || null,
          filtroNombre || null,
          filtroApellido || null,
          filtroEdad || null
        );
        
        if (response.success && response.data) {
          // Actualizar información de paginación
          if (response.paginacion) {
            setTotalRegistros(response.total || 0);
            setTotalPaginas(response.paginacion.totalPaginas || 1);
          }
          
          // Transformar los datos para el formato esperado por el componente
          const notasTransformadas = response.data.map(nota => {
            // Calcular tiempo basado en tres estados posibles:
            // 1. Tiempo agotado (tiempoAgotado === true)
            // 2. Tiempo de juego (completado === true)
            // 3. No termino (completado === false)
            let tiempo;
            
            if (nota.sesion) {
              // Prioridad 1: Si se agotó el tiempo, mostrar "Tiempo agotado"
              if (Boolean(nota.sesion.tiempoAgotado) === true) {
                tiempo = 'Tiempo agotado';
              }
              // Prioridad 2: Si completado === true, mostrar el tiempo de juego
              else if (Boolean(nota.sesion.completado) === true) {
                // Prioridad 1: Usar tiempoTotal si está disponible
                if (nota.sesion.tiempoTotal !== null && nota.sesion.tiempoTotal !== undefined && nota.sesion.tiempoTotal > 0) {
                  const minutos = Math.floor(nota.sesion.tiempoTotal / 60);
                  const segundos = nota.sesion.tiempoTotal % 60;
                  tiempo = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
                } 
                // Prioridad 2: Calcular desde fechas si no hay tiempoTotal
                else if (nota.sesion.fechaInicio && nota.sesion.fechaFin) {
                  const fechaInicio = new Date(nota.sesion.fechaInicio);
                  const fechaFin = new Date(nota.sesion.fechaFin);
                  const tiempoTotal = Math.floor((fechaFin - fechaInicio) / 1000);
                  if (tiempoTotal > 0) {
                    const minutos = Math.floor(tiempoTotal / 60);
                    const segundos = tiempoTotal % 60;
                    tiempo = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
                  } else {
                    tiempo = '00:00';
                  }
                } else {
                  tiempo = '00:00';
                }
              } 
              // Prioridad 3: Si completado === false, mostrar "No termino"
              else {
                tiempo = 'No termino';
              }
            } else {
              // Si no hay sesión, mostrar "No termino"
              tiempo = 'No termino';
            }
            
            return {
              id: nota.id,
              nombre: nota.usuario.nombre,
              apellido: nota.usuario.apellido,
              curso: nota.usuario.curso || '-',
              edad: nota.usuario.edad !== undefined && nota.usuario.edad !== null ? nota.usuario.edad : '-',
              nota: nota.calificacion !== undefined && nota.calificacion !== null ? nota.calificacion.toFixed(1) : '0.0',
              tiempo: tiempo
            };
          });
          setDatosNotas(notasTransformadas);
        }
      } catch (err) {
        console.error('Error al cargar notas:', err);
        setError('No se pudieron cargar las notas');
        setDatosNotas([]);
      } finally {
        setCargando(false);
        setCargandoTabla(false);
      }
    };

    cargarNotas();
  }, [paginaActual, registrosPorPagina, filtroCurso, filtroNombre, filtroApellido, filtroEdad]);

  // Los datos ya vienen filtrados del servidor, no necesitamos filtrar en el cliente
  const datosFiltrados = datosNotas;

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltroNombre('');
    setFiltroApellido('');
    setFiltroCurso('');
    setFiltroEdad('');
    setPaginaActual(1); // Resetear a la primera página
  };

  // Resetear a la primera página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroNombre, filtroApellido, filtroCurso, filtroEdad]);

  // Funciones de paginación
  const irAPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
      // Scroll al inicio de la tabla
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      irAPagina(paginaActual - 1);
    }
  };

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      irAPagina(paginaActual + 1);
    }
  };

  // Calcular índices para mostrar (todos los filtros se aplican en el servidor)
  const tieneFiltros = filtroNombre || filtroApellido || filtroCurso || filtroEdad;
  const inicioRegistro = totalRegistros === 0 ? 0 : (paginaActual - 1) * registrosPorPagina + 1;
  const finRegistro = Math.min(paginaActual * registrosPorPagina, totalRegistros);

  return (
    <div className="notas-page">
      <div className="notas-container">
        <h1 className="notas-titulo">📚 Registro de Notas</h1>
        
        {/* Mostrar estado de carga o error */}
        {cargando && (
          <div className="mensaje-estado">
            <p>⏳ Cargando notas...</p>
          </div>
        )}
        
        {error && (
          <div className="mensaje-error">
            <p>❌ {error}</p>
          </div>
        )}
        
        {/* Sección de búsqueda y filtros */}
        {!cargando && !error && (
        <>
        <div className="filtros-container">
          <h3 className="filtros-titulo">🔍 Buscar y Filtrar</h3>
          <div className="filtros-grid">
            <div className="filtro-grupo">
              <label htmlFor="filtro-nombre" className="filtro-label">
                👤 Nombre
              </label>
              <input
                type="text"
                id="filtro-nombre"
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
                placeholder="Buscar por nombre..."
                className="filtro-input"
                autoComplete="off"
              />
            </div>
            
            <div className="filtro-grupo">
              <label htmlFor="filtro-apellido" className="filtro-label">
                👤 Apellido
              </label>
              <input
                type="text"
                id="filtro-apellido"
                value={filtroApellido}
                onChange={(e) => setFiltroApellido(e.target.value)}
                placeholder="Buscar por apellido..."
                className="filtro-input"
                autoComplete="off"
              />
            </div>
            
            <div className="filtro-grupo">
              <label htmlFor="filtro-curso" className="filtro-label">
                🏛️ Curso
              </label>
              <input
                type="text"
                id="filtro-curso"
                value={filtroCurso}
                onChange={(e) => setFiltroCurso(e.target.value)}
                placeholder="Buscar por curso..."
                className="filtro-input"
                autoComplete="off"
              />
            </div>
            
            <div className="filtro-grupo">
              <label htmlFor="filtro-edad" className="filtro-label">
                🌙 Edad
              </label>
              <input
                type="number"
                id="filtro-edad"
                value={filtroEdad}
                onChange={(e) => setFiltroEdad(e.target.value)}
                placeholder="Buscar por edad..."
                className="filtro-input"
                autoComplete="off"
              />
            </div>
          </div>
          
          <div className="filtros-acciones">
            <button 
              className="btn-limpiar-filtros"
              onClick={limpiarFiltros}
            >
              🗑️ Limpiar Filtros
            </button>
            <span className="resultados-contador">
              {totalRegistros > 0 ? (
                tieneFiltros 
                  ? `Mostrando ${inicioRegistro}-${finRegistro} de ${totalRegistros} estudiantes (filtrados)`
                  : `Mostrando ${inicioRegistro}-${finRegistro} de ${totalRegistros} estudiantes`
              ) : (
                tieneFiltros
                  ? 'No hay estudiantes que coincidan con los filtros'
                  : 'No hay estudiantes registrados'
              )}
            </span>
          </div>
        </div>
        
        <div className="tabla-notas">
          {cargandoTabla && (
            <div className="tabla-cargando-overlay">
              <div className="tabla-cargando-mensaje">
                <p>⏳ Cargando...</p>
              </div>
            </div>
          )}
          <table className="tabla-notas-table" style={{ opacity: cargandoTabla ? 0.5 : 1 }}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Curso</th>
                <th>Edad</th>
                <th>Nota</th>
                <th>Tiempo</th>
              </tr>
            </thead>
            <tbody>
              {datosFiltrados.map(estudiante => (
                <tr key={estudiante.id}>
                  <td>{estudiante.nombre}</td>
                  <td>{estudiante.apellido}</td>
                  <td>{estudiante.curso}</td>
                  <td>{estudiante.edad}</td>
                  <td className={`nota-cell ${estudiante.nota >= 9 ? 'nota-excelente' : estudiante.nota >= 8 ? 'nota-buena' : estudiante.nota >= 7 ? 'nota-regular' : 'nota-baja'}`}>
                    {estudiante.nota}
                  </td>
                  <td>{estudiante.tiempo}</td>
                </tr>
              ))}
              {datosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="sin-resultados">
                    No se encontraron estudiantes con los filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de paginación */}
        {totalPaginas > 1 && (
          <div className="paginacion-container">
            <button
              className="btn-paginacion"
              onClick={paginaAnterior}
              disabled={paginaActual === 1}
            >
              ← Anterior
            </button>
            
            <div className="paginacion-numeros">
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                let numeroPagina;
                if (totalPaginas <= 5) {
                  numeroPagina = i + 1;
                } else if (paginaActual <= 3) {
                  numeroPagina = i + 1;
                } else if (paginaActual >= totalPaginas - 2) {
                  numeroPagina = totalPaginas - 4 + i;
                } else {
                  numeroPagina = paginaActual - 2 + i;
                }
                
                return (
                  <button
                    key={numeroPagina}
                    className={`btn-pagina ${paginaActual === numeroPagina ? 'activa' : ''}`}
                    onClick={() => irAPagina(numeroPagina)}
                  >
                    {numeroPagina}
                  </button>
                );
              })}
            </div>
            
            <button
              className="btn-paginacion"
              onClick={paginaSiguiente}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente →
            </button>
          </div>
        )}
        </>
        )}
      </div>
      
      {/* Botón flotante fuera del contenedor */}
      <button 
        className="btn-volver-inicio-fixed"
        onClick={onVolver}
      >
        Volver
      </button>
    </div>
  );
};

export default NotasComponent;
