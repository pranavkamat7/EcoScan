# 🌱 GarbageMedia — Civic Cleanup & Before/After Proofs Platform

A responsive, community-driven civic platform where neighbors report dirty spots with live GPS, clean them up, verify on-site proximity, and automatically generate interactive **Before & After** comparison sliders while earning reward points.

Now integrated with **Firebase** for cloud authentication (Google & Email/Password), real-time Firestore database sync across devices, and cloud profiles — running on Firebase's **100% Free Spark Plan** (no credit card required).

---

## 🌟 Core Features

1. **Firebase Authentication & Profiles**:
   - One-click **Google Sign-In** & **Email/Password** registration.
   - Cloud user profile synced in Firestore (`users/{uid}`) tracking points, level, and cleanups.
   - Graceful offline fallback: if Firebase is not yet configured, runs locally without crashing!

2. **Real-Time Cloud Synchronization (Firestore)**:
   - When one user snaps and reports a dirty spot from their phone, it appears **instantly in real time** on everyone's screen.
   - Cleanup submissions, Before & After transformations, and civic likes sync across all devices.

3. **Live GPS Capture & Address Reverse Geocoding**:
   - Takes or uploads photos directly on mobile or desktop.
   - Automatically acquires live device GPS and reverse geocodes to a human-readable street address via free **OpenStreetMap Nominatim**.
   - Assigns severity level and generates an automatic community bounty.

4. **Clean & Verify On-Site Proximity**:
   - Volunteers click *"I Cleaned This Spot"* on any open mission.
   - **Haversine Geolocation Matching**: Calculates the exact distance in meters between the report GPS and the cleaner's location. If within threshold (<250m), grants verified on-site status and bonus reward points!
   - Built-in location simulation toggle for easy desktop testing.

5. **Automatic Before/After Proof Generation**:
   - Instantly pairs the dirty report with the cleaned proof into an interactive dual-mode slider.
   - Drag the slider handle or toggle Side-by-Side mode.

6. **Gamification & Rewards Ledger**:
   - Points earned based on spot severity, GPS verification, and speed.
   - 5 Levels: *Civic Scout*, *Neighborhood Steward*, *Urban Eco-Guardian*, *Civic Transformer*, *Honorary Earth Champion*.
   - Live Leaderboard showing top civic cleaners.

7. **Interactive Civic Map**:
   - 100% Free OpenStreetMap integration via Leaflet (no Google Maps API billing or credit card required).
   - Color-coded pins: Terracotta for open cleanup bounties, Forest Green for restored places.

---

## 🔥 Free Firebase Setup (Spark Plan — 0 Cost)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a free project.
2. Under **Build** > **Authentication**:
   - Enable **Google** and **Email/Password** sign-in methods.
3. Under **Build** > **Firestore Database**:
   - Click **Create database** (start in Test mode).
4. Register a Web app `</>` to view your config keys.
5. In the GarbageMedia web app, click **"Connect Firebase"** in the top navigation bar and paste your keys, or add them to your `.env` file:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_PROJECT_ID=garbagemedia-12345
VITE_FIREBASE_AUTH_DOMAIN=garbagemedia-12345.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=garbagemedia-12345.appspot.com
VITE_FIREBASE_APP_ID=1:123456:web:abcd
```

---

## 🚀 How to Host for 100% Free on Render

Render offers **Static Site hosting that is 100% free forever** with **zero spin-down / sleeping delays** and automatic SSL certificates.

### Step 1: Push your project to GitHub
```bash
git add .
git commit -m "Integrate Firebase Authentication & real-time Firestore sync"
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign in for free with your GitHub account.
2. Click **"New +"** > **"Static Site"**.
3. Select your repository `GarbageMedia`.
4. Configure settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. *(Optional)* Under **Environment Variables**, you can add your `VITE_FIREBASE_*` keys so your deployed site automatically connects to Firebase!
6. Click **"Create Static Site"**.
