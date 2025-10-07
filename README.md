# Proyecto de Factorización de Ecuaciones Cuadráticas

Una aplicación React interactiva que permite a los usuarios practicar la factorización de ecuaciones cuadráticas mediante el método de multiplicación cruzada.

## Características

- **Interfaz Interactiva**: Los usuarios pueden ingresar valores en campos de entrada que reemplazan los números rojos de la imagen original
- **Cálculo en Tiempo Real**: Los productos y la suma se calculan automáticamente
- **Validación Automática**: El sistema verifica si la factorización es correcta
- **Diseño Responsivo**: Funciona en dispositivos móviles y escritorio
- **Interfaz Visual Clara**: Diseño centrado con colores distintivos para cada sección

## Instalación

1. Asegúrate de tener Node.js instalado en tu sistema
2. Navega al directorio del proyecto
3. Instala las dependencias:

```bash
npm install
```

## Ejecución

Para ejecutar la aplicación en modo desarrollo:

```bash
npm start
```

La aplicación se abrirá en [http://localhost:3000](http://localhost:3000) en tu navegador.

## Uso

1. **Ecuación Original**: La aplicación muestra la ecuación `3x² - 5x - 2 = 0`
2. **Factores de 3x²**: Ingresa los factores en los campos de la izquierda (por defecto: `x` y `3x`)
3. **Factores de -2**: Ingresa los factores en los campos de la derecha (por defecto: `-2` y `1`)
4. **Productos**: Los campos de productos se calculan automáticamente
5. **Suma**: La suma se calcula automáticamente y debe ser igual a `-5x`
6. **Validación**: El sistema te indica si la factorización es correcta

## Estructura del Proyecto

```
src/
├── components/
│   ├── FactorizacionComponent.js    # Componente principal de factorización
│   └── FactorizacionComponent.css    # Estilos del componente
├── App.js                           # Componente principal de la aplicación
├── App.css                          # Estilos globales
├── index.js                         # Punto de entrada de React
└── index.css                        # Estilos base
```

## Tecnologías Utilizadas

- **React 18**: Framework de JavaScript para interfaces de usuario
- **CSS3**: Estilos modernos con gradientes y efectos visuales
- **JavaScript ES6+**: Funcionalidades modernas de JavaScript

## Características Técnicas

- **Estado Reactivo**: Utiliza hooks de React para manejo de estado
- **Cálculos Automáticos**: useEffect para cálculos en tiempo real
- **Validación Inteligente**: Verificación automática de la corrección de la factorización
- **Diseño Responsivo**: Media queries para adaptación a diferentes pantallas
- **Accesibilidad**: Campos de entrada con etiquetas claras y feedback visual

## Personalización

Puedes modificar la ecuación original cambiando el valor de `ecuacionOriginal` en el componente `FactorizacionComponent.js`.

Para cambiar los valores por defecto, modifica el estado inicial en el hook `useState`.
"# Frontend-Quipus" 
