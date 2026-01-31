#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class EnglishTeachersAPITester:
    def __init__(self, base_url="https://lessongen-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:500]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_get_grades(self):
        """Test getting list of grades"""
        success, response = self.run_test("Get Grades", "GET", "grades", 200)
        if success and 'grades' in response:
            grades = response['grades']
            expected_grades = ["pre_k", "K", "1", "2", "3", "4", "5", "6"]
            if set(grades) == set(expected_grades):
                print(f"   ✅ All 8 grades found: {grades}")
                return True, grades
            else:
                print(f"   ❌ Grade mismatch. Expected: {expected_grades}, Got: {grades}")
                return False, grades
        return success, response

    def test_get_scenarios(self, grade):
        """Test getting scenarios for a grade"""
        success, response = self.run_test(f"Get Scenarios for Grade {grade}", "GET", f"grades/{grade}/scenarios", 200)
        if success and 'scenarios' in response:
            scenarios = response['scenarios']
            print(f"   ✅ Found {len(scenarios)} scenarios: {scenarios[:2]}...")
            return True, scenarios
        return success, response

    def test_get_themes(self, grade, scenario):
        """Test getting themes for a scenario"""
        encoded_scenario = requests.utils.quote(scenario, safe='')
        success, response = self.run_test(f"Get Themes for {grade}/{scenario}", "GET", f"grades/{grade}/scenarios/{encoded_scenario}/themes", 200)
        if success and 'themes' in response:
            themes = response['themes']
            print(f"   ✅ Found {len(themes)} themes: {themes}")
            return True, themes
        return success, response

    def test_get_grade_content(self, grade):
        """Test getting complete grade content"""
        return self.run_test(f"Get Grade {grade} Content", "GET", f"grades/{grade}/content", 200)

    def test_get_official_projects(self, grade, scenario):
        """Test getting official projects"""
        encoded_scenario = requests.utils.quote(scenario, safe='')
        return self.run_test(f"Get Official Projects for {grade}/{scenario}", "GET", f"projects/official/{grade}/{encoded_scenario}", 200)

    def test_generate_planner(self, grade, scenario, theme):
        """Test planner generation"""
        planner_data = {
            "grade": grade,
            "scenario": scenario,
            "theme": theme,
            "plan_type": "standard",
            "official_format": False,
            "project_id": None,
            "language": "es"
        }
        
        success, response = self.run_test("Generate Planner", "POST", "planner/generate", 200, planner_data)
        if success:
            # Validate planner structure
            required_keys = ['grade', 'scenario', 'theme', 'theme_planner', 'lesson_planners']
            missing_keys = [key for key in required_keys if key not in response]
            if missing_keys:
                print(f"   ❌ Missing keys in planner: {missing_keys}")
                return False, response
            
            # Check lesson planners count
            lesson_planners = response.get('lesson_planners', [])
            if len(lesson_planners) != 5:
                print(f"   ❌ Expected 5 lesson planners, got {len(lesson_planners)}")
                return False, response
            
            # Check skills
            expected_skills = ['Listening', 'Reading', 'Speaking', 'Writing', 'Mediation']
            actual_skills = [lesson.get('skill_focus') for lesson in lesson_planners]
            if actual_skills != expected_skills:
                print(f"   ❌ Skill mismatch. Expected: {expected_skills}, Got: {actual_skills}")
                return False, response
            
            print(f"   ✅ Planner generated with {len(lesson_planners)} lessons")
            print(f"   ✅ Skills: {actual_skills}")
            return True, response
        
        return success, response

    def test_export_docx(self, planner_data):
        """Test DOCX export"""
        success, response = self.run_test("Export DOCX", "POST", "planner/export/docx", 200, planner_data)
        return success, response

def main():
    print("🚀 Starting English Teachers Planner API Tests")
    print("=" * 60)
    
    tester = EnglishTeachersAPITester()
    
    # Test 1: API Root
    success, _ = tester.test_root_endpoint()
    if not success:
        print("❌ API Root failed, stopping tests")
        return 1

    # Test 2: Get Grades
    success, grades = tester.test_get_grades()
    if not success:
        print("❌ Get Grades failed, stopping tests")
        return 1

    # Test 3: Test scenarios for each grade
    test_grade = "1"  # Use Grade 1 for detailed testing
    success, scenarios = tester.test_get_scenarios(test_grade)
    if not success or not scenarios:
        print(f"❌ No scenarios found for grade {test_grade}")
        return 1

    # Test 4: Test themes for first scenario
    test_scenario = scenarios[0]
    success, themes = tester.test_get_themes(test_grade, test_scenario)
    if not success or not themes:
        print(f"❌ No themes found for scenario {test_scenario}")
        return 1

    # Test 5: Test grade content
    success, _ = tester.test_get_grade_content(test_grade)
    
    # Test 6: Test official projects
    success, _ = tester.test_get_official_projects(test_grade, test_scenario)

    # Test 7: Test planner generation
    test_theme = themes[0]
    success, planner = tester.test_generate_planner(test_grade, test_scenario, test_theme)
    if not success:
        print("❌ Planner generation failed")
        return 1

    # Test 8: Test DOCX export
    if planner:
        success, _ = tester.test_export_docx(planner)

    # Test multiple grades for scenarios
    print(f"\n🔍 Testing scenarios for all grades...")
    for grade in grades[:4]:  # Test first 4 grades
        success, grade_scenarios = tester.test_get_scenarios(grade)
        if success and grade_scenarios:
            print(f"   ✅ Grade {grade}: {len(grade_scenarios)} scenarios")

    # Print final results
    print(f"\n📊 Test Results:")
    print(f"   Tests run: {tester.tests_run}")
    print(f"   Tests passed: {tester.tests_passed}")
    print(f"   Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests:")
        for test in tester.failed_tests:
            print(f"   - {test['name']}: {test.get('error', f\"Expected {test.get('expected')}, got {test.get('actual')}\")}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())