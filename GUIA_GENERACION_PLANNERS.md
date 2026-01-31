# 📚 Guía para Generar Planeamientos con IAs Gratuitas

## 🎯 Objetivo
Generar planeamientos completos usando ChatGPT, Claude o Gemini gratis, y convertirlos a JSON para usar en la app.

---

## 📋 Checklist de Planeamientos

**Archivo:** `planners_checklist.csv`

Este archivo contiene **128 planeamientos** (8 grados × 8 scenarios × 2 themes):
- Pre-K: 16 planeamientos
- K: 16 planeamientos  
- Grade 1-6: 16 planeamientos cada uno

Marca como "Completado" conforme los vayas generando.

---

## 🤖 Prompt Template para IA

Copia y pega este prompt en ChatGPT/Claude/Gemini, reemplazando los valores entre [corchetes]:

```
Genera un planeamiento completo de clase de inglés para docentes de primaria en Panamá, alineado al currículo MEDUCA.

DATOS DEL PLANEAMIENTO:
- Grado: [Grade X]
- Nivel CEFR: [consulta tabla de niveles CEFR abajo]
- Scenario: [Scenario X: Nombre del Scenario]
- Theme: [Nombre del Theme]
- Tipo de plan: Standard
- Idioma: Español

INFORMACIÓN DEL CURRÍCULO:
[Pega aquí el contenido del archivo grades/[grade].json para este scenario y theme específico]

---

GENERA EL PLANEAMIENTO EN FORMATO JSON CON ESTA ESTRUCTURA EXACTA:

{
  "grade": "[grade]",
  "scenario": "[Scenario completo]",
  "theme": "[Theme completo]",
  "plan_type": "standard",
  "language": "es",
  "theme_planner": {
    "specific_objectives": {
      "listening": "[Objetivo SMART específico para listening - debe ser específico, medible, alcanzable, relevante y con tiempo definido]",
      "reading": "[Objetivo SMART específico para reading]",
      "speaking": "[Objetivo SMART específico para speaking]",
      "writing": "[Objetivo SMART específico para writing]",
      "mediation": "[Objetivo SMART específico para mediation]"
    },
    "materials_and_strategies": {
      "required_materials": [
        "[Material específico 1 con descripción detallada]",
        "[Material específico 2]",
        "[Material específico 3]",
        "[Mínimo 8 materiales concretos y específicos]"
      ],
      "differentiated_instruction": "[Estrategias detalladas para diferentes estilos de aprendizaje (visual, auditivo, kinestésico), estudiantes con dificultades, estudiantes avanzados, y ELL. Mínimo 150 palabras]"
    }
  },
  "lesson_planners": [
    {
      "lesson_number": 1,
      "skill_focus": "Listening",
      "specific_objective": "[Objetivo SMART específico para esta lección de listening - qué lograrán los estudiantes al final de esta lección específica]",
      "time": "45-60 minutos",
      "lesson_stages": [
        {
          "stage": "Warm-up / Pre-task",
          "activities": [
            "[Actividad específica 1 con instrucciones paso a paso]",
            "[Actividad específica 2 con detalles de implementación]",
            "[Actividad específica 3 con materiales necesarios]",
            "[Mínimo 3 actividades detalladas]"
          ]
        },
        {
          "stage": "Presentation",
          "activities": [
            "[Actividad de presentación 1 - cómo introducir el contenido nuevo]",
            "[Actividad de presentación 2 - ejemplos específicos a usar]",
            "[Actividad de presentación 3 - demostración o modelaje]",
            "[Mínimo 3 actividades detalladas]"
          ]
        },
        {
          "stage": "Preparation",
          "activities": [
            "[Actividad de práctica guiada 1 con scaffolding específico]",
            "[Actividad de práctica guiada 2 con apoyo del docente]",
            "[Actividad de práctica guiada 3 con trabajo en parejas/grupos]",
            "[Mínimo 3 actividades detalladas]"
          ]
        },
        {
          "stage": "Performance",
          "activities": [
            "[Actividad independiente 1 - qué harán los estudiantes solos]",
            "[Actividad independiente 2 - producción del estudiante]",
            "[Actividad independiente 3 - demostración de la habilidad]",
            "[Mínimo 3 actividades detalladas]"
          ]
        },
        {
          "stage": "Assessment / Post-task",
          "activities": [
            "[Estrategia de evaluación formativa 1 - cómo verificar comprensión]",
            "[Estrategia de evaluación formativa 2 - feedback específico]",
            "[Estrategia de evaluación formativa 3 - auto-evaluación]",
            "[Mínimo 3 actividades detalladas]"
          ]
        },
        {
          "stage": "Reflection",
          "activities": [
            "[Actividad de reflexión 1 - qué preguntas hacer]",
            "[Actividad de reflexión 2 - auto-evaluación del aprendizaje]",
            "[Actividad de reflexión 3 - cierre de la lección]",
            "[Mínimo 3 actividades detalladas]"
          ]
        }
      ],
      "comments": {
        "homework": "[Tarea específica y significativa relacionada al listening y al theme. Debe ser práctica, realizable en casa, y reforzar lo aprendido. Mínimo 2-3 oraciones]",
        "formative_assessment": "[Estrategias específicas de evaluación formativa: qué observar, cómo verificar comprensión, criterios de éxito. Mínimo 2-3 oraciones]",
        "teacher_comments": "[Notas importantes para el docente: tips, desafíos comunes, diferenciación, timing. Mínimo 2-3 oraciones]"
      }
    },
    {
      "lesson_number": 2,
      "skill_focus": "Reading",
      "specific_objective": "[Objetivo SMART para Reading]",
      "time": "45-60 minutos",
      "lesson_stages": [
        "[Misma estructura que Lesson 1, pero enfocada en Reading]"
      ],
      "comments": {
        "homework": "[Tarea específica para Reading]",
        "formative_assessment": "[Evaluación para Reading]",
        "teacher_comments": "[Notas para Reading]"
      }
    },
    {
      "lesson_number": 3,
      "skill_focus": "Speaking",
      "specific_objective": "[Objetivo SMART para Speaking]",
      "time": "45-60 minutos",
      "lesson_stages": [
        "[Misma estructura, enfocada en Speaking]"
      ],
      "comments": {
        "homework": "[Tarea para Speaking]",
        "formative_assessment": "[Evaluación para Speaking]",
        "teacher_comments": "[Notas para Speaking]"
      }
    },
    {
      "lesson_number": 4,
      "skill_focus": "Writing",
      "specific_objective": "[Objetivo SMART para Writing]",
      "time": "45-60 minutos",
      "lesson_stages": [
        "[Misma estructura, enfocada en Writing]"
      ],
      "comments": {
        "homework": "[Tarea para Writing]",
        "formative_assessment": "[Evaluación para Writing]",
        "teacher_comments": "[Notas para Writing]"
      }
    },
    {
      "lesson_number": 5,
      "skill_focus": "Mediation",
      "specific_objective": "[Objetivo SMART para Mediation]",
      "time": "45-60 minutos",
      "lesson_stages": [
        "[Misma estructura, enfocada en Mediation]"
      ],
      "comments": {
        "homework": "[Tarea para Mediation]",
        "formative_assessment": "[Evaluación para Mediation]",
        "teacher_comments": "[Notas para Mediation]"
      }
    }
  ]
}

---

REQUISITOS CRÍTICOS:
1. Cada actividad debe ser ESPECÍFICA y PRÁCTICA, no genérica
2. Incluir instrucciones paso a paso que el docente pueda seguir
3. Todas las actividades deben estar relacionadas directamente al Theme
4. Usar vocabulario y gramática del currículo MEDUCA para este scenario
5. Objetivos SMART deben ser específicos, medibles, alcanzables, relevantes y con tiempo
6. Mínimo 3 actividades por stage, cada una con 2-3 oraciones de descripción
7. Materiales deben ser concretos (ej: "Flashcards con imágenes de frutas", no solo "flashcards")
8. Homework debe ser realizable en casa sin recursos especiales
9. Todo en español
10. El JSON debe ser válido (verifica con jsonlint.com antes de guardar)

DEVUELVE SOLO EL JSON, SIN TEXTO ADICIONAL ANTES O DESPUÉS.
```

