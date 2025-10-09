#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Transmittal Management System
Tests all CRUD operations and business logic for transmittals
"""

import requests
import json
import base64
from datetime import datetime, date
from typing import Dict, List, Any
import os
import sys

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=')[1].strip() + '/api'
        return 'http://localhost:8001/api'  # fallback
    except:
        return 'http://localhost:8001/api'  # fallback

BASE_URL = get_backend_url()
print(f"Testing backend at: {BASE_URL}")

class TransmittalTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.test_results = []
        self.created_transmittals = []  # Track created transmittals for cleanup
        
    def log_result(self, test_name: str, success: bool, message: str, details: Any = None):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def create_sample_transmittal_data(self, title_suffix="Test"):
        """Create realistic sample transmittal data"""
        return {
            "transmittal_type": "Drawing",
            "department": "Architecture",
            "design_stage": "Schematic Design",
            "transmittal_date": "2024-01-15",
            "send_to": "Client",
            "salutation": "Mr",
            "recipient_name": "John Anderson",
            "sender_name": "Sarah Wilson",
            "sender_designation": "Project Architect",
            "send_mode": "Softcopy",
            "documents": [
                {
                    "document_no": "A-001",
                    "title": "Ground Floor Plan",
                    "revision": 2,
                    "copies": 3,
                    "action": "for approval"
                },
                {
                    "document_no": "A-002", 
                    "title": "First Floor Plan",
                    "revision": 1,
                    "copies": 2,
                    "action": "for planning"
                }
            ],
            "title": f"Residential Project Plans - {title_suffix}",
            "project_name": "Greenfield Residential Complex",
            "purpose": "Design review and approval",
            "remarks": "Please review and provide feedback by end of week"
        }
    
    def test_health_check(self):
        """Test basic API health"""
        try:
            response = requests.get(f"{self.base_url}/")
            if response.status_code == 200:
                self.log_result("Health Check", True, "API is accessible")
                return True
            else:
                self.log_result("Health Check", False, f"API returned status {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Health Check", False, f"Cannot connect to API: {str(e)}")
            return False
    
    def test_create_transmittal(self):
        """Test POST /api/transmittals - Create new transmittal"""
        try:
            data = self.create_sample_transmittal_data("Create Test")
            response = requests.post(f"{self.base_url}/transmittals", json=data)
            
            if response.status_code == 200:
                result = response.json()
                # Verify response structure
                required_fields = ['id', 'status', 'document_count', 'created_date']
                missing_fields = [field for field in required_fields if field not in result]
                
                if missing_fields:
                    self.log_result("Create Transmittal", False, f"Missing fields: {missing_fields}")
                    return None
                
                # Verify business logic
                if result['status'] != 'draft':
                    self.log_result("Create Transmittal", False, f"Expected status 'draft', got '{result['status']}'")
                    return None
                
                if result['document_count'] != len(data['documents']):
                    self.log_result("Create Transmittal", False, f"Document count mismatch: expected {len(data['documents'])}, got {result['document_count']}")
                    return None
                
                self.created_transmittals.append(result['id'])
                self.log_result("Create Transmittal", True, f"Created transmittal with ID: {result['id']}")
                return result
            else:
                self.log_result("Create Transmittal", False, f"Status {response.status_code}: {response.text}")
                return None
        except Exception as e:
            self.log_result("Create Transmittal", False, f"Exception: {str(e)}")
            return None
    
    def test_get_transmittals(self):
        """Test GET /api/transmittals - Get transmittals with pagination"""
        try:
            # Test basic get
            response = requests.get(f"{self.base_url}/transmittals")
            if response.status_code != 200:
                self.log_result("Get Transmittals", False, f"Status {response.status_code}: {response.text}")
                return False
            
            transmittals = response.json()
            if not isinstance(transmittals, list):
                self.log_result("Get Transmittals", False, "Response is not a list")
                return False
            
            # Test pagination
            response_paginated = requests.get(f"{self.base_url}/transmittals?skip=0&limit=5")
            if response_paginated.status_code != 200:
                self.log_result("Get Transmittals Pagination", False, f"Pagination failed: {response_paginated.status_code}")
                return False
            
            # Test filtering by status
            response_filtered = requests.get(f"{self.base_url}/transmittals?status=draft")
            if response_filtered.status_code != 200:
                self.log_result("Get Transmittals Filter", False, f"Filtering failed: {response_filtered.status_code}")
                return False
            
            self.log_result("Get Transmittals", True, f"Retrieved {len(transmittals)} transmittals, pagination and filtering work")
            return True
        except Exception as e:
            self.log_result("Get Transmittals", False, f"Exception: {str(e)}")
            return False
    
    def test_get_transmittal_by_id(self, transmittal_id: str):
        """Test GET /api/transmittals/{id} - Get specific transmittal"""
        try:
            response = requests.get(f"{self.base_url}/transmittals/{transmittal_id}")
            if response.status_code == 200:
                result = response.json()
                if result['id'] == transmittal_id:
                    self.log_result("Get Transmittal by ID", True, f"Retrieved transmittal {transmittal_id}")
                    return result
                else:
                    self.log_result("Get Transmittal by ID", False, f"ID mismatch: expected {transmittal_id}, got {result['id']}")
                    return None
            elif response.status_code == 404:
                self.log_result("Get Transmittal by ID", False, f"Transmittal {transmittal_id} not found")
                return None
            else:
                self.log_result("Get Transmittal by ID", False, f"Status {response.status_code}: {response.text}")
                return None
        except Exception as e:
            self.log_result("Get Transmittal by ID", False, f"Exception: {str(e)}")
            return None
    
    def test_update_transmittal(self, transmittal_id: str):
        """Test PUT /api/transmittals/{id} - Update transmittal (drafts only)"""
        try:
            update_data = {
                "title": "Updated Residential Project Plans",
                "purpose": "Updated purpose for design review",
                "documents": [
                    {
                        "document_no": "A-001-REV",
                        "title": "Updated Ground Floor Plan",
                        "revision": 3,
                        "copies": 4,
                        "action": "for final approval"
                    }
                ]
            }
            
            response = requests.put(f"{self.base_url}/transmittals/{transmittal_id}", json=update_data)
            if response.status_code == 200:
                result = response.json()
                if result['title'] == update_data['title'] and result['document_count'] == 1:
                    self.log_result("Update Transmittal", True, f"Updated transmittal {transmittal_id}")
                    return result
                else:
                    self.log_result("Update Transmittal", False, "Update data not reflected correctly")
                    return None
            else:
                self.log_result("Update Transmittal", False, f"Status {response.status_code}: {response.text}")
                return None
        except Exception as e:
            self.log_result("Update Transmittal", False, f"Exception: {str(e)}")
            return None
    
    def test_generate_transmittal(self, transmittal_id: str):
        """Test POST /api/transmittals/{id}/generate - Generate transmittal"""
        try:
            response = requests.post(f"{self.base_url}/transmittals/{transmittal_id}/generate")
            if response.status_code == 200:
                result = response.json()
                if result['status'] == 'generated' and result['transmittal_number']:
                    # Verify transmittal number format (TRN-YYYY-XXX)
                    number_parts = result['transmittal_number'].split('-')
                    if len(number_parts) == 3 and number_parts[0] == 'TRN':
                        self.log_result("Generate Transmittal", True, f"Generated transmittal {result['transmittal_number']}")
                        return result
                    else:
                        self.log_result("Generate Transmittal", False, f"Invalid transmittal number format: {result['transmittal_number']}")
                        return None
                else:
                    self.log_result("Generate Transmittal", False, "Status not changed to generated or number not assigned")
                    return None
            else:
                self.log_result("Generate Transmittal", False, f"Status {response.status_code}: {response.text}")
                return None
        except Exception as e:
            self.log_result("Generate Transmittal", False, f"Exception: {str(e)}")
            return None
    
    def test_update_generated_transmittal(self, transmittal_id: str):
        """Test that generated transmittals cannot be updated"""
        try:
            update_data = {"title": "Should not be allowed"}
            response = requests.put(f"{self.base_url}/transmittals/{transmittal_id}", json=update_data)
            
            if response.status_code == 400:
                self.log_result("Update Generated Transmittal Restriction", True, "Correctly prevented update of generated transmittal")
                return True
            else:
                self.log_result("Update Generated Transmittal Restriction", False, f"Should have returned 400, got {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Update Generated Transmittal Restriction", False, f"Exception: {str(e)}")
            return False
    
    def test_duplicate_transmittal(self, transmittal_id: str):
        """Test POST /api/transmittals/{id}/duplicate - Duplicate transmittal"""
        try:
            # Test opposite mode duplication
            response = requests.post(f"{self.base_url}/transmittals/{transmittal_id}/duplicate?mode=opposite")
            if response.status_code == 200:
                result = response.json()
                if result['status'] == 'draft' and result['id'] != transmittal_id:
                    self.created_transmittals.append(result['id'])
                    self.log_result("Duplicate Transmittal", True, f"Created duplicate with ID: {result['id']}")
                    return result
                else:
                    self.log_result("Duplicate Transmittal", False, "Duplicate not created properly")
                    return None
            else:
                self.log_result("Duplicate Transmittal", False, f"Status {response.status_code}: {response.text}")
                return None
        except Exception as e:
            self.log_result("Duplicate Transmittal", False, f"Exception: {str(e)}")
            return None
    
    def test_send_transmittal(self, transmittal_id: str):
        """Test POST /api/transmittals/{id}/send - Update send status"""
        try:
            send_data = {
                "delivery_person": "Me",
                "send_date": datetime.now().isoformat()
            }
            
            response = requests.post(
                f"{self.base_url}/transmittals/{transmittal_id}/send?sent_status=Sent",
                json=send_data
            )
            
            if response.status_code == 200:
                self.log_result("Send Transmittal", True, f"Updated send status for {transmittal_id}")
                return True
            else:
                self.log_result("Send Transmittal", False, f"Status {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_result("Send Transmittal", False, f"Exception: {str(e)}")
            return False
    
    def test_receive_transmittal(self, transmittal_id: str):
        """Test POST /api/transmittals/{id}/receive - Update receive status"""
        try:
            receive_data = {
                "received_date": "2024-01-20",
                "received_time": "14:30",
                "receipt_file": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            }
            
            response = requests.post(
                f"{self.base_url}/transmittals/{transmittal_id}/receive?received_status=Received",
                json=receive_data
            )
            
            if response.status_code == 200:
                self.log_result("Receive Transmittal", True, f"Updated receive status for {transmittal_id}")
                return True
            else:
                self.log_result("Receive Transmittal", False, f"Status {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_result("Receive Transmittal", False, f"Exception: {str(e)}")
            return False
    
    def test_get_transmittals_count(self):
        """Test GET /api/transmittals/count - Get count of transmittals"""
        try:
            response = requests.get(f"{self.base_url}/transmittals/count")
            if response.status_code == 200:
                result = response.json()
                if 'count' in result and isinstance(result['count'], int):
                    self.log_result("Get Transmittals Count", True, f"Count: {result['count']}")
                    return result['count']
                else:
                    self.log_result("Get Transmittals Count", False, "Invalid count response format")
                    return None
            else:
                self.log_result("Get Transmittals Count", False, f"Status {response.status_code}: {response.text}")
                return None
        except Exception as e:
            self.log_result("Get Transmittals Count", False, f"Exception: {str(e)}")
            return None
    
    def test_upload_receipt(self):
        """Test POST /api/transmittals/upload-receipt - File upload"""
        try:
            # Create a simple test image (1x1 pixel PNG)
            test_image_data = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==")
            
            files = {'file': ('test_receipt.png', test_image_data, 'image/png')}
            response = requests.post(f"{self.base_url}/transmittals/upload-receipt", files=files)
            
            if response.status_code == 200:
                result = response.json()
                if 'base64_content' in result and 'filename' in result:
                    self.log_result("Upload Receipt", True, f"Uploaded file: {result['filename']}")
                    return True
                else:
                    self.log_result("Upload Receipt", False, "Invalid upload response format")
                    return False
            else:
                self.log_result("Upload Receipt", False, f"Status {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_result("Upload Receipt", False, f"Exception: {str(e)}")
            return False
    
    def test_delete_draft_transmittal(self, transmittal_id: str):
        """Test DELETE /api/transmittals/{id} - Delete draft transmittal"""
        try:
            response = requests.delete(f"{self.base_url}/transmittals/{transmittal_id}")
            if response.status_code == 200:
                self.log_result("Delete Draft Transmittal", True, f"Deleted transmittal {transmittal_id}")
                return True
            else:
                self.log_result("Delete Draft Transmittal", False, f"Status {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_result("Delete Draft Transmittal", False, f"Exception: {str(e)}")
            return False
    
    def test_delete_generated_transmittal(self, transmittal_id: str):
        """Test that generated transmittals cannot be deleted"""
        try:
            response = requests.delete(f"{self.base_url}/transmittals/{transmittal_id}")
            if response.status_code == 400:
                self.log_result("Delete Generated Transmittal Restriction", True, "Correctly prevented deletion of generated transmittal")
                return True
            else:
                self.log_result("Delete Generated Transmittal Restriction", False, f"Should have returned 400, got {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Delete Generated Transmittal Restriction", False, f"Exception: {str(e)}")
            return False
    
    def cleanup(self):
        """Clean up created test data"""
        print("\n🧹 Cleaning up test data...")
        for transmittal_id in self.created_transmittals:
            try:
                requests.delete(f"{self.base_url}/transmittals/{transmittal_id}")
            except:
                pass  # Ignore cleanup errors
    
    def run_comprehensive_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Comprehensive Transmittal API Tests")
        print("=" * 60)
        
        # 1. Health check
        if not self.test_health_check():
            print("❌ API is not accessible. Stopping tests.")
            return False
        
        # 2. Create transmittal
        transmittal = self.test_create_transmittal()
        if not transmittal:
            print("❌ Cannot create transmittal. Stopping tests.")
            return False
        
        transmittal_id = transmittal['id']
        
        # 3. Test retrieval operations
        self.test_get_transmittals()
        self.test_get_transmittal_by_id(transmittal_id)
        self.test_get_transmittals_count()
        
        # 4. Test update operations (on draft)
        self.test_update_transmittal(transmittal_id)
        
        # 5. Test generate operation
        generated_transmittal = self.test_generate_transmittal(transmittal_id)
        if generated_transmittal:
            # 6. Test restrictions on generated transmittals
            self.test_update_generated_transmittal(transmittal_id)
            self.test_delete_generated_transmittal(transmittal_id)
            
            # 7. Test status operations
            self.test_send_transmittal(transmittal_id)
            self.test_receive_transmittal(transmittal_id)
        
        # 8. Test duplication
        duplicate = self.test_duplicate_transmittal(transmittal_id)
        if duplicate:
            # 9. Test deletion of draft
            self.test_delete_draft_transmittal(duplicate['id'])
        
        # 10. Test file upload
        self.test_upload_receipt()
        
        # Summary
        self.print_summary()
        
        # Cleanup
        self.cleanup()
        
        return True
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  • {result['test']}: {result['message']}")
        
        print("\n" + "=" * 60)

def main():
    """Main test execution"""
    tester = TransmittalTester()
    try:
        success = tester.run_comprehensive_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        tester.cleanup()
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        tester.cleanup()
        return 1

if __name__ == "__main__":
    sys.exit(main())