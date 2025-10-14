import React, { useState, useEffect, useRef } from 'react';
import './FactorizacionComponent.css';
import apiService from '../services/api';

const FactorizacionComponent = ({ datosUsuario, onCompletarReto3, sesionJuego }) => {
  // Scroll al inicio cuando se monta el componente
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Verificar si el usuario es admin
  const esAdmin = datosUsuario && datosUsuario.esAdmin;
  const [valores, setValores] = useState({
    // Factores del término cuadrático (2x²)
    factor1X: '',
    factor1Coef: '',
    // Factores del término constante (16)
    factor2Const: '',
    factor2Num: '',
    // Productos de la multiplicación cruzada
    producto1: '',
    producto2: '',
    // Suma de productos
    suma: ''
  });

  const [signos, setSignos] = useState({
    factor1X: '+',
    factor1Coef: '+',
    factor2Const: '+',
    factor2Num: '+'
  });

  const [ecuacionOriginal, setEcuacionOriginal] = useState('2x² - 7x - 15');
  const [ecuaciones] = useState([
    '2x² - 7x - 15',
    '2x² + 5x + 2',
    '2x² + 3x + 1',
    '3x² + 5x + 2',
    '4x² + 13x + 3',
    '4x² + 15x + 9',
    '6x⁴ + 5x² - 6',
    '12x² - 13x - 35',
    '3x² + 13x - 10',
    '3x² - 5x - 12'
  ]);
  const [indiceEcuacion, setIndiceEcuacion] = useState(0);
  const [validacion, setValidacion] = useState({
    esCorrecta: null,
    mensaje: '',
    mostrar: false,
    esAdvertencia: false
  });

  const [factoresIzquierdosValidados, setFactoresIzquierdosValidados] = useState(false);
  
  // Estado para el modal de instrucciones
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(true);

  // Estado para el sistema de nudos
  const [nudosEnFactores, setNudosEnFactores] = useState({
    factor1X: { signo: null, numero: null, letra: null, letras: [] },
    factor1Coef: { signo: null, numero: null, letra: null, letras: [] },
    factor2Const: { signo: null, numero: null, letra: null },
    factor2Num: { signo: null, numero: null, letra: null }
  });

  // Función para calcular productos con nudos
  const calcularProductosConNudos = () => {
    const nuevosProductos = {
      producto1: [],
      producto2: [],
      suma: []
    };

    // Calcular producto1: factor1X * factor2Const
    const factor1X = nudosEnFactores.factor1X;
    const factor2Const = nudosEnFactores.factor2Const;
    
    if (factor1X.numero && factor2Const.numero) {
      const num1 = parseInt(factor1X.numero);
      const num2 = parseInt(factor2Const.numero);
      const signo1 = factor1X.signo === 'minus' ? -1 : 1;
      const signo2 = factor2Const.signo === 'minus' ? -1 : 1;
      
      const resultado = num1 * num2 * signo1 * signo2;
      
      // Crear nudos para el resultado
      for (let i = 0; i < Math.abs(resultado); i++) {
        if (factor1X.letra === 'x' || factor2Const.letra === 'x') {
          nuevosProductos.producto1.push('x');
        } else {
          nuevosProductos.producto1.push('1');
        }
      }
    }

    // Calcular producto2: factor1Coef * factor2Num
    const factor1Coef = nudosEnFactores.factor1Coef;
    const factor2Num = nudosEnFactores.factor2Num;
    
    if (factor1Coef.numero && factor2Num.numero) {
      const num1 = parseInt(factor1Coef.numero);
      const num2 = parseInt(factor2Num.numero);
      const signo1 = factor1Coef.signo === 'minus' ? -1 : 1;
      const signo2 = factor2Num.signo === 'minus' ? -1 : 1;
      
      const resultado = num1 * num2 * signo1 * signo2;
      
      // Crear nudos para el resultado
      for (let i = 0; i < Math.abs(resultado); i++) {
        if (factor1Coef.letra === 'x' || factor2Num.letra === 'x') {
          nuevosProductos.producto2.push('x');
        } else {
          nuevosProductos.producto2.push('1');
        }
      }
    }

    // Calcular suma
    const suma = [...nuevosProductos.producto1, ...nuevosProductos.producto2];
    nuevosProductos.suma = suma;

    setProductosConNudos(nuevosProductos);
  };

  // Calcular productos automáticamente cuando cambien los nudos - DESACTIVADO
  // useEffect(() => {
  //   calcularProductosConNudos();
  // }, [nudosEnFactores]);

  const [productosConNudos, setProductosConNudos] = useState({
    producto1: [],
    producto2: [],
    suma: []
  });

  // Funciones para el sistema de drag & drop
  const handleDragStart = (e, nudoNombre) => {
    e.dataTransfer.setData('text/plain', nudoNombre);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  // Función para validar si un nudo es del tipo correcto para cada sección
  const validarTipoNudo = (nudoNombre, seccion) => {
    const nudosSigno = ['plus', 'minus'];
    const nudosNumero = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const nudosVariable = ['x', 'x2'];
    
    switch (seccion) {
      case 'signo':
        return nudosSigno.includes(nudoNombre);
      case 'numero':
        return nudosNumero.includes(nudoNombre);
      case 'letra':
        return nudosVariable.includes(nudoNombre);
      default:
        return true;
    }
  };

  const handleDrop = (e, factor, seccion) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    // Bloquear drop en factores izquierdos si están validados
    if (factoresIzquierdosValidados && (factor === 'factor1X' || factor === 'factor1Coef')) {
      return;
    }
    
    // Bloquear drop en factores derechos si están validados
    if (factoresDerechosValidados && (factor === 'factor2Const' || factor === 'factor2Num')) {
      return;
    }
    
    // Bloquear drop en factores derechos si los izquierdos no están validados
    if (!factoresIzquierdosValidados && (factor === 'factor2Const' || factor === 'factor2Num')) {
      return;
    }
    
    const nudoNombre = e.dataTransfer.getData('text/plain');
    
    // Validar tipo de nudo para factores izquierdos
    if (factor === 'factor1X' || factor === 'factor1Coef') {
      if (!validarTipoNudo(nudoNombre, seccion)) {
        // Mensaje guiado por tipo de casilla
        const msg = seccion === 'signo'
          ? 'Aquí van los quipus de signos'
          : seccion === 'numero'
          ? 'Aquí van los quipus de números'
          : 'Aquí van los quipus de variables';
        setValidacion({ esCorrecta: false, mensaje: msg, mostrar: true, esAdvertencia: true });
        return;
      }
    }
    
    // Validar tipo de nudo para factores derechos
    if (factor === 'factor2Const' || factor === 'factor2Num') {
      if (!validarTipoNudo(nudoNombre, seccion)) {
        const msg = seccion === 'signo'
          ? 'Aquí van los quipus de signos'
          : seccion === 'numero'
          ? 'Aquí van los quipus de números'
          : 'Aquí van los quipus de variables';
        setValidacion({ esCorrecta: false, mensaje: msg, mostrar: true, esAdvertencia: true });
        return;
      }
    }
    
    setNudosEnFactores(prev => ({
      ...prev,
      [factor]: {
        ...prev[factor],
        [seccion]: nudoNombre
      }
    }));

    // Actualizar valores numéricos
    actualizarValoresDesdeNudos(factor, seccion, nudoNombre);
  };

  // Función para quitar un nudo (doble clic)
  const quitarNudo = (factor, seccion) => {
    // Bloquear quitar nudos en factores izquierdos si están validados
    if (factoresIzquierdosValidados && (factor === 'factor1X' || factor === 'factor1Coef')) {
      return;
    }
    
    // Reactivar botones de resolver cuando se quitan nudos
    setBotonesResolverDeshabilitados(false);
    
    // Bloquear quitar nudos en factores derechos si están validados
    if (factoresDerechosValidados && (factor === 'factor2Const' || factor === 'factor2Num')) {
      return;
    }
    
    // Bloquear quitar nudos en factores derechos si los izquierdos no están validados
    if (!factoresIzquierdosValidados && (factor === 'factor2Const' || factor === 'factor2Num')) {
      return;
    }
    
    setNudosEnFactores(prev => ({
      ...prev,
      [factor]: {
        ...prev[factor],
        [seccion]: null
      }
    }));

    // Limpiar valores cuando se quita un nudo
    if (seccion === 'signo') {
      // Al quitar el signo, resetear a '+' por defecto
      setSignos(prev => ({
        ...prev,
        [factor]: '+'
      }));
    } else if (seccion === 'numero') {
      // Quitar solo el número, mantener la letra si existe
      setValores(prev => ({
        ...prev,
        [factor]: prev[factor].replace(/^\d+/, '')
      }));
    } else if (seccion === 'letra') {
      // Para letras, remover el nudo del array
      setNudosEnFactores(prev => ({
        ...prev,
        [factor]: {
          ...prev[factor],
          letras: []
        }
      }));
      
      // Actualizar el valor removiendo la variable
      setValores(prev => {
        const valorActual = prev[factor] || '';
        const numeroExistente = valorActual.replace(/x²?/g, '');
        console.log(`Nudo de variable removido, Número existente: ${numeroExistente}`);
        
        return {
          ...prev,
          [factor]: numeroExistente
        };
      });
    }
  };

  const actualizarValoresDesdeNudos = (factor, seccion, nudoNombre) => {
    console.log(`Actualizando ${factor} - ${seccion} con ${nudoNombre}`);
    
    // Reactivar botones de resolver cuando se cambian los nudos
    setBotonesResolverDeshabilitados(false);
    
    let nuevoValor = '';
    
    if (seccion === 'signo') {
      if (nudoNombre === 'plus') nuevoValor = '+';
      else if (nudoNombre === 'minus') nuevoValor = '-';
      
      console.log(`Signo ${nudoNombre} para ${factor} = ${nuevoValor}`);
      
      setSignos(prev => ({
        ...prev,
        [factor]: nuevoValor
      }));
      
      // Resetear validaciones cuando se cambia el signo
      resetearValidacionesPorCambioSigno(factor);
    } else if (seccion === 'numero') {
      if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(nudoNombre)) {
        // Obtener el valor actual y la letra existente
        setValores(prev => {
          const valorActual = prev[factor] || '';
          const letraExistente = valorActual.match(/x²?/g) ? valorActual.match(/x²?/g)[0] : '';
          const nuevoValor = nudoNombre + letraExistente;
          console.log(`Número ${nudoNombre} + letra existente ${letraExistente} = ${nuevoValor}`);
          // Combinar número + letra existente
          return {
            ...prev,
            [factor]: nuevoValor
          };
        });
      }
    } else if (seccion === 'letra') {
      // Solo permitir letras en factores izquierdos (término cuadrático)
      if (factor === 'factor2Const' || factor === 'factor2Num') {
        console.log(`No se permiten letras en factores derechos: ${factor}`);
        return;
      }
      
      if (nudoNombre === 'x') {
        // Para factor1X y factor1Coef, agregar nudo rojo y determinar grado
        if (factor === 'factor1X' || factor === 'factor1Coef') {
          // Reemplazar el nudo existente (si hay uno) con el nuevo nudo x
          setNudosEnFactores(prev => ({
            ...prev,
            [factor]: {
              ...prev[factor],
              letras: ['x']
            }
          }));
          
          // Actualizar el valor como x
          setValores(prev => {
            const valorActual = prev[factor] || '';
            const numeroExistente = valorActual.replace(/x²?/g, '');
            const nuevoValor = numeroExistente + 'x';
            console.log(`Nudo x colocado (reemplazando existente), Número existente: ${numeroExistente}, Resultado: ${nuevoValor}`);
            
            return {
              ...prev,
              [factor]: nuevoValor
            };
          });
        }
      } else if (nudoNombre === 'x2') {
        // Para factor1X y factor1Coef, agregar nudo x² directamente
        if (factor === 'factor1X' || factor === 'factor1Coef') {
          // Reemplazar el nudo existente (si hay uno) con el nuevo nudo x2
          setNudosEnFactores(prev => ({
            ...prev,
            [factor]: {
              ...prev[factor],
              letras: ['x2']
            }
          }));
          
          // Actualizar el valor directamente como x²
          setValores(prev => {
            const valorActual = prev[factor] || '';
            const numeroExistente = valorActual.replace(/x²?/g, '');
            const nuevoValor = numeroExistente + 'x²';
            console.log(`Nudo x² colocado (reemplazando existente), Número existente: ${numeroExistente}, Resultado: ${nuevoValor}`);
            
            return {
              ...prev,
              [factor]: nuevoValor
            };
          });
        }
      }
    }
  };

  const [factoresDerechosValidados, setFactoresDerechosValidados] = useState(false);
  const [estadoValidacionIzquierda, setEstadoValidacionIzquierda] = useState(null); // null, 'correcto', 'incorrecto'
  const [estadoValidacionDerecha, setEstadoValidacionDerecha] = useState(null); // null, 'correcto', 'incorrecto'
  const [mostrarProductos, setMostrarProductos] = useState({
    producto1: false,
    producto2: false,
    suma: false
  });

  // Estado para rastrear qué productos han sido resueltos
  const [productosResueltos, setProductosResueltos] = useState({
    producto1: false,
    producto2: false
  });

  const [validacionTanteo, setValidacionTanteo] = useState({
    esCorrecta: null,
    mensaje: '',
    mostrar: false
  });

  const [estadoValidacionTanteo, setEstadoValidacionTanteo] = useState(null); // null, 'correcto', 'incorrecto'
  const [factoresResaltados, setFactoresResaltados] = useState(false); // Para resaltar factores cuando el tanteo es incorrecto
  const [sumaResaltada, setSumaResaltada] = useState(false); // Para resaltar el recuadro de suma cuando es incorrecta
  const [lineasVisibles, setLineasVisibles] = useState({
    linea1: false, // Línea diagonal 1 (factor1X × factor2Num)
    linea2: false  // Línea diagonal 2 (factor1Coef × factor2Const)
  });
  const [ocultarLineasDivision, setOcultarLineasDivision] = useState(false); // Para ocultar líneas de división de factores

  const [mostrarRespuesta, setMostrarRespuesta] = useState(false);
  const [mostrarBotonTrinomio, setMostrarBotonTrinomio] = useState(false); // Para mostrar la respuesta factorizada
  const [mostrarLineaParentesis, setMostrarLineaParentesis] = useState(false); // Para mostrar línea de paréntesis
  const [mostrarLineaParentesisSuperior, setMostrarLineaParentesisSuperior] = useState(false); // Para mostrar línea de paréntesis superior
  const [factoresResaltadosProducto1, setFactoresResaltadosProducto1] = useState(false); // Para resaltar factores del producto 1
  const [factoresResaltadosProducto2, setFactoresResaltadosProducto2] = useState(false); // Para resaltar factores del producto 2
  const [mostrarBotonesValidar, setMostrarBotonesValidar] = useState(true); // Para controlar visibilidad de botones de validar
  
  // Estados específicos para cada factor
  const [factor1XResaltado, setFactor1XResaltado] = useState(false);
  const [factor1CoefResaltado, setFactor1CoefResaltado] = useState(false);
  const [factor2ConstResaltado, setFactor2ConstResaltado] = useState(false);
  const [factor2NumResaltado, setFactor2NumResaltado] = useState(false);
  const [mostrarPrimerParentesis, setMostrarPrimerParentesis] = useState(false); // Para mostrar el primer paréntesis (2x+8)
  const [mostrarSegundoParentesis, setMostrarSegundoParentesis] = useState(false); // Para mostrar el segundo paréntesis (x+2)
  const [factoresSuperioresResaltados, setFactoresSuperioresResaltados] = useState(false); // Para resaltar factores superiores en azul
  const [factoresInferioresResaltados, setFactoresInferioresResaltados] = useState(false); // Para resaltar factores inferiores en verde
  const [botonesResolverDeshabilitados, setBotonesResolverDeshabilitados] = useState(false); // Para deshabilitar botones "Resolver" durante animación
  const [mostrarModal, setMostrarModal] = useState(false); // Para mostrar el modal de felicitaciones
  const [ocultarValidacion, setOcultarValidacion] = useState(false); // Para ocultar validaciones al interactuar
  const [enviando, setEnviando] = useState(false); // Estado de carga para evitar envíos múltiples
  
  // Estados para rastrear validaciones e intentos
  const [tiempoInicioEjercicio, setTiempoInicioEjercicio] = useState(Date.now());
  const [intentosValidacion1, setIntentosValidacion1] = useState(0); // Factores izquierdos
  const [intentosValidacion2, setIntentosValidacion2] = useState(0); // Factores derechos  
  const [intentosValidacion3, setIntentosValidacion3] = useState(0); // Tanteo final
  const [tiempoInicioValidacion1, setTiempoInicioValidacion1] = useState(Date.now());
  const [tiempoInicioValidacion2, setTiempoInicioValidacion2] = useState(Date.now());
  const [tiempoInicioValidacion3, setTiempoInicioValidacion3] = useState(Date.now());

  // Ocultar validaciones automáticamente después de un tiempo
  useEffect(() => {
    let timeoutId;
    
    if (validacion.mostrar || validacionTanteo.mostrar) {
      timeoutId = setTimeout(() => {
        setOcultarValidacion(true);
        // Ocultar las validaciones después de un breve delay
        setTimeout(() => {
          setValidacion(prev => ({ ...prev, mostrar: false }));
          setValidacionTanteo(prev => ({ ...prev, mostrar: false }));
          setOcultarValidacion(false);
        }, 300);
      }, 2000); // 2 segundos para mostrar la validación
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [validacion.mostrar, validacionTanteo.mostrar]);

  // Reactivar botones cuando se validan ambos lados
  useEffect(() => {
    if (factoresIzquierdosValidados && factoresDerechosValidados) {
      setBotonesResolverDeshabilitados(false);
    }
  }, [factoresIzquierdosValidados, factoresDerechosValidados]);

  // Inicializar tiempos cuando cambia la ecuación
  useEffect(() => {
    setTiempoInicioEjercicio(Date.now());
    setTiempoInicioValidacion1(Date.now());
    setTiempoInicioValidacion2(Date.now());
    setTiempoInicioValidacion3(Date.now());
    setIntentosValidacion1(0);
    setIntentosValidacion2(0);
    setIntentosValidacion3(0);
  }, [indiceEcuacion]);

  // Imágenes de nudos (incluyendo operadores)
  const nudosOrden = ['1','2','3','4','5','6','7','8','9','10','x','x2','plus','minus','times','divided'];
  let cargarImagen;
  try {
    const ctx = require.context('../assets/img', false, /\.(png|jpg|jpeg|svg)$/);
    cargarImagen = (nombre) => {
      // Mapear nombres especiales
      let archivo = nombre;
      if (nombre === 'x2') archivo = 'x2';
      if (nombre === 'times') archivo = 'times';
      if (nombre === 'divided') archivo = 'divided';
      
      try { return ctx(`./${archivo}.png`); } catch (e1) {
        try { return ctx(`./${archivo}.svg`); } catch (e2) {
          try { return ctx(`./${archivo}.jpg`); } catch (e3) {
            return null;
          }
        }
      }
    };
  } catch (e) {
    cargarImagen = () => null;
  }

  // Función para obtener los términos de la ecuación actual
  const obtenerTerminosEcuacion = () => {
    switch (ecuacionOriginal) {
      case '2x² - 7x - 15':
        return {
          termino1: '2x²',
          termino2: '- 7x',
          termino3: '- 15',
          coeficienteMedio: -7,
          terminoConstante: -15
        };
      case '2x² + 5x + 2':
        return {
          termino1: '2x²',
          termino2: '+ 5x',
          termino3: '+ 2',
          coeficienteMedio: 5,
          terminoConstante: 2
        };
      case '2x² + 3x + 1':
        return {
          termino1: '2x²',
          termino2: '+ 3x',
          termino3: '+ 1',
          coeficienteMedio: 3,
          terminoConstante: 1
        };
      case '3x² + 5x + 2':
        return {
          termino1: '3x²',
          termino2: '+ 5x',
          termino3: '+ 2',
          coeficienteMedio: 5,
          terminoConstante: 2
        };
      case '4x² + 13x + 3':
        return {
          termino1: '4x²',
          termino2: '+ 13x',
          termino3: '+ 3',
          coeficienteMedio: 13,
          terminoConstante: 3
        };
      case '4x² + 15x + 9':
        return {
          termino1: '4x²',
          termino2: '+ 15x',
          termino3: '+ 9',
          coeficienteMedio: 15,
          terminoConstante: 9
        };
      case '6x⁴ + 5x² - 6':
        return {
          termino1: '6x⁴',
          termino2: '+ 5x²',
          termino3: '- 6',
          coeficienteMedio: 5,
          terminoConstante: -6
        };
      case '12x² - 13x - 35':
        return {
          termino1: '12x²',
          termino2: '- 13x',
          termino3: '- 35',
          coeficienteMedio: -13,
          terminoConstante: -35
        };
      case '3x² + 13x - 10':
        return {
          termino1: '3x²',
          termino2: '+ 13x',
          termino3: '- 10',
          coeficienteMedio: 13,
          terminoConstante: -10
        };
      case '3x² - 5x - 12':
        return {
          termino1: '3x²',
          termino2: '- 5x',
          termino3: '- 12',
          coeficienteMedio: -5,
          terminoConstante: -12
        };
      default:
        return {
          termino1: '2x²',
          termino2: '- 7x',
          termino3: '- 15',
          coeficienteMedio: -7,
          terminoConstante: -15
        };
    }
  };

  const terminos = obtenerTerminosEcuacion();

  // Función para obtener el coeficiente del término cuadrático
  const obtenerCoeficienteCuadratico = () => {
    const termino1 = terminos.termino1;
    if (termino1 === '2x²') return 2;
    if (termino1 === '3x²') return 3;
    if (termino1 === '4x²') return 4;
    if (termino1 === '12x²') return 12;
    return 2; // Valor por defecto
  };

  // Función específica para obtener el coeficiente del término 6x⁴ (retorna 6, el coeficiente)
  const obtenerCoeficienteX4 = () => {
    const termino1 = terminos.termino1;
    if (termino1 === '6x⁴') return 6;
    return 2; // Valor por defecto para otros términos
  };

  // Estados para overlay final (corona) del Reto 3
  const [mostrarCoronaReto3, setMostrarCoronaReto3] = useState(false);
  const [coronaPresionadaReto3, setCoronaPresionadaReto3] = useState(false);
  const [coronaDesaparecidaReto3, setCoronaDesaparecidaReto3] = useState(false);

  const handleCoronaClickReto3 = () => {
    setCoronaDesaparecidaReto3(true);
    setCoronaPresionadaReto3(true);
    setMostrarCoronaReto3(false);
    // Activar el quipu con mensaje final inmediatamente
    setMostrarRespuesta(true);
    setMostrarPrimerParentesis(true);
    setMostrarSegundoParentesis(true);
  };

  // Función para cambiar a la siguiente ecuación o terminar
  const cambiarSiguienteEcuacion = async () => {
    // Evitar envíos múltiples
    if (enviando) {
      return;
    }

    // Activar estado de carga
    setEnviando(true);

    // Guardar la respuesta del ejercicio completado
    if (sesionJuego) {
      try {
        // Calcular tiempos reales para cada validación
        const tiempoValidacion1 = Math.round((Date.now() - tiempoInicioValidacion1) / 1000);
        const tiempoValidacion2 = Math.round((Date.now() - tiempoInicioValidacion2) / 1000);
        const tiempoValidacion3 = Math.round((Date.now() - tiempoInicioValidacion3) / 1000);
        
        await apiService.guardarRespuestaReto3({
          sesionId: sesionJuego.id,
          ejercicioNumero: indiceEcuacion + 1,
          ecuacionOriginal: ecuaciones[indiceEcuacion],
          validacion1: {
            correcta: estadoValidacionIzquierda === 'correcto',
            intento: intentosValidacion1,
            tiempo: tiempoValidacion1,
            respuesta: 'Validación de factores izquierdos'
          },
          validacion2: {
            correcta: estadoValidacionDerecha === 'correcto',
            intento: intentosValidacion2,
            tiempo: tiempoValidacion2,
            respuesta: 'Validación de factores derechos'
          },
          validacion3: {
            correcta: estadoValidacionTanteo === 'correcto',
            intento: intentosValidacion3,
            tiempo: tiempoValidacion3,
            respuesta: 'Validación del método de tanteo'
          }
        });
        console.log(`✅ Ejercicio ${indiceEcuacion + 1} del Reto 3 guardado en el backend`);
      } catch (error) {
        console.error('❌ Error al guardar ejercicio del Reto 3:', error);
      }
    }

    // Desactivar estado de carga
    setEnviando(false);

    // Si es la última ecuación, mostrar modal de felicitaciones
    if (indiceEcuacion === ecuaciones.length - 1) {
      // Mostrar overlay de corona (estilo Reto 1/2) para finalizar
      setMostrarCoronaReto3(true);
      return;
    }
    
    const nuevoIndice = (indiceEcuacion + 1) % ecuaciones.length;
    setIndiceEcuacion(nuevoIndice);
    setEcuacionOriginal(ecuaciones[nuevoIndice]);
    
    // Actualizar términos según la ecuación
    if (ecuaciones[nuevoIndice] === '2x² + 5x + 2') {
      // Actualizar términos para 2x² + 5x + 2
      // Los términos se actualizarán automáticamente en el render
    }
    
    // Resetear todos los estados
    setValores({
      factor1X: '',
      factor1Coef: '',
      factor2Const: '',
      factor2Num: '',
      producto1: '',
      producto2: '',
      suma: ''
    });
    
    setSignos({
      factor1X: '+',
      factor1Coef: '+',
      factor2Const: '+',
      factor2Num: '+'
    });
    
    setValidacion({
      esCorrecta: null,
      mensaje: '',
      mostrar: false
    });
    
    setFactoresIzquierdosValidados(false);
    setFactoresDerechosValidados(false);
    setEstadoValidacionIzquierda(null);
    setEstadoValidacionDerecha(null);
    setMostrarProductos({
      producto1: false,
      producto2: false,
      suma: false
    });
    setProductosResueltos({
      producto1: false,
      producto2: false
    });
    
    setValidacionTanteo({
      esCorrecta: null,
      mensaje: '',
      mostrar: false
    });
    
    setEstadoValidacionTanteo(null);
    setFactoresResaltados(false);
    setSumaResaltada(false);
    setLineasVisibles({
      linea1: false,
      linea2: false
    });
    setOcultarLineasDivision(false);
    
    setMostrarRespuesta(false);
    setMostrarBotonTrinomio(false);
    setMostrarLineaParentesis(false);
    setMostrarLineaParentesisSuperior(false);
    setFactoresResaltadosProducto1(false);
    setFactoresResaltadosProducto2(false);
    // Resetear estados específicos de factores
    setFactor1XResaltado(false);
    setFactor1CoefResaltado(false);
    setFactor2ConstResaltado(false);
    setFactor2NumResaltado(false);
    setMostrarPrimerParentesis(false);
    setMostrarSegundoParentesis(false);
    setFactoresSuperioresResaltados(false);
    setFactoresInferioresResaltados(false);
    setBotonesResolverDeshabilitados(false);
    
    // Resetear estados de animación específicos para evitar activación automática
    setFactoresResaltados(false);
    setSumaResaltada(false);
    setLineasVisibles({ linea1: false, linea2: false });
    setMostrarProductos({ producto1: false, producto2: false, suma: false });
    setMostrarBotonesValidar(true); // Mostrar botones de validar al reiniciar
    
    // Limpiar nudos en factores
    setNudosEnFactores({
      factor1X: { signo: null, numero: null, letra: null },
      factor1Coef: { signo: null, numero: null, letra: null },
      factor2Const: { signo: null, numero: null, letra: null },
      factor2Num: { signo: null, numero: null, letra: null }
    });
    
    // Limpiar productos con nudos
    setProductosConNudos({
      producto1: [],
      producto2: [],
      suma: []
    });
  };

  // Función para actualizar valores en tiempo real
  const actualizarValor = (campo, valor) => {
    setValores(prev => ({
      ...prev,
      [campo]: valor
    }));

    // Desactivar validaciones cuando se modifica un factor
    if (campo === 'factor1X' || campo === 'factor1Coef') {
      setFactoresIzquierdosValidados(false);
      setEstadoValidacionIzquierda(null);
    }
    if (campo === 'factor2Const' || campo === 'factor2Num') {
      setFactoresDerechosValidados(false);
      setEstadoValidacionDerecha(null);
    }

    // Resetear productos resueltos cuando se cambian los factores
    setProductosResueltos({
      producto1: false,
      producto2: false
    });

    // Resetear validación de tanteo cuando se modifican factores
    setEstadoValidacionTanteo(null);
    setFactoresResaltados(false); // Quitar resaltado al modificar factores
    setSumaResaltada(false); // Quitar resaltado de suma al modificar factores
    setLineasVisibles({ linea1: false, linea2: false }); // Ocultar líneas al modificar factores
    setMostrarRespuesta(false); // Ocultar respuesta al modificar factores
    setMostrarBotonTrinomio(false); // Ocultar botón al modificar factores
    setMostrarLineaParentesis(false); // Ocultar línea de paréntesis al modificar factores
    setMostrarLineaParentesisSuperior(false); // Ocultar línea de paréntesis superior al modificar factores
    setFactoresResaltadosProducto1(false); // Ocultar resaltado de factores del producto 1
    setFactoresResaltadosProducto2(false); // Ocultar resaltado de factores del producto 2
    setMostrarPrimerParentesis(false);
    setMostrarSegundoParentesis(false);
    setFactoresSuperioresResaltados(false);
    setFactoresInferioresResaltados(false);
    setBotonesResolverDeshabilitados(false);

    // Limpiar productos cuando se modifican factores
    setValores(prev => ({
      ...prev,
      producto1: '',
      producto2: '',
      suma: ''
    }));

    // Ocultar productos cuando se modifican factores
    setMostrarProductos({
      producto1: false,
      producto2: false,
      suma: false
    });
  };

  // Función para resetear validaciones cuando cambian los signos
  const resetearValidacionesPorCambioSigno = (factor) => {
    // Desactivar validaciones cuando se cambia un signo
    if (factor === 'factor1X' || factor === 'factor1Coef') {
      setFactoresIzquierdosValidados(false);
      setEstadoValidacionIzquierda(null);
    }
    if (factor === 'factor2Const' || factor === 'factor2Num') {
      setFactoresDerechosValidados(false);
      setEstadoValidacionDerecha(null);
    }

    // Resetear productos resueltos cuando se cambian los signos
    setProductosResueltos({
      producto1: false,
      producto2: false
    });

    // Resetear validación de tanteo cuando se cambian signos
    setEstadoValidacionTanteo(null);
    setFactoresResaltados(false); // Quitar resaltado al cambiar signos
    setSumaResaltada(false); // Quitar resaltado de suma al cambiar signos
    setLineasVisibles({ linea1: false, linea2: false }); // Ocultar líneas al cambiar signos
    setMostrarRespuesta(false); // Ocultar respuesta al cambiar signos
    setMostrarBotonTrinomio(false); // Ocultar botón al cambiar signos
    setMostrarLineaParentesis(false); // Ocultar línea de paréntesis al cambiar signos
    setMostrarLineaParentesisSuperior(false); // Ocultar línea de paréntesis superior al cambiar signos
    setFactoresResaltadosProducto1(false); // Ocultar resaltado de factores del producto 1
    setFactoresResaltadosProducto2(false); // Ocultar resaltado de factores del producto 2
    setMostrarPrimerParentesis(false);
    setMostrarSegundoParentesis(false);
    setFactoresSuperioresResaltados(false);
    setFactoresInferioresResaltados(false);
    setBotonesResolverDeshabilitados(false);

    // Limpiar productos cuando se cambian signos
    setValores(prev => ({
      ...prev,
      producto1: '',
      producto2: '',
      suma: ''
    }));

    // Ocultar productos cuando se cambian signos
    setMostrarProductos({
      producto1: false,
      producto2: false,
      suma: false
    });
  };

  // Función para obtener clases de validación de factores
  const obtenerClasesValidacionFactores = (estadoValidacion) => {
    if (estadoValidacion === 'correcto') {
      return 'factor-correcto';
    } else if (estadoValidacion === 'incorrecto') {
      return 'factor-incorrecto';
    }
    return '';
  };

  // Función para generar icono de checkmark SVG circular
  const IconoCheckmarkBonito = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#28a745" stroke="#1e7e34" strokeWidth="2"/>
      <path d="M12 16l3 3 6-6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // Función para generar icono de error SVG circular
  const IconoErrorBonito = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#dc3545" stroke="#c82333" strokeWidth="2"/>
      <path d="M19 13l-6 6M13 13l6 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // Función para generar icono de advertencia SVG circular (amarillo)
  const IconoAdvertenciaBonito = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#ffc107" stroke="#e0a800" strokeWidth="2"/>
      <path d="M16 8v8M16 20h.01" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // Función para manejar el foco en inputs de factores
  const manejarFocoFactor = (campo) => {
    // Resetear estados de validación inmediatamente al hacer foco
    if (campo === 'factor1X' || campo === 'factor1Coef') {
      setFactoresIzquierdosValidados(false);
      setEstadoValidacionIzquierda(null);
    }
    if (campo === 'factor2Const' || campo === 'factor2Num') {
      setFactoresDerechosValidados(false);
      setEstadoValidacionDerecha(null);
    }

    // Resetear productos resueltos cuando se hace foco en un factor
    setProductosResueltos({
      producto1: false,
      producto2: false
    });
    
    // Resetear otros estados visuales
    setEstadoValidacionTanteo(null);
    setFactoresResaltados(false);
    setSumaResaltada(false);
    setLineasVisibles({ linea1: false, linea2: false });
    setMostrarRespuesta(false);
    setMostrarBotonTrinomio(false);
    setMostrarLineaParentesis(false);
    setMostrarLineaParentesisSuperior(false);
    setFactoresResaltadosProducto1(false);
    setFactoresResaltadosProducto2(false);
    // Resetear estados específicos de factores
    setFactor1XResaltado(false);
    setFactor1CoefResaltado(false);
    setFactor2ConstResaltado(false);
    setFactor2NumResaltado(false);
    setMostrarPrimerParentesis(false);
    setMostrarSegundoParentesis(false);
    setFactoresSuperioresResaltados(false);
    setFactoresInferioresResaltados(false);
    setBotonesResolverDeshabilitados(false);
  };

  // Función para cerrar el modal
  const cerrarModal = () => {
    setMostrarModal(false);
  };

  // Funciones para el modal de instrucciones
  const cerrarInstrucciones = () => {
    // Función deshabilitada - no hay navegación al inicio
  };

  const comenzarAventura = () => {
    // Solo quitar el modal para mostrar la página de factorización
    setMostrarInstrucciones(false);
  };

  // Función para completar el reto 3 directamente
  const handleCompletarReto3 = () => {
    // Mostrar la corona directamente como si hubiera completado todos los ejercicios
    setMostrarCoronaReto3(true);
  };


  // Función para ver tabla de resultados
  const verTablaResultados = () => {
    // Aquí puedes implementar la lógica para mostrar la tabla de resultados
    alert('Función de tabla de resultados en desarrollo');
    setMostrarModal(false);
  };

  // Función para manejar la animación secuencial del resultado
  const manejarResultadoSecuencial = () => {
    // Ocultar líneas diagonales
    setLineasVisibles({ linea1: false, linea2: false });
    
    // Deshabilitar botones "Resolver" durante la animación
    setBotonesResolverDeshabilitados(true);
    
    // Limpiar colores de los botones "Resolver"
    setFactoresResaltadosProducto1(false);
    setFactoresResaltadosProducto2(false);
    // Resetear estados específicos de factores
    setFactor1XResaltado(false);
    setFactor1CoefResaltado(false);
    setFactor2ConstResaltado(false);
    setFactor2NumResaltado(false);
    
    // Paso 1: Resaltar factores superiores en azul, mostrar línea superior y primer paréntesis
    setFactoresSuperioresResaltados(true);
    setMostrarLineaParentesisSuperior(true);
    setMostrarPrimerParentesis(true);
    
    // Paso 2: Después de 1.5 segundos, resaltar factores inferiores en verde, mostrar línea inferior y segundo paréntesis
    setTimeout(() => {
      setFactoresInferioresResaltados(true);
      setMostrarLineaParentesis(true);
      setMostrarSegundoParentesis(true);
    }, 1500);
  };

  // Función para manejar botones individuales de resolver
  const manejarResolverIndividual = (producto) => {
    if (factoresIzquierdosValidados && factoresDerechosValidados) {
      // Calcular solo el producto específico
      calcularProductoIndividual(producto);

      // Solo mostrar si no está ya visible, no alternar
      setMostrarProductos(prev => ({
        ...prev,
        [producto]: true
      }));

      // Marcar el producto como resuelto (solo para producto1 y producto2)
      if (producto === 'producto1' || producto === 'producto2') {
        setProductosResueltos(prev => ({
          ...prev,
          [producto]: true
        }));
      }

      // Si se resuelve la suma, deshabilitar los botones de resolver de productos individuales
      if (producto === 'suma') {
        setBotonesResolverDeshabilitados(true);
      }

      // Aplicar estilos de conexión por colores (solo cambiar el ORDEN solicitado)
      if (producto === 'producto1') {
        // Primer botón (producto1): resaltar segundo factor izquierdo y primer factor derecho + línea AZUL
        setFactor1CoefResaltado(true);
        setFactor2ConstResaltado(true);
      } else if (producto === 'producto2') {
        // Segundo botón (producto2): resaltar primer factor izquierdo y segundo factor derecho + línea VERDE
        setFactor1XResaltado(true);
        setFactor2NumResaltado(true);
      }

      // Mostrar líneas específicas según el producto que se resuelve (acumulativo)
      if (producto === 'producto1') {
        // Primer botón: línea diagonal VERDE (linea1)
        setLineasVisibles(prev => ({ ...prev, linea1: true }));
      } else if (producto === 'producto2') {
        // Segundo botón: línea diagonal AZUL (linea2)
        setLineasVisibles(prev => ({ ...prev, linea2: true }));
      } else if (producto === 'suma') {
        // Suma: ambas multiplicaciones - Ambas líneas
        setLineasVisibles({ linea1: true, linea2: true });
        
        // Ocultar las líneas de división de los factores
        setOcultarLineasDivision(true);
        
        // Ocultar las líneas diagonales después de un breve delay
        setTimeout(() => {
          setLineasVisibles({ linea1: false, linea2: false });
        }, 1000);
      }

      // Si es la suma, validar el método de tanteo automáticamente después del cálculo
      if (producto === 'suma') {
        // Mostrar botón del trinomio después de que se oculten las líneas
        setTimeout(() => {
          setMostrarBotonTrinomio(true);
          validarMetodoTanteoConValor();
        }, 1200); // 200ms después de que se oculten las líneas (1000ms + 200ms)
      }
    }
  };

  // Función para validar el método de tanteo con valor directo
  const validarMetodoTanteoConValor = () => {
    try {
      // Incrementar intentos de validación 3
      setIntentosValidacion3(prev => prev + 1);
      
      // Calcular la suma directamente con los valores actuales
      const factor1X = valores.factor1X;
      const factor1Coef = valores.factor1Coef;
      const factor2Const = valores.factor2Const;
      const factor2Num = valores.factor2Num;

      // Calcular producto 1: factor1X × factor2Num
      const coef1X = factor1X === 'x' ? 1 : parseFloat(factor1X.replace('x', '')) || 0;
      const coef2Num = parseFloat(factor2Num) || 0;
      const signo1X = signos.factor1X === '+' ? 1 : -1;
      const signo2Num = signos.factor2Num === '+' ? 1 : -1;
      const producto1Calculado = coef1X * coef2Num * signo1X * signo2Num;

      // Calcular producto 2: factor1Coef × factor2Const
      const coef1Coef = factor1Coef === 'x' ? 1 : parseFloat(factor1Coef.replace('x', '')) || 0;
      const coef2Const = parseFloat(factor2Const) || 0;
      const signo1Coef = signos.factor1Coef === '+' ? 1 : -1;
      const signo2Const = signos.factor2Const === '+' ? 1 : -1;
      const producto2Calculado = coef1Coef * coef2Const * signo1Coef * signo2Const;

      // Calcular suma
      const sumaCalculada = producto1Calculado + producto2Calculado;

      // El término medio del trinomio (coeficiente dinámico)
      const terminoMedioTrinomio = terminos.coeficienteMedio;

      if (sumaCalculada === terminoMedioTrinomio) {
        setValidacionTanteo({
          esCorrecta: true,
          mensaje: `¡Correcto! La suma de productos es igual al término medio del trinomio (${terminos.coeficienteMedio}x).`,
          mostrar: true
        });
        setEstadoValidacionTanteo('correcto');
        setFactoresResaltados(false); // Quitar resaltado cuando es correcto
        setSumaResaltada(false); // Quitar resaltado de suma cuando es correcto
        setMostrarBotonesValidar(false); // Ocultar botones de validar cuando es correcto
        // Ocultar validación de factores cuando se valida tanteo
        setValidacion({
          esCorrecta: null,
          mensaje: '',
          mostrar: false
        });
      } else {
        setValidacionTanteo({
          esCorrecta: false,
          mensaje: `La suma de productos (${sumaCalculada}x) no es igual al término medio del trinomio (${terminos.coeficienteMedio}x). Debes cambiar los valores o signos de los factores para que coincidan.`,
          mostrar: true
        });
        setEstadoValidacionTanteo('incorrecto');
        setFactoresResaltados(true); // Resaltado de factores cuando es incorrecto
        setSumaResaltada(true); // Resaltado de suma cuando es incorrecto
        // Desbloquear factores para permitir cambios
        setFactoresIzquierdosValidados(false);
        setFactoresDerechosValidados(false);
        // Ocultar botón de resolver trinomio
        setMostrarBotonTrinomio(false);
        // Ocultar validación de factores cuando se valida tanteo
        setValidacion({
          esCorrecta: null,
          mensaje: '',
          mostrar: false
        });
      }
    } catch (error) {
      console.log('Error en validación de tanteo:', error);
      setValidacionTanteo({
        esCorrecta: false,
        mensaje: 'Error al validar el método de tanteo',
        mostrar: true
      });
    }
  };

  // Función para validar el método de tanteo
  const validarMetodoTanteo = () => {
    try {
      if (!valores.suma) {
        setValidacionTanteo({
          esCorrecta: false,
          mensaje: 'Primero debes resolver la suma de productos',
          mostrar: true
        });
        return;
      }

      // Extraer el coeficiente de la suma calculada
      const sumaCalculada = parseFloat(valores.suma.replace('x', '')) || 0;

      // El término medio del trinomio (coeficiente dinámico)
      const terminoMedioTrinomio = terminos.coeficienteMedio;

      if (sumaCalculada === terminoMedioTrinomio) {
        setValidacionTanteo({
          esCorrecta: true,
          mensaje: `¡Correcto! La suma de productos es igual al término medio del trinomio (${terminos.coeficienteMedio}x).`,
          mostrar: true
        });
      } else {
        setValidacionTanteo({
          esCorrecta: false,
          mensaje: `La suma de productos (${sumaCalculada}x) no es igual al término medio del trinomio (${terminos.coeficienteMedio}x). Debes cambiar los valores o signos de los factores para que coincidan.`,
          mostrar: true
        });
      }
    } catch (error) {
      console.log('Error en validación de tanteo:', error);
      setValidacionTanteo({
        esCorrecta: false,
        mensaje: 'Error al validar el método de tanteo',
        mostrar: true
      });
    }
  };

  // Función para generar nudos basados en el resultado numérico
  const generarNudosParaProducto = (resultado) => {
    const nudos = [];
    const valorAbsoluto = Math.abs(resultado);
    const esNegativo = resultado < 0;
    
    // Agregar signo si es negativo
    if (esNegativo) {
      nudos.push('minus');
    }
    
    // Agregar nudos para el coeficiente numérico
    if (valorAbsoluto === 10) {
      // Usar el nudo "10" directamente
      nudos.push('10');
    } else if (valorAbsoluto > 10) {
      // Para números mayores a 10, crear hilos: cada decena = '10', unidades = un único hilo con el número exacto
      const decenas = Math.floor(valorAbsoluto / 10);
      const unidades = valorAbsoluto % 10;
      
      // Repetir el hilo '10' por cada decena
      for (let i = 0; i < decenas; i++) {
        nudos.push('10');
      }
      
      // Agregar un hilo con el número de unidades si las hay
      if (unidades > 0) {
        nudos.push(unidades.toString());
      }
    } else {
      // Para números menores a 10: un solo hilo con ese número
      nudos.push(valorAbsoluto.toString());
    }
    
    // No agregar variable aquí, se manejará en la función que llama
    
    return nudos;
  };

  // Función para generar nudos basados en el resultado completo (coeficiente + variable)
  const generarNudosParaProductoCompleto = (resultadoCompleto) => {
    const nudos = [];
    
    // Extraer el coeficiente y la variable del resultado completo
    const match = resultadoCompleto.match(/^(-?\d+)(x²?|x³?|x⁴?)?$/);
    if (!match) return nudos;
    
    const coeficiente = parseInt(match[1]);
    const variable = match[2] || '';
    const valorAbsoluto = Math.abs(coeficiente);
    const esNegativo = coeficiente < 0;
    
    // Agregar signo (siempre: positivo o negativo)
    if (esNegativo) {
      nudos.push('minus');
    } else {
      nudos.push('plus');
    }
    
    // Agregar nudos para el coeficiente numérico
    if (valorAbsoluto === 10) {
      nudos.push('10');
    } else if (valorAbsoluto > 10) {
      const decenas = Math.floor(valorAbsoluto / 10);
      const unidades = valorAbsoluto % 10;
      // Repetir el hilo '10' por cada decena
      for (let i = 0; i < decenas; i++) {
        nudos.push('10');
      }
      // Un único hilo con el número de unidades
      if (unidades > 0) {
        nudos.push(unidades.toString());
      }
    } else {
      // Para números menores a 10: un solo hilo con ese número
      nudos.push(valorAbsoluto.toString());
    }
    
    // Agregar nudos para la variable
    if (variable === 'x') {
      nudos.push('x');
    } else if (variable === 'x²') {
      nudos.push('x2');
    } else if (variable === 'x³') {
      nudos.push('x3');
    } else if (variable === 'x⁴') {
      nudos.push('x4');
    }
    
    return nudos;
  };

  // Función para calcular un producto individual
  const calcularProductoIndividual = (producto) => {
    try {
      if (!valores.factor1X || !valores.factor1Coef || !valores.factor2Const || !valores.factor2Num) {
        return;
      }

      const factor1X = valores.factor1X;
      const factor1Coef = valores.factor1Coef;
      const factor2Const = valores.factor2Const;
      const factor2Num = valores.factor2Num;

      let valorCalculado = '';
      let nudosParaProducto = [];

      if (producto === 'producto1') {
        // Producto 1: factor1Coef × factor2Const (1x × 3 = 3x)
        const coef1Coef = factor1Coef === 'x' ? 1 : parseFloat(factor1Coef.replace('x', '')) || 0;
        const coef2Const = parseFloat(factor2Const) || 0;
        const signo1Coef = signos.factor1Coef === '+' ? 1 : -1;
        const signo2Const = signos.factor2Const === '+' ? 1 : -1;
        const producto1Calculado = coef1Coef * coef2Const * signo1Coef * signo2Const;
        
        // Calcular el grado de la variable resultante
        const grado1Coef = factor1Coef.includes('x²') ? 2 : (factor1Coef.includes('x') ? 1 : 0);
        const grado2Const = 0; // factor2Const es constante
        const gradoResultante = grado1Coef + grado2Const;
        
        const variableResultante = gradoResultante === 0 ? '' : gradoResultante === 1 ? 'x' : gradoResultante === 2 ? 'x²' : gradoResultante === 3 ? 'x³' : gradoResultante === 4 ? 'x⁴' : `x^${gradoResultante}`;
        valorCalculado = `${producto1Calculado}${variableResultante}`;
        
        // Generar nudos para el producto1
        nudosParaProducto = generarNudosParaProductoCompleto(valorCalculado);
        
        // Imprimir en consola el resultado numérico
        console.log(`Producto1 resultado numérico: ${producto1Calculado}${variableResultante}`);
        
      } else if (producto === 'producto2') {
        // Producto 2: factor1X × factor2Num (2x × -5 = -10x)
        const coef1X = factor1X === 'x' ? 1 : parseFloat(factor1X.replace('x', '')) || 0;
        const coef2Num = parseFloat(factor2Num) || 0;
        const signo1X = signos.factor1X === '+' ? 1 : -1;
        const signo2Num = signos.factor2Num === '+' ? 1 : -1;
        const producto2Calculado = coef1X * coef2Num * signo1X * signo2Num;
        
        // Calcular el grado de la variable resultante
        const grado1X = factor1X.includes('x²') ? 2 : (factor1X.includes('x') ? 1 : 0);
        const grado2Num = 0; // factor2Num es constante
        const gradoResultante = grado1X + grado2Num;
        
        const variableResultante = gradoResultante === 0 ? '' : gradoResultante === 1 ? 'x' : gradoResultante === 2 ? 'x²' : gradoResultante === 3 ? 'x³' : gradoResultante === 4 ? 'x⁴' : `x^${gradoResultante}`;
        valorCalculado = `${producto2Calculado}${variableResultante}`;
        
        // Generar nudos para el producto2
        nudosParaProducto = generarNudosParaProductoCompleto(valorCalculado);
        
        // Imprimir en consola el resultado numérico
        console.log(`Producto2 resultado numérico: ${producto2Calculado}${variableResultante}`);
        
      } else if (producto === 'suma') {
        // Calcular suma solo si ambos productos están disponibles
        // Producto 1: factor1Coef × factor2Const
        const coef1Coef = factor1Coef === 'x' ? 1 : parseFloat(factor1Coef.replace('x', '')) || 0;
        const coef2Const = parseFloat(factor2Const) || 0;
        const signo1Coef = signos.factor1Coef === '+' ? 1 : -1;
        const signo2Const = signos.factor2Const === '+' ? 1 : -1;
        const producto1Calculado = coef1Coef * coef2Const * signo1Coef * signo2Const;

        // Producto 2: factor1X × factor2Num
        const coef1X = factor1X === 'x' ? 1 : parseFloat(factor1X.replace('x', '')) || 0;
        const coef2Num = parseFloat(factor2Num) || 0;
        const signo1X = signos.factor1X === '+' ? 1 : -1;
        const signo2Num = signos.factor2Num === '+' ? 1 : -1;
        const producto2Calculado = coef1X * coef2Num * signo1X * signo2Num;

        const sumaCalculada = producto1Calculado + producto2Calculado;
        // Determinar el grado correcto para la suma según los factores involucrados
        const grado1 = factor1Coef.includes('x⁴') ? 4 : factor1Coef.includes('x³') ? 3 : factor1Coef.includes('x²') ? 2 : (factor1Coef.includes('x') ? 1 : 0);
        const grado2 = factor1X.includes('x⁴') ? 4 : factor1X.includes('x³') ? 3 : factor1X.includes('x²') ? 2 : (factor1X.includes('x') ? 1 : 0);
        const gradoSuma = Math.max(grado1, grado2);
        const variableSuma = gradoSuma === 0 ? '' : gradoSuma === 1 ? 'x' : gradoSuma === 2 ? 'x²' : gradoSuma === 3 ? 'x³' : gradoSuma === 4 ? 'x⁴' : `x^${gradoSuma}`;
        valorCalculado = `${sumaCalculada}${variableSuma}`;
        
        // Generar nudos para la suma
        nudosParaProducto = generarNudosParaProducto(sumaCalculada);
        
        // Imprimir en consola el resultado numérico de la suma
        console.log(`Suma resultado numérico: ${sumaCalculada}${variableSuma}`);
      }

      if (valorCalculado && !valorCalculado.includes('NaN')) {
        setValores(prev => ({
          ...prev,
          [producto]: valorCalculado
        }));
        
        // Actualizar nudos para el producto específico
        if (producto === 'producto1' || producto === 'producto2' || producto === 'suma') {
          setProductosConNudos(prev => ({
            ...prev,
            [producto]: nudosParaProducto
          }));
        }
      }
    } catch (error) {
      console.log('Error en cálculo individual:', error);
    }
  };

  // Función para calcular productos
  const calcularProductos = () => {
    try {
      if (!valores.factor1X || !valores.factor1Coef || !valores.factor2Const || !valores.factor2Num) {
        return;
      }

      // Calcular productos basándose en los factores
      const factor1X = valores.factor1X;
      const factor1Coef = valores.factor1Coef;
      const factor2Const = valores.factor2Const;
      const factor2Num = valores.factor2Num;

      // Producto 1: factor1X × factor2Num (1x × -5 = -5x)
      const coef1X = factor1X === 'x' ? 1 : parseFloat(factor1X.replace('x', '')) || 0;
      const coef2Num = parseFloat(factor2Num) || 0;
      const signo1X = signos.factor1X === '+' ? 1 : -1;
      const signo2Num = signos.factor2Num === '+' ? 1 : -1;
      const producto1Calculado = coef1X * coef2Num * signo1X * signo2Num;

      // Producto 2: factor1Coef × factor2Const (2x × 3 = 6x)
      const coef1Coef = factor1Coef === 'x' ? 1 : parseFloat(factor1Coef.replace('x', '')) || 0;
      const coef2Const = parseFloat(factor2Const) || 0;
      const signo1Coef = signos.factor1Coef === '+' ? 1 : -1;
      const signo2Const = signos.factor2Const === '+' ? 1 : -1;
      const producto2Calculado = coef1Coef * coef2Const * signo1Coef * signo2Const;

      // Calcular suma
      const sumaCalculada = producto1Calculado + producto2Calculado;

      // Determinar grados según factores para formar variable correcta
      const gradoProd1 = (factor1X.includes('x⁴') ? 4 : factor1X.includes('x³') ? 3 : factor1X.includes('x²') ? 2 : (factor1X.includes('x') ? 1 : 0));
      const gradoProd2 = (factor1Coef.includes('x⁴') ? 4 : factor1Coef.includes('x³') ? 3 : factor1Coef.includes('x²') ? 2 : (factor1Coef.includes('x') ? 1 : 0));
      const var1 = gradoProd1 === 0 ? '' : gradoProd1 === 1 ? 'x' : gradoProd1 === 2 ? 'x²' : gradoProd1 === 3 ? 'x³' : gradoProd1 === 4 ? 'x⁴' : `x^${gradoProd1}`;
      const var2 = gradoProd2 === 0 ? '' : gradoProd2 === 1 ? 'x' : gradoProd2 === 2 ? 'x²' : gradoProd2 === 3 ? 'x³' : gradoProd2 === 4 ? 'x⁴' : `x^${gradoProd2}`;
      const gradoSuma = Math.max(gradoProd1, gradoProd2);
      const varSuma = gradoSuma === 0 ? '' : gradoSuma === 1 ? 'x' : gradoSuma === 2 ? 'x²' : gradoSuma === 3 ? 'x³' : gradoSuma === 4 ? 'x⁴' : `x^${gradoSuma}`;

      if (!isNaN(producto1Calculado) && !isNaN(producto2Calculado)) {
        setValores(prev => ({
          ...prev,
          producto1: `${producto1Calculado}${var1}`,
          producto2: `${producto2Calculado}${var2}`,
          suma: `${sumaCalculada}${varSuma}`
        }));
      }
    } catch (error) {
      console.log('Error en cálculo:', error);
    }
  };


  // Función para validar la multiplicación de factores de la columna derecha
  const validarMultiplicacionFactoresDerechos = () => {
    try {
      // Incrementar intentos de validación 2
      setIntentosValidacion2(prev => prev + 1);
      
      // Verificar que los signos hayan sido colocados por el usuario
      if (!nudosEnFactores.factor2Const.signo || !nudosEnFactores.factor2Num.signo) {
        setValidacion({
          esCorrecta: false,
          mensaje: 'Por favor, coloca los signos',
          mostrar: true
        });
        return;
      }

      // Verificar que los números estén colocados
      if (!nudosEnFactores.factor2Const.numero || !nudosEnFactores.factor2Num.numero) {
        setValidacion({
          esCorrecta: false,
          mensaje: 'Por favor, coloca los números',
          mostrar: true
        });
        return;
      }

      // Extraer coeficientes y variables de los factores
      const coef2Const = parseFloat(valores.factor2Const) || 0;
      const coef2Num = parseFloat(valores.factor2Num) || 0;

      // Aplicar signos
      const signo2Const = signos.factor2Const === '+' ? 1 : -1;
      const signo2Num = signos.factor2Num === '+' ? 1 : -1;

      const factor1Final = coef2Const * signo2Const;
      const factor2Final = coef2Num * signo2Num;

      // Calcular la multiplicación
      const multiplicacion = factor1Final * factor2Final;

      // Verificar si da el término constante correcto
      if (multiplicacion === terminos.terminoConstante) {
        setValidacion({
          esCorrecta: true,
          mensaje: `¡Correcto! La multiplicación de los factores da ${terminos.terminoConstante}`,
          mostrar: true
        });
        setFactoresDerechosValidados(true);
        setEstadoValidacionDerecha('correcto');
        // Ocultar validación de tanteo cuando se validan factores
        setValidacionTanteo({
          esCorrecta: null,
          mensaje: '',
          mostrar: false
        });
      } else {
        setValidacion({
          esCorrecta: false,
          mensaje: `Incorrecto. La multiplicación de los factores debe ser ${terminos.terminoConstante}`,
          mostrar: true
        });
        setFactoresDerechosValidados(false);
        setEstadoValidacionDerecha('incorrecto');
        // Ocultar validación de tanteo cuando se validan factores
        setValidacionTanteo({
          esCorrecta: null,
          mensaje: '',
          mostrar: false
        });
      }
    } catch (error) {
      setValidacion({
        esCorrecta: false,
        mensaje: 'Error en la validación. Revisa el formato de tus respuestas',
        mostrar: true
      });
    }
  };

  // Función para validar la multiplicación de factores
  const validarMultiplicacionFactores = () => {
    try {
      // Incrementar intentos de validación 1
      setIntentosValidacion1(prev => prev + 1);
      
      // Debug: mostrar valores actuales
      console.log('Valores actuales:', valores.factor1X, valores.factor1Coef);
      console.log('Signos actuales:', signos.factor1X, signos.factor1Coef);
      
      // Verificar que los signos hayan sido colocados por el usuario
      if (!nudosEnFactores.factor1X.signo || !nudosEnFactores.factor1Coef.signo) {
        setValidacion({
          esCorrecta: false,
          mensaje: 'Por favor, coloca los signos',
          mostrar: true
        });
        return;
      }

      // Verificar que los números estén colocados
      if (!nudosEnFactores.factor1X.numero || !nudosEnFactores.factor1Coef.numero) {
        setValidacion({
          esCorrecta: false,
          mensaje: 'Por favor, coloca los números',
          mostrar: true
        });
        return;
      }

      // Verificar que las variables estén colocadas
      if (!nudosEnFactores.factor1X.letra || !nudosEnFactores.factor1Coef.letra) {
        setValidacion({
          esCorrecta: false,
          mensaje: 'Por favor, coloca las variables',
          mostrar: true
        });
        return;
      }

      // Extraer coeficientes y variables de los factores
      const coef1X = valores.factor1X === 'x' ? 1 : parseFloat(valores.factor1X.replace('x', '')) || 0;
      const coef1Coef = valores.factor1Coef === 'x' ? 1 : parseFloat(valores.factor1Coef.replace('x', '')) || 0;

      console.log('Coeficientes extraídos:', coef1X, coef1Coef);

      // Calcular el grado de la variable resultante
      const grado1 = valores.factor1X.includes('x²') ? 2 : (valores.factor1X.includes('x') ? 1 : 0);
      const grado2 = valores.factor1Coef.includes('x²') ? 2 : (valores.factor1Coef.includes('x') ? 1 : 0);
      const gradoResultante = grado1 + grado2;
      
      console.log('Factor1X:', valores.factor1X, 'Grado1:', grado1);
      console.log('Factor1Coef:', valores.factor1Coef, 'Grado2:', grado2);
      console.log('Grado resultante:', gradoResultante);

      console.log('Grados de variables:', grado1, grado2, 'Resultante:', gradoResultante);

      // Aplicar signos
      const signo1X = signos.factor1X === '+' ? 1 : -1;
      const signo1Coef = signos.factor1Coef === '+' ? 1 : -1;

      const factor1Final = coef1X * signo1X;
      const factor2Final = coef1Coef * signo1Coef;

      console.log('Factores finales:', factor1Final, factor2Final);

      // Calcular la multiplicación
      const multiplicacion = factor1Final * factor2Final;

      console.log('Multiplicación:', multiplicacion);

      // Obtener el coeficiente esperado según el tipo de ecuación
      let coeficienteEsperado;
      let gradoEsperado;
      
      if (terminos.termino1 === '6x⁴') {
        coeficienteEsperado = obtenerCoeficienteX4(); // Retorna 4
        gradoEsperado = 4;
      } else {
        coeficienteEsperado = obtenerCoeficienteCuadratico(); // Retorna 2, 3, 4, 12
        gradoEsperado = 2;
      }
      
      console.log('Coeficiente esperado:', coeficienteEsperado, 'Grado esperado:', gradoEsperado);
      
      // Verificar si da el coeficiente correcto Y si tiene el grado correcto
      if (multiplicacion === coeficienteEsperado && gradoResultante === gradoEsperado) {
        const variableEsperada = gradoEsperado === 2 ? 'x²' : gradoEsperado === 4 ? 'x⁴' : `x^${gradoEsperado}`;
        setValidacion({
          esCorrecta: true,
          mensaje: `¡Correcto! La multiplicación de los factores da ${coeficienteEsperado}${variableEsperada}`,
          mostrar: true
        });
        setFactoresIzquierdosValidados(true);
        setEstadoValidacionIzquierda('correcto');
        // Ocultar validación de tanteo cuando se validan factores
        setValidacionTanteo({
          esCorrecta: null,
          mensaje: '',
          mostrar: false
        });
      } else {
        const variableEsperada = gradoEsperado === 2 ? 'x²' : gradoEsperado === 4 ? 'x⁴' : `x^${gradoEsperado}`;
        setValidacion({
          esCorrecta: false,
          mensaje: `Incorrecto: La multiplicación de los factores debe ser ${coeficienteEsperado}${variableEsperada}`,
          mostrar: true
        });
        setFactoresIzquierdosValidados(false);
        setEstadoValidacionIzquierda('incorrecto');
        // Ocultar validación de tanteo cuando se validan factores
        setValidacionTanteo({
          esCorrecta: null,
          mensaje: '',
          mostrar: false
        });
      }
    } catch (error) {
      console.log('Error en validación:', error);
      setValidacion({
        esCorrecta: false,
        mensaje: 'Error en la validación. Revisa el formato de tus respuestas',
        mostrar: true
      });
    }
  };

  return (
    <div className={`factorizacion-page ${mostrarCoronaReto3 ? 'blur-background' : ''}`}>
      {/* Header */}
      <header className="App-header">
        <div className="header-content">
          <h1 className="main-title">Factorización de Ecuaciones Cuadráticas</h1>
          <p className="subtitle">Interactúa con la ecuación y observa los cálculos en tiempo real</p>
          {datosUsuario && (
            <div className="info-usuario">
              <span className="user-name">{datosUsuario.nombre}</span>
              <span className="user-details">
                <span className="detail-item">🏛️ {datosUsuario.curso}</span>
                <span className="detail-item">🌙 {datosUsuario.edad} años</span>
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Botón flotante para completar reto 3 */}
      {/* Botón completar - Solo visible para admin */}
      {esAdmin && (
        <div className="boton-completar-flotante">
          <button 
            className="btn-completar-admin"
            onClick={handleCompletarReto3}
            title="Completar Reto (Solo Admin)"
          >
            👑 Completar
          </button>
        </div>
      )}
      
      <div className="app-container">
      {/* Modal de Instrucciones */}
      {mostrarInstrucciones && (
        <div className="modal-overlay">
          <div className="modal-instrucciones">
            <div className="modal-header">
              <h2>Nomenclatura Quipus</h2>
            </div>
            <div className="modal-content">
              {/* Nomenclatura X */}
              <div className="nomenclatura-section">
                <h3>Nomenclatura X</h3>
                <div className="test-content">
                  <div className="test-item">
                    <img src={require('../assets/img/x.png')} alt="X" className="test-image" />
                    <span>X</span>
                  </div>
                  <div className="test-item">
                    <img src={require('../assets/img/x2.png')} alt="X²" className="test-image" />
                    <span>X²</span>
                  </div>
                </div>
              </div>
              
         {/* Nomenclatura Numérica */}
         <div className="nomenclatura-section">
           <h3>Nomenclatura Numérica</h3>
           <div className="nomenclatura-content">
             <div className="quipu-grid">
               {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(numero => (
                 <div key={numero} className="quipu-example">
                   <img 
                     src={require(`../assets/img/${numero}.png`)} 
                     alt={`Nudo ${numero}`} 
                     className="quipu-knot-image"
                   />
                   <span>{numero}</span>
                 </div>
               ))}
             </div>
           </div>
         </div>
              
              {/* Nomenclatura Operacional */}
              <div className="nomenclatura-section">
                <h3>Nomenclatura Operacional</h3>
                <div className="nomenclatura-content">
                  <div className="operational-grid">
                    <div className="operational-item">
                      <img 
                        src={require('../assets/img/plus.png')} 
                        alt="Suma" 
                        className="operational-image"
                      />
                      <span>+</span>
                    </div>
                    <div className="operational-item">
                      <img 
                        src={require('../assets/img/minus.png')} 
                        alt="Resta" 
                        className="operational-image"
                      />
                      <span>-</span>
                    </div>
                    <div className="operational-item">
                      <img 
                        src={require('../assets/img/times.png')} 
                        alt="Multiplicación" 
                        className="operational-image"
                      />
                      <span>×</span>
                    </div>
                    <div className="operational-item">
                      <img 
                        src={require('../assets/img/divided.png')} 
                        alt="División" 
                        className="operational-image"
                      />
                      <span>÷</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-buttons">
              <button className="btn-volver" onClick={cerrarInstrucciones}>
                Volver
              </button>
              <button className="btn-comenzar" onClick={comenzarAventura}>
                Comenzar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ecuación principal */}
      <div className="ecuacion-principal">
        <div className="ecuacion-box">
          {ecuacionOriginal}
        </div>
      </div>
      <div className="contenedor-filas">
        {/* Contenedor principal */}
        <div className="main-container">
          {/* Términos de la ecuación */}
          <div className="terminos-superiores">
            <div className={`termino-box ${estadoValidacionIzquierda === 'correcto' ? 'termino-correcto' : estadoValidacionIzquierda === 'incorrecto' ? 'termino-incorrecto' : ''}`}>
              <span>{terminos.termino1}</span>
              <div className={`flecha ${estadoValidacionIzquierda === 'correcto' ? 'flecha-correcta' : estadoValidacionIzquierda === 'incorrecto' ? 'flecha-incorrecta' : ''}`}></div>
            </div>
            <div className={`termino-box ${estadoValidacionTanteo === 'correcto' ? 'termino-correcto' : estadoValidacionTanteo === 'incorrecto' ? 'termino-incorrecto' : ''}`}>
              <span>{terminos.termino2}</span>
            </div>
            <div className={`termino-box ${estadoValidacionDerecha === 'correcto' ? 'termino-correcto' : estadoValidacionDerecha === 'incorrecto' ? 'termino-incorrecto' : ''}`}>
              <span>{terminos.termino3}</span>
              <div className={`flecha ${estadoValidacionDerecha === 'correcto' ? 'flecha-correcta' : estadoValidacionDerecha === 'incorrecto' ? 'flecha-incorrecta' : ''}`}></div>
            </div>
          </div>

          {/* Sección de factores */}
          <div className="seccion-principal">
            {/* Factores de 2x² */}
            <div className="columna-factores">
              <div className="factor-container">
                <div className={`factor-box ${factor1XResaltado ? 'producto1-conexion' : ''} ${factoresSuperioresResaltados ? 'factores-superiores-azul' : ''} ${estadoValidacionIzquierda === 'correcto' ? 'factor-correcto' : estadoValidacionIzquierda === 'incorrecto' ? 'factor-incorrecto' : ''} ${ocultarLineasDivision ? 'sin-lineas-division' : ''}`}>
                  {/* Zona de destino para signo */}
                  <div 
                    className="factor-drop-zone signo-zone"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'factor1X', 'signo')}
                  >
                    {nudosEnFactores.factor1X.signo ? (
                      <img 
                        src={cargarImagen(nudosEnFactores.factor1X.signo)} 
                        alt={`nudo-${nudosEnFactores.factor1X.signo}`}
                        className="nudo-en-factor"
                        onDoubleClick={() => quitarNudo('factor1X', 'signo')}
                        title="Doble clic para quitar"
                      />
                    ) : (
                      <span className="drop-hint">+ o -</span>
                    )}
                  </div>
                  
                  {/* Zona de destino para número */}
                  <div 
                    className="factor-drop-zone numero-zone"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'factor1X', 'numero')}
                  >
                    {nudosEnFactores.factor1X.numero ? (
                      <img 
                        src={cargarImagen(nudosEnFactores.factor1X.numero)} 
                        alt={`nudo-${nudosEnFactores.factor1X.numero}`}
                        className="nudo-en-factor"
                        onDoubleClick={() => quitarNudo('factor1X', 'numero')}
                        title="Doble clic para quitar"
                      />
                    ) : (
                      <span className="drop-hint">1 a 10</span>
                    )}
                  </div>
                  
                  {/* Zona de destino para letra */}
                  <div 
                    className="factor-drop-zone letra-zone"
                    data-factor="factor1X"
                    data-seccion="letra"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'factor1X', 'letra')}
                  >
                    {nudosEnFactores.factor1X.letras && nudosEnFactores.factor1X.letras.length > 0 ? (
                      nudosEnFactores.factor1X.letras.map((nudo, idx) => (
                      <img 
                          key={idx}
                          src={cargarImagen(nudo)} 
                          alt={`nudo-${nudo}`}
                        className="nudo-en-factor"
                        onDoubleClick={() => quitarNudo('factor1X', 'letra')}
                        title="Doble clic para quitar"
                      />
                      ))
                    ) : (
                      <span className="drop-hint">x</span>
                    )}
                  </div>
                  
                  <input
                    type="text"
                    value={valores.factor1X}
                    onChange={(e) => actualizarValor('factor1X', e.target.value)}
                    onFocus={() => manejarFocoFactor('factor1X')}
                    placeholder=""
                    className={`${factoresResaltados ? 'factor-error' : ''} ${factoresResaltadosProducto1 ? 'factor-resaltado-producto1' : ''} ${obtenerClasesValidacionFactores(estadoValidacionIzquierda)} ${factoresSuperioresResaltados ? 'factor-resaltado-azul' : ''}`}
                    disabled={factoresIzquierdosValidados}
                    style={{ display: 'none' }}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="factor-container">
                <div className={`factor-box ${factor1CoefResaltado ? 'producto2-conexion' : ''} ${factoresInferioresResaltados ? 'factores-inferiores-verde' : ''} ${estadoValidacionIzquierda === 'correcto' ? 'factor-correcto' : estadoValidacionIzquierda === 'incorrecto' ? 'factor-incorrecto' : ''} ${ocultarLineasDivision ? 'sin-lineas-division' : ''}`}>
                  {/* Zona de destino para signo */}
                  <div 
                    className="factor-drop-zone signo-zone"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'factor1Coef', 'signo')}
                  >
                    {nudosEnFactores.factor1Coef.signo ? (
                      <img 
                        src={cargarImagen(nudosEnFactores.factor1Coef.signo)} 
                        alt={`nudo-${nudosEnFactores.factor1Coef.signo}`}
                        className="nudo-en-factor"
                        onDoubleClick={() => quitarNudo('factor1Coef', 'signo')}
                        title="Doble clic para quitar"
                      />
                    ) : (
                      <span className="drop-hint">+ o -</span>
                    )}
                  </div>
                  
                  {/* Zona de destino para número */}
                  <div 
                    className="factor-drop-zone numero-zone"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'factor1Coef', 'numero')}
                  >
                    {nudosEnFactores.factor1Coef.numero ? (
                      <img 
                        src={cargarImagen(nudosEnFactores.factor1Coef.numero)} 
                        alt={`nudo-${nudosEnFactores.factor1Coef.numero}`}
                        className="nudo-en-factor"
                        onDoubleClick={() => quitarNudo('factor1Coef', 'numero')}
                        title="Doble clic para quitar"
                      />
                    ) : (
                      <span className="drop-hint">1 a 10</span>
                    )}
                  </div>
                  
                  {/* Zona de destino para letra */}
                  <div 
                    className="factor-drop-zone letra-zone"
                    data-factor="factor1Coef"
                    data-seccion="letra"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'factor1Coef', 'letra')}
                  >
                    {nudosEnFactores.factor1Coef.letras && nudosEnFactores.factor1Coef.letras.length > 0 ? (
                      nudosEnFactores.factor1Coef.letras.map((nudo, idx) => (
                      <img 
                          key={idx}
                          src={cargarImagen(nudo)} 
                          alt={`nudo-${nudo}`}
                        className="nudo-en-factor"
                        onDoubleClick={() => quitarNudo('factor1Coef', 'letra')}
                        title="Doble clic para quitar"
                      />
                      ))
                    ) : (
                      <span className="drop-hint">x</span>
                    )}
                  </div>
                  
                  <input
                    type="text"
                    value={valores.factor1Coef}
                    onChange={(e) => actualizarValor('factor1Coef', e.target.value)}
                    onFocus={() => manejarFocoFactor('factor1Coef')}
                    placeholder=""
                    className={`${factoresResaltados ? 'factor-error' : ''} ${factoresResaltadosProducto2 ? 'factor-resaltado-producto2' : ''} ${obtenerClasesValidacionFactores(estadoValidacionIzquierda)} ${factoresInferioresResaltados ? 'factor-resaltado-verde' : ''}`}
                    disabled={factoresIzquierdosValidados}
                    style={{ display: 'none' }}
                    autoComplete="off"
                  />
                </div>
              </div>
              {/* Botón de validación para factores izquierdos */}
              {mostrarBotonesValidar && (
              <div className="validacion-factores-container">
                <button
                  className="btn-validar-factores"
                  onClick={validarMultiplicacionFactores}
                  disabled={factoresIzquierdosValidados}
                >
                  ✓
                </button>
              </div>
              )}
            </div>



            {/* Líneas cruzadas del aspa */}
            <div className="aspas-lines">
              <div className={`linea-diagonal linea-1 ${lineasVisibles.linea2 ? 'linea-visible' : 'linea-oculta'}`}></div>
              <div className={`linea-diagonal linea-2 ${lineasVisibles.linea1 ? 'linea-visible' : 'linea-oculta'}`}></div>
            </div>

            {/* Línea de paréntesis superior */}
            {mostrarLineaParentesisSuperior && (
              <div className="linea-parentesis-superior"></div>
            )}

            {/* Línea de paréntesis inferior */}
            {mostrarLineaParentesis && (
              <div className="linea-parentesis"></div>
            )}


            {/* Factores de 16 */}
            <div className="columna-factores">
              <div className="factor-container">
                <div className={`factor-box ${factor2ConstResaltado ? 'producto2-conexion' : ''} ${factoresSuperioresResaltados ? 'factores-superiores-azul' : ''} ${estadoValidacionDerecha === 'correcto' ? 'factor-correcto' : estadoValidacionDerecha === 'incorrecto' ? 'factor-incorrecto' : ''} ${ocultarLineasDivision ? 'sin-lineas-division' : ''}`}>
                  {/* Zona de destino para signo */}
                  <div 
                    className="factor-drop-zone signo-zone"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'factor2Const', 'signo')}
                  >
                    {nudosEnFactores.factor2Const.signo ? (
                      <img 
                        src={cargarImagen(nudosEnFactores.factor2Const.signo)} 
                        alt={`nudo-${nudosEnFactores.factor2Const.signo}`}
                        className="nudo-en-factor"
                        onDoubleClick={() => quitarNudo('factor2Const', 'signo')}
                        title="Doble clic para quitar"
                      />
                    ) : (
                      <span className="drop-hint">+ o -</span>
                    )}
                  </div>
                  
                  {/* Zona de destino para número */}
                  <div 
                    className="factor-drop-zone numero-zone"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'factor2Const', 'numero')}
                  >
                    {nudosEnFactores.factor2Const.numero ? (
                      <img 
                        src={cargarImagen(nudosEnFactores.factor2Const.numero)} 
                        alt={`nudo-${nudosEnFactores.factor2Const.numero}`}
                        className="nudo-en-factor"
                        onDoubleClick={() => quitarNudo('factor2Const', 'numero')}
                        title="Doble clic para quitar"
                      />
                    ) : (
                      <span className="drop-hint">1 a 10</span>
                    )}
                  </div>
                  
                  <input
                    type="text"
                    value={valores.factor2Const}
                    onChange={(e) => actualizarValor('factor2Const', e.target.value)}
                    onFocus={() => manejarFocoFactor('factor2Const')}
                    placeholder=""
                    disabled={!factoresIzquierdosValidados || factoresDerechosValidados}
                    className={`${factoresResaltados ? 'factor-error' : ''} ${factoresResaltadosProducto2 ? 'factor-resaltado-producto2' : ''} ${obtenerClasesValidacionFactores(estadoValidacionDerecha)} ${factoresSuperioresResaltados ? 'factor-resaltado-azul' : ''}`}
                    style={{ display: 'none' }}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="factor-container">
                <div className={`factor-box ${factor2NumResaltado ? 'producto1-conexion' : ''} ${factoresInferioresResaltados ? 'factores-inferiores-verde' : ''} ${estadoValidacionDerecha === 'correcto' ? 'factor-correcto' : estadoValidacionDerecha === 'incorrecto' ? 'factor-incorrecto' : ''} ${ocultarLineasDivision ? 'sin-lineas-division' : ''}`}>
                  {/* Zona de destino para signo */}
                  <div 
                    className="factor-drop-zone signo-zone"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'factor2Num', 'signo')}
                  >
                    {nudosEnFactores.factor2Num.signo ? (
                      <img 
                        src={cargarImagen(nudosEnFactores.factor2Num.signo)} 
                        alt={`nudo-${nudosEnFactores.factor2Num.signo}`}
                        className="nudo-en-factor"
                        onDoubleClick={() => quitarNudo('factor2Num', 'signo')}
                        title="Doble clic para quitar"
                      />
                    ) : (
                      <span className="drop-hint">+ o -</span>
                    )}
                  </div>
                  
                  {/* Zona de destino para número */}
                  <div 
                    className="factor-drop-zone numero-zone"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'factor2Num', 'numero')}
                  >
                    {nudosEnFactores.factor2Num.numero ? (
                      <img 
                        src={cargarImagen(nudosEnFactores.factor2Num.numero)} 
                        alt={`nudo-${nudosEnFactores.factor2Num.numero}`}
                        className="nudo-en-factor"
                        onDoubleClick={() => quitarNudo('factor2Num', 'numero')}
                        title="Doble clic para quitar"
                      />
                    ) : (
                      <span className="drop-hint">1 a 10</span>
                    )}
                  </div>
                  
                  <input
                    type="text"
                    value={valores.factor2Num}
                    onChange={(e) => actualizarValor('factor2Num', e.target.value)}
                    onFocus={() => manejarFocoFactor('factor2Num')}
                    placeholder=""
                    disabled={!factoresIzquierdosValidados || factoresDerechosValidados}
                    className={`${factoresResaltados ? 'factor-error' : ''} ${factoresResaltadosProducto1 ? 'factor-resaltado-producto1' : ''} ${obtenerClasesValidacionFactores(estadoValidacionDerecha)} ${factoresInferioresResaltados ? 'factor-resaltado-verde' : ''}`}
                    style={{ display: 'none' }}
                    autoComplete="off"
                  />
                </div>
              </div>
              {/* Botón de validación para factores derechos */}
              {mostrarBotonesValidar && (
              <div className="validacion-factores-container">
                <button
                  className="btn-validar-factores"
                  onClick={validarMultiplicacionFactoresDerechos}
                  disabled={!factoresIzquierdosValidados || factoresDerechosValidados}
                >
                  ✓
                </button>
              </div>
              )}
              
            </div>

          </div>
          
          {/* Espaciado reservado para el botón RESULTADO o resultado */}
          <div className="boton-resultado-principal">
            {!mostrarBotonesValidar && !mostrarRespuesta && (
              <button
                className="btn-resolver-trinomio"
                onClick={() => {
                  if (estadoValidacionTanteo === 'correcto') {
                    // Ejecutar animación secuencial
                    manejarResultadoSecuencial();
                    // Calcular todos los productos
                    calcularProductoIndividual('producto1');
                    calcularProductoIndividual('producto2');
                    calcularProductoIndividual('suma');
                    // Mostrar todos los productos
                    setMostrarProductos({ producto1: true, producto2: true, suma: true });
                    // Mostrar respuesta factorizada
                    setMostrarRespuesta(true);
                  }
                }}
                disabled={estadoValidacionTanteo !== 'correcto'}
              >
                RESULTADO
              </button>
            )}
            {!mostrarBotonesValidar && mostrarRespuesta && (
              <div className="respuesta-factorizada">
                {mostrarPrimerParentesis && (
                  <span className="primer-parentesis">({signos.factor1X === '-' ? '-' : ''}{valores.factor1X} {signos.factor2Const}{valores.factor2Const})</span>
                )}
                {mostrarSegundoParentesis && (
                  <span className="segundo-parentesis">({signos.factor1Coef === '-' ? '-' : ''}{valores.factor1Coef} {signos.factor2Num}{valores.factor2Num})</span>
                )}
                {!mostrarPrimerParentesis && !mostrarSegundoParentesis && (
                  <span className="respuesta-texto">
                    <span className="primer-parentesis">({signos.factor1X === '-' ? '-' : ''}{valores.factor1X} {signos.factor2Const}{valores.factor2Const})</span>
                    <span className="segundo-parentesis">({signos.factor1Coef === '-' ? '-' : ''}{valores.factor1Coef} {signos.factor2Num}{valores.factor2Num})</span>
                  </span>
                )}
        </div>
            )}
          </div>
        </div>
        
        
        {/* Contenedor de productos */}
        <div className="contenedor-productos">
          <div className="producto-item">
            <span className="igual">=</span>
            <div className={`producto-box producto1 ${mostrarProductos.producto1 ? 'producto-activo' : 'producto-inactivo'} ${factoresResaltadosProducto1 ? 'producto-resaltado-azul' : ''}`}>
              {/* Mostrar nudos en lugar de input */}
              <div className="producto-nudos">
                {productosConNudos.producto1.map((nudo, idx) => (
                  <img 
                    key={idx} 
                    src={cargarImagen(nudo)} 
                    alt={`nudo-${nudo}`}
                    className="nudo-en-producto"
                  />
                ))}
              </div>
              <input
                type="text"
              value={mostrarProductos.producto1 ? valores.producto1 : ''}
                placeholder=""
                readOnly
                style={{ display: 'none' }}
                autoComplete="off"
              />
            </div>
            <button
              className="btn-resolver-individual"
              onClick={() => manejarResolverIndividual('producto1')}
              disabled={!factoresIzquierdosValidados || !factoresDerechosValidados || botonesResolverDeshabilitados}
            >
              Resolver
            </button>
          </div>
          <div className="producto-item">
            <span className="igual">=</span>
            <div className={`producto-box producto2 ${mostrarProductos.producto2 ? 'producto-activo' : 'producto-inactivo'} ${factoresResaltadosProducto2 ? 'producto-resaltado-verde' : ''}`}>
              {/* Mostrar nudos en lugar de input */}
              <div className="producto-nudos">
                {productosConNudos.producto2.map((nudo, idx) => (
                  <img 
                    key={idx} 
                    src={cargarImagen(nudo)} 
                    alt={`nudo-${nudo}`}
                    className="nudo-en-producto"
                  />
                ))}
              </div>
              <input
                type="text"
              value={mostrarProductos.producto2 ? valores.producto2 : ''}
                placeholder=""
                readOnly
                style={{ display: 'none' }}
                autoComplete="off"
              />
            </div>
            <button
              className="btn-resolver-individual"
              onClick={() => manejarResolverIndividual('producto2')}
              disabled={!factoresIzquierdosValidados || !factoresDerechosValidados || botonesResolverDeshabilitados}
            >
              Resolver
            </button>
          </div>

          {/* Línea horizontal separada */}
          <div className="linea-horizontal-separada"></div>

          {/* Resultado de la suma */}
          <div className="suma-productos">
            <div className={`suma-box ${mostrarProductos.suma ? 'suma-activa' : 'suma-inactiva'} ${sumaResaltada ? 'suma-resaltada-error' : ''}`}>
              {/* Mostrar valor numérico en lugar de nudos */}
              <input
                type="text"
                value={mostrarProductos.suma ? valores.suma : ''}
                placeholder=""
                readOnly
                className="suma-input"
                autoComplete="off"
              />
            </div>
            <button
              className="btn-resolver-individual"
              onClick={() => manejarResolverIndividual('suma')}
              disabled={!factoresIzquierdosValidados || !factoresDerechosValidados || botonesResolverDeshabilitados || !productosResueltos.producto1 || !productosResueltos.producto2}
            >
              Resolver
            </button>
          </div>

        </div>

        {/* Contenedor de nudos (nuevo, a la derecha) */}
        <div className="contenedor-nudos">
          <div className="nudos-contenido">
            <div className="nudos-scroll">
              {nudosOrden.map((nombre, idx) => {
                const src = cargarImagen(nombre);
                return (
                  <div 
                    key={idx} 
                    className="nudo-item"
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, nombre)}
                  >
                    {src ? (
                      <img src={src} alt={`nudo-${nombre}`} />
                    ) : (
                      <div className="nudo-placeholder">{nombre}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>


      {/* Resultado de validación de tanteo - ocultar cuando aparece botón resultado */}
      {validacionTanteo.mostrar && !mostrarBotonTrinomio && (
        <div className={`validacion-resultado ${validacionTanteo.esCorrecta ? 'correcta' : 'incorrecta'} ${ocultarValidacion ? 'ocultando' : ''}`}>
          <div className="validacion-nino">
            <img 
              src={validacionTanteo.esCorrecta 
                ? require('../assets/img/niñofeliz.png') 
                : ((validacionTanteo.mensaje?.startsWith('Aquí van los quipus') || validacionTanteo.mensaje === 'Por favor, coloca los signos') 
                    ? require('../assets/img/niñoestudio.png') 
                    : require('../assets/img/niñopensando.png'))} 
              alt={validacionTanteo.esCorrecta ? "Niño feliz" : "Niño estudio"} 
              className="nino-imagen"
            />
          </div>
          <div className="validacion-icono">
            {validacionTanteo.esCorrecta ? <IconoCheckmarkBonito /> : <IconoErrorBonito />}
          </div>
          <div className="validacion-mensaje">
            {validacionTanteo.mensaje}
          </div>
        </div>
      )}

      {/* Resultado de validación */}
      {validacion.mostrar && (
        <div className={`validacion-resultado ${validacion.esCorrecta ? 'correcta' : validacion.esAdvertencia ? 'advertencia' : 'incorrecta'} ${ocultarValidacion ? 'ocultando' : ''}`}>
          <div className="validacion-nino">
            <img 
              src={validacion.esCorrecta 
                ? require('../assets/img/niñofeliz.png') 
                : ((validacion.mensaje?.startsWith('Aquí van los quipus') || validacion.mensaje === 'Por favor, coloca los signos') 
                    ? require('../assets/img/niñoestudio.png') 
                    : require('../assets/img/niñopensando.png'))} 
              alt={validacion.esCorrecta ? "Niño feliz" : "Niño estudio"} 
              className="nino-imagen"
            />
          </div>
          <div className="validacion-icono">
            {validacion.esCorrecta ? <IconoCheckmarkBonito /> : validacion.esAdvertencia ? <IconoAdvertenciaBonito /> : <IconoErrorBonito />}
          </div>
          <div className="validacion-mensaje">
            {validacion.mensaje}
          </div>
        </div>
      )}


      {/* Quipu flotante de confirmación (estilo Reto1/2) */}
      {mostrarRespuesta && mostrarPrimerParentesis && mostrarSegundoParentesis && (
        <div className="quipufactor-container">
          <div className="quipufactor-mensaje">
            <div className="mensaje-bubble">
              <p className="quipufactor-texto">
                {coronaDesaparecidaReto3 ? (
                  <>
                    ¡¡Vamos!! ¡Es la última corona y el pergamino dice: <span className="mensaje-quip">QUIP</span>!!
                  </>
                ) : (
                  `¡Genial! ¡Vamos ${indiceEcuacion + 1}/${ecuaciones.length}!`
                )}
              </p>
            </div>
          </div>
          <div 
            className="quipufactor-personaje" 
            onClick={enviando ? null : (coronaDesaparecidaReto3 ? (() => { if (onCompletarReto3) onCompletarReto3(); }) : cambiarSiguienteEcuacion)} 
            title={enviando ? 'Guardando...' : (coronaDesaparecidaReto3 ? 'Finalizar' : (indiceEcuacion === ecuaciones.length - 1 ? 'Terminar' : 'Siguiente Ecuación'))}
            style={{
              opacity: enviando ? 0.6 : 1,
              cursor: enviando ? 'not-allowed' : 'pointer'
            }}
          >
            <img 
              src={require(`../assets/img/${coronaDesaparecidaReto3 ? 'niñoorgulloso.png' : 'niñofeliz.png'}`)} 
              alt={coronaDesaparecidaReto3 ? "Niño orgulloso" : "Quipu feliz"} 
              className="quipufactor-img"
            />
            <div className="quipufactor-texto-cta">
              {enviando ? '⏳ Guardando...' : (coronaPresionadaReto3 ? 'Finalizar' : 'Presióname')}
            </div>
          </div>
        </div>
      )}

      </div>
      
      {/* Corona y pergamino del Reto 3 - Fuera del contenedor principal */}
      {mostrarCoronaReto3 && (
        <>
          <div className="corona-container-reto3">
            <img 
              src={require('../assets/img/pergaminocompleto.png')}
              alt="Pergamino"
              className="pergamino-img-reto3"
            />
            <img 
              src={require('../assets/img/corona.png')}
              alt="Corona"
              className="corona-img-reto3 clickeable-reto3"
              onClick={handleCoronaClickReto3}
            />
          </div>
          <div className="instruccion-corona-reto3">
            <p>Presiona la corona</p>
          </div>
        </>
      )}
    </div>
  );
};

export default FactorizacionComponent;
