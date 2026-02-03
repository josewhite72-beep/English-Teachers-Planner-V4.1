# English Teachers Planner - PRD

## Problema Original
Aplicación web para docentes de primaria en Panamá (Pre-K a Grado 6) que genera planeamientos de clases de inglés alineados al nuevo currículo oficial de MEDUCA.

## Estructura del Theme Planner (Formato MEDUCA)

El Theme Planner incluye 6 secciones principales:

### 1. Información General
- Docente(s), Grado, Nivel CEFR, Trimestre
- Horas Semanales, Semanas (desde/hasta), Scenario, Theme

### 2. Estándares Específicos y Resultados de Aprendizaje
- Listening (Comprensión Auditiva)
- Reading (Comprensión Lectora)
- Speaking (Expresión Oral)
- Writing (Expresión Escrita)
- Mediation

### 3. Competencias Comunicativas
- **Competencia Lingüística (Aprender a Conocer)**: Estructuras Gramaticales, Vocabulario, Pronunciación
- **Competencia Pragmática (Aprender a Hacer)**: Funciones Comunicativas y Marcadores del Discurso
- **Competencia Sociolingüística (Aprender a Ser)**: Interacciones Respetuosas y Participación Social
- **Proyecto del Siglo XXI**: Nombre, Categoría, Descripción, Objetivos, Actividades, Productos, Rúbrica

### 4. Objetivos Específicos
- Para Listening, Reading, Speaking, Writing, Mediation

### 5. Materiales y Estrategias de Enseñanza
- Lista de Materiales Requeridos
- Instrucción Diferenciada y Adaptaciones para DLN

### 6. Secuencia de Aprendizaje
- Lección 1: Listening y Fundamentos del Lenguaje
- Lección 2: Reading y Comprensión de Conceptos
- Lección 3: Speaking - Tareas Productivas/Interactivas
- Lección 4: Writing y Preparación del Proyecto
- Lección 5: Completar el Proyecto del Siglo XXI con Énfasis en Mediation

## Funcionalidades Implementadas ✅

### MVP Completado
- [x] Selección de Grado, Scenario, Theme
- [x] Selección de Proyecto del Siglo XXI (3 proyectos por scenario)
- [x] Theme Planner con las 6 secciones completas del formato MEDUCA
- [x] Specific Standards para las 5 habilidades (todos los formatos de datos)
- [x] Proyecto del Siglo XXI integrado en Competencias Comunicativas
- [x] Objetivos SMART para 5 habilidades
- [x] Vista previa completa del planeamiento
- [x] Función de edición inline
- [x] Exportación a Word (.docx) con todas las secciones
- [x] Modo oscuro/claro
- [x] Interfaz bilingüe (ES/EN)

### Correcciones Implementadas (Feb 2025)
- [x] Reading Standards ahora cargan correctamente para todos los grados
- [x] Proyecto del Siglo XXI se muestra en preview y exporta a Word
- [x] Soporte para múltiples formatos de datos JSON (receptive/productive, reading1/reading2, etc.)
- [x] Theme Planner reestructurado con las 6 secciones oficiales

## Arquitectura Técnica
```
/app/
├── backend/          # FastAPI
│   ├── server.py
│   ├── data/
│   │   ├── grades/           # Datos curriculares por grado
│   │   ├── projects/official # Proyectos del Siglo XXI
│   │   └── generated_planners/ # JSONs pre-generados
│   └── requirements.txt
├── frontend/         # React + TailwindCSS + Shadcn
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.js
│   │   │   └── PreviewPage.js (reestructurado)
│   │   └── components/
│   └── package.json
└── memory/
    └── PRD.md
```

## Tareas Pendientes

### P0 - Alta Prioridad
- [ ] Sistema de Autenticación
  - Login con Google y/o Email/Password
  - Sistema de códigos de acceso de un solo uso
  - Panel de administrador
  - Diferenciación usuarios Free/Premium

### P1 - Media Prioridad
- [ ] Exportación a PDF (weasyprint ya instalado)

### P2 - Baja Prioridad
- [ ] Estrategia de despliegue permanente (Vercel + Railway)

## API Endpoints
- `POST /api/planner/generate` - Genera planeamiento con standards del currículo
- `POST /api/planner/export/docx` - Exporta a Word con proyecto
- `GET /api/projects/official/{grade}/{scenario}` - Obtiene proyectos del Siglo XXI
- `GET /api/grades` - Lista de grados
- `GET /api/scenarios/{grade}` - Scenarios por grado
- `GET /api/themes/{grade}/{scenario}` - Themes por scenario

## Notas Importantes
- Los datos vienen de archivos JSON locales (no hay base de datos)
- Soporte para múltiples formatos de datos JSON según el grado
- Idioma preferido del usuario: Español
