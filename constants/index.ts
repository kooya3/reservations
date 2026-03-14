export const GenderOptions = ["Male", "Female", "Other", "Prefer not to say"];

export const GuestFormDefaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: new Date(Date.now()),
  gender: "Prefer not to say" as Gender,
  address: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  preferredTable: "",
  dietaryRestrictions: "",
  allergies: "",
  specialOccasion: "",
  marketingConsent: false,
  newsletterConsent: false,
  privacyConsent: false,
};

// Alias for compatibility
export const PatientFormDefaultValues = GuestFormDefaultValues;

export const IdentificationTypes = [
  "Driver's License",
  "Passport",
  "National Identity Card",
  "State ID Card",
  "Student ID Card",
  "Military ID Card",
  "Other",
];

export const TablePreferences = [
  {
    name: "Window Seating",
    description: "Enjoy the view with natural lighting",
    icon: "🪟",
  },
  {
    name: "Private Booth",
    description: "Intimate dining experience",
    icon: "🛋️",
  },
  {
    name: "Bar Seating",
    description: "Perfect for cocktails and casual dining",
    icon: "🍸",
  },
  {
    name: "Outdoor Terrace",
    description: "Al fresco dining under the stars",
    icon: "🌃",
  },
  {
    name: "Main Dining Room",
    description: "Classic restaurant atmosphere",
    icon: "🍽️",
  },
  {
    name: "VIP Section",
    description: "Exclusive area with premium service",
    icon: "⭐",
  },
  {
    name: "Family Area",
    description: "Spacious seating for families",
    icon: "👨‍👩‍👧‍👦",
  },
  {
    name: "Quiet Corner",
    description: "Peaceful ambiance for conversation",
    icon: "🤫",
  },
  {
    name: "Chef's Table",
    description: "Watch the culinary magic happen",
    icon: "👨‍🍳",
  },
];

export const TimeSlots = [
  // Brunch & Early Lunch (Mon-Fri: 8am+, Sat-Sun: 10am+)
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  
  // Lunch & Afternoon
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  
  // Happy Hour & Early Dinner
  "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
  "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
  
  // Prime Dinner
  "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM",
  "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM",
  
  // Late Night (Fri-Sat until 2am)
  "12:00 AM", "12:30 AM", "1:00 AM", "1:30 AM"
];

export const PartySize = [
  "1 Guest", "2 Guests", "3 Guests", "4 Guests",
  "5 Guests", "6 Guests", "7 Guests", "8 Guests",
  "9 Guests", "10 Guests", "11-15 Guests", "16-20 Guests",
  "20+ Guests (Private Event)"
];

export const OccasionTypes = [
  "Birthday Celebration 🎂",
  "Anniversary 💑",
  "Business Meeting 💼",
  "Date Night 💕",
  "Family Gathering 👨‍👩‍👧‍👦",
  "Friends Reunion 🥳",
  "Engagement 💍",
  "Graduation 🎓",
  "Corporate Event 🏢",
  "Other Special Occasion ✨"
];

export const StatusIcon = {
  scheduled: "/assets/icons/check.svg",
  confirmed: "/assets/icons/check.svg",
  pending: "/assets/icons/pending.svg",
  cancelled: "/assets/icons/cancelled.svg",
};

export const StatusColors = {
  confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};

export const DietaryRestrictions = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut Allergy",
  "Seafood Allergy",
  "Halal",
  "Kosher",
  "Low Sodium",
  "Diabetic Friendly",
  "Other"
];

