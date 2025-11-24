# Refoodify Deployment & Documentation

## Overview
Refoodify is a web application designed to reduce food waste by helping users track expiration dates, discover recipes, and connect with donation centers. It uses the Spoonacular and Google APIs for real-time data and location services.

## Application Purpose
Refoodify addresses the real-world problem of food waste, providing practical tools for individuals and communities. It enables:
- Expiry tracking
- Recipe suggestions
- Donation center search
- Community engagement

## API Usage & Credits
- **Spoonacular API** ([Docs](https://spoonacular.com/food-api)) — Used for ingredient analysis and recipe suggestions.
- **Google Maps API** ([Docs](https://developers.google.com/maps)) — Used for donation center location search.

**API Key Handling:**
- API keys are stored securely and never committed to the public repository. See `.gitignore` for details.
- Keys are provided in code comments for instructor review only.

## Local Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/refoodify.git
   cd refoodify
   ```
2. Install dependencies (if any):
   ```sh
   # For static HTML/CSS/JS, no install needed
   # For Node.js: npm install
   ```
3. Add your API keys to `script.js` as instructed in code comments.
4. Run locally:
   ```sh
   # For static site
   python3 -m http.server 8080
   # Or use any static server
   ```
5. Access at `http://localhost:8080`

## Deployment to Web Servers
### Prerequisites
- SSH access to Web01, Web02, and Lb01
- Web01: `web01.example.com`
- Web02: `web02.example.com`
- Lb01: `lb01.example.com`

### Steps
#### 1. Deploy to Web01 & Web02
- SSH into each server:
  ```sh
  ssh user@web01.example.com
  # or
  ssh user@web02.example.com
  ```
- Copy files:
  ```sh
  scp -r * user@web01.example.com:/var/www/html/
  scp -r * user@web02.example.com:/var/www/html/
  ```
- Ensure web server (e.g., Apache/Nginx) is running:
  ```sh
  sudo systemctl start nginx
  # or
  sudo systemctl start apache2
  ```

#### 2. Configure Load Balancer (Lb01)
- SSH into Lb01:
  ```sh
  ssh user@lb01.example.com
  ```
- Edit load balancer config (example: Nginx):
  ```nginx
  http {
    upstream refoodify_backend {
      server web01.example.com;
      server web02.example.com;
    }
    server {
      listen 80;
      location / {
        proxy_pass http://refoodify_backend;
      }
    }
  }
  ```
- Reload Nginx:
  ```sh
  sudo nginx -s reload
  ```

#### 3. Testing
- Access the app via `http://lb01.example.com`
- Verify requests are balanced (refresh to see round-robin effect)
- Test all features, especially API integrations

## Error Handling
- All API calls include error handling for downtime and invalid responses
- User feedback is provided for failed requests

## User Interaction
- Users can search, filter, and sort data
- All data is presented clearly with interactive controls

## Security
- API keys are never exposed publicly
- `.gitignore` excludes sensitive files
- Input validation is implemented in forms

## Bonus Features (Optional)
- User authentication (if implemented)
- Caching for API responses
- Docker/Kubernetes setup (see `docker-compose.yml` if present)
- CI/CD pipeline (see `.github/workflows/` if present)
- Advanced security (input validation, XSS protection)

## Demo Video
- See `demo.mp4` for a 2-minute walkthrough

## Challenges & Solutions
- API rate limits: Implemented caching and error messages
- Load balancing: Configured Nginx for round-robin
- Secure key management: Used environment variables and `.gitignore`

## Credits
- Spoonacular API team
- Google Maps API team
- All referenced libraries (see code comments)

## License
MIT

---
**Note:** For instructor review, API keys are provided in code comments only. Never commit them to the repository.
# Refoodify
