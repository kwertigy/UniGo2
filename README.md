🚗 UniGo - Campus Rideshare Platform
A premium campus ridesharing app built with React Native (Expo) and FastAPI, featuring a soft UI design, gamified driver incentives, and real-time ride matching.
✨ Features
👤 User Experience
College Onboarding - Bangalore college selection with .edu email verification
Dual Mode System - Seamless Rider ↔ Driver toggle with smooth animations
Pink Pool - Women-only ride option for enhanced safety
SOS Button - Emergency assistance feature
🚘 Rider Features
3 Subscription tiers (Quick Hitch, Mid-Terms, Dean's List)
Campus Wallet payment integration
Real-time driver availability cards
Map integration (TomTom-ready)
🎯 Driver Features
Route publisher with schedule management
Bounty Board - Gamified ride requests
Elite Host Badge - Earn rewards for quality service
VIP parking progress tracker
Amenities showcase (AC, Music, etc.)
⭐ Vibe Check Rating System
Smoothness & Comfort sliders (1-10)
Interactive amenity chips with bounce animations
Elite Host bonus points system
💳 Payment Flow
Mock Apple Pay/GPay UI
Double-click to pay simulation
Success confetti animations
🎨 Design System
Soft UI Light Mode:

Element	Value
Background	#F7F8FA
Cards	#FFFFFF
Primary Accent	#F28C68 (Soft Peach)
Text	#1C1C1E
Border Radius	32px (extreme)
Motion: 60fps spring animations using React Native Reanimated

🛠 Tech Stack
Layer	Technology
Frontend	Expo (React Native 0.81.5), TypeScript
State Management	Zustand
Storage	AsyncStorage
Animations	React Native Reanimated
Icons	@expo/vector-icons
Backend	FastAPI (Python)
Database	MongoDB Atlas
Maps	TomTom Maps API
Real-time	WebSockets
POST   /api/users                      - Create user
GET    /api/users/{id}                 - Get user details
POST   /api/driver-routes              - Publish route
GET    /api/driver-routes              - Get all routes
POST   /api/ride-requests              - Create ride request
GET    /api/ride-requests              - Get requests
PUT    /api/ride-requests/{id}/accept  - Accept ride
POST   /api/ratings                    - Submit rating
POST   /api/subscriptions              - Create subscription
GET    /api/health                     - Health check

🚀 Getting Started
Prerequisites
Node.js 18+
Python 3.10+
MongoDB Atlas account
Expo CLI (npm install -g expo-cli)

UniGo/
├── backend/
│   ├── server.py          # FastAPI application
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── app/
│   │   ├── index.tsx      # Main entry point
│   │   ├── _components/   # React components
│   │   ├── _constants/    # Theme & config
│   │   ├── _services/     # API services
│   │   ├── _store/        # Zustand store
│   │   └── _types/        # TypeScript types
│   └── package.json
└── README.md

📱 Screenshots
Coming soon

🤝 Contributing
Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

👥 Authors
Your Name - Initial work
🙏 Acknowledgments
TomTom Maps for mapping services
Expo team for the amazing React Native framework
FastAPI for the powerful backend framework
