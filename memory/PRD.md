# PanaMentor - Product Requirements Document

## Original Problem Statement
Web application called "English Teachers Planner" for primary school teachers (Pre-K to Grade 6) in Panama. Core function: generate English class plans aligned to the official MEDUCA curriculum with options to select grade, scenario, theme, and plan type. Plans include "21st Century Project" with export to Word and PDF capabilities.

**Vision Evolution:** Platform expanded to **PanaMentor**, a modular educational platform with six main components:
1. **PanaMentor Planner** - Lesson planner (IMPLEMENTED ✅)
2. **PanaMentor Resources** - Teaching materials repository (PENDING)
3. **PanaMentor Reading** - Student reading comprehension (PENDING)
4. **PanaMentor StudyBuddy** - AI-assisted tutor (PENDING)
5. **PanaMentor Validator** - Curriculum alignment checker (PENDING)
6. **PanaMentor Teacher Grading Book** - Digital gradebook (PENDING)

## User Personas
- **Primary:** English teachers in Panama (Pre-K to Grade 6)
- **Secondary:** School directors
- **Future:** Students (for Reading and StudyBuddy modules)

## Technical Stack
- **Frontend:** React, TailwindCSS, Shadcn/UI
- **Backend:** FastAPI (Python)
- **Data Storage:** JSON files (migration to MongoDB planned)
- **Document Generation:** python-docx (Word), weasyprint (PDF - pending)

---

## What's Been Implemented

### ✅ PanaMentor Planner (v2.0) - MEDUCA Official Format
**Completed: February 6, 2025**

#### Theme Planner (6 Sections - Official MEDUCA Format)
1. **General Information**
   - Teacher(s) name
   - Grade
   - CEFR Level (auto-assigned per grade)
   - Trimester (1, 2, 3)
   - Weekly Hours
   - Week range (From/To)
   - Scenario
   - Theme

2. **Specific Standards and Learning Outcomes**
   - 3-column table: Skills | Specific Standards | Learning Outcomes
   - All 5 skills: Listening, Reading, Speaking, Writing, Mediation

3. **Communicative Competences**
   - 3-column layout: Linguistic (Learn to Know) | Pragmatic (Learn to Do) | Sociolinguistic (Learn to Be)
   - Grammatical Features
   - Vocabulary
   - Pronunciation & Phonemic Awareness
   - 21st Century Project section

4. **Specific Objectives**
   - SMART objectives per skill
   - Editable in preview

5. **Materials and Teaching Strategies**
   - Required materials list
   - DLN (Differentiated Learning Needs) section

6. **Learning Sequence**
   - Table: Lesson | Learning Sequence | Date
   - 5 lessons mapped to skills progression
   - Editable date column

#### Lesson Planner (5 Lessons - Official MEDUCA Format)
- **Header:** GOBIERNO NACIONAL | MINISTERIO DE EDUCACIÓN
- **Title:** "Lesson Planner – Theme # ___ – Lesson # ___"
- **Info Fields:** Grade, Scenario, Theme, Date(s), Learning Sequence time
- **Objectives:** Specific Objective, Learning Outcome
- **The Six Action-oriented Approach Lesson Stages:**
  1. Stage 1 - Warm-up / Pre-task
  2. Stage 2 - Presentation
  3. Stage 3 - Preparation
  4. Stage 4 - Performance
  5. Stage 5 - Assessment / Post-task
  6. Stage 6 - Reflection
  - Each stage has: Activities + Estimated Date and Time column
- **Comments Section:** Homework, Formative Assessment, Teacher's Comments

#### Word Export (.docx)
- Full MEDUCA official format
- All 6 Theme Planner sections
- All 5 Lesson Planners with 6 stages
- 21st Century Project details (if selected)

#### Previous Features (Still Working)
- Grade selection (Pre-K to Grade 6)
- Scenario and Theme selection
- Plan types: Basic, Standard, Enriched
- 21st Century Project selection (all grades integrated)
- Dark/Light mode
- Bilingual UI (Spanish/English)
- Editable fields in preview

---

## Prioritized Backlog

### P0 - Foundation (Next Priority)
- [ ] PWA Conversion (manifest.json, service worker)
- [ ] MongoDB migration
- [ ] User authentication system (JWT or Google Auth)
- [ ] Main dashboard with module selector

### P1 - Core Modules
- [ ] PDF Export (weasyprint already installed)
- [ ] PanaMentor Teacher Grading Book
- [ ] PanaMentor Validator

### P2 - Extended Features
- [ ] PanaMentor Resources repository
- [ ] Backend refactoring (modular routes)

### P3 - Future
- [ ] PanaMentor Reading
- [ ] PanaMentor StudyBuddy (AI integration)

---

## API Endpoints

### Working Endpoints
- `GET /api/grades` - List all grades
- `GET /api/scenarios/{grade}` - Get scenarios for grade
- `GET /api/themes/{grade}/{scenario}` - Get themes
- `GET /api/projects/{grade}/{scenario_id}` - Get 21st Century Projects
- `POST /api/planner/generate` - Generate lesson planner
- `POST /api/planner/export/docx` - Export to Word

### Planned Endpoints
- `POST /api/planner/export/pdf` - Export to PDF
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/resources` - Teaching resources
- `POST /api/validator/check` - Curriculum alignment

---

## Database Schema (Planned for MongoDB)

```javascript
// Users
{ _id, email, password, role, name, school, grades_assigned, created_at }

// Students
{ _id, name, grade, teacher_id, created_at }

// Assessments
{ _id, student_id, teacher_id, grade, skill, score, instrument_type, observations, date }

// Resources
{ _id, title, type, url, grade, skill, created_by }
```

---

## File Structure

```
/app/
├── backend/
│   ├── server.py              # Main API (all endpoints)
│   ├── data/
│   │   ├── grades/           # Curriculum JSON files
│   │   └── projects/official/ # 21st Century Projects
│   └── tests/
│       └── test_planner_features.py
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.js    # Form with MEDUCA fields
│   │   │   └── PreviewPage.js # MEDUCA format preview
│   │   ├── context/
│   │   │   └── PlannerContext.js
│   │   └── components/ui/     # Shadcn components
│   └── public/
└── memory/
    └── PRD.md                 # This file
```

---

## Testing Status
- **Backend:** 22/22 tests passing (100%)
- **Frontend:** All UI flows verified
- **Test Reports:** `/app/test_reports/iteration_3.json`

---

## Notes for Next Agent
- User prefers responses in **Spanish**
- User is cost-sensitive - work efficiently
- MEDUCA format is now the standard for all exports
- All curriculum data (Pre-K to Grade 6) is complete
- 21st Century Projects integrated for all grades
