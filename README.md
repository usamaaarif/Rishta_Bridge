# RishtaBridge - digital Rishta App (Pakistan)

**RishtaBridge** is a purpose-built matrimonial platform designed effectively for the Pakistani ecosystem. Unlike generic dating apps, it digitizes the traditional "Rishta" process by incorporating deep cultural, religious, and socio-economic filters.

## 🚀 Key Features

### 1. Cultural & Religious Specificity
- **Sect (Maslak) Filters**: Granular options for *Sunni (Barelvi, Deobandi, Ahle Hadith)* and *Shia (Ithna Ashari, Ismaili)*.
- **Caste (Biradari) Logic**: Searchable database of castes including *Jutt, Rajput, Syed, Arain, Sheikh*, and *Pathan* tribes.
- **Family Values**: Indicators for *Joint Family* vs *Nuclear Family* preferences.

### 2. Socio-Economic Proxies
- **Wealth Estimation**: Uses local real estate units (*Marla, Kanal, Square Yards*) to estimate family standing.
- **Verification**: "Voice of Profile" (Parent/Self) and simulated Mobile/CNIC verification.

### 3. Privacy First
- **Contact Hiding**: Phone numbers are never exposed publicly.
- **Profile Privacy**: Option to blur photos until a connection is established.

### 4. Enhanced Search & Location
- **Cascading Location Filters**: Intelligent Country -> State -> City relationships ensure accurate data entry and search.
- **Comprehensive Database**: Structured location data for **India, Pakistan, UK, UAE, and USA**, covering 4000+ cities and states.
- **Advanced Filtering**: Horizontal filter bar for quick refinement by Marital Status, Age, Height, Education, and more.

## 🌐 Web Application Details

### Frontend Architecture
Built with **React (Vite)** and styled using **Tailwind CSS**. The application uses **React Router** for navigation and **Framer Motion** for animations.

**Key Pages & Routes:**
- **Home (`/`)**: Landing page introducing the platform.
- **Authentication (`/login`, `/register`, `/forgot-password`)**: Secure user onboarding and access.
- **Onboarding (`/onboarding`)**: Comprehensive Biodata Form to collect cultural, religious, and socio-economic details.
- **Dashboard (`/dashboard`)**: User portal to manage their profile, connections, and messages.
- **Search (`/search`)**: Advanced search interface with cascading location filters and detailed preferences.
- **Profile Details (`/profile/:id`)**: Detailed view of a potential match, with privacy controls.
- **Admin Dashboard (`/admin`)**: Administrative interface for platform management and moderation.

### Backend Architecture
Powered by **Python FastAPI** providing high-performance asynchronous API endpoints, with **SQLAlchemy** managing the **SQLite** database.

**Key API Modules (Routers):**
- **Auth**: User registration, login, and JWT token generation.
- **Profile**: Creating, reading, and updating detailed user biodata.
- **Search**: Advanced querying logic based on cultural and demographic filters.
- **Connection**: Handling connection requests between users.
- **Message**: Messaging system for connected users.
- **Upload**: Managing media uploads.
- **Moderation & Admin**: Content moderation tools and administrative functions.

## 🛠 Tech Stack

- **Frontend**: React (Vite), TailwindCSS, Framer Motion, Lucide Icons.
- **Backend**: Python FastAPI, SQLAlchemy (SQLite), Pydantic.
- **Authentication**: JWT (JSON Web Tokens) with mocked SMS verification.

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)

### 1. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
   *Server runs at http://localhost:8000*
   *API Docs at http://localhost:8000/docs*

### 2. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *App runs at http://localhost:5173*



### Super Admin Access
The Super Admin Dashboard is fully built, secured, and ready for you to use! I've summarized everything you need to know in the Walkthrough document to your right.

To test the new feature, log out of your current account and go to the Login page.

Since the Password login field only accepts a phone number by default, I have securely attached your admin account to the following mock phone number:

- **Phone Number**: `+920000000000`
- **Password**: `SuperSecretAdminPassword123!`

Go ahead and log in using the "Password" method. You will immediately see the new red Admin Panel button appear in the top navigation bar. Click it to view the photo moderation interface! Let me know if you run into any issues.

## 🚀 Production Deployment

To deploy the application securely for production, I have removed all testing and debugging scripts, and created a `docker-compose.prod.yml` file.

1. First, set your production `.env` variables if necessary.
2. Run the production Docker build and spin up the containers:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```
3. The frontend will automatically compile its static assets and be served by a lightning-fast Nginx server on port `80`.
4. The backend will serve on port `8000` via Uvicorn.
5. Code directories are NOT mounted to the containers, ensuring the production environment is completely isolated from local development changes.

---
*Built for the Deepmind Advanced Coding Agent Demo.*
