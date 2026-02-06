"""
Test suite for English Teachers Planner - Testing specific features:
1. Specific objectives generation for 5 skills
2. Official projects selector (3 projects)
3. Project selection and generation
4. Project display in preview
5. DOCX export with project section
6. Project selector label
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestOfficialProjects:
    """Test official projects endpoint returns 3 projects per scenario"""
    
    def test_projects_endpoint_returns_3_projects_grade1(self):
        """Verify that official projects endpoint returns exactly 3 projects for Grade 1"""
        response = requests.get(f"{BASE_URL}/api/projects/official/1/Scenario%201%3A%20All%20Week%20Long!")
        assert response.status_code == 200
        
        data = response.json()
        projects = data.get('projects', [])
        
        # Should return 3 projects
        assert len(projects) == 3, f"Expected 3 projects, got {len(projects)}"
        
        # Each project should have required fields
        for project in projects:
            assert 'id' in project, "Project missing 'id' field"
            assert 'name' in project, "Project missing 'name' field"
            assert 'category' in project, "Project missing 'category' field"
            assert 'overview' in project, "Project missing 'overview' field"
            assert 'general_objective' in project, "Project missing 'general_objective' field"
            assert 'activities' in project, "Project missing 'activities' field"
            assert 'rubric_criteria' in project, "Project missing 'rubric_criteria' field"
    
    def test_projects_have_valid_ids(self):
        """Verify projects have valid IDs for selection"""
        response = requests.get(f"{BASE_URL}/api/projects/official/1/Scenario%201%3A%20All%20Week%20Long!")
        data = response.json()
        projects = data.get('projects', [])
        
        project_ids = [p.get('id') for p in projects]
        assert 'grade1_scenario1_project1' in project_ids
        assert 'grade1_scenario1_project2' in project_ids
        assert 'grade1_scenario1_project3' in project_ids


class TestSpecificObjectives:
    """Test that specific objectives are generated for all 5 skills"""
    
    def test_objectives_generated_for_all_5_skills(self):
        """Verify specific objectives are generated for listening, reading, speaking, writing, mediation"""
        response = requests.post(f"{BASE_URL}/api/planner/generate", json={
            "grade": "1",
            "scenario": "Scenario 1: All Week Long!",
            "theme": "Days of the Week",
            "plan_type": "standard",
            "official_format": False,
            "project_id": None,
            "language": "es"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        objectives = data.get('theme_planner', {}).get('specific_objectives', {})
        
        # All 5 skills must have objectives
        required_skills = ['listening', 'reading', 'speaking', 'writing', 'mediation']
        for skill in required_skills:
            assert skill in objectives, f"Missing objective for {skill}"
            assert objectives[skill], f"Empty objective for {skill}"
            assert len(objectives[skill]) > 10, f"Objective for {skill} is too short"
    
    def test_objectives_are_meaningful(self):
        """Verify objectives contain meaningful content, not just placeholders"""
        response = requests.post(f"{BASE_URL}/api/planner/generate", json={
            "grade": "1",
            "scenario": "Scenario 1: All Week Long!",
            "theme": "Days of the Week",
            "plan_type": "standard",
            "language": "es"
        })
        
        data = response.json()
        objectives = data.get('theme_planner', {}).get('specific_objectives', {})
        
        # Check that objectives are not empty placeholders
        for skill, objective in objectives.items():
            assert 'TODO' not in objective.upper(), f"Objective for {skill} contains TODO"
            assert 'PLACEHOLDER' not in objective.upper(), f"Objective for {skill} contains PLACEHOLDER"
            assert len(objective) > 20, f"Objective for {skill} is too short to be meaningful"


class TestProjectInGeneration:
    """Test that selected project appears in generated planner response"""
    
    def test_project_included_in_response_when_selected(self):
        """Verify project data is included when project_id is provided"""
        response = requests.post(f"{BASE_URL}/api/planner/generate", json={
            "grade": "1",
            "scenario": "Scenario 1: All Week Long!",
            "theme": "Days of the Week",
            "plan_type": "standard",
            "official_format": False,
            "project_id": "grade1_scenario1_project1",
            "language": "es"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Project should be in response
        project = data.get('project')
        assert project is not None, "Project is missing from response"
        
        # Verify project fields
        assert project.get('name') == "Days of the Week Calendar"
        assert project.get('category') == "Time Management & Organization"
        assert 'overview' in project and project['overview']
        assert 'general_objective' in project and project['general_objective']
        assert 'activities' in project and len(project['activities']) > 0
        assert 'rubric_criteria' in project and len(project['rubric_criteria']) > 0
    
    def test_project_not_included_when_not_selected(self):
        """Verify project is null when no project_id is provided"""
        response = requests.post(f"{BASE_URL}/api/planner/generate", json={
            "grade": "1",
            "scenario": "Scenario 1: All Week Long!",
            "theme": "Days of the Week",
            "plan_type": "standard",
            "project_id": None,
            "language": "es"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Project should be null
        project = data.get('project')
        assert project is None, f"Project should be None when not selected, got: {project}"
    
    def test_different_project_selection(self):
        """Verify selecting different project returns correct project data"""
        response = requests.post(f"{BASE_URL}/api/planner/generate", json={
            "grade": "1",
            "scenario": "Scenario 1: All Week Long!",
            "theme": "Days of the Week",
            "plan_type": "standard",
            "project_id": "grade1_scenario1_project2",
            "language": "es"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        project = data.get('project')
        assert project is not None
        assert project.get('name') == "Day of the Week Song"
        assert project.get('category') == "Music & Language Integration"


class TestDocxExport:
    """Test DOCX export includes project section"""
    
    def test_docx_export_with_project(self):
        """Verify DOCX export works and returns valid file"""
        planner_data = {
            "grade": "1",
            "scenario": "Scenario 1: All Week Long!",
            "theme": "Today Is Tuesday!",
            "plan_type": "standard",
            "theme_planner": {
                "general_information": {
                    "grade": "1",
                    "cefr_level": "A1.1",
                    "scenario": "Scenario 1: All Week Long!",
                    "theme": "Today Is Tuesday!"
                },
                "specific_objectives": {
                    "listening": "Test listening objective",
                    "reading": "Test reading objective",
                    "speaking": "Test speaking objective",
                    "writing": "Test writing objective",
                    "mediation": "Test mediation objective"
                },
                "materials_and_strategies": {
                    "required_materials": ["Flashcards", "Markers"],
                    "differentiated_instruction": "Test instruction"
                }
            },
            "lesson_planners": [],
            "project": {
                "name": "Days of the Week Calendar",
                "category": "Time Management",
                "overview": "Test overview",
                "general_objective": "Test general objective",
                "specific_objectives": ["Obj 1", "Obj 2"],
                "activities": ["Activity 1", "Activity 2"],
                "products_evidences": ["Product 1"],
                "rubric_criteria": {"Accuracy": "Test", "Completeness": "Test"},
                "duration": "2-3 class periods",
                "materials": ["Material 1"],
                "skills_developed": ["Skill 1"],
                "differentiation": "Test differentiation"
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/api/planner/export/docx",
            json=planner_data
        )
        
        assert response.status_code == 200
        assert response.headers.get('content-type') == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        
        # File should have content
        assert len(response.content) > 1000, "DOCX file is too small"
    
    def test_docx_export_without_project(self):
        """Verify DOCX export works without project"""
        planner_data = {
            "grade": "1",
            "scenario": "Scenario 1: All Week Long!",
            "theme": "Today Is Tuesday!",
            "plan_type": "standard",
            "theme_planner": {
                "general_information": {
                    "grade": "1",
                    "cefr_level": "A1.1"
                },
                "specific_objectives": {},
                "materials_and_strategies": {}
            },
            "lesson_planners": [],
            "project": None
        }
        
        response = requests.post(
            f"{BASE_URL}/api/planner/export/docx",
            json=planner_data
        )
        
        assert response.status_code == 200


class TestLessonPlanners:
    """Test lesson planners generation"""
    
    def test_5_lesson_planners_generated(self):
        """Verify 5 lesson planners are generated (one per skill)"""
        response = requests.post(f"{BASE_URL}/api/planner/generate", json={
            "grade": "1",
            "scenario": "Scenario 1: All Week Long!",
            "theme": "Days of the Week",
            "plan_type": "standard",
            "language": "es"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        lessons = data.get('lesson_planners', [])
        assert len(lessons) == 5, f"Expected 5 lessons, got {len(lessons)}"
        
        # Verify skills covered
        skills = [l.get('skill_focus', '').lower() for l in lessons]
        assert 'listening' in skills
        assert 'reading' in skills
        assert 'speaking' in skills
        assert 'writing' in skills
        assert 'mediation' in skills


class TestAPIEndpoints:
    """Test basic API endpoints"""
    
    def test_root_endpoint(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        assert 'message' in response.json()
    
    def test_grades_endpoint(self):
        """Test grades endpoint returns all grades"""
        response = requests.get(f"{BASE_URL}/api/grades")
        assert response.status_code == 200
        
        data = response.json()
        grades = data.get('grades', [])
        assert len(grades) == 8
        assert 'pre_k' in grades
        assert 'K' in grades
        assert '1' in grades
    
    def test_scenarios_endpoint(self):
        """Test scenarios endpoint for grade 1"""
        response = requests.get(f"{BASE_URL}/api/grades/1/scenarios")
        assert response.status_code == 200
        
        data = response.json()
        scenarios = data.get('scenarios', [])
        assert len(scenarios) > 0
    
    def test_themes_endpoint(self):
        """Test themes endpoint"""
        response = requests.get(f"{BASE_URL}/api/grades/1/scenarios/Scenario%201%3A%20All%20Week%20Long!/themes")
        assert response.status_code == 200
        
        data = response.json()
        themes = data.get('themes', [])
        assert len(themes) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])


class TestMEDUCAFormatFields:
    """Test new MEDUCA format fields: teacher_name, trimester, weekly_hours, week_from, week_to"""
    
    def test_generate_with_meduca_fields(self):
        """Verify planner generation accepts and returns MEDUCA fields"""
        response = requests.post(f"{BASE_URL}/api/planner/generate", json={
            "grade": "1",
            "scenario": "Scenario 1: All Week Long!",
            "theme": "Days of the Week",
            "plan_type": "standard",
            "official_format": True,
            "project_id": None,
            "language": "es",
            "teacher_name": "Prof. María García",
            "trimester": "2",
            "weekly_hours": "3",
            "week_from": "5",
            "week_to": "8"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Check general_information contains MEDUCA fields
        general_info = data.get('theme_planner', {}).get('general_information', {})
        assert general_info.get('teachers') == "Prof. María García", f"Expected teacher name, got: {general_info.get('teachers')}"
        assert general_info.get('trimester') == "2", f"Expected trimester 2, got: {general_info.get('trimester')}"
        assert general_info.get('weekly_hours') == "3", f"Expected weekly_hours 3, got: {general_info.get('weekly_hours')}"
        assert "5" in general_info.get('week_range', ''), f"Expected week_from 5 in week_range, got: {general_info.get('week_range')}"
        assert "8" in general_info.get('week_range', ''), f"Expected week_to 8 in week_range, got: {general_info.get('week_range')}"
    
    def test_generate_without_meduca_fields(self):
        """Verify planner generation works without MEDUCA fields (optional)"""
        response = requests.post(f"{BASE_URL}/api/planner/generate", json={
            "grade": "1",
            "scenario": "Scenario 1: All Week Long!",
            "theme": "Days of the Week",
            "plan_type": "standard",
            "language": "es"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Should still have general_information structure
        general_info = data.get('theme_planner', {}).get('general_information', {})
        assert 'grade' in general_info
        assert 'cefr_level' in general_info
    
    def test_docx_export_with_meduca_fields(self):
        """Verify DOCX export includes MEDUCA fields in General Information section"""
        planner_data = {
            "grade": "1",
            "scenario": "Scenario 1: All Week Long!",
            "theme": "Days of the Week",
            "plan_type": "standard",
            "theme_planner": {
                "general_information": {
                    "teachers": "Prof. María García",
                    "grade": "1",
                    "cefr_level": "A1.1",
                    "trimester": "2",
                    "weekly_hours": "3",
                    "week_range": "From week 5 to week 8",
                    "scenario": "Scenario 1: All Week Long!",
                    "theme": "Days of the Week"
                },
                "standards_and_learning_outcomes": {},
                "communicative_competences": {},
                "specific_objectives": {},
                "materials_and_strategies": {}
            },
            "lesson_planners": [],
            "project": None
        }
        
        response = requests.post(
            f"{BASE_URL}/api/planner/export/docx",
            json=planner_data
        )
        
        assert response.status_code == 200
        assert response.headers.get('content-type') == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        assert len(response.content) > 1000, "DOCX file is too small"


class TestThemePlannerSections:
    """Test Theme Planner sections according to MEDUCA format"""
    
    def test_theme_planner_has_all_sections(self):
        """Verify theme planner has all 6 required sections"""
        response = requests.post(f"{BASE_URL}/api/planner/generate", json={
            "grade": "1",
            "scenario": "Scenario 1: All Week Long!",
            "theme": "Days of the Week",
            "plan_type": "standard",
            "language": "es"
        })
        
        assert response.status_code == 200
        data = response.json()
        theme_planner = data.get('theme_planner', {})
        
        # Section 1: General Information
        assert 'general_information' in theme_planner, "Missing Section 1: General Information"
        
        # Section 2: Standards and Learning Outcomes
        assert 'standards_and_learning_outcomes' in theme_planner, "Missing Section 2: Standards and Learning Outcomes"
        
        # Section 3: Communicative Competences
        assert 'communicative_competences' in theme_planner, "Missing Section 3: Communicative Competences"
        
        # Section 4: Specific Objectives
        assert 'specific_objectives' in theme_planner, "Missing Section 4: Specific Objectives"
        
        # Section 5: Materials and Strategies
        assert 'materials_and_strategies' in theme_planner, "Missing Section 5: Materials and Strategies"
        
        # Section 6: Learning Sequence
        assert 'learning_sequence' in theme_planner, "Missing Section 6: Learning Sequence"
    
    def test_standards_has_5_skills(self):
        """Verify standards section has all 5 skills"""
        response = requests.post(f"{BASE_URL}/api/planner/generate", json={
            "grade": "1",
            "scenario": "Scenario 1: All Week Long!",
            "theme": "Days of the Week",
            "plan_type": "standard",
            "language": "es"
        })
        
        data = response.json()
        standards = data.get('theme_planner', {}).get('standards_and_learning_outcomes', {})
        
        required_skills = ['listening', 'reading', 'speaking', 'writing', 'mediation']
        for skill in required_skills:
            assert skill in standards, f"Missing skill in standards: {skill}"
    
    def test_communicative_competences_structure(self):
        """Verify communicative competences has 3 columns: linguistic, pragmatic, sociolinguistic"""
        response = requests.post(f"{BASE_URL}/api/planner/generate", json={
            "grade": "1",
            "scenario": "Scenario 1: All Week Long!",
            "theme": "Days of the Week",
            "plan_type": "standard",
            "language": "es"
        })
        
        data = response.json()
        competences = data.get('theme_planner', {}).get('communicative_competences', {})
        
        assert 'linguistic' in competences, "Missing linguistic competence"
        assert 'pragmatic' in competences, "Missing pragmatic competence"
        assert 'sociolinguistic' in competences, "Missing sociolinguistic competence"


class TestLessonPlannerMEDUCAFormat:
    """Test Lesson Planner MEDUCA format with 6 stages"""
    
    def test_lesson_has_6_stages(self):
        """Verify each lesson has 6 action-oriented approach stages"""
        response = requests.post(f"{BASE_URL}/api/planner/generate", json={
            "grade": "1",
            "scenario": "Scenario 1: All Week Long!",
            "theme": "Days of the Week",
            "plan_type": "standard",
            "language": "es"
        })
        
        assert response.status_code == 200
        data = response.json()
        lessons = data.get('lesson_planners', [])
        
        assert len(lessons) == 5, f"Expected 5 lessons, got {len(lessons)}"
        
        for lesson in lessons:
            stages = lesson.get('lesson_stages', [])
            assert len(stages) == 6, f"Lesson {lesson.get('lesson_number')} should have 6 stages, got {len(stages)}"
    
    def test_lesson_has_comments_section(self):
        """Verify each lesson has comments section with homework, formative assessment, teacher comments"""
        response = requests.post(f"{BASE_URL}/api/planner/generate", json={
            "grade": "1",
            "scenario": "Scenario 1: All Week Long!",
            "theme": "Days of the Week",
            "plan_type": "standard",
            "language": "es"
        })
        
        data = response.json()
        lessons = data.get('lesson_planners', [])
        
        for lesson in lessons:
            comments = lesson.get('comments', {})
            assert 'homework' in comments, f"Lesson {lesson.get('lesson_number')} missing homework in comments"
            assert 'formative_assessment' in comments, f"Lesson {lesson.get('lesson_number')} missing formative_assessment"
            assert 'teacher_comments' in comments, f"Lesson {lesson.get('lesson_number')} missing teacher_comments"
