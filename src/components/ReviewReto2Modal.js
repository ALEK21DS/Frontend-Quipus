import React from 'react';
import './ReviewReto2Modal.css';

const ReviewBlank = ({ userValue, correctValue, isCorrect }) => {
  return (
    <span className="review-blank-container">
      <div className="review-blank-line1">
        {isCorrect ? (
          <span className="review-blank-correct">✅ {userValue}</span>
        ) : (
          <span className="review-blank-incorrect">❌ {userValue}</span>
        )}
      </div>
      <div className="review-blank-line2">
        Correcta: {correctValue}
      </div>
    </span>
  );
};

const ReviewReto2Modal = ({ blanksUsuario, blanksCorrectos, onContinuar }) => {
  // Texto del párrafo con los blanks (debe coincidir exactamente con RetoDos.js)
  const textoParrafo = "Exploradores, han mostrado ingenio. Ahora, el saber que buscan se encuentra en este antiguo pergamino, donde se esconde la clave de la {blank-1}. Para nuestros sabios, el método del Aspa era la herramienta para {blank-2} una expresión compleja, como un trinomio de la forma {blank-3} y así revelar sus dos {blank-4} ocultos.";

  // Dividir el texto en partes y reemplazar los blanks
  const partes = textoParrafo.split(/\{blank-\d\}/);
  const blanks = ['blank-1', 'blank-2', 'blank-3', 'blank-4'];

  return (
    <div className="review-reto2-modal-overlay">
      <div className="review-reto2-modal">
        <div className="review-reto2-modal-header">
          <h2>Review - Reto 2</h2>
        </div>
        <div className="review-reto2-modal-content">
          <p className="review-reto2-parrafo">
            {partes.map((parte, index) => (
              <React.Fragment key={index}>
                {parte}
                {index < blanks.length && (
                  <ReviewBlank
                    userValue={blanksUsuario[blanks[index]] || ''}
                    correctValue={blanksCorrectos[blanks[index]] || ''}
                    isCorrect={blanksUsuario[blanks[index]] === blanksCorrectos[blanks[index]]}
                  />
                )}
              </React.Fragment>
            ))}
          </p>
        </div>
        <div className="review-reto2-modal-footer">
          <button className="review-reto2-btn-continuar" onClick={onContinuar}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewReto2Modal;