---

## 📊 Tabla de Niveles CEFR por Grado

| Grado | Nivel CEFR |
|-------|------------|
| Pre-K | Pre A1.1   |
| K     | Pre A1.2   |
| 1     | A1.1       |
| 2     | A1.2       |
| 3     | A2.1       |
| 4     | A2.2       |
| 5     | B1.1       |
| 6     | B1.2       |

---

## 📁 Nombres de Archivos

Usa este formato exacto:
```
{grade}_{scenario_num}_{theme_num}_{plan_type}_{language}.json
```

**Ejemplos:**
- `1_1_1_standard_es.json` = Grade 1, Scenario 1, Theme 1, Standard, Español
- `3_2_2_standard_es.json` = Grade 3, Scenario 2, Theme 2, Standard, Español
- `pre_k_1_1_standard_es.json` = Pre-K, Scenario 1, Theme 1, Standard, Español

---

## 🔄 Proceso Recomendado

### Paso 1: Preparación
1. Abre el archivo `planners_checklist.csv`
2. Selecciona el primer planeamiento pendiente
3. Abre el archivo `/app/backend/data/grades/[grade].json`
4. Localiza el scenario y theme correspondiente

### Paso 2: Generación con IA
1. Copia el prompt template
2. Reemplaza [grade], [scenario], [theme]
3. Pega el contenido del currículo relevante
4. Envía a ChatGPT/Claude/Gemini
5. Espera la respuesta completa

