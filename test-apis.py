#!/usr/bin/env python3
"""
Refoodify API Integration Testing Script
Tests Spoonacular and Google APIs to verify they're working correctly
"""

import requests
import json
import sys
from datetime import datetime

# API Keys (from .env)
SPOONACULAR_API_KEY = '825ab033e0a4406388d0145f156d52be'
GOOGLE_MAPS_API_KEY = 'f6a4207676msh4825f4491ed9993p1d8588jsnc4e1772dd94e'

# Colors for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
END = '\033[0m'
BOLD = '\033[1m'

def log_info(msg):
    print(f"{BLUE}ℹ{END} {msg}")

def log_success(msg):
    print(f"{GREEN}✓{END} {msg}")

def log_error(msg):
    print(f"{RED}✗{END} {msg}")

def log_warning(msg):
    print(f"{YELLOW}⚠{END} {msg}")

def print_header(title):
    print(f"\n{BOLD}{BLUE}{'='*60}{END}")
    print(f"{BOLD}{BLUE}{title:^60}{END}")
    print(f"{BOLD}{BLUE}{'='*60}{END}\n")

# Test 1: Spoonacular - Find by Ingredients
def test_spoonacular_find_by_ingredients():
    print_header("Test 1: Spoonacular - Find Recipes by Ingredients")
    
    try:
        ingredients = "apple,chicken,garlic"
        url = f"https://api.spoonacular.com/recipes/findByIngredients?ingredients={ingredients}&number=3&apiKey={SPOONACULAR_API_KEY}"
        
        log_info(f"Testing with ingredients: {ingredients}")
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            log_success(f"API returned {len(data)} recipes")
            
            for i, recipe in enumerate(data[:3], 1):
                print(f"  {i}. {recipe.get('title', 'N/A')}")
                print(f"     Used: {recipe.get('usedIngredientCount')}, Missed: {recipe.get('missedIngredientCount')}")
            
            return True
        else:
            log_error(f"API returned status code {response.status_code}")
            return False
    
    except Exception as e:
        log_error(f"Exception: {str(e)}")
        return False

# Test 2: Spoonacular - Get Recipe Information
def test_spoonacular_get_recipe():
    print_header("Test 2: Spoonacular - Get Recipe Details")
    
    try:
        recipe_id = 282656  # Pasta example
        url = f"https://api.spoonacular.com/recipes/{recipe_id}/information?apiKey={SPOONACULAR_API_KEY}"
        
        log_info(f"Fetching recipe ID: {recipe_id}")
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            log_success(f"Retrieved: {data.get('title', 'N/A')}")
            print(f"  Servings: {data.get('servings')}")
            print(f"  Ready in: {data.get('readyInMinutes')} minutes")
            print(f"  Health Score: {data.get('healthScore')}/100")
            
            return True
        else:
            log_error(f"API returned status code {response.status_code}")
            return False
    
    except Exception as e:
        log_error(f"Exception: {str(e)}")
        return False

# Test 3: Spoonacular - Search Recipes
def test_spoonacular_search():
    print_header("Test 3: Spoonacular - Search Recipes")
    
    try:
        query = "pasta"
        url = f"https://api.spoonacular.com/recipes/complexSearch?query={query}&number=3&apiKey={SPOONACULAR_API_KEY}"
        
        log_info(f"Searching for: {query}")
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            log_success(f"Found {data.get('totalResults', 0)} recipes")
            
            for i, recipe in enumerate(data.get('results', [])[:3], 1):
                print(f"  {i}. {recipe.get('title', 'N/A')}")
            
            return True
        else:
            log_error(f"API returned status code {response.status_code}")
            return False
    
    except Exception as e:
        log_error(f"Exception: {str(e)}")
        return False

