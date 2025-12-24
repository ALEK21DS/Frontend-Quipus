import React from 'react';
import './ReviewReto3Modal.css';

const ReviewReto3Modal = ({ ejercicios, onContinuar }) => {
  const getImagenCorrecta = (preguntaNum) => {
    const imagenes = {
      1: require('../assets/img_review/reto3_p1-c.png'),
      2: require('../assets/img_review/reto3_p2-c.png'),
      3: require('../assets/img_review/reto3_p3-c.png'),
      4: require('../assets/img_review/reto3_p4-c.png'),
      5: require('../assets/img_review/reto3_p5-c.png'),
      6: require('../assets/img_review/reto3_p6-c.png'),
      7: require('../assets/img_review/reto3_p7-c.png'),
      8: require('../assets/img_review/reto3_p8-c.png'),
      9: require('../assets/img_review/reto3_p9-c.png'),
      10: require('../assets/img_review/reto3_p10-c.png')
    };
    return imagenes[preguntaNum] || null;
  };

  return (
    <div className="review-reto3-modal-overlay">
      <div className="review-reto3-modal">
        <div className="review-reto3-modal-header">
          <h2>Review - Reto 3</h2>
        </div>
        <div className="review-reto3-modal-content">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(preguntaNum => {
            const ejercicio = ejercicios.find(e => e.ejercicioNumero === preguntaNum);
            const puntuacion = ejercicio?.puntuacion || 0;
            const esCorrecta = puntuacion > 0;
            const imagenCorrecta = getImagenCorrecta(preguntaNum);
            
            return (
              <div key={preguntaNum} className="review-reto3-pregunta">
                <div className="review-reto3-pregunta-header">
                  <h3>Pregunta {preguntaNum}</h3>
                  {esCorrecta ? (
                    <span className="review-reto3-correcta">✔️</span>
                  ) : (
                    <span className="review-reto3-incorrecta">❌</span>
                  )}
                </div>
                {imagenCorrecta && (
                  <div className="review-reto3-imagen-container">
                    <img 
                      src={imagenCorrecta} 
                      alt={`Respuesta correcta pregunta ${preguntaNum}`}
                      className="review-reto3-imagen"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="review-reto3-modal-footer">
          <button className="review-reto3-btn-continuar" onClick={onContinuar}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewReto3Modal;

