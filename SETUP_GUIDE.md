# Refoodify - Food Waste Reduction Platform

## Setup & Running the Application

### Prerequisites
- Node.js 14.0.0 or higher
- Python 3.7+ (for testing)

### Installation

1. **Install Node dependencies:**
```bash
npm install
```

2. **Install Python dependencies (optional, for testing):**
```bash
pip install requests
```

### Running the Server

Start the backend server that handles API proxying:

```bash
npm start
# or
node server.js
```

The server will start on `http://localhost:3000` by default.

You can also specify a custom port:
```bash
PORT=8080 npm start
```

### Accessing the Application

Once the server is running, open your browser and visit:
```
http://localhost:3000
```

## API Architecture

### Why a Backend Proxy?

The webapp uses several external APIs:
- **Spoonacular** - For recipe recommendations based on ingredients
- **Google Maps** - For finding donation centers
- **Google Custom Search** - For food-saving tips

These APIs cannot be called directly from the browser due to **CORS (Cross-Origin Resource Sharing)** restrictions. The Node.js backend server proxies these requests, allowing the frontend to communicate with external APIs safely.

### Backend API Endpoints

The server exposes the following endpoints:

#### 1. Find Recipes by Ingredients
```
GET /api/recipes/findByIngredients?ingredients=apple,chicken&number=6
```
Returns recipes that can be made with the specified ingredients.

**Parameters:**
- `ingredients` (string, required): Comma-separated ingredient list
- `number` (integer, optional): Number of recipes to return (default: 6)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 12345,
      "title": "Recipe Title",
      "image": "https://...",
      "usedIngredientCount": 2,
      "missedIngredientCount": 1
    }
  ]
}
```

#### 2. Search Recipes
```
GET /api/recipes/search?q=pasta&number=10
```
Searches for recipes by query string.

**Parameters:**
- `q` (string, required): Search query
- `number` (integer, optional): Number of results (default: 10)

#### 3. Get Recipe Details
```
GET /api/recipes/getDetails?recipeId=12345
```
Returns detailed information about a specific recipe.

**Parameters:**
- `recipeId` (integer, required): The recipe ID

#### 4. Geocode Address
```
GET /api/maps/geocode?address=Kigali,Rwanda
```
Converts an address into geographic coordinates.

**Parameters:**
- `address` (string, required): The address to geocode

#### 5. Search Tips
```
GET /api/search/tips?q=storing+tomatoes
```
Returns food-saving tips related to the search query.

**Parameters:**
- `q` (string, required): Search query

## Page Features

### Analyzer (`/analyzer.html`)
- Add ingredients to analyze food waste risk
- Get recipe suggestions from Spoonacular
- Filter suggestions by ingredient category
- Real-time waste risk calculation

**How it works:**
1. Enter ingredients (comma or space-separated)
2. Click "Analyze"
3. The server calls `/api/recipes/findByIngredients` with your ingredients
4. Recipes are displayed with nutrition info and links to full recipes

### Donations (`/donations.html`)
- View donation centers (mock data for now)
- Find nearby food donation locations
- Donate surplus food safely

### Tips (`/tips.html`)
- Search for food-saving tips
- Learn storage best practices
- Reduce food waste with expert advice

### Tracker (`/tracker.html`)
- Track your pantry inventory
- Monitor food freshness
- Receive notifications before food expires

## Environment Variables

Optional environment variables for customization:

```bash
PORT=3000                                          # Server port (default: 3000)
SPOONACULAR_API_KEY=your_key_here                # Your Spoonacular API key
GOOGLE_MAPS_API_KEY=your_key_here                # Your Google Maps API key
GOOGLE_CSE_ID=your_cse_id_here                   # Your Google Custom Search Engine ID
```

## Testing

### Test APIs (Python)
```bash
npm run test
# or
python3 test-apis.py
```

This runs a comprehensive test suite that validates:
- Spoonacular recipes by ingredients
- Recipe details retrieval
- Recipe search functionality
- Rate limiting behavior
- API key validation

## Troubleshooting

### Issue: "Cannot GET /analyzer.html"
**Solution:** Make sure the server is running with `npm start` and is serving from the correct directory.

### Issue: "API endpoint not found"
**Solution:** Verify you're using the correct endpoint path and parameters. Check the API Endpoints section above.

### Issue: "Spoonacular API error"
**Solution:** 
1. Verify your Spoonacular API key is valid
2. Check that you haven't exceeded your daily API quota
3. Ensure ingredients are properly formatted

### Issue: Recipes not loading in Analyzer
**Solution:**
1. Check browser console for errors (F12)
2. Make sure the server is running
3. Try different ingredients
4. Check that ingredients are comma or space-separated

## Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (vanilla)
- **Backend:** Node.js
- **APIs:** Spoonacular, Google Maps, Google Custom Search
- **Testing:** Python with requests library

## File Structure

```
refoodify/
├── index.html              # Home page
├── analyzer.html           # Ingredient analyzer
├── donations.html          # Donation centers
├── tracker.html            # Pantry tracker
├── tips.html               # Food-saving tips
├── login.html              # Login page
├── register.html           # Registration page
├── profile.html            # User profile
├── style.css               # Global styles
├── script.js               # Main JavaScript (now uses backend proxies)
├── server.js               # Node.js backend server (NEW)
├── package.json            # Node dependencies
├── test-apis.py            # API test suite
├── assets/                 # Images and logos
└── README.md               # This file
```

## API Response Format

All API endpoints return JSON responses in this format:

**Success:**
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message here",
  "statusCode": 400
}
```

## Future Improvements

- [ ] Integrate real Google Maps with proper API key
- [ ] Add user authentication with database
- [ ] Implement pantry storage with persistent data
- [ ] Add mobile app version
- [ ] Integrate payment processing for donations
- [ ] Add community features and leaderboards
- [ ] Implement machine learning for recipe recommendations
- [ ] Add real-time notifications

## Support

For issues or questions, please check the troubleshooting section or refer to the API documentation in this README.

---

**Last Updated:** November 24, 2025
