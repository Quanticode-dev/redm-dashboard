#!/usr/bin/env python3
"""
Backend API Testing for Zug Routes
Tests the newly implemented Zug (Train) Routes API endpoints
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Configuration
BACKEND_URL = "https://huntersdashboard.preview.emergentagent.com/api"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

class ZugRoutesAPITester:
    def __init__(self):
        self.admin_token = None
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str, details: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def login_admin(self) -> bool:
        """Login as admin user and get token"""
        try:
            response = self.session.post(
                f"{BACKEND_URL}/auth/login",
                json={
                    "username": ADMIN_USERNAME,
                    "password": ADMIN_PASSWORD
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data["access_token"]
                self.log_test("Admin Login", True, f"Successfully logged in as {ADMIN_USERNAME}")
                return True
            else:
                self.log_test("Admin Login", False, f"Login failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Admin Login", False, f"Login error: {str(e)}")
            return False
    
    def get_auth_headers(self) -> Dict[str, str]:
        """Get authorization headers with admin token"""
        return {"Authorization": f"Bearer {self.admin_token}"}
    
    def test_get_zug_routes_with_admin(self):
        """Test GET /api/zug/routes with valid admin token"""
        try:
            response = self.session.get(
                f"{BACKEND_URL}/zug/routes",
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                routes = response.json()
                self.log_test(
                    "GET /api/zug/routes (Admin)", 
                    True, 
                    f"Retrieved {len(routes)} routes successfully"
                )
                return routes
            else:
                self.log_test(
                    "GET /api/zug/routes (Admin)", 
                    False, 
                    f"Failed with status {response.status_code}", 
                    response.text
                )
                return None
                
        except Exception as e:
            self.log_test("GET /api/zug/routes (Admin)", False, f"Request error: {str(e)}")
            return None
    
    def test_get_zug_routes_without_permission(self):
        """Test GET /api/zug/routes without proper permissions (should fail with 403)"""
        try:
            # Test without any token
            response = self.session.get(f"{BACKEND_URL}/zug/routes")
            
            if response.status_code == 401:
                self.log_test(
                    "GET /api/zug/routes (No Auth)", 
                    True, 
                    "Correctly rejected request without authentication"
                )
            else:
                self.log_test(
                    "GET /api/zug/routes (No Auth)", 
                    False, 
                    f"Expected 401, got {response.status_code}", 
                    response.text
                )
                
        except Exception as e:
            self.log_test("GET /api/zug/routes (No Auth)", False, f"Request error: {str(e)}")
    
    def test_init_zug_routes_first_time(self):
        """Test POST /api/zug/routes/init (should create 10 routes, admin only)"""
        try:
            response = self.session.post(
                f"{BACKEND_URL}/zug/routes/init",
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                data = response.json()
                if "Routes initialized successfully" in data.get("message", ""):
                    self.log_test(
                        "POST /api/zug/routes/init (First Time)", 
                        True, 
                        f"Successfully initialized routes: {data.get('message')}"
                    )
                    return True
                elif "Routes already initialized" in data.get("message", ""):
                    self.log_test(
                        "POST /api/zug/routes/init (First Time)", 
                        True, 
                        "Routes were already initialized (expected if running multiple times)"
                    )
                    return True
                else:
                    self.log_test(
                        "POST /api/zug/routes/init (First Time)", 
                        False, 
                        f"Unexpected response: {data}"
                    )
                    return False
            else:
                self.log_test(
                    "POST /api/zug/routes/init (First Time)", 
                    False, 
                    f"Failed with status {response.status_code}", 
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("POST /api/zug/routes/init (First Time)", False, f"Request error: {str(e)}")
            return False
    
    def test_init_zug_routes_second_time(self):
        """Test POST /api/zug/routes/init again (should return message that routes already exist)"""
        try:
            response = self.session.post(
                f"{BACKEND_URL}/zug/routes/init",
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                data = response.json()
                if "Routes already initialized" in data.get("message", ""):
                    self.log_test(
                        "POST /api/zug/routes/init (Second Time)", 
                        True, 
                        "Correctly returned 'already initialized' message"
                    )
                    return True
                else:
                    self.log_test(
                        "POST /api/zug/routes/init (Second Time)", 
                        False, 
                        f"Expected 'already initialized' message, got: {data}"
                    )
                    return False
            else:
                self.log_test(
                    "POST /api/zug/routes/init (Second Time)", 
                    False, 
                    f"Failed with status {response.status_code}", 
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("POST /api/zug/routes/init (Second Time)", False, f"Request error: {str(e)}")
            return False
    
    def test_update_zug_route(self, routes: list):
        """Test PUT /api/zug/routes/{route_id} to update a route"""
        if not routes:
            self.log_test("PUT /api/zug/routes/{id}", False, "No routes available to update")
            return None
            
        try:
            # Get the first route to update
            route_to_update = routes[0]
            route_id = route_to_update["id"]
            
            # Prepare update data
            update_data = {
                "title": "/g1 - Kleine Runde [SD➸EM➸OIL] - [20min]",
                "stations": ["SD", "EM", "OIL", "VAL", "RHO"],
                "rows": [
                    ["L", "20 h", "40", "", ""],
                    ["M", "15 h", "30", "", ""],
                    ["S", "10 h", "20", "", ""],
                    ["", "", "", "", ""],
                    ["", "", "", "", ""]
                ]
            }
            
            response = self.session.put(
                f"{BACKEND_URL}/zug/routes/{route_id}",
                headers=self.get_auth_headers(),
                json=update_data
            )
            
            if response.status_code == 200:
                updated_route = response.json()
                self.log_test(
                    "PUT /api/zug/routes/{id}", 
                    True, 
                    f"Successfully updated route: {updated_route['title']}"
                )
                return updated_route
            else:
                self.log_test(
                    "PUT /api/zug/routes/{id}", 
                    False, 
                    f"Failed with status {response.status_code}", 
                    response.text
                )
                return None
                
        except Exception as e:
            self.log_test("PUT /api/zug/routes/{id}", False, f"Request error: {str(e)}")
            return None
    
    def test_update_zug_route_without_admin(self, routes: list):
        """Test PUT /api/zug/routes/{route_id} without admin token (should fail with 403)"""
        if not routes:
            self.log_test("PUT /api/zug/routes/{id} (No Admin)", False, "No routes available to test")
            return
            
        try:
            route_id = routes[0]["id"]
            update_data = {"title": "Test Update Without Permission"}
            
            # Test without any token
            response = self.session.put(
                f"{BACKEND_URL}/zug/routes/{route_id}",
                json=update_data
            )
            
            if response.status_code == 401:
                self.log_test(
                    "PUT /api/zug/routes/{id} (No Admin)", 
                    True, 
                    "Correctly rejected update without authentication"
                )
            else:
                self.log_test(
                    "PUT /api/zug/routes/{id} (No Admin)", 
                    False, 
                    f"Expected 401, got {response.status_code}", 
                    response.text
                )
                
        except Exception as e:
            self.log_test("PUT /api/zug/routes/{id} (No Admin)", False, f"Request error: {str(e)}")
    
    def verify_route_update_persistence(self, updated_route: dict):
        """Verify the update was saved by fetching routes again"""
        try:
            response = self.session.get(
                f"{BACKEND_URL}/zug/routes",
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 200:
                routes = response.json()
                # Find the updated route
                found_route = None
                for route in routes:
                    if route["id"] == updated_route["id"]:
                        found_route = route
                        break
                
                if found_route and found_route["title"] == updated_route["title"]:
                    self.log_test(
                        "Verify Route Update Persistence", 
                        True, 
                        "Route update was successfully persisted"
                    )
                else:
                    self.log_test(
                        "Verify Route Update Persistence", 
                        False, 
                        "Route update was not persisted correctly"
                    )
            else:
                self.log_test(
                    "Verify Route Update Persistence", 
                    False, 
                    f"Failed to fetch routes for verification: {response.status_code}"
                )
                
        except Exception as e:
            self.log_test("Verify Route Update Persistence", False, f"Request error: {str(e)}")
    
    def run_all_tests(self):
        """Run all Zug Routes API tests"""
        print("=" * 60)
        print("STARTING ZUG ROUTES API TESTS")
        print("=" * 60)
        
        # 1. Login as admin
        if not self.login_admin():
            print("❌ Cannot proceed without admin login")
            return False
        
        # 2. Test GET routes with admin
        routes = self.test_get_zug_routes_with_admin()
        
        # 3. Test GET routes without permission
        self.test_get_zug_routes_without_permission()
        
        # 4. Test init routes (first time)
        self.test_init_zug_routes_first_time()
        
        # 5. Test init routes (second time)
        self.test_init_zug_routes_second_time()
        
        # 6. Get routes again after init (to have routes for update tests)
        if not routes:
            routes = self.test_get_zug_routes_with_admin()
        
        # 7. Test update route with admin
        updated_route = self.test_update_zug_route(routes)
        
        # 8. Test update route without admin
        self.test_update_zug_route_without_admin(routes)
        
        # 9. Verify update persistence
        if updated_route:
            self.verify_route_update_persistence(updated_route)
        
        # Print summary
        self.print_summary()
        
        return all(result["success"] for result in self.test_results)
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        
        if total - passed > 0:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  ❌ {result['test']}: {result['message']}")
        
        print(f"\nOverall Result: {'✅ ALL TESTS PASSED' if passed == total else '❌ SOME TESTS FAILED'}")

def main():
    """Main function to run tests"""
    tester = ZugRoutesAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()