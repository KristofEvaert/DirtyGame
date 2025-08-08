# Truth or Dare - For You & Your Wife

A beautiful, modern Truth or Dare game designed specifically for couples. No login required - just pure fun for you and your partner!

## 🎮 Features

### **Game Features:**
- **Player Selection**: Choose between "You" and "Your Wife"
- **Game Modes**: Truth, Dare, or Random
- **Difficulty Levels**: Easy, Medium, Hard (color-coded)
- **Card Reveal**: Beautiful animated card reveals
- **Complete/Skip Tracking**: Track whether challenges were completed
- **Game Statistics**: Real-time tracking of performance

### **Admin Panel:**
- **Add Custom Cards**: Create your own truth and dare cards
- **Edit Cards**: Modify existing cards (content, type, difficulty)
- **Delete Cards**: Remove unwanted cards
- **Filtering**: Filter by type and difficulty
- **Export/Import**: Share card collections with others
- **Reset to Default**: Return to original card set

### **History & Statistics:**
- **Game Statistics**: Total games, completion rates, player performance
- **Detailed Breakdown**: Card types and difficulty analysis
- **Player Performance**: Individual stats for each player
- **Filtering**: Filter by player, card type, and completion status
- **Timestamps**: Track when each game was played

## 🚀 How to Share with Others

### **Option 1: Share the Entire Program (Recommended)**
1. **Build the program**: Run `npm run build`
2. **Share the `dist` folder**: This contains the complete game
3. **Others can run it**: They just need to open `index.html` in their browser

### **Option 2: Share Just the Cards**
1. **Export your cards**: Go to Admin → Export Cards
2. **Share the JSON file**: Send `truth-or-dare-cards.json` to others
3. **They import it**: They go to Admin → Import Cards → Select your file

### **Option 3: Customize the Default Cards**
1. **Edit `src/data/cards.json`**: Add your own cards to the default set
2. **Build and share**: Everyone gets your custom cards by default

## 📁 File Structure

```
DirtyGame/
├── src/
│   ├── data/
│   │   └── cards.json          # All truth and dare cards
│   ├── pages/
│   │   ├── Game.tsx           # Main game interface
│   │   ├── Admin.tsx          # Card management
│   │   └── History.tsx        # Game statistics
│   ├── components/
│   │   └── Navbar.tsx         # Navigation bar
│   └── App.tsx                # Main app component
├── dist/                      # Built version (after npm run build)
└── README.md                  # This file
```

## 🎯 How Cards Work

### **Card Storage:**
- **Default Cards**: Stored in `src/data/cards.json`
- **Custom Cards**: Can be added through Admin panel
- **Sharing**: Export/import JSON files to share card collections

### **Card Structure:**
```json
{
  "id": "unique-id",
  "type": "truth" | "dare",
  "content": "Card text here",
  "difficulty": "easy" | "medium" | "hard"
}
```

### **Difficulty Levels:**
- **Easy**: Simple, fun challenges
- **Medium**: More personal or physical challenges
- **Hard**: Intimate or challenging questions/actions

## 🛠️ Installation & Setup

### **For Development:**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### **For Sharing:**
1. Run `npm run build`
2. Share the `dist` folder
3. Recipients just open `index.html` in their browser

## 🎨 Design Features

- **Beautiful UI**: Purple/pink gradient theme perfect for couples
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Card reveals and transitions
- **Intuitive Navigation**: Easy sidebar navigation
- **Visual Feedback**: Color-coded difficulty levels and completion status

## 📊 Data Persistence

- **Game History**: Saved in browser localStorage
- **Cards**: Loaded from JSON file (no login required)
- **Cross-Session**: Data persists between browser sessions
- **Private**: All data stays on your device

## 🔧 Customization

### **Adding Custom Cards:**
1. Go to Admin panel
2. Fill in the form (Type, Difficulty, Content)
3. Click "Add Card"

### **Sharing Custom Cards:**
1. Go to Admin panel
2. Click "Export Cards"
3. Share the downloaded JSON file
4. Others import it via "Import Cards"

### **Modifying Default Cards:**
1. Edit `src/data/cards.json`
2. Add your custom cards
3. Build the program (`npm run build`)
4. Share the `dist` folder

## 🎯 Perfect For

- **Couples**: Designed specifically for romantic partners
- **Date Nights**: Add excitement to your evenings
- **Parties**: Fun for small groups
- **Long Distance**: Play over video calls
- **Privacy**: No accounts, no data sharing

## 🚀 Quick Start

1. **Open the game** in your browser
2. **Select a player** (You or Your Wife)
3. **Choose game mode** (Truth, Dare, or Random)
4. **Draw a card** and have fun!
5. **Track progress** in the History section
6. **Add custom cards** in the Admin section

## 📱 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 🎉 Enjoy!

This Truth or Dare game is designed to bring couples closer together through fun, intimate, and sometimes silly challenges. Whether you're looking for deep conversations or playful activities, this game has something for every couple!

---

**Made with ❤️ for couples everywhere**
