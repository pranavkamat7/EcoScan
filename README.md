# 🌱 SpotClean — Civic Cleanup & Before/After Proofs Platform

A responsive, community-driven civic platform where neighbors report dirty spots with live GPS, clean them up, verify on-site proximity, and automatically generate interactive **Before & After** comparison sliders while earning reward points.

Designed with an honest, utilitarian, editorial aesthetic — **no neon gradients, no glassy blur effects, no generic AI styling**. Built with earthy tones, crisp borders, and clean typography.

---

## 🌟 Core Features

1. **Social Civic Feed**:
   - Live stream of transformed spots and open cleanup bounties.
   - Interactive **Before & After comparison slider** (drag to reveal transformation or switch to side-by-side mode).
   - Upvotes ("Civic Respect"), comments, and waste reduction metrics.

2. **Report a Dirty Spot**:
   - Take or upload photo directly on mobile or desktop.
   - Automatically acquires live device GPS (Latitude, Longitude) and reverse geocodes to a human-readable street address via OpenStreetMap Nominatim.
   - Assigns severity level and generates an automatic community bounty.

3. **Clean & Verify On-Site Proximity**:
   - Volunteers click *"I Cleaned This Spot"* on any open mission.
   - Submit cleaned photo proof.
   - **Haversine Geolocation Matching**: Calculates the exact distance in meters between the original report GPS and the cleaner's location. If within threshold (<250m), grants verified on-site status and maximum reward points!
   - Built-in location simulation toggle for easy desktop testing.

4. **Automatic Before/After Proof Generation**:
   - Instantly pairs the dirty report with the cleaned proof into an interactive dual-mode slider.
   - Accurately attributes both the reporter and the cleaner.

5. **Gamification & Rewards Ledger**:
   - Points earned based on spot severity, GPS verification, and speed.
   - Levels: *Civic Scout*, *Neighborhood Steward*, *Urban Eco-Guardian*, *Civic Transformer*, *Honorary Earth Champion*.
   - Leaderboard showing top civic cleaners, spots transformed, and kilograms of waste removed.
   - Free civic rewards store (Certificates of Commendation with PDF export, Tree Dedications, Steward Badges).

6. **Interactive Civic Map**:
   - 100% Free OpenStreetMap integration via Leaflet (no Google Maps API billing or credit card required).
   - Color-coded pins: Terracotta for open cleanup bounties, Forest Green for restored places.

---

## 🚀 How to Host for 100% Free on Render

Render offers **Static Site hosting that is 100% free forever** with **zero spin-down / sleeping delays** and automatic SSL certificates.

### Step 1: Push your project to GitHub
In your project directory:
```bash
git init
git add .
git commit -m "Initial commit of SpotClean"
# Create a repository on GitHub (github.com/new) and link it:
git remote add origin https://github.com/YOUR_USERNAME/spotclean.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and create a free account (log in with your GitHub account).
2. Click the **"New +"** button in the top right corner and select **"Static Site"**.
3. Select your `spotclean` GitHub repository.
4. Set the following settings:
   - **Name**: `spotclean` (or any name you choose)
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Click **"Create Static Site"**.

Render will automatically clone the repository, run `npm run build`, and provide your permanent free URL:
`https://spotclean.onrender.com`

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local dev server with hot reload
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build locally
npm run preview
```

---

## 🔒 100% Free Guarantee

- **No Paid APIs**: Uses OpenStreetMap (free tile layer and free Nominatim reverse geocoding API).
- **No Paid Databases**: Client-side offline-first architecture with `localStorage` persistence and sample data pre-seeded.
- **No Render Subscription**: Built for Render's 100% free Static Sites tier.
