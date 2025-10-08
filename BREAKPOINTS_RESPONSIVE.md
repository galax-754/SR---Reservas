# Sistema de Breakpoints Responsive - Sistema de Reservas

## 📐 Breakpoints Implementados

Este documento detalla el sistema de breakpoints responsive implementado en el dashboard de reservas.

### Breakpoints de Tailwind CSS Utilizados

| Breakpoint | Tamaño | Aproximación Usuario | Descripción |
|------------|--------|---------------------|-------------|
| `sm:` | ≥ 640px | - | Mobile pequeño a tablet |
| `md:` | ≥ 768px | - | Tablet |
| `lg:` | ≥ 1024px | **≥ 950px** | Desktop pequeño |
| `xl:` | ≥ 1280px | **≥ 1170px** | Desktop grande |

---

## 🎯 Implementación por Componente

### 1. Selector de Vistas (View Mode)

#### Mobile/Tablet (< 1024px / ~950px)
```tsx
<div className="lg:hidden">
  <select>
    <option value="list">Lista</option>
    <option value="map">Ver espacios</option>
  </select>
</div>
```
- ✅ **Dropdown selector**
- ✅ **Solo 2 opciones:** Lista y Ver espacios
- ❌ **Vista "Día" NO disponible**

#### Desktop (≥ 1024px / ~950px)
```tsx
<div className="hidden lg:flex">
  {/* Botones: Día, Mes, Lista, Ver espacios */}
</div>
```
- ✅ **Botones tradicionales**
- ✅ **Todas las vistas disponibles:** Día, Mes, Lista, Ver espacios
- ✅ Vista "Día" muestra múltiples espacios
- ✅ Vista "Mes" muestra calendario mensual completo

---

### 2. Botones de Acción (CRUD)

#### Mobile (< 1024px / ~950px)
```tsx
<div className="lg:hidden">
  <Button>Nueva</Button>
  <Button><MoreVertical /></Button> {/* Dropdown */}
</div>
```
- ✅ Botón **"Nueva"** visible
- ✅ Botón con **icono de 3 puntos** (MoreVertical)
- ✅ Dropdown con: Editar, Eliminar, Cancelar reserva

#### Tablet (≥ 1024px && < 1280px / ~950px-1170px)
```tsx
<div className="hidden lg:flex xl:hidden">
  <Button>Nueva reservación</Button>
  <Button>Acciones ▼</Button> {/* Dropdown */}
</div>
```
- ✅ Botón **"Nueva reservación"** con texto completo
- ✅ Botón **"Acciones"** con dropdown
- ✅ Dropdown con: Editar, Eliminar, Cancelar reserva

#### Desktop (≥ 1280px / ~1170px)
```tsx
<div className="hidden xl:flex">
  <Button>Nueva reservación</Button>
  <Button>Editar</Button>
  <Button>Eliminar</Button>
  <Button>Cancelar</Button>
  {modeActivo && <Button>Salir</Button>}
</div>
```
- ✅ **Todos los botones expandidos**
- ✅ Cada acción con su propio botón
- ✅ Botón "Salir" cuando hay un modo activo

---

### 3. Vista de Día (Day View)

#### Mobile/Tablet (< 1024px / ~950px)
- ❌ **Vista Día NO disponible**
- ❌ **Vista Mes NO disponible**
- ✅ **Forzado automático a "Lista"** si intentan acceder a Día o Mes
- ✅ **useEffect** detecta resize y cambia vista si es necesario

```tsx
useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth < 1024 && (viewMode === 'day' || viewMode === 'month')) {
      setViewMode('list')
    }
  }
  
  handleResize()
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [viewMode])
```

#### Desktop (≥ 1024px / ~950px)
- ✅ **Vista Día completa disponible**
- ✅ **Vista Mes completa disponible**
- ✅ **Grid con múltiples espacios** simultáneos (Vista Día)
- ✅ **Calendario mensual completo** (Vista Mes)
- ✅ **Sin selector de espacio único**
- ✅ Navegación por páginas de espacios (flechas)

```tsx
<div className="space-grid" 
  style={{ gridTemplateColumns: `200px repeat(${currentSpaces.length}, 1fr)` }}>
  {/* Múltiples columnas de espacios */}
</div>
```

---

### 4. Indicador de Modo Activo

#### Mobile/Tablet (< 1280px / ~1170px)
```tsx
<div className="xl:hidden">
  <div className="bg-blue-50 border border-blue-200">
    <span>Modo Edición / Modo Eliminar / Modo Cancelar</span>
    <button>Salir</button>
  </div>
</div>
```
- ✅ Badge visible cuando hay un modo activo
- ✅ Botón "Salir" integrado

#### Desktop (≥ 1280px / ~1170px)
- ❌ **Indicador oculto** (el botón "Salir" está en la barra de acciones)

---

## 🎨 Resumen Visual

