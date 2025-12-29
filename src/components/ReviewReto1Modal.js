import React from 'react';
import './ReviewReto1Modal.css';

const ReviewReto1Modal = ({ respuestas, onContinuar }) => {
  // Mapeo de respuestas a imágenes
  // IMPORTANTE: Orden visual es Izquierda=C, Centro=A, Derecha=B
  const getImagenRespuesta = (preguntaNum, respuestaSeleccionada) => {
    // Mapeo de letras a valores
    const mapeoLetras = {
      'A': 'x',           // Centro
      'B': 'numeros',     // Derecha
      'C': 'operadores',  // Izquierda
      'D': 'parentesis'
    };
    
    const valor = mapeoLetras[respuestaSeleccionada] || respuestaSeleccionada;
    
    // Imágenes correctas
    const imagenesCorrectas = {
      1: require('../assets/img_review/reto1_p1-c.png'),
      2: require('../assets/img_review/reto1_p2-c.png'),
      3: require('../assets/img_review/reto1_p3-c.png'),
      4: require('../assets/img_review/reto1_p4-c.png')
    };
    
    // Mapeo de respuestas incorrectas a imágenes según pregunta
    // Pregunta 1: Izq=C(operadores), Centro=A(x-correcta), Der=B(números)
    // Pregunta 2: Izq=C(operadores), Centro=A(x), Der=B(números-correcta)
    const imagenesPorRespuesta = {
      1: {
        'A': require('../assets/img_review/reto1_p1-c.png'),      // x (correcta)
        'B': require('../assets/img_review/reto1_p1-i1.png'),     // números (incorrecta)
        'C': require('../assets/img_review/reto1_p1-i2.png')      // operadores (incorrecta)
      },
      2: {
        'A': require('../assets/img_review/reto1_p2-i2.png'),     // x (incorrecta)
        'B': require('../assets/img_review/reto1_p2-c.png'),      // números (correcta)
        'C': require('../assets/img_review/reto1_p2-i1.png')      // operadores (incorrecta)
      },
      3: {
        'A': require('../assets/img_review/reto1_p3-i1.png'),     // x (incorrecta)
        'B': require('../assets/img_review/reto1_p3-i2.png'),    // números (incorrecta)
        'C': require('../assets/img_review/reto1_p3-c.png')      // operadores (correcta)
      },
      4: {
        'A': require('../assets/img_review/reto1_p4-i1.png'),     // x (incorrecta)
        'B': require('../assets/img_review/reto1_p4-i2.png'),    // números (incorrecta)
        'C': require('../assets/img_review/reto1_p4-c.png')      // operadores/paréntesis (correcta)
      }
    };
    
    // Devolver la imagen correspondiente a la respuesta seleccionada
    return imagenesPorRespuesta[preguntaNum]?.[respuestaSeleccionada] || imagenesCorrectas[preguntaNum];
  };
  
  const getRespuestaCorrecta = (preguntaNum) => {
    const respuestasCorrectas = {
      1: 'A', // x
      2: 'B', // números
      3: 'C', // operadores
      4: 'C'  // operadores (paréntesis)
    };
    return respuestasCorrectas[preguntaNum];
  };
  
  const getImagenCorrecta = (preguntaNum) => {
    const imagenesCorrectas = {
      1: require('../assets/img_review/reto1_p1-c.png'),
      2: require('../assets/img_review/reto1_p2-c.png'),
      3: require('../assets/img_review/reto1_p3-c.png'),
      4: require('../assets/img_review/reto1_p4-c.png')
    };
    return imagenesCorrectas[preguntaNum];
  };
  
  const getTextoPregunta = (preguntaNum) => {
    const textos = {
      1: "Escoja de que color es la variable x o x al cuadrado en el Quipu",
      2: "Escoja con que color se representa a los numeros en el Quipu",
      3: "Escoja con que color se representa a las operaciones (+,-) en el Quipu",
      4: "Escoje con que color se representa los paréntesis en el Quipu"
    };
    return textos[preguntaNum];
  };

  return (
    <div className="review-reto1-modal-overlay">
      <div className="review-reto1-modal">
        <div className="review-reto1-modal-header">
          <h2>Review - Reto 1</h2>
        </div>
        <div className="review-reto1-modal-content">
          {[1, 2, 3, 4].map(preguntaNum => {
            const respuesta = respuestas.find(r => r.preguntaNumero === preguntaNum);
            const esCorrecta = respuesta && respuesta.respuestaUsuario === respuesta.respuestaCorrecta;
            const imagenUsuario = respuesta ? getImagenRespuesta(preguntaNum, respuesta.respuestaUsuario) : null;
            const imagenCorrecta = getImagenCorrecta(preguntaNum);
            
            return (
              <div key={preguntaNum} className="review-reto1-pregunta">
                <div className="review-reto1-pregunta-header">
                  <h3>Pregunta {preguntaNum}</h3>
                  {esCorrecta ? (
                    <span className="review-reto1-correcta">✓ Correcta</span>
                  ) : (
                    <span className="review-reto1-incorrecta">✗ Incorrecta</span>
                  )}
                </div>
                <p className="review-reto1-pregunta-texto">{getTextoPregunta(preguntaNum)}</p>
                <div className="review-reto1-imagenes">
                  <div className="review-reto1-imagen-container">
                    <p className="review-reto1-imagen-label">Tu respuesta:</p>
                    {imagenUsuario && (
                      <img 
                        src={imagenUsuario} 
                        alt={`Respuesta pregunta ${preguntaNum}`}
                        className="review-reto1-imagen"
                      />
                    )}
                  </div>
                  {!esCorrecta && (
                    <div className="review-reto1-imagen-container">
                      <p className="review-reto1-imagen-label">Respuesta correcta:</p>
                      <img 
                        src={imagenCorrecta} 
                        alt={`Respuesta correcta pregunta ${preguntaNum}`}
                        className="review-reto1-imagen"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="review-reto1-modal-footer">
          <button className="review-reto1-btn-continuar" onClick={onContinuar}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewReto1Modal;