### Paso 3: Validación
1. Copia el JSON generado
2. Ve a https://jsonlint.com
3. Pega y valida que sea JSON válido
4. Corrige errores si los hay

### Paso 4: Guardar
1. Crea archivo con nombre correcto: `[grade]_[S]_[T]_standard_es.json`
2. Guárdalo en `/app/backend/data/generated_planners/`
3. Marca como "Completado" en el checklist

### Paso 5: Probar
1. Genera ese planeamiento en la app
2. Verifica que se vea correctamente
3. Exporta a Word para verificar formato

---

## 💡 Tips para Mejores Resultados

**Con ChatGPT:**
- Usa GPT-4 si tienes acceso (mejor calidad)
- Si la respuesta se corta, pide "continúa desde donde quedaste"
- Pide "regenera solo la lección X" si una está débil

**Con Claude:**
- Excelente para seguir estructuras complejas
- Puede generar respuestas muy detalladas
- Pide aclaraciones si algo no está claro

**Con Gemini:**
- Bueno para contenido educativo
- Usa Gemini Advanced si tienes acceso
- Valida bien el JSON (a veces tiene errores de formato)

**General:**
- Haz un planeamiento de prueba primero
- Ajusta el prompt si los resultados no son buenos
- Guarda tu prompt ajustado para reutilizar
- Genera en bloques (ej: todos los de Grade 1 primero)

---

## 🎯 Priorización Sugerida

Empieza por los grados más usados:

**Alta Prioridad (16 planeamientos):**
- Grade 1 (todos los scenarios y themes)

**Media Prioridad (32 planeamientos):**
- Grade 2 (todos)
- Grade 3 (todos)

**Baja Prioridad (80 planeamientos):**
- Pre-K, K, 4, 5, 6

**Total:** 128 planeamientos

A ~10-15 minutos por planeamiento = **20-30 horas** de trabajo total (puedes hacerlo gradualmente)

---

## ✅ Checklist de Calidad

Antes de guardar cada JSON, verifica:

- [ ] JSON es válido (jsonlint.com)
- [ ] Tiene los 5 objetivos SMART
- [ ] Tiene 8+ materiales específicos
- [ ] Tiene las 5 lecciones completas
- [ ] Cada lección tiene 6 stages
- [ ] Cada stage tiene 3+ actividades detalladas
- [ ] Actividades son específicas (no genéricas)
- [ ] Homework, assessment y teacher notes están completos
- [ ] Todo está en español
- [ ] Nombre de archivo es correcto
- [ ] El planeamiento se genera correctamente en la app

---

## 🆘 Solución de Problemas

**"El JSON tiene errores"**
- Usa jsonlint.com para identificar dónde está el error
- Común: comillas sin cerrar, comas de más al final

**"Las actividades son muy genéricas"**
- Agrega al prompt: "Incluye ejemplos ESPECÍFICOS con el vocabulario de [theme]"
- Pide: "Sé más específico en las instrucciones para el docente"

**"La respuesta se cortó"**
- Di: "Continúa desde donde quedaste"
- O: "Regenera solo la lección 4 y 5"

**"No se genera en la app"**
- Verifica el nombre del archivo esté correcto
- Revisa que scenario y theme coincidan exactamente con el archivo grades/[grade].json
- Verifica que el JSON sea válido

---

## 📞 Soporte

Si tienes dudas:
1. Revisa el archivo `TEMPLATE_EXAMPLE.json` como referencia
2. Consulta el `README.md` en `/backend/data/generated_planners/`
3. Prueba generar uno y valida en la app

---

¡Buena suerte generando los planeamientos! 🎓