```
┌─────────────────────────────────────────────────────────────┐
│                      BREAKPOINTS                             │
├─────────────┬─────────────┬──────────────┬──────────────────┤
│   Mobile    │   Tablet    │  Desktop S   │   Desktop L      │
│  < 1024px   │ 1024-1279px │  ≥ 1024px    │   ≥ 1280px       │
│  (~950px)   │ (~950-1170) │  (~950px)    │   (~1170px)      │
├─────────────┼─────────────┼──────────────┼──────────────────┤
│ VISTAS:                                                      │
│ Dropdown    │ Dropdown    │ Botones      │ Botones          │
│ Lista       │ Lista       │ Día ✓        │ Día ✓            │
│ Ver esp.    │ Ver esp.    │ Mes ✓        │ Mes ✓            │
│ ❌ Día      │ ❌ Día      │ Lista ✓      │ Lista ✓          │
│ ❌ Mes      │ ❌ Mes      │ Ver esp. ✓   │ Ver esp. ✓       │
├─────────────┼─────────────┼──────────────┼──────────────────┤
│ ACCIONES:                                                    │
│ Nueva + ⋮   │ Nueva + ▼   │ Nueva + ▼    │ Todos expandidos │
│ (solo icon) │ "Acciones"  │ "Acciones"   │ Nueva/Edit/Del   │
│             │             │              │ Cancel/Salir     │
├─────────────┼─────────────┼──────────────┼──────────────────┤
│ VISTA DÍA:                                                   │
│ ❌ No disp. │ ❌ No disp. │ ✓ Normal     │ ✓ Normal         │
│             │             │ Multi-espacio│ Multi-espacio    │
└─────────────┴─────────────┴──────────────┴──────────────────┘
```

---

## 📱 Comportamiento Responsive

### Auto-ajuste de Vista
- Si el usuario está en vista "Día" o "Mes" y reduce el ancho a < 1024px:
  - ✅ **Automáticamente cambia a "Lista"**
  - ✅ **Evento de resize detecta el cambio**
  - ✅ **Previene errores de visualización**

### Dropdown Menus
- Todos los dropdowns incluyen:
  - ✅ **Backdrop** para cerrar al hacer clic fuera
  - ✅ **Z-index** apropiado (z-40 backdrop, z-50 menu)
  - ✅ **Auto-cierre** después de seleccionar una opción

### Estados Visuales
- ✅ **Colores de estado** en opciones del dropdown:
  - Editar: `bg-blue-50 text-blue-700`
  - Eliminar: `bg-red-50 text-red-700`
  - Cancelar: `bg-orange-50 text-orange-700`

---

## 🔧 Implementación Técnica

### Archivos Modificados

1. **`src/components/features/dashboard-section.tsx`**
   - Selectores de vista responsive
   - Botones de acción responsive
   - useEffect para forzar cambio de vista
   - Eliminación de selector de espacio único en móvil

2. **`src/styles/dashboard-responsive.css`**
   - Eliminación de reglas CSS para espacio único
   - Mantenimiento de estilos base para vista día

### Clases Tailwind Clave

```css
/* Ocultar en pantallas grandes */
.lg:hidden        /* Ocultar en ≥ 1024px */
.xl:hidden        /* Ocultar en ≥ 1280px */

/* Mostrar solo en pantallas grandes */
.hidden .lg:flex  /* Mostrar solo en ≥ 1024px */
.hidden .xl:flex  /* Mostrar solo en ≥ 1280px */

/* Rangos específicos */
.hidden .lg:flex .xl:hidden  /* Mostrar solo entre 1024-1279px */
```

---

## ✅ Validación de Requisitos

| # | Requisito | Estado | Breakpoint |
|---|-----------|--------|------------|
| 1 | Vista Día oculta en móvil | ✅ | < 1024px |
| 2 | Vista Mes oculta en móvil | ✅ | < 1024px |
| 3 | Solo Lista y Ver espacios en móvil | ✅ | < 1024px |
| 4 | Menú de edición en un botón (tablet) | ✅ | 1024-1279px |
| 5 | Menú de edición en un botón (móvil) | ✅ | < 1024px |
| 6 | Vista Día normal en desktop | ✅ | ≥ 1024px |
| 7 | Vista Mes disponible en desktop | ✅ | ≥ 1024px |
| 8 | Sin selector de espacio único en desktop | ✅ | ≥ 1024px |
| 9 | Todos los botones expandidos en desktop grande | ✅ | ≥ 1280px |
| 10 | Todas las vistas (Día, Mes, Lista, Ver espacios) en desktop | ✅ | ≥ 1024px |

---

## 🎯 Resultado Final

El sistema ahora proporciona:

- ✅ **3 niveles de responsive:** Mobile, Tablet, Desktop
- ✅ **Optimización progresiva** según espacio disponible
- ✅ **Auto-ajuste inteligente** de vistas
- ✅ **Interfaz limpia** en todos los tamaños
- ✅ **Prevención de errores** de visualización

**Breakpoints aproximados del usuario:**
- 950px → Implementado con `lg:` (1024px)
- 1170px → Implementado con `xl:` (1280px)

Los breakpoints de Tailwind más cercanos garantizan compatibilidad cross-browser y mantenibilidad del código.

