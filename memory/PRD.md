# English Teachers Planner - PRD

## Problema Original
Aplicación web para docentes de primaria en Panamá (Pre-K a Grado 6) que genera planeamientos de clases de inglés alineados al nuevo currículo oficial de MEDUCA.

## Estructura del Currículo
- 8 Scenarios por grado
- 2 Themes por Scenario
- 5 lecciones por Scenario (cada una enfocada en una habilidad)
- 5 habilidades: Listening, Reading, Speaking, Writing, Mediation
- 6 etapas pedagógicas: warm-up, presentation, preparation, performance, assessment, reflection

## Enfoque Pedagógico: Planificación Hacia Atrás (Backward Planning)
La aplicación implementa el enfoque de planificación hacia atrás según directrices MEDUCA:
- **Lección 5 (Mediation)**: Proyecto oficial integrador - punto de partida
- **Lección 4 (Writing)**: Borradores y escritura preparatoria
- **Lección 3 (Speaking)**: Práctica oral
- **Lección 2 (Reading)**: Comprensión lectora
- **Lección 1 (Listening)**: Vocabulario fundamental

## Arquitectura Técnica
```
/app/
├── backend/          # FastAPI
│   ├── server.py
│   ├── data/
│   │   ├── grades/           # Datos curriculares por grado
│   │   ├── projects/official # Proyectos oficiales MEDUCA
│   │   └── generated_planners/ # JSONs pre-generados
│   └── requirements.txt
├── frontend/         # React + TailwindCSS + Shadcn
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.js
│   │   │   └── PreviewPage.js
│   │   └── components/
│   └── package.json
└── memory/
    └── PRD.md
```

## Funcionalidades Implementadas ✅

### MVP Completado
- [x] Selección de Grado, Scenario, Theme
- [x] Selección de Proyecto Oficial (3 proyectos por scenario)
- [x] Generación de planeamientos con datos curriculares
- [x] Objetivos SMART para 5 habilidades
- [x] Vista previa completa del planeamiento
- [x] Sección de Proyecto Oficial con todos los detalles
- [x] Función de edición inline
- [x] Exportación a Word (.docx) con sección del proyecto
- [x] Modo oscuro/claro
- [x] Interfaz bilingüe (ES/EN)
- [x] Archivos de guía para generación offline

### Correcciones Implementadas (Feb 2025)
- [x] Secciones de reading y mediation ya no están vacías
- [x] El proyecto seleccionado se muestra y exporta correctamente
- [x] Enfoque de Backward Planning implementado
- [x] Etiquetas actualizadas a "Proyecto Oficial (Lección 5)"

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
- [ ] Asistencia para integrar nuevos JSONs de planes

## URLs de Descarga (Archivos de Guía)
- planners_master_list.csv - Lista de 128 planeamientos
- planners_checklist.csv - Checklist de progreso
- GUIA_GENERACION_PLANNERS.md - Guía con prompt para IA
- TEMPLATE_EXAMPLE.json - Ejemplo completo de JSON

## API Endpoints
- `POST /api/planner/generate` - Genera planeamiento
- `POST /api/planner/export/docx` - Exporta a Word
- `GET /api/projects/official/{grade}/{scenario}` - Obtiene proyectos oficiales
- `GET /api/grades` - Lista de grados
- `GET /api/scenarios/{grade}` - Scenarios por grado
- `GET /api/themes/{grade}/{scenario}` - Themes por scenario

## Notas Importantes
- Los datos vienen de archivos JSON locales (no hay base de datos)
- El usuario es sensible a costos - evitar soluciones con costos recurrentes
- El usuario es no técnico - instrucciones deben ser simples
- Idioma preferido: Español