// Welcome drinks & cocktails menu 🍹
export const Doctors = [
  // Classic Cocktails 🥃
  {
    name: "🍃 Classic Mojito",
    image: "/assets/icons/dr-cruz.png",
    description: "Fresh mint, lime, white rum, soda"
  },
  {
    name: "🌅 Sunset Margarita",
    image: "/assets/icons/dr-lee.png",
    description: "Premium tequila, Cointreau, fresh lime"
  },
  {
    name: "🥃 Whiskey Sour",
    image: "/assets/icons/dr-sharma.png",
    description: "Bourbon, lemon juice, egg white foam"
  },
  {
    name: "💋 Cosmopolitan",
    image: "/assets/icons/dr-cruz.png",
    description: "Vodka, cranberry, lime, triple sec"
  },
  {
    name: "🎩 Old Fashioned",
    image: "/assets/icons/dr-lee.png",
    description: "Whiskey, Angostura bitters, sugar cube"
  },
  {
    name: "🥥 Piña Colada",
    image: "/assets/icons/dr-sharma.png",
    description: "White rum, coconut cream, pineapple"
  },
  {
    name: "☕ Espresso Martini",
    image: "/assets/icons/dr-cruz.png",
    description: "Vodka, Kahlúa, fresh espresso"
  },
  
  // Signature Cocktails ✨
  {
    name: "🌺 Mai Tai Paradise",
    image: "/assets/icons/dr-lee.png",
    description: "Rum blend, orgeat, orange curaçao"
  },
  {
    name: "🍓 Strawberry Daiquiri",
    image: "/assets/icons/dr-sharma.png",
    description: "White rum, fresh strawberries, lime"
  },
  {
    name: "🥝 Kiwi Caipirinha",
    image: "/assets/icons/dr-cruz.png",
    description: "Cachaça, muddled kiwi, lime"
  },
  {
    name: "🔥 Spicy Paloma",
    image: "/assets/icons/dr-lee.png",
    description: "Tequila, grapefruit, jalapeño, tajin rim"
  },
  {
    name: "💜 Lavender Collins",
    image: "/assets/icons/dr-sharma.png",
    description: "Gin, lavender syrup, lemon, soda"
  },
  {
    name: "🍑 Bellini Royale",
    image: "/assets/icons/dr-cruz.png",
    description: "Prosecco, white peach purée"
  },
  {
    name: "🌿 Basil Gimlet",
    image: "/assets/icons/dr-lee.png",
    description: "Gin, fresh basil, lime juice"
  },
  
  // Tropical & Exotic 🏝️
  {
    name: "🦩 Pink Flamingo",
    image: "/assets/icons/dr-sharma.png",
    description: "Vodka, pink grapefruit, rosé splash"
  },
  {
    name: "🥭 Mango Tango",
    image: "/assets/icons/dr-cruz.png",
    description: "Vodka, mango purée, passion fruit"
  },
  {
    name: "🍍 Tropical Storm",
    image: "/assets/icons/dr-lee.png",
    description: "Dark rum, pineapple, blue curaçao"
  },
  {
    name: "🌴 Caribbean Breeze",
    image: "/assets/icons/dr-sharma.png",
    description: "Coconut rum, banana liqueur, pineapple"
  },
  {
    name: "🍉 Watermelon Martini",
    image: "/assets/icons/dr-cruz.png",
    description: "Vodka, fresh watermelon, basil"
  },
  
  // Champagne & Wine 🥂
  {
    name: "🥂 French 75",
    image: "/assets/icons/dr-lee.png",
    description: "Gin, lemon, sugar, champagne"
  },
  {
    name: "🍾 Aperol Spritz",
    image: "/assets/icons/dr-sharma.png",
    description: "Aperol, prosecco, soda, orange"
  },
  {
    name: "🌹 Rosé Sangria",
    image: "/assets/icons/dr-cruz.png",
    description: "Rosé wine, mixed berries, brandy"
  },
  {
    name: "⚪ White Wine Sangria",
    image: "/assets/icons/dr-lee.png",
    description: "White wine, peach, citrus fruits"
  },
  {
    name: "🍷 House Red Wine",
    image: "/assets/icons/dr-sharma.png",
    description: "Premium Cabernet Sauvignon"
  },
  {
    name: "🥂 House White Wine",
    image: "/assets/icons/dr-cruz.png",
    description: "Crisp Sauvignon Blanc"
  },
  
  // Premium Spirits 🥇
  {
    name: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Single Malt Scotch",
    image: "/assets/icons/dr-lee.png",
    description: "12-year aged Highland scotch"
  },
  {
    name: "🇯🇵 Japanese Highball",
    image: "/assets/icons/dr-sharma.png",
    description: "Japanese whisky, soda, lemon"
  },
  {
    name: "🇲🇽 Premium Tequila Shot",
    image: "/assets/icons/dr-cruz.png",
    description: "Don Julio 1942, lime, salt"
  },
  {
    name: "🇷🇺 Vodka Martini",
    image: "/assets/icons/dr-lee.png",
    description: "Grey Goose, dry vermouth, olive"
  },
  
  // Beer Selection 🍺
  {
    name: "🍺 Craft IPA",
    image: "/assets/icons/dr-sharma.png",
    description: "Local brewery hoppy IPA"
  },
  {
    name: "🍻 Belgian Wheat",
    image: "/assets/icons/dr-cruz.png",
    description: "Hoegaarden with orange slice"
  },
  {
    name: "🏖️ Corona Extra",
    image: "/assets/icons/dr-lee.png",
    description: "Mexican lager with lime"
  },
  {
    name: "🇮🇪 Guinness Stout",
    image: "/assets/icons/dr-sharma.png",
    description: "Creamy Irish stout"
  },
  
  // Mocktails (Non-Alcoholic) 🌟
  {
    name: "🌺 Virgin Mojito",
    image: "/assets/icons/dr-cruz.png",
    description: "Fresh mint, lime, soda"
  },
  {
    name: "🍹 Paradise Punch",
    image: "/assets/icons/dr-lee.png",
    description: "Tropical fruit blend, grenadine"
  },
  {
    name: "🥤 Shirley Temple",
    image: "/assets/icons/dr-sharma.png",
    description: "Ginger ale, grenadine, cherry"
  },
  {
    name: "🍋 Lemon Ginger Fizz",
    image: "/assets/icons/dr-cruz.png",
    description: "Fresh lemon, ginger, sparkling water"
  },
  {
    name: "🫐 Berry Sparkler",
    image: "/assets/icons/dr-lee.png",
    description: "Mixed berries, lime, tonic"
  },
  {
    name: "🥒 Cucumber Cooler",
    image: "/assets/icons/dr-sharma.png",
    description: "Cucumber, mint, elderflower"
  },
  
  // Coffee & Dessert Drinks ☕
  {
    name: "☕ Irish Coffee",
    image: "/assets/icons/dr-cruz.png",
    description: "Whiskey, coffee, cream float"
  },
  {
    name: "🍫 Chocolate Martini",
    image: "/assets/icons/dr-lee.png",
    description: "Vodka, chocolate liqueur, cream"
  },
  {
    name: "🥜 Amaretto Sour",
    image: "/assets/icons/dr-sharma.png",
    description: "Amaretto, lemon, cherry"
  },
  {
    name: "🍦 White Russian",
    image: "/assets/icons/dr-cruz.png",
    description: "Vodka, Kahlúa, cream"
  },
  {
    name: "🌰 Hazelnut Espresso",
    image: "/assets/icons/dr-lee.png",
    description: "Frangelico, espresso, vodka"
  }
];