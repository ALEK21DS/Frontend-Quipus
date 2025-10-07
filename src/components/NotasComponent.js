import React, { useState, useEffect } from 'react';
import './NotasComponent.css';
import apiService from '../services/api';

const NotasComponent = ({ onVolver }) => {
  // Estados para búsqueda y filtrado
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroApellido, setFiltroApellido] = useState('');
  const [filtroCurso, setFiltroCurso] = useState('');
  const [filtroEdad, setFiltroEdad] = useState('');

  // Datos de notas desde la base de datos
  const [datosNotas, setDatosNotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Cargar notas desde la base de datos
  useEffect(() => {
    const cargarNotas = async () => {
      try {
        setCargando(true);
        const response = await apiService.obtenerTodasNotas();
        
        if (response.success && response.data) {
          // Transformar los datos para el formato esperado por el componente
          const notasTransformadas = response.data.map(nota => ({
            id: nota.id,
            nombre: nota.usuario.nombre,
            apellido: nota.usuario.apellido,
            curso: nota.usuario.curso || '-',
            edad: nota.usuario.edad !== undefined && nota.usuario.edad !== null ? nota.usuario.edad : '-',
            nota: nota.calificacion !== undefined && nota.calificacion !== null ? nota.calificacion.toFixed(1) : '0.0'
          }));
          setDatosNotas(notasTransformadas);
        }
      } catch (err) {
        console.error('Error al cargar notas:', err);
        setError('No se pudieron cargar las notas');
        setDatosNotas([]);
      } finally {
        setCargando(false);
      }
    };

    cargarNotas();
  }, []);

  // Función para filtrar los datos
  const datosFiltrados = datosNotas.filter(estudiante => {
    const nombreMatch = estudiante.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
    const apellidoMatch = estudiante.apellido.toLowerCase().includes(filtroApellido.toLowerCase());
    const cursoMatch = estudiante.curso.toLowerCase().includes(filtroCurso.toLowerCase());
    const edadMatch = filtroEdad === '' || estudiante.edad.toString().includes(filtroEdad);
    
    return nombreMatch && apellidoMatch && cursoMatch && edadMatch;
  });

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltroNombre('');
    setFiltroApellido('');
    setFiltroCurso('');
    setFiltroEdad('');
  };

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
              {datosFiltrados.length} de {datosNotas.length} estudiantes
            </span>
          </div>
        </div>
        
        <div className="tabla-notas">
          <table className="tabla-notas-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Curso</th>
                <th>Edad</th>
                <th>Nota</th>
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
                </tr>
              ))}
              {datosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="5" className="sin-resultados">
                    No se encontraron estudiantes con los filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
