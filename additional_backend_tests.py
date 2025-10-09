#!/usr/bin/env python3
"""
Additional Edge Case Tests for Transmittal Management System
"""

import requests
import json
from datetime import datetime, date

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
print(f"Testing additional edge cases at: {BASE_URL}")

def test_invalid_transmittal_id():
    """Test with invalid transmittal ID"""
    print("\n🔍 Testing Invalid Transmittal ID...")
    
    # Test get with invalid ID
    response = requests.get(f"{BASE_URL}/transmittals/invalid-id-123")
    if response.status_code == 404:
        print("✅ PASS: Get invalid transmittal returns 404")
    else:
        print(f"❌ FAIL: Expected 404, got {response.status_code}")
    
    # Test update with invalid ID
    response = requests.put(f"{BASE_URL}/transmittals/invalid-id-123", json={"title": "test"})
    if response.status_code == 404:
        print("✅ PASS: Update invalid transmittal returns 404")
    else:
        print(f"❌ FAIL: Expected 404, got {response.status_code}")
    
    # Test delete with invalid ID
    response = requests.delete(f"{BASE_URL}/transmittals/invalid-id-123")
    if response.status_code == 404:
        print("✅ PASS: Delete invalid transmittal returns 404")
    else:
        print(f"❌ FAIL: Expected 404, got {response.status_code}")

def test_pagination_edge_cases():
    """Test pagination with edge cases"""
    print("\n🔍 Testing Pagination Edge Cases...")
    
    # Test with very high skip value
    response = requests.get(f"{BASE_URL}/transmittals?skip=1000&limit=10")
    if response.status_code == 200:
        transmittals = response.json()
        print(f"✅ PASS: High skip value returns {len(transmittals)} transmittals")
    else:
        print(f"❌ FAIL: High skip value failed: {response.status_code}")
    
    # Test with zero limit
    response = requests.get(f"{BASE_URL}/transmittals?skip=0&limit=0")
    if response.status_code == 200:
        transmittals = response.json()
        print(f"✅ PASS: Zero limit returns {len(transmittals)} transmittals")
    else:
        print(f"❌ FAIL: Zero limit failed: {response.status_code}")

def test_invalid_file_upload():
    """Test file upload with invalid file types"""
    print("\n🔍 Testing Invalid File Upload...")
    
    # Test with text file (should fail)
    files = {'file': ('test.txt', b'This is a text file', 'text/plain')}
    response = requests.post(f"{BASE_URL}/transmittals/upload-receipt", files=files)
    if response.status_code == 400:
        print("✅ PASS: Invalid file type correctly rejected")
    else:
        print(f"❌ FAIL: Expected 400 for invalid file type, got {response.status_code}")

def test_create_transmittal_validation():
    """Test transmittal creation with missing/invalid data"""
    print("\n🔍 Testing Transmittal Creation Validation...")
    
    # Test with missing required fields
    incomplete_data = {
        "transmittal_type": "Drawing",
        # Missing other required fields
    }
    response = requests.post(f"{BASE_URL}/transmittals", json=incomplete_data)
    if response.status_code == 422:  # FastAPI validation error
        print("✅ PASS: Missing required fields correctly rejected")
    else:
        print(f"❌ FAIL: Expected 422 for missing fields, got {response.status_code}")
    
    # Test with empty documents array
    data_empty_docs = {
        "transmittal_type": "Drawing",
        "department": "Architecture",
        "transmittal_date": "2024-01-15",
        "send_to": "Client",
        "salutation": "Mr",
        "recipient_name": "John Doe",
        "sender_name": "Jane Smith",
        "sender_designation": "Architect",
        "send_mode": "Softcopy",
        "documents": [],  # Empty array
        "title": "Test Transmittal"
    }
    response = requests.post(f"{BASE_URL}/transmittals", json=data_empty_docs)
    if response.status_code == 200:
        result = response.json()
        if result['document_count'] == 0:
            print("✅ PASS: Empty documents array handled correctly")
            # Clean up
            requests.delete(f"{BASE_URL}/transmittals/{result['id']}")
        else:
            print(f"❌ FAIL: Document count should be 0, got {result['document_count']}")
    else:
        print(f"❌ FAIL: Empty documents array failed: {response.status_code}")

def test_status_filtering():
    """Test status filtering functionality"""
    print("\n🔍 Testing Status Filtering...")
    
    # Test with non-existent status
    response = requests.get(f"{BASE_URL}/transmittals?status=nonexistent")
    if response.status_code == 200:
        transmittals = response.json()
        print(f"✅ PASS: Non-existent status filter returns {len(transmittals)} transmittals")
    else:
        print(f"❌ FAIL: Non-existent status filter failed: {response.status_code}")
    
    # Test count with status filter
    response = requests.get(f"{BASE_URL}/transmittals/count?status=draft")
    if response.status_code == 200:
        result = response.json()
        print(f"✅ PASS: Count with status filter returns {result['count']}")
    else:
        print(f"❌ FAIL: Count with status filter failed: {response.status_code}")

def test_duplicate_modes():
    """Test duplicate functionality with different modes"""
    print("\n🔍 Testing Duplicate Modes...")
    
    # First create a transmittal
    data = {
        "transmittal_type": "Drawing",
        "department": "Architecture",
        "transmittal_date": "2024-01-15",
        "send_to": "Client",
        "salutation": "Mr",
        "recipient_name": "John Doe",
        "sender_name": "Jane Smith",
        "sender_designation": "Architect",
        "send_mode": "Softcopy",
        "documents": [{"document_no": "A-001", "title": "Test", "revision": 1, "copies": 1, "action": "for approval"}],
        "title": "Original Transmittal"
    }
    
    response = requests.post(f"{BASE_URL}/transmittals", json=data)
    if response.status_code == 200:
        original = response.json()
        original_id = original['id']
        
        # Test same mode duplication
        response = requests.post(f"{BASE_URL}/transmittals/{original_id}/duplicate?mode=same")
        if response.status_code == 200:
            duplicate = response.json()
            if duplicate['send_mode'] == original['send_mode']:
                print("✅ PASS: Same mode duplication works correctly")
            else:
                print(f"❌ FAIL: Same mode duplication changed send_mode")
            # Clean up duplicate
            requests.delete(f"{BASE_URL}/transmittals/{duplicate['id']}")
        else:
            print(f"❌ FAIL: Same mode duplication failed: {response.status_code}")
        
        # Clean up original
        requests.delete(f"{BASE_URL}/transmittals/{original_id}")
    else:
        print(f"❌ FAIL: Could not create original transmittal: {response.status_code}")

def main():
    """Run all additional tests"""
    print("🧪 Running Additional Edge Case Tests")
    print("=" * 50)
    
    test_invalid_transmittal_id()
    test_pagination_edge_cases()
    test_invalid_file_upload()
    test_create_transmittal_validation()
    test_status_filtering()
    test_duplicate_modes()
    
    print("\n" + "=" * 50)
    print("✅ Additional edge case testing completed")

if __name__ == "__main__":
    main()