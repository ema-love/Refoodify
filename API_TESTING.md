# API Integration Testing Guide

## 1. Spoonacular API (Ingredient Analyzer)

### Setup
1. Get your API key from [Spoonacular](https://spoonacular.com/food-api)
2. Add to `script.js`:
   ```javascript
   const SPOONACULAR_API_KEY = 'YOUR_KEY_HERE';
   ```

### Test Cases
- **Test 1: Valid Ingredient Search**
  - Input: "apple"
  - Expected: Recipe suggestions displayed
  - Check: API response status, data rendering, UI updates

- **Test 2: Multiple Ingredients**
  - Input: "apple, chicken, garlic"
  - Expected: Combined recipe results
  - Check: Correct parsing and API calls

- **Test 3: Invalid Input**
  - Input: Special characters or empty field
  - Expected: Error message shown gracefully
  - Check: Error handling works

- **Test 4: API Downtime**
  - Mock: Disable network or use invalid key
  - Expected: User-friendly error message
  - Check: App doesn't crash

### Testing Steps
1. Open `analyzer.html` in browser
2. Enter ingredient names in the input field
3. Click "Analyze" or equivalent button
4. Verify results display correctly
5. Open browser console (F12 → Console) to check for errors
6. Check Network tab to see API requests/responses

---

## 2. Google Maps API (Donation Center Search)

### Setup
1. Get your API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Add to `script.js`:
   ```javascript
   const GOOGLE_MAPS_API_KEY = 'YOUR_KEY_HERE';
   ```

### Test Cases
- **Test 1: Valid Location Search**
  - Input: "New York"
  - Expected: Donation centers mapped and listed
  - Check: Map loads, markers appear, list updates

- **Test 2: No Results**
  - Input: Remote location with no centers
  - Expected: Message indicating no results
  - Check: Graceful handling

- **Test 3: Invalid Location**
  - Input: Non-existent place
  - Expected: Error message
  - Check: Error handling

- **Test 4: Geolocation**
  - Expected: App uses user's location if permitted
  - Check: Browser permission prompt and map centering

### Testing Steps
1. Open `donations.html` in browser
2. Enter a location or allow geolocation
3. Verify map displays and donation centers appear
4. Click markers for details
5. Check console for errors or API issues

---

## 3. Tips Page (Google Custom Search)

### Setup
1. Configure Google Custom Search API key in `script.js`
2. Set your search engine ID (CSE ID)

### Test Cases
- **Test 1: Search Query**
  - Input: "food storage tips"
  - Expected: Relevant articles displayed
  - Check: Results load, titles/snippets visible

- **Test 2: Multiple Searches**
  - Input: Different queries sequentially
  - Expected: Results update correctly
  - Check: No residual data from previous search

- **Test 3: Empty Search**
  - Input: Empty or whitespace
  - Expected: Prompt to enter valid search
  - Check: Validation works

### Testing Steps
1. Open `tips.html` in browser
2. Enter search terms and submit
3. Verify results display
4. Test pagination if available

---

## 4. Community Page (Eventbrite & Disqus Embeds)

### Test Cases
- **Test 1: Eventbrite Events Load**
  - Expected: Events widget displays
  - Check: No 404 errors, widget interactive

- **Test 2: Disqus Comments Load**
  - Expected: Comment thread appears
  - Check: Users can view/post comments

### Testing Steps
1. Open `community.html` in browser
2. Scroll to event section → verify Eventbrite loads
3. Scroll to comments section → verify Disqus loads

---

## 5. Full Integration Flow Test

### Scenario: User Journey
1. **Home** → Click "Get Started"
2. **Login** → Mock or use test account
3. **Tracker** → Add items with expiry dates
4. **Analyzer** → Search for recipes for expiring items
5. **Donations** → Find nearby donation centers
6. **Tips** → Search food-saving tips
7. **Community** → View events and discussions
8. **Profile** → View saved items and metrics

### Validation Checklist
- [ ] All pages load without errors
- [ ] Headers are consistent
- [ ] Navigation works across all pages
- [ ] API calls succeed and display data
- [ ] Error messages are user-friendly
- [ ] Forms submit and validate correctly
- [ ] Load balancer distributes traffic evenly
- [ ] No API keys exposed in network requests

---

## 6. Browser Console Checks

### What to Look For
1. **No JavaScript errors** → Red X errors
2. **No 404s** → Missing resources
3. **No CORS errors** → API key/domain issues
4. **Successful API responses** → Check Network tab → XHR/Fetch

### Debug Example
```javascript
// In console, test API call manually
fetch('https://api.spoonacular.com/recipes/findByIngredients?apiKey=YOUR_KEY&ingredients=apple')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 7. Performance Testing

### Metrics to Track
- Page load time
- API response time
- UI responsiveness
- Error recovery time

### Tools
- Chrome DevTools (Performance tab)
- Network tab for API timing
- Lighthouse for overall score

---

## 8. Load Balancer Testing

### Test Steps
1. Deploy app to Web01 and Web02
2. Configure load balancer (Lb01)
3. Access `http://lb01.example.com` multiple times
4. Check server logs to confirm traffic distribution:
   ```sh
   ssh user@web01.example.com
   tail -f /var/log/nginx/access.log
   # See if requests come in, then check web02
   ```
5. Verify load balancing is working (roughly equal requests)

---

## 9. Reporting Issues

### If Tests Fail
1. Check API key validity
2. Verify API rate limits (check API dashboard)
3. Inspect network requests in browser
4. Check server logs for errors
5. Review API documentation for changes
6. Test with curl or Postman for isolated testing

### Example Curl Test
```bash
curl -X GET "https://api.spoonacular.com/recipes/findByIngredients?apiKey=YOUR_KEY&ingredients=apple" -H "accept: application/json"
```

---

## Summary
- Test each API independently first
- Then test the full user flow
- Monitor console and network tab throughout
- Verify load balancer traffic distribution
- Document any issues found

Ready to test? Let me know which API you'd like to start with!
