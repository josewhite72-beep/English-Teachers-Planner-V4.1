# English Teachers Planner

Aplicación web educativa para generar planeamientos de clases de inglés alineados al nuevo currículo de inglés de MEDUCA de Panamá.

## 🎯 Características

- ✅ Generación de planeamientos para Pre-K a Grade 6
- ✅ 8 Scenarios × 2 Themes por grado
- ✅ 5 Lecciones por theme (Listening, Reading, Speaking, Writing, Mediation)
- ✅ Basado en currículo oficial MEDUCA
- ✅ Exportación a Word (.docx)
- ✅ Interfaz bilingüe (Español/Inglés)
- ✅ Modo claro/oscuro
- ✅ Sistema de planeamientos pregenerados (sin costos de IA)

## 🚀 Stack Tecnológico

**Frontend:**
- React 18
- Tailwind CSS
- Shadcn UI Components
- React Router
- Axios

**Backend:**
- FastAPI (Python)
- MongoDB
- Motor (async MongoDB driver)
- Python-docx (exportación Word)

## 📁 Estructura del Proyecto

```
/app
├── backend/
│   ├── server.py              # API FastAPI
│   ├── requirements.txt       # Dependencias Python
│   ├── .env                   # Variables de entorno
│   └── data/                  # Datos curriculares
│       ├── grades/            # Archivos JSON por grado
│       ├── projects/          # Proyectos oficiales y C21
│       ├── institutional_standards/
│       └── generated_planners/ # Planeamientos pregenerados
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── pages/
│   │   │   ├── HomePage.js
│   │   │   └── PreviewPage.js
│   │   ├── context/
│   │   │   └── PlannerContext.js
│   │   └── components/
│   │       └── ui/            # Componentes Shadcn
│   ├── package.json
│   └── .env
└── README.md
```

## 🛠️ Instalación Local

### Backend

```bash
cd backend
pip install -r requirements.txt
python server.py
```

El backend correrá en `http://localhost:8001`

### Frontend

```bash
cd frontend
yarn install
yarn start
```

El frontend correrá en `http://localhost:3000`

### Variables de Entorno

**Backend (.env):**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=teacher_planner
CORS_ORIGINS=*
```

**Frontend (.env):**
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 📚 Sistema de Planeamientos Pregenerados

Los planeamientos pueden generarse sin costos de IA usando archivos JSON pregenerados.

**Formato de nombre:**
```
{grade}_{scenario}_{theme}_{plan_type}_{language}.json
```

**Ejemplo:** `1_1_1_standard_es.json`

Ver `/backend/data/generated_planners/README.md` para más detalles.

## 🎨 Características de Diseño

- Paleta institucional azul/verde (Teal)
- Diseño responsive (móvil, tablet, desktop)
- Modo claro y oscuro
- Transiciones suaves
- Tipografía: Manrope (headings) + Inter (body)

## 📄 Licencia

© 2025 - Uso educativo

## 👨‍💻 Autor

Jose White - English Teachers Planner