# Test 4: Google Maps - Geocoding (Location Search)
def test_google_geocoding():
    print_header("Test 4: Google Maps - Geocoding")
    

    try:
        location = "Kigali, Rwanda"
        # Note: The provided key is a RapidAPI key, not a standard Google Maps API key
        # This test may fail if the key doesn't have geocoding permissions
        url = f"https://maps.googleapis.com/maps/api/geocode/json?address={location}&key={GOOGLE_MAPS_API_KEY}"
        
        log_info(f"Geocoding location: {location}")
        response = requests.get(url, timeout=10)
        
        log_info(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            log_info(f"Response: {json.dumps(data, indent=2)[:200]}...")
            
            if data.get('results'):
                result = data['results'][0]
                log_success(f"Location found: {result.get('formatted_address', 'N/A')}")
                
                loc = result.get('geometry', {}).get('location', {})
                print(f"  Latitude: {loc.get('lat')}")
                print(f"  Longitude: {loc.get('lng')}")
                
                return True
            else:
                log_warning("No results found - API key may not have geocoding permissions")
                return False
        else:
            log_error(f"API returned status code {response.status_code}")
            if response.text:
                log_info(f"Response: {response.text[:200]}")
            return False
    
    except Exception as e:
        log_error(f"Exception: {str(e)}")
        return False
# Test 5: Google Maps - Nearby Search
def test_google_nearby_search():
    print_header("Test 5: Google Maps - Nearby Places Search")
    
    try:
        # Kigali coordinates
        location = "-1.9441,30.0619"
        radius = 5000  # 5km
        keyword = "food bank"
        
        url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={location}&radius={radius}&keyword={keyword}&key={GOOGLE_MAPS_API_KEY}"
        
        log_info(f"Searching for: {keyword} near {location} (radius: {radius}m)")
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])
            log_success(f"Found {len(results)} places")
            
            for i, place in enumerate(results[:3], 1):
                print(f"  {i}. {place.get('name', 'N/A')}")
                print(f"     Address: {place.get('vicinity', 'N/A')}")
                print(f"     Rating: {place.get('rating', 'N/A')}/5")
            
            return True
        else:
            log_error(f"API returned status code {response.status_code}")
            return False
    
    except Exception as e:
        log_error(f"Exception: {str(e)}")
        return False

# Test 6: API Key Validation
def test_api_keys():
    print_header("Test 6: API Key Validation")
    
    spoonacular_valid = False
    google_valid = False
    
    if SPOONACULAR_API_KEY and SPOONACULAR_API_KEY != 'YOUR_API_KEY_HERE':
        log_success("Spoonacular API key is set")
        spoonacular_valid = True
    else:
        log_error("Spoonacular API key is missing or invalid")
    
    if GOOGLE_MAPS_API_KEY and GOOGLE_MAPS_API_KEY != 'YOUR_API_KEY_HERE':
        log_success("Google Maps API key is set")
        google_valid = True
    else:
        log_error("Google Maps API key is missing or invalid")
    
    return spoonacular_valid and google_valid

# Test 7: Rate Limiting Check
def test_rate_limiting():
    print_header("Test 7: Rate Limiting & Performance Check")
    
    try:
        import time
        
        log_info("Making 5 requests to test rate limiting...")
        start_time = time.time()
        
        for i in range(5):
            url = f"https://api.spoonacular.com/recipes/findByIngredients?ingredients=apple&number=1&apiKey={SPOONACULAR_API_KEY}"
            response = requests.get(url, timeout=10)
            
            if response.status_code != 200:
                log_error(f"Request {i+1} failed with status {response.status_code}")
                return False
            
            print(f"  Request {i+1}: OK ({response.elapsed.total_seconds():.2f}s)")
        
        end_time = time.time()
        total_time = end_time - start_time
        
        log_success(f"All requests successful in {total_time:.2f}s")
        return True
    
    except Exception as e:
        log_error(f"Exception: {str(e)}")
        return False

# Main Test Runner
def run_all_tests():
    print(f"\n{BOLD}{BLUE}Refoodify API Integration Test Suite{END}")
    print(f"{BLUE}Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{END}\n")
    
    tests = [
        ("API Key Validation", test_api_keys),
        ("Spoonacular - Find by Ingredients", test_spoonacular_find_by_ingredients),
        ("Spoonacular - Get Recipe Details", test_spoonacular_get_recipe),
        ("Spoonacular - Search Recipes", test_spoonacular_search),
        ("Google Maps - Geocoding", test_google_geocoding),
        ("Google Maps - Nearby Search", test_google_nearby_search),
        ("Rate Limiting Check", test_rate_limiting),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results[test_name] = result
        except Exception as e:
            log_error(f"Unexpected error in {test_name}: {str(e)}")
            results[test_name] = False
    
    # Summary
    print_header("Test Summary")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = f"{GREEN}PASS{END}" if result else f"{RED}FAIL{END}"
        print(f"{status} - {test_name}")
    
    print(f"\n{BOLD}Total: {passed}/{total} tests passed{END}\n")
    
    if passed == total:
        print(f"{GREEN}✓ All tests passed!{END}\n")
        return 0
    else:
        print(f"{RED}✗ Some tests failed. Check configuration.{END}\n")
        return 1

if __name__ == "__main__":
    sys.exit(run_all_tests())
