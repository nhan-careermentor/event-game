// Game Configuration - All settings in one place
export const GAME_CONFIG = {
  DURATION_SEC: 30,
  MAX_PLAYS: 2,
  EVENT_ID: "AUG-Adelaide-Fair-15082025"
};

// URLs
export const URLS = {
  LOGO: "https://iili.io/FtoWuaV.png",
  FB_GROUP: "https://www.facebook.com/groups/taynganghoccode",
};

// Add Supabase configuration
export const SUPABASE_CONFIG = {
  URL: "https://cgxvscxqeitxffheohpv.supabase.co", // Replace with your Project URL
  ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNneHZzY3hxZWl0eGZmaGVvaHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMzUzNzYsImV4cCI6MjA3MDcxMTM3Nn0.5GAtEa1EHzo-XbYuqEyfrS0TL-cZLOL9kEQo3Bqhvmk" // Replace with your anon public key
};

// Sound Effects
export const SOUNDS = {
  click: "/sounds/click-good.wav",
  bad: "/sounds/click-bad.mp3",
  start: "/sounds/game-start.wav",
  end: "/sounds/game-end.wav"
};

// Game Icons
export const ICONS = {
  mortarboard: "/icons/mortarboard.webp",
  laptop: "/icons/laptop.webp",
  award: "/icons/award.png",
  briefcase: "/icons/briefcase.png",
  handshake: "/icons/handshake.png",
  books: "/icons/books.png",
  campus: "/icons/campus.png",
  careerMentor: "/icons/careerMentor.png",

  phone: "/icons/phone.webp",
  controller: "/icons/controller.png",
  sleepingFace: "/icons/sleepingFace.png",
  popcorn: "/icons/popcorn.png",
  bomb: "/icons/bomb.png",
  prohibited: "/icons/prohibited.png",

  star: "/icons/star.png",
  rocket: "/icons/rocket.png",
  brain: "/icons/brain.png",
  hourglass: "/icons/hourglass.png"
};
                                    
// Game Item Categories
export const ITEM_CATEGORIES = {
  GOOD: [
    "mortarboard",
    "laptop",
    "award",
    "briefcase",
    "handshake",
    "books",
    "careerMentor",
    "campus"
  ],
  BAD: [
    "phone",
    "controller",
    "sleepingFace",
    "popcorn",
    "bomb",
    "prohibited"
  ],
  POWER_UPS: ["star", "rocket", "brain", "hourglass"]
};

// Prize Tiers
export const PRIZE_TIERS = [
  { min: 100, label: "🎁 Voucher", css: "bg-red-600 text-white" },
  { min: 50, label: "🎁 Tote Bag", css: "bg-orange-500 text-white" },
  { min: 30, label: "🎁 Pen", css: "bg-yellow-500 text-black" }
];

// Achievement Definitions
export const ACHIEVEMENTS = [
  { 
    id: 'speed_demon', 
    title: 'Speed Demon', 
    description: '5 clicks in 3 seconds', 
    check: (stats) => stats.goodClicks >= 5 
  },
  { 
    id: 'combo_master', 
    title: 'Combo Master', 
    description: '7x combo achieved', 
    check: (stats, combo) => combo >= 7 
  },
  { 
    id: 'perfectionist', 
    title: 'Perfectionist', 
    description: 'No bad clicks', 
    check: (stats, combo, score) => stats.badClicks === 0 && score > 5 
  },
  { 
    id: 'career_focused', 
    title: 'Career Focused', 
    description: '15+ points scored', 
    check: (stats, combo, score) => score >= 15 
  }
];

// Utility Functions
export function rand(min, max) { 
  return Math.random() * (max - min) + min; 
}

export function pick(arr) { 
  return arr[Math.floor(Math.random() * arr.length)]; 
}

export function makeBoothCode(base) {
  let hash = 5381;
  for (let i = 0; i < base.length; i++) {
    hash = ((hash << 5) + hash) ^ base.charCodeAt(i);
  }
  return "CM-" + Math.abs(hash).toString(36).toUpperCase().slice(0, 6);
}