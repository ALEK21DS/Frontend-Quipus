import React, { useState } from 'react';
import './App.css';
import apiService from './services/api';
import PaginaInicio from './components/PaginaInicio';
import PaginaEntrada from './components/PaginaEntrada';
import PaginaCentroControl from './components/PaginaCentroControl';
import EnigmaticoComponent from './components/EnigmaticoComponent';
import RetoUno from './components/RetoUno';
import AspaMagicaComponent from './components/AspaMagicaComponent';
import RetoDos from './components/RetoDos';
import RetoTres from './components/RetoTres';
import FactorizacionComponent from './components/FactorizacionComponent';
import PuntuacionesComponent from './components/PuntuacionesComponent';
import NotasComponent from './components/NotasComponent';
import RelojFlotante from './components/RelojFlotante';
import QuipoTiempoAgotado from './components/QuipoTiempoAgotado';

function App() {
  const [mostrarInicio, setMostrarInicio] = useState(true);
  const [mostrarEntrada, setMostrarEntrada] = useState(false);
  const [mostrarCentroControl, setMostrarCentroControl] = useState(false);
  const [mostrarEnigmatico, setMostrarEnigmatico] = useState(false);
  const [mostrarRetoUno, setMostrarRetoUno] = useState(false);
  const [mostrarAspaMagica, setMostrarAspaMagica] = useState(false);
  const [mostrarRetoDos, setMostrarRetoDos] = useState(false);
  const [mostrarRetoTres, setMostrarRetoTres] = useState(false);
  const [mostrarFactorizacion, setMostrarFactorizacion] = useState(false);
  const [mostrarPuntuaciones, setMostrarPuntuaciones] = useState(false);
  const [mostrarNotas, setMostrarNotas] = useState(false);
  const [datosUsuario, setDatosUsuario] = useState(null);
  const [sesionJuego, setSesionJuego] = useState(null);
  const [retosCompletados, setRetosCompletados] = useState([]);
  const [juegoCompletado, setJuegoCompletado] = useState(false);
  const [mostrarReloj, setMostrarReloj] = useState(false);
  const [mostrarQuipoTiempoAgotado, setMostrarQuipoTiempoAgotado] = useState(false);
  const [origenNotas, setOrigenNotas] = useState(null); // 'entrada' o 'puntuaciones'
  const [quipuYaMostrado, setQuipuYaMostrado] = useState(false);

  const handleIniciarSesion = async (datos) => {
    try {
      console.log('🔍 Datos del usuario recibidos:', datos);
      
      // Extraer el usuario real del objeto de respuesta
      const usuario = datos.data || datos;
      console.log('🔍 Usuario extraído:', usuario);
      console.log('🔍 ID del usuario:', usuario.id);
      
      // Crear sesión de juego en el backend
      const sessionPayload = {
        usuarioId: usuario.id  // Backend espera 'usuarioId', no 'usuario_id'
      };
      console.log('📤 Enviando al backend:', sessionPayload);
      
      const nuevaSesion = await apiService.crearSesion(sessionPayload);

      console.log('✅ Sesión creada:', nuevaSesion.data);
      setDatosUsuario(usuario);
      setSesionJuego(nuevaSesion.data);
      setMostrarInicio(false);
      setMostrarEntrada(true);
    } catch (error) {
      console.error('❌ Error al crear sesión de juego:', error);
      // Continuar sin sesión si hay error
      const usuario = datos.data || datos;
      setDatosUsuario(usuario);
      setMostrarInicio(false);
      setMostrarEntrada(true);
    }
  };

  const handleContinuarEntrada = () => {
    setMostrarEntrada(false);
    setMostrarCentroControl(true);
    setMostrarReloj(true); // Mostrar el reloj cuando se inicia el juego
  };

  const handleSeleccionarReto = (retoId) => {
    if (retoId === 1) {
      setMostrarCentroControl(false);
      setMostrarEnigmatico(true);
    } else if (retoId === 2) {
      setMostrarCentroControl(false);
      setMostrarAspaMagica(true);
    } else if (retoId === 3) {
      setMostrarCentroControl(false);
      setMostrarRetoTres(true);
    }
  };

  const handleContinuarEnigmatico = () => {
    setMostrarEnigmatico(false);
    setMostrarRetoUno(true);
  };

  const handleContinuarAspaMagica = () => {
    setMostrarAspaMagica(false);
    setMostrarRetoDos(true);
  };

  const handleContinuarRetoTres = () => {
    setMostrarRetoTres(false);
    setMostrarFactorizacion(true);
  };

  const handleCompletarReto3 = () => {
    // Completar el reto 3 y volver al centro de control
    setRetosCompletados(prev => [...prev, 3]);
    setMostrarFactorizacion(false);
    setMostrarCentroControl(true);
  };

  const handleSalirRuinas = async () => {
    setJuegoCompletado(true); // Marcar que el juego fue completado
    
    // Actualizar sesión de juego en el backend
    if (sesionJuego) {
      try {
        await apiService.actualizarSesion(sesionJuego.id, {
          fecha_fin: new Date().toISOString(),
          completado: true,
          razon_fin_juego: 'COMPLETADO'
        });
      } catch (error) {
        console.error('Error al actualizar sesión:', error);
      }
    }
    
    setMostrarCentroControl(false);
    setMostrarPuntuaciones(true);
    setMostrarReloj(false); // Ocultar el reloj porque el juego terminó
  };

  const handleVerPuntuaciones = () => {
    setJuegoCompletado(false); // Marcar que NO viene de completar el juego
    setMostrarInicio(false);
    setMostrarPuntuaciones(true);
    setMostrarReloj(false); // Ocultar el reloj cuando se accede desde inicio
  };

  const handleVerNotas = (desdePuntuaciones = false) => {
    // Rastrear de dónde viene
    setOrigenNotas(desdePuntuaciones ? 'puntuaciones' : 'entrada');
    
    // Ocultar todas las pantallas del juego
    setMostrarInicio(false);
    setMostrarEntrada(false);
    setMostrarCentroControl(false);
    setMostrarEnigmatico(false);
    setMostrarRetoUno(false);
    setMostrarAspaMagica(false);
    setMostrarRetoDos(false);
    setMostrarRetoTres(false);
    setMostrarFactorizacion(false);
    setMostrarPuntuaciones(false);
    setMostrarReloj(false);
    
    // Mostrar notas
    setMostrarNotas(true);
  };

  const handleVolverEntrada = () => {
    // Ocultar notas
    setMostrarNotas(false);
    
    // Regresar al lugar correcto según el origen
    if (origenNotas === 'puntuaciones') {
      // Si vino desde puntuaciones, regresar ahí
      setMostrarPuntuaciones(true);
    } else {
      // Si vino desde entrada, regresar ahí
      setMostrarEntrada(true);
    }
    
    // Limpiar el origen
    setOrigenNotas(null);
  };

  const handleVolverInicio = () => {
    // Recargar la página para limpiar completamente el estado
    window.location.reload();
  };

  const handleTiempoAgotado = async () => {
    // NO ocultar las pantallas del juego - el quipo aparecerá encima
    // Solo ocultar el reloj
    setMostrarReloj(false);
    
    // Obtener nota final acumulada antes de actualizar la sesión
    let notaFinalAcumulada = 0;
    if (sesionJuego) {
      try {
        const sesionActual = await apiService.obtenerSesion(sesionJuego.id);
        const sesionData = sesionActual.data || sesionActual;
        notaFinalAcumulada = sesionData.puntuacionTotal || 0;
      } catch (error) {
        console.error('Error al obtener sesión para calcular nota final:', error);
      }
    }
    
    // Calcular nota del juego (0-10): puntuación total dividida entre 10
    const notaJuego = Math.round(notaFinalAcumulada / 10); // Redondear a entero (0-10)
    
    // Actualizar sesión de juego en el backend - tiempo agotado
    if (sesionJuego) {
      try {
        await apiService.actualizarSesion(sesionJuego.id, {
          fecha_fin: new Date().toISOString(),
          tiempo_agotado: true,
          razon_fin_juego: 'TIEMPO_AGOTADO',
          puntuacionTotal: notaFinalAcumulada,
          puntuacionNotas: notaJuego
        });
        console.log(`✅ Tiempo agotado. Nota final acumulada: ${notaFinalAcumulada}/100. Nota del juego: ${notaJuego}/10`);
      } catch (error) {
        console.error('Error al actualizar sesión por tiempo agotado:', error);
      }
    }
    
    // Mostrar el quipo de tiempo agotado como overlay
    setMostrarQuipoTiempoAgotado(true);
  };

  const handleVolverCentroControl = (retoCompletado = null) => {
    if (retoCompletado) {
      setRetosCompletados(prev => [...prev, retoCompletado]);
    }
    setMostrarRetoUno(false);
    setMostrarEnigmatico(false);
    setMostrarAspaMagica(false);
    setMostrarRetoDos(false);
    setMostrarRetoTres(false);
    setMostrarFactorizacion(false);
    setMostrarCentroControl(true);
  };

  return (
    <div className="App">
      {mostrarInicio && (
        <PaginaInicio 
          onIniciarSesion={handleIniciarSesion} 
          onVerPuntuaciones={handleVerPuntuaciones}
        />
      )}
      
      {mostrarEntrada && (
        <PaginaEntrada 
          onContinuar={handleContinuarEntrada} 
          datosUsuario={datosUsuario}
          onVerNotas={handleVerNotas}
        />
      )}
      
      {mostrarCentroControl && (
        <PaginaCentroControl 
          onSeleccionarReto={handleSeleccionarReto} 
          retosCompletados={retosCompletados} 
          onSalirRuinas={handleSalirRuinas}
        />
      )}
      
      {mostrarEnigmatico && (
        <EnigmaticoComponent onContinuar={handleContinuarEnigmatico} />
      )}
      
      {mostrarRetoUno && (
        <RetoUno 
          onVolver={handleVolverCentroControl} 
          datosUsuario={datosUsuario}
          sesionJuego={sesionJuego}
        />
      )}
      
      {mostrarAspaMagica && (
        <AspaMagicaComponent onContinuar={handleContinuarAspaMagica} />
      )}
      
      {mostrarRetoDos && (
        <RetoDos 
          datosUsuario={datosUsuario} 
          onVolverCentroControl={handleVolverCentroControl}
          sesionJuego={sesionJuego}
        />
      )}
      
      {mostrarRetoTres && (
        <RetoTres 
          onContinuar={handleContinuarRetoTres} 
          onVolverCentroControl={handleVolverCentroControl}
          sesionJuego={sesionJuego}
        />
      )}
      
      {mostrarFactorizacion && (
        <FactorizacionComponent 
          datosUsuario={datosUsuario} 
          onCompletarReto3={handleCompletarReto3}
          sesionJuego={sesionJuego}
          onMostrarJuegoTerminado={() => setMostrarQuipoTiempoAgotado(true)}
        />
      )}
      
      {mostrarPuntuaciones && (
        <PuntuacionesComponent 
          onVolverInicio={handleVolverInicio} 
          onVerNotas={handleVerNotas}
          juegoCompletado={juegoCompletado}
          datosUsuario={datosUsuario}
          quipuYaMostrado={quipuYaMostrado}
          setQuipuYaMostrado={setQuipuYaMostrado}
        />
      )}
      
      {mostrarNotas && (
        <NotasComponent onVolver={handleVolverEntrada} />
      )}
      
      {/* Reloj Flotante - aparece durante todo el juego */}
      {mostrarReloj && (
        <RelojFlotante 
          tiempoInicial={2400}
          onTiempoAgotado={handleTiempoAgotado}
        />
      )}
      
      {/* Quipo Tiempo Agotado - aparece cuando se acaba el tiempo */}
      {mostrarQuipoTiempoAgotado && (
        <QuipoTiempoAgotado 
          onVolverInicio={handleVolverInicio}
        />
      )}
    </div>
  );
}

export default App;
