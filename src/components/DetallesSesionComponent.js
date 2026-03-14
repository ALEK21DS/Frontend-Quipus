import React, { useState, useEffect } from 'react';
import './DetallesSesionComponent.css';
import apiService from '../services/api';

const DetallesSesionComponent = ({ sesionId, onVolver }) => {
  const [detalles, setDetalles] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDetalles = async () => {
      try {
        setCargando(true);
        const response = await apiService.obtenerDetallesSesion(sesionId);
        
        if (response.success && response.data) {
          setDetalles(response.data);
        } else {
          setError('No se pudieron cargar los detalles de la sesión');
        }
      } catch (err) {
        console.error('Error al cargar detalles:', err);
        setError('Error al cargar los detalles de la sesión');
      } finally {
        setCargando(false);
      }
    };

    if (sesionId) {
      cargarDetalles();
    }
  }, [sesionId]);

  if (cargando) {
    return (
      <div className="detalles-page">
        <div className="detalles-container">
          <div className="mensaje-estado">
            <p>⏳ Cargando detalles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detalles-page">
        <div className="detalles-container">
          <div className="mensaje-error">
            <p>❌ {error}</p>
          </div>
          <button className="btn-volver" onClick={onVolver}>
            ← Volver a Notas
          </button>
        </div>
      </div>
    );
  }

  if (!detalles) {
    return null;
  }

  const { sesion, respuestas, detallesNota } = detalles;

  // Formatear tiempo
  const formatearTiempo = (segundos) => {
    if (!segundos) return '00:00';
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="detalles-page">
      {/* Botón Volver en la esquina superior izquierda */}
      <button className="btn-volver-fixed" onClick={onVolver}>
        ← Volver a Notas
      </button>

      <div className="detalles-container">
        <h1 className="detalles-titulo">📋 Detalles de la Sesión</h1>
        
        {/* Información General */}
        <div className="info-general">
          <h2>👤 Información del Estudiante</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Nombre:</span>
              <span className="info-valor">{sesion.usuario?.nombre} {sesion.usuario?.apellido}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Curso:</span>
              <span className="info-valor">{sesion.usuario?.curso || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Edad:</span>
              <span className="info-valor">{sesion.usuario?.edad || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tiempo Total:</span>
              <span className="info-valor">{formatearTiempo(sesion.tiempoTotal)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Estado:</span>
              <span className={`info-valor ${sesion.completado ? 'completado' : 'incompleto'}`}>
                {sesion.tiempoAgotado ? '⏰ Tiempo Agotado' : sesion.completado ? '✅ Completado' : '❌ No Terminó'}
              </span>
            </div>
          </div>
        </div>

        {/* Resumen de Nota */}
        <div className="resumen-nota">
          <h2>📊 Resumen de Nota</h2>
          <div className="nota-total">
            <span className="nota-label">Nota Final:</span>
            <span className={`nota-valor ${detallesNota.notaTotal >= 9 ? 'excelente' : detallesNota.notaTotal >= 7 ? 'buena' : detallesNota.notaTotal >= 5 ? 'regular' : 'baja'}`}>
              {detallesNota.notaTotal.toFixed(2)} / {detallesNota.notaMaxima}
            </span>
          </div>
          <div className="nota-desglose">
            <div className="nota-reto">
              <span>Reto 1:</span>
              <span>{detallesNota.reto1.nota.toFixed(2)} / {detallesNota.reto1.notaMaxima}</span>
            </div>
            <div className="nota-reto">
              <span>Reto 2:</span>
              <span>{detallesNota.reto2.nota.toFixed(2)} / {detallesNota.reto2.notaMaxima}</span>
            </div>
            <div className="nota-reto">
              <span>Reto 3:</span>
              <span>{detallesNota.reto3.nota.toFixed(2)} / {detallesNota.reto3.notaMaxima}</span>
            </div>
          </div>
          <p className="nota-aclaracion">
            * La nota final es la registrada en el sistema durante el juego
          </p>
        </div>

        {/* Reto 1 */}
        <div className="reto-seccion">
          <h2>🎯 Reto 1: Preguntas de Selección Múltiple</h2>
          <p className="reto-descripcion">
            4 preguntas, cada una vale 0.25 puntos. Total: {detallesNota.reto1.correctas}/4 correctas = {detallesNota.reto1.nota.toFixed(2)} puntos
          </p>
          <div className="preguntas-lista">
            {respuestas.reto1.map((respuesta, index) => (
              <div key={respuesta.id} className={`pregunta-item ${respuesta.esCorrecto ? 'correcta' : 'incorrecta'}`}>
                <div className="pregunta-header">
                  <span className="pregunta-numero">Pregunta {respuesta.preguntaNumero}</span>
                  <span className={`pregunta-estado ${respuesta.esCorrecto ? 'correcto' : 'incorrecto'}`}>
                    {respuesta.esCorrecto ? '✅ Correcta' : '❌ Incorrecta'}
                  </span>
                </div>
                <div className="pregunta-contenido">
                  <p className="pregunta-texto">{respuesta.pregunta}</p>
                  <div className="respuesta-info">
                    <div className="respuesta-item">
                      <span className="respuesta-label">Respuesta correcta:</span>
                      <span className="respuesta-valor correcta-valor">{respuesta.respuestaCorrecta}</span>
                    </div>
                    <div className="respuesta-item">
                      <span className="respuesta-label">Respuesta del estudiante:</span>
                      <span className={`respuesta-valor ${respuesta.esCorrecto ? 'correcta-valor' : 'incorrecta-valor'}`}>
                        {respuesta.respuestaUsuario}
                      </span>
                    </div>
                  </div>
                  <div className="contribucion-nota">
                    {respuesta.esCorrecto ? (
                      <span className="contribucion-positiva">+0.25 puntos</span>
                    ) : (
                      <span className="contribucion-negativa">0 puntos (respuesta incorrecta)</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reto 2 */}
        <div className="reto-seccion">
          <h2>📝 Reto 2: Completar Texto</h2>
          <p className="reto-descripcion">
            1 pregunta con 4 casillas, cada casilla vale 0.5 puntos. Total: {detallesNota.reto2.casillasCorrectas}/4 casillas correctas = {detallesNota.reto2.nota.toFixed(2)} puntos
          </p>
          <div className="preguntas-lista">
            {respuestas.reto2.map((respuesta) => {
              // Parsear las respuestas del usuario y correctas
              let respuestasUsuario = {};
              let respuestasCorrectas = {};
              
              try {
                respuestasUsuario = JSON.parse(respuesta.respuestaUsuario);
                respuestasCorrectas = JSON.parse(respuesta.respuestaCorrecta);
              } catch (e) {
                // Si no se puede parsear, intentar usar como está
                respuestasUsuario = respuesta.respuestaUsuario;
                respuestasCorrectas = respuesta.respuestaCorrecta;
              }

              // Convertir objetos a arrays si es necesario
              const usuarioArray = [];
              const correctasArray = [];
              
              if (typeof respuestasUsuario === 'object' && !Array.isArray(respuestasUsuario)) {
                // Es un objeto con keys blank-1, blank-2, etc.
                for (let i = 1; i <= 4; i++) {
                  usuarioArray.push(respuestasUsuario[`blank-${i}`] || 'Sin respuesta');
                }
              } else if (Array.isArray(respuestasUsuario)) {
                usuarioArray.push(...respuestasUsuario);
              } else {
                usuarioArray.push(respuestasUsuario);
              }
              
              if (typeof respuestasCorrectas === 'object' && !Array.isArray(respuestasCorrectas)) {
                // Es un objeto con keys blank-1, blank-2, etc.
                for (let i = 1; i <= 4; i++) {
                  correctasArray.push(respuestasCorrectas[`blank-${i}`] || '');
                }
              } else if (Array.isArray(respuestasCorrectas)) {
                correctasArray.push(...respuestasCorrectas);
              } else {
                correctasArray.push(respuestasCorrectas);
              }

              return (
                <div key={respuesta.id} className={`pregunta-item ${respuesta.esCorrecto ? 'correcta' : 'incorrecta'}`}>
                  <div className="pregunta-header">
                    <span className="pregunta-numero">Pregunta Única</span>
                    <span className={`pregunta-estado ${respuesta.esCorrecto ? 'correcto' : 'incorrecto'}`}>
                      {respuesta.esCorrecto ? '✅ Correcta' : '❌ Incorrecta'}
                    </span>
                  </div>
                  <div className="pregunta-contenido">
                    <p className="pregunta-texto">{respuesta.pregunta}</p>
                    
                    {/* Mostrar las 4 casillas */}
                    <div className="casillas-reto2">
                      {[0, 1, 2, 3].map((index) => {
                        const usuarioResp = usuarioArray[index] || 'Sin respuesta';
                        const correctaResp = correctasArray[index] || '';
                        const esCorrecto = usuarioResp === correctaResp;
                        
                        return (
                          <div key={index} className={`casilla-item ${esCorrecto ? 'casilla-correcta' : 'casilla-incorrecta'}`}>
                            <div className="casilla-header">
                              <span className="casilla-numero">Casilla {index + 1}</span>
                              <span className="casilla-icono">{esCorrecto ? '✓' : '✗'}</span>
                            </div>
                            <div className="casilla-detalles">
                              <div className="casilla-respuesta">
                                <span className="casilla-label">Correcta:</span>
                                <span className="casilla-valor correcta-valor">{correctaResp}</span>
                              </div>
                              <div className="casilla-respuesta">
                                <span className="casilla-label">Estudiante:</span>
                                <span className={`casilla-valor ${esCorrecto ? 'correcta-valor' : 'incorrecta-valor'}`}>
                                  {usuarioResp}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="contribucion-nota">
                      {(() => {
                        const casillasCorrectas = [0, 1, 2, 3].filter(index => {
                          const usuarioResp = usuarioArray[index] || 'Sin respuesta';
                          const correctaResp = correctasArray[index] || '';
                          return usuarioResp === correctaResp;
                        }).length;
                        const notaCasillas = casillasCorrectas * 0.5;
                        
                        return (
                          <span className={casillasCorrectas === 4 ? 'contribucion-positiva' : 'contribucion-parcial'}>
                            {casillasCorrectas}/4 casillas correctas = +{notaCasillas.toFixed(2)} puntos
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reto 3 */}
        <div className="reto-seccion">
          <h2>🧮 Reto 3: Factorización de Trinomios</h2>
          <p className="reto-descripcion">
            10 ejercicios, cada uno vale 7 puntos máximo. Total: {detallesNota.reto3.puntosObtenidos}/70 puntos = {detallesNota.reto3.nota.toFixed(2)} de nota
          </p>
          <div className="ejercicios-lista">
            {/* Crear un array combinado de todos los ejercicios (respondidos y no respondidos) ordenados */}
            {(() => {
              // Obtener los números de ejercicios que SÍ tienen registro
              const ejerciciosRespondidos = respuestas.reto3.map(e => e.ejercicioNumero);
              
              // Crear array de todos los ejercicios del 1 al 10
              const todosLosEjercicios = [];
              
              for (let i = 1; i <= 10; i++) {
                const ejercicio = respuestas.reto3.find(e => e.ejercicioNumero === i);
                
                if (ejercicio) {
                  // Ejercicio con respuesta
                  todosLosEjercicios.push({
                    tipo: 'respondido',
                    numero: i,
                    data: ejercicio
                  });
                } else {
                  // Ejercicio sin respuesta
                  todosLosEjercicios.push({
                    tipo: 'no-respondido',
                    numero: i
                  });
                }
              }
              
              // Renderizar todos los ejercicios en orden
              return todosLosEjercicios.map((item) => {
                if (item.tipo === 'respondido') {
                  const ejercicio = item.data;
                  return (
                    <div key={ejercicio.id} className={`ejercicio-item ${ejercicio.completado ? 'completado' : 'incompleto'}`}>
                      <div className="ejercicio-header">
                        <span className="ejercicio-numero">Ejercicio {ejercicio.ejercicioNumero}</span>
                        <span className={`ejercicio-estado ${ejercicio.completado ? 'completado-estado' : 'incompleto-estado'}`}>
                          {ejercicio.completado ? '✅ Completado' : '❌ Incompleto'}
                        </span>
                      </div>
                      <div className="ejercicio-contenido">
                        <p className="ecuacion-original">{ejercicio.ecuacionOriginal}</p>
                        
                        <div className="validaciones-lista">
                          {/* Validación 1 */}
                          <div className={`validacion-item ${ejercicio.validacion1Correcta ? 'validacion-correcta' : 'validacion-incorrecta'}`}>
                            <div className="validacion-header">
                              <span className="validacion-nombre">Validación 1 (Factores izquierda)</span>
                              <span className="validacion-icono">{ejercicio.validacion1Correcta ? '✓' : '✗'}</span>
                            </div>
                            <div className="validacion-detalles">
                              <span>Respuesta: {ejercicio.respuestaUsuario1}</span>
                              {ejercicio.validacion1Intento > 1 && ejercicio.validacion1Correcta && (
                                <span className="validacion-errores-visual">✗</span>
                              )}
                            </div>
                          </div>

                          {/* Validación 2 */}
                          <div className={`validacion-item ${ejercicio.validacion2Correcta ? 'validacion-correcta' : 'validacion-incorrecta'}`}>
                            <div className="validacion-header">
                              <span className="validacion-nombre">Validación 2 (Factores derecha)</span>
                              <span className="validacion-icono">{ejercicio.validacion2Correcta ? '✓' : '✗'}</span>
                            </div>
                            <div className="validacion-detalles">
                              <span>Respuesta: {ejercicio.respuestaUsuario2}</span>
                              {ejercicio.validacion2Intento > 1 && ejercicio.validacion2Correcta && (
                                <span className="validacion-errores-visual">✗</span>
                              )}
                            </div>
                          </div>

                          {/* Validación 3 */}
                          <div className={`validacion-item ${ejercicio.validacion3Correcta ? 'validacion-correcta' : 'validacion-incorrecta'}`}>
                            <div className="validacion-header">
                              <span className="validacion-nombre">Validación 3 (Suma total)</span>
                              <span className="validacion-icono">{ejercicio.validacion3Correcta ? '✓' : '✗'}</span>
                            </div>
                            <div className="validacion-detalles">
                              <span>Respuesta: {ejercicio.respuestaUsuario3}</span>
                              {ejercicio.validacion3Intento > 1 && ejercicio.validacion3Correcta && (
                                <span className="validacion-errores-visual">✗</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  // Ejercicio no respondido
                  return (
                    <div key={`no-completado-${item.numero}`} className="ejercicio-item no-respondido">
                      <div className="ejercicio-header">
                        <span className="ejercicio-numero">Ejercicio {item.numero}</span>
                        <span className="ejercicio-estado no-respondido-estado">
                          ⚠️ No Completó la Respuesta
                        </span>
                      </div>
                      <div className="ejercicio-contenido">
                        <p className="mensaje-no-respondido">
                          El estudiante no llegó a responder este ejercicio.
                        </p>
                        <div className="contribucion-nota">
                          <span className="contribucion-negativa">0 puntos (sin respuesta)</span>
                        </div>
                      </div>
                    </div>
                  );
                }
              });
            })()}
          </div>
        </div>

        <button className="btn-volver-bottom" onClick={onVolver}>
          ← Volver a Notas
        </button>
      </div>
    </div>
  );
};

export default DetallesSesionComponent;
