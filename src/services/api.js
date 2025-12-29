// Servicio API para comunicarse con el backend del Proyecto Quipus
// Usa la variable de entorno o localhost como fallback para desarrollo
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('🌐 API conectada a:', this.baseURL);
  }

  // Método genérico para hacer peticiones HTTP con timeout
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const timeout = options.timeout || 30000; // 30 segundos por defecto
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Crear un AbortController para el timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Si es un error de timeout o abort
      if (error.name === 'AbortError') {
        throw new Error('La petición tardó demasiado. Por favor, intenta nuevamente.');
      }
      
      // Re-lanzar otros errores
      throw error;
    }
  }


  // ==================== USUARIOS ====================
  
  // Crear nuevo usuario
  async crearUsuario(usuarioData) {
    return this.request('/usuarios', {
      method: 'POST',
      body: JSON.stringify(usuarioData),
    });
  }

  // Buscar usuario por nombre y apellido
  async buscarUsuario(nombre, apellido) {
    return this.request(`/usuarios/buscar/${encodeURIComponent(nombre)}/${encodeURIComponent(apellido)}`);
  }

  // Obtener usuario por ID
  async obtenerUsuario(id) {
    return this.request(`/usuarios/${id}`);
  }

  // Verificar si es admin
  async verificarAdmin(nombre, apellido) {
    return this.request(`/usuarios/verificar-admin?nombre=${encodeURIComponent(nombre)}&apellido=${encodeURIComponent(apellido)}`);
  }

  // ==================== SESIONES ====================
  
  // Crear nueva sesión de juego
  async crearSesion(sesionData) {
    return this.request('/sesiones', {
      method: 'POST',
      body: JSON.stringify(sesionData),
    });
  }

  // Actualizar sesión
  async actualizarSesion(id, sesionData) {
    return this.request(`/sesiones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sesionData),
    });
  }

  // Obtener sesión por ID
  async obtenerSesion(id) {
    return this.request(`/sesiones/${id}`);
  }

  // Obtener sesiones de un usuario
  async obtenerSesionesUsuario(usuarioId) {
    return this.request(`/sesiones/usuario/${usuarioId}`);
  }

  // ==================== RESPUESTAS ====================
  
  // Guardar respuesta del Reto 1
  async guardarRespuestaReto1(respuestaData) {
    return this.request('/respuestas/reto1', {
      method: 'POST',
      body: JSON.stringify(respuestaData),
    });
  }

  // Guardar respuesta del Reto 2
  async guardarRespuestaReto2(respuestaData) {
    return this.request('/respuestas/reto2', {
      method: 'POST',
      body: JSON.stringify(respuestaData),
    });
  }

  // Guardar respuesta del Reto 3
  async guardarRespuestaReto3(respuestaData) {
    return this.request('/respuestas/reto3', {
      method: 'POST',
      body: JSON.stringify(respuestaData),
    });
  }

  // Obtener respuestas de una sesión
  async obtenerRespuestasSesion(sesionId) {
    return this.request(`/respuestas/sesion/${sesionId}`);
  }

  // ==================== NOTAS ====================
  
  // Crear nueva nota
  async crearNota(notaData) {
    return this.request('/notas', {
      method: 'POST',
      body: JSON.stringify(notaData),
    });
  }

  // Obtener todas las notas con paginación y filtros
  async obtenerTodasNotas(limite = 50, offset = 0, curso = null, nombre = null, apellido = null, edad = null) {
    const params = new URLSearchParams({
      limite: limite.toString(),
      offset: offset.toString()
    });
    if (curso) {
      params.append('curso', curso);
    }
    if (nombre) {
      params.append('nombre', nombre);
    }
    if (apellido) {
      params.append('apellido', apellido);
    }
    if (edad) {
      params.append('edad', edad);
    }
    return this.request(`/notas?${params.toString()}`);
  }

  // Obtener notas de un usuario
  async obtenerNotasUsuario(usuarioId) {
    return this.request(`/notas/usuario/${usuarioId}`);
  }

  // Actualizar nota
  async actualizarNota(id, notaData) {
    return this.request(`/notas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(notaData),
    });
  }

  // Eliminar nota
  async eliminarNota(id) {
    return this.request(`/notas/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== PUNTUACIONES ====================
  
  // Obtener tabla de puntuaciones general
  async obtenerTablaPuntuaciones(limite = 50, offset = 0) {
    return this.request(`/sesiones/puntuaciones/tabla?limite=${limite}&offset=${offset}`);
  }

  // Obtener puntuaciones por curso
  async obtenerPuntuacionesPorCurso(curso, limite = 50, offset = 0) {
    return this.request(`/sesiones/puntuaciones/curso/${encodeURIComponent(curso)}?limite=${limite}&offset=${offset}`);
  }

  // Obtener puntuaciones de un usuario
  async obtenerPuntuacionesUsuario(usuarioId) {
    return this.request(`/sesiones/puntuaciones/usuario/${usuarioId}`);
  }

  // ==================== ESTADÍSTICAS ====================
  
  // Obtener estadísticas de usuarios
  async obtenerEstadisticasUsuarios() {
    return this.request('/usuarios/estadisticas');
  }

  // Obtener estadísticas de sesiones
  async obtenerEstadisticasSesiones() {
    return this.request('/sesiones/estadisticas');
  }

  // Obtener estadísticas generales
  async obtenerEstadisticasGenerales() {
    return this.request('/sesiones/estadisticas/generales');
  }
}

// Crear instancia única del servicio
const apiService = new ApiService();

export default apiService;
