/**
 * South Park Character System
 * Based on official South Park Studios Wiki structure
 * https://www.southparkstudios.com/w/index.php/List_of_Characters
 */

// ── CHARACTER CATEGORIES (Official Wiki Structure) ─────────────────────────

export type CharacterCategory =
  | "the_four_boys"
  | "4th_graders"
  | "school_faculty"
  | "extended_families"
  | "adults"
  | "celebrities"
  | "other";

export type CharacterRarity = "main" | "recurring" | "minor" | "background";

export interface SouthParkCharacter {
  id: string;
  name: string;
  fullName: string;
  category: CharacterCategory;
  subCategory?: string;
  rarity: CharacterRarity;
  
  // Visual
  color: string;
  spritePath: string;
  
  // Character info
  age?: string;
  occupation?: string;
  grade?: string;
  relatives?: string[];
  firstAppearance?: string;
  voicedBy?: string;
  
  // Personality
  personality: string;
  catchphrases: string[];
  
  // Game stats
  stats: {
    intelligence: number;
    creativity: number;
    speed: number;
    accuracy: number;
    charisma: number;
    luck: number;
  };
  
  // Level system
  level: {
    current: number;
    xp: number;
    xpToNext: number;
    totalXp: number;
  };
  
  // Phrases for AI agent work
  workingPhrases: string[];
  completionPhrases: string[];
  errorPhrases: string[];
  idlePhrases: string[];
  
  // Unlock
  unlocked: boolean;
  unlockCondition?: string;
}

// ── THE FOUR BOYS (Main Characters) ───────────────────────────────────────

const THE_FOUR_BOYS: SouthParkCharacter[] = [
  {
    id: "stan",
    name: "Stan",
    fullName: "Stan Marsh",
    category: "the_four_boys",
    rarity: "main",
    color: "#3B82F6",
    spritePath: "/southpark/stan.png",
    age: "10",
    grade: "4th Grade",
    relatives: ["Randy Marsh (Father)", "Sharon Marsh (Mother)", "Shelly Marsh (Sister)"],
    firstAppearance: "Cartman Gets an Anal Probe",
    personality: "Kind, ethical, and usually the voice of reason among the boys",
    catchphrases: [
      "Oh my God, they killed Kenny!",
      "You guys, I learned something today...",
      "This is pretty messed up right here.",
      "Dude, that's not cool.",
    ],
    stats: { intelligence: 75, creativity: 70, speed: 65, accuracy: 80, charisma: 85, luck: 60 },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    workingPhrases: ["Working on it, dude...", "I think I got this figured out...", "Just a sec..."],
    completionPhrases: ["Done! That actually went pretty well.", "Task complete, guys!", "Nailed it!"],
    errorPhrases: ["Oh man, this is messed up...", "Dude, something went wrong..."],
    idlePhrases: ["Hey guys, what's going on?", "This is pretty weird..."],
    unlocked: true,
  },
  {
    id: "kyle",
    name: "Kyle",
    fullName: "Kyle Broflovski",
    category: "the_four_boys",
    rarity: "main",
    color: "#22C55E",
    spritePath: "/southpark/kyle.png",
    age: "10",
    grade: "4th Grade",
    relatives: ["Gerald Broflovski (Father)", "Sheila Broflovski (Mother)", "Ike Broflovski (Brother)"],
    firstAppearance: "Cartman Gets an Anal Probe",
    personality: "Intelligent, logical, and has a strong moral compass",
    catchphrases: [
      "You bastards!",
      "I learned something today...",
      "That's not logical!",
      "Cartman, you're such a fatass!",
    ],
    stats: { intelligence: 95, creativity: 75, speed: 55, accuracy: 90, charisma: 70, luck: 50 },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    workingPhrases: ["Analyzing the problem...", "Processing the data...", "Let me think this through..."],
    completionPhrases: ["Finally! That makes sense now.", "Task complete, logically speaking.", "Done!"],
    errorPhrases: ["This doesn't make any sense!", "That's not logical at all!"],
    idlePhrases: ["I need to think about this...", "Has anyone seen my hat?"],
    unlocked: true,
  },
  {
    id: "cartman",
    name: "Cartman",
    fullName: "Eric Cartman",
    category: "the_four_boys",
    rarity: "main",
    color: "#EF4444",
    spritePath: "/southpark/cartman.png",
    age: "10",
    grade: "4th Grade",
    relatives: ["Liane Cartman (Mother)"],
    firstAppearance: "Cartman Gets an Anal Probe",
    personality: "Manipulative, arrogant, but surprisingly capable at getting results",
    catchphrases: [
      "Respect my authoritah!",
      "Screw you guys, I'm going home!",
      "I'm not fat, I'm big-boned!",
      "You will respect my authoritah!",
    ],
    stats: { intelligence: 80, creativity: 90, speed: 40, accuracy: 70, charisma: 95, luck: 75 },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    workingPhrases: ["I'm working on it, okay?!", "Let me handle this my way...", "Everyone just calm down!"],
    completionPhrases: ["Done! You're welcome!", "See? I told you I'd handle it!", "Finished! Now respect my authoritah!"],
    errorPhrases: ["WHAT?! That's not fair!", "SCREW THIS!", "This is BS!"],
    idlePhrases: ["Whatever, I do what I want!", "You guys are stupid."],
    unlocked: true,
  },
  {
    id: "kenny",
    name: "Kenny",
    fullName: "Kenny McCormick",
    category: "the_four_boys",
    rarity: "main",
    color: "#F97316",
    spritePath: "/southpark/kenny.png",
    age: "10",
    grade: "4th Grade",
    relatives: ["Stuart McCormick (Father)", "Carol McCormick (Mother)", "Kevin McCormick (Brother)", "Karen McCormick (Sister)"],
    firstAppearance: "Cartman Gets an Anal Probe",
    personality: "Mysterious, loyal, and surprisingly knowledgeable despite his muffled speech",
    catchphrases: [
      "Mmph mmph mmph!",
      "(Muffled sounds)",
      "...",
      "*muffled agreement*",
    ],
    stats: { intelligence: 70, creativity: 60, speed: 85, accuracy: 65, charisma: 55, luck: 100 },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    workingPhrases: ["Mmph mph mmph...", "(concentrating)", "*focused mumbling*"],
    completionPhrases: ["(success mumble)", "Mmph!", "*thumbs up*"],
    errorPhrases: ["(sad mumble)", "Mmph...", "*disappointed sounds*"],
    idlePhrases: ["...", "(muffled humming)"],
    unlocked: true,
  },
];

// ── 4TH GRADERS (Recurring Characters) ─────────────────────────────────────

const FOURTH_GRADERS: SouthParkCharacter[] = [
  {
    id: "butters",
    name: "Butters",
    fullName: "Butters Stotch",
    category: "4th_graders",
    subCategory: "Featured 4th Graders",
    rarity: "recurring",
    color: "#06B6D4",
    spritePath: "/southpark/butters.png",
    age: "10",
    grade: "4th Grade",
    relatives: ["Stephen Stotch (Father)", "Linda Stotch (Mother)"],
    firstAppearance: "Two Guys Naked in a Hot Tub",
    personality: "Innocent, naive, optimistic, and always eager to please",
    catchphrases: [
      "Oh hamburgers!",
      "Gee whiz!",
      "That's the darndest thing!",
      "I'm grounded...",
    ],
    stats: { intelligence: 60, creativity: 80, speed: 75, accuracy: 70, charisma: 90, luck: 65 },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    workingPhrases: ["Oh boy, working real hard!", "Gee, this is exciting!", "Doing my best, folks!"],
    completionPhrases: ["Oh boy, I did it!", "Gee whiz, all done!", "Finished! That was fun!"],
    errorPhrases: ["Oh hamburgers...", "Gee, that didn't work..."],
    idlePhrases: ["Gee, I wonder what to do...", "Anyone need help?"],
    unlocked: true,
  },
  {
    id: "token",
    name: "Token",
    fullName: "Token Black",
    category: "4th_graders",
    subCategory: "Featured 4th Graders",
    rarity: "recurring",
    color: "#8B5CF6",
    spritePath: "/southpark/token.png",
    age: "10",
    grade: "4th Grade",
    relatives: ["Steve Black (Father)", "Linda Black (Mother)"],
    firstAppearance: "Cartman Gets an Anal Probe",
    personality: "Wealthy, well-spoken, and talented musician",
    catchphrases: [
      "I'm not just a token black kid.",
      "I can play bass.",
      "My family is wealthy.",
    ],
    stats: { intelligence: 85, creativity: 90, speed: 60, accuracy: 80, charisma: 75, luck: 70 },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    workingPhrases: ["Let me handle this professionally...", "Working with precision...", "Quality takes time."],
    completionPhrases: ["Done with excellence!", "Task completed to standard.", "Finished!"],
    errorPhrases: ["This is below standard...", "Let me try a different approach."],
    idlePhrases: ["Working on my music...", "Reading up on investments."],
    unlocked: false,
    unlockCondition: "Complete 5 tasks with any character",
  },
  {
    id: "jimmy",
    name: "Jimmy",
    fullName: "Jimmy Valmer",
    category: "4th_graders",
    subCategory: "Featured 4th Graders",
    rarity: "recurring",
    color: "#EAB308",
    spritePath: "/southpark/jimmy.png",
    age: "10",
    grade: "4th Grade",
    relatives: ["Ryan Valmer (Father)", "Sarah Valmer (Mother)"],
    firstAppearance: "Cripple Fight",
    personality: "Positive, comedic, and never lets anything hold him back",
    catchphrases: [
      "W-w-w-what a terrific audience!",
      "Th-th-th-that's funny!",
      "I'm not crippled, I'm handicapped.",
    ],
    stats: { intelligence: 75, creativity: 95, speed: 30, accuracy: 65, charisma: 85, luck: 60 },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    workingPhrases: ["W-working on it...", "Th-this won't take long...", "D-d-doing my best!"],
    completionPhrases: ["Th-there we go!", "F-f-finished!", "What a terrific result!"],
    errorPhrases: ["W-w-well that didn't work...", "L-l-let me try again."],
    idlePhrases: ["W-w-working on some jokes...", "Anyone want to hear a joke?"],
    unlocked: false,
    unlockCondition: "Complete 3 tasks successfully",
  },
  {
    id: "timmy",
    name: "Timmy",
    fullName: "Timmy Burch",
    category: "4th_graders",
    subCategory: "Special Education",
    rarity: "recurring",
    color: "#DC2626",
    spritePath: "/southpark/timmy.png",
    age: "10",
    grade: "4th Grade",
    firstAppearance: "The Tooth Fairy Tats 2000",
    personality: "Enthusiastic despite limited vocabulary, pure heart",
    catchphrases: [
      "TIMMY!",
      "Timmy!",
      "TIM-MAY!",
    ],
    stats: { intelligence: 50, creativity: 70, speed: 20, accuracy: 60, charisma: 80, luck: 90 },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    workingPhrases: ["TIMMY!", "Tim-my!", "...timmy..."],
    completionPhrases: ["TIM-MAY!", "Timmy! Timmy!"],
    errorPhrases: ["...timmy?", "Tim... my..."],
    idlePhrases: ["Timmy!", "TIMMY!"],
    unlocked: false,
    unlockCondition: "Reach Level 3 with any character",
  },
  {
    id: "craig",
    name: "Craig",
    fullName: "Craig Tucker",
    category: "4th_graders",
    subCategory: "Featured 4th Graders",
    rarity: "recurring",
    color: "#1D4ED8",
    spritePath: "/southpark/craig.png",
    age: "10",
    grade: "4th Grade",
    relatives: ["Thomas Tucker (Father)", "Laura Tucker (Mother)", "Tricia Tucker (Sister)"],
    firstAppearance: "Cartman Gets an Anal Probe",
    personality: "Stoic, cynical, and known for flipping people off",
    catchphrases: [
      "I don't care.",
      "Whatever.",
      "*flips bird*",
    ],
    stats: { intelligence: 70, creativity: 50, speed: 60, accuracy: 75, charisma: 40, luck: 55 },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    workingPhrases: ["Whatever...", "Doing this, I guess...", "Fine..."],
    completionPhrases: ["Done. Whatever.", "Finished, I guess.", "There."],
    errorPhrases: ["Whatever.", "I don't care.", "*flips bird*"],
    idlePhrases: ["...", "I don't care."],
    unlocked: false,
    unlockCondition: "Complete 10 tasks",
  },
  {
    id: "tweek",
    name: "Tweek",
    fullName: "Tweek Tweak",
    category: "4th_graders",
    subCategory: "Featured 4th Graders",
    rarity: "recurring",
    color: "#84CC16",
    spritePath: "/southpark/tweek.png",
    age: "10",
    grade: "4th Grade",
    relatives: ["Richard Tweak (Father)", "Mrs. Tweak (Mother)"],
    firstAppearance: "Gnomes",
    personality: "Extremely anxious, jittery, and always on edge",
    catchphrases: [
      "AAH! TOO MUCH PRESSURE!",
      "GAH!",
      "I can't take the pressure!",
    ],
    stats: { intelligence: 60, creativity: 75, speed: 90, accuracy: 40, charisma: 50, luck: 80 },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    workingPhrases: ["AAH! Working on it!", "GAH! Too much pressure!", "I-I-I'm trying!"],
    completionPhrases: ["GAH! Done!", "F-F-Finished!", "AAH! Finally!"],
    errorPhrases: ["AAAH! IT FAILED!", "GAH! TOO MUCH PRESSURE!"],
    idlePhrases: ["GAH!", "AAH!", "I need coffee..."],
    unlocked: false,
    unlockCondition: "Complete 5 tasks with any character",
  },
];

// ── SCHOOL FACULTY ────────────────────────────────────────────────────────

const SCHOOL_FACULTY: SouthParkCharacter[] = [
  {
    id: "garrison",
    name: "Mr. Garrison",
    fullName: "Herbert Garrison",
    category: "school_faculty",
    rarity: "main",
    color: "#14B8A6",
    spritePath: "/southpark/garrison.png",
    occupation: "Teacher / Former President",
    firstAppearance: "Cartman Gets an Anal Probe",
    personality: "Unpredictable, eccentric, and has had quite the journey",
    catchphrases: [
      "Oh, stop it!",
      "Mr. Hat says...",
      "I'm not your buddy, guy!",
      "What's going on here?!",
    ],
    stats: { intelligence: 70, creativity: 75, speed: 65, accuracy: 60, charisma: 70, luck: 80 },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    workingPhrases: ["Now class, pay attention...", "This should work... I think...", "Mr. Hat, what do you think?"],
    completionPhrases: ["See? I told you I knew what I was doing!", "A+ work!"],
    errorPhrases: ["What?! That's not right!", "I'm confused..."],
    idlePhrases: ["Where's Mr. Hat?", "Children, behave!"],
    unlocked: false,
    unlockCondition: "Complete 10 tasks with any character",
  },
  {
    id: "chef",
    name: "Chef",
    fullName: "Jerome McElroy",
    category: "school_faculty",
    rarity: "main",
    color: "#DC2626",
    spritePath: "/southpark/chef.png",
    occupation: "School Chef",
    firstAppearance: "Cartman Gets an Anal Probe",
    personality: "Wise, soulful, always ready with advice",
    catchphrases: [
      "Hello there, children!",
      "I'm gonna make love to you, woman!",
      "Now children, let me tell you something...",
      "That's a spicy meat-a-ball!",
    ],
    stats: { intelligence: 90, creativity: 85, speed: 60, accuracy: 85, charisma: 100, luck: 55 },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    workingPhrases: ["Now let me see what we have here...", "Time to cook up a solution!", "Mm-hmm, I see the problem!"],
    completionPhrases: ["Mm-hmm! That's done right!", "Satisfying! Like a good meal!", "There we go, children!"],
    errorPhrases: ["Oh my, that's not good!", "Children, we have a problem!"],
    idlePhrases: ["Hello there, children!", "Want to hear a song?"],
    unlocked: false,
    unlockCondition: "Reach Level 5 with any character",
  },
  {
    id: "mackey",
    name: "Mr. Mackey",
    fullName: "Mackey",
    category: "school_faculty",
    rarity: "recurring",
    color: "#6366F1",
    spritePath: "/southpark/mackey.png",
    occupation: "School Counselor",
    firstAppearance: "Cartman Gets an Anal Probe",
    personality: "Monotone, well-meaning, obsessed with drugs being bad",
    catchphrases: [
      "Drugs are bad, mmkay?",
      "Mmkay?",
      "That's not cool, mmkay?",
    ],
    stats: { intelligence: 75, creativity: 40, speed: 50, accuracy: 70, charisma: 45, luck: 60 },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    workingPhrases: ["Working on this, mmkay?", "Let me analyze this, mmkay?", "This is important, mmkay?"],
    completionPhrases: ["Done, mmkay?", "Task complete, mmkay?"],
    errorPhrases: ["That's not good, mmkay?", "This is problematic, mmkay?"],
    idlePhrases: ["Mmkay?", "Drugs are bad, mmkay?"],
    unlocked: false,
    unlockCondition: "Complete 7 tasks",
  },
];

// ── EXTENDED FAMILIES ──────────────────────────────────────────────────────

const EXTENDED_FAMILIES: SouthParkCharacter[] = [
  {
    id: "randy",
    name: "Randy",
    fullName: "Randy Marsh",
    category: "extended_families",
    subCategory: "Marsh Family",
    rarity: "main",
    color: "#A855F7",
    spritePath: "/southpark/randy.png",
    occupation: "Geologist / Tegridy Farms Owner",
    relatives: ["Stan Marsh (Son)", "Shelly Marsh (Daughter)", "Sharon Marsh (Wife)"],
    firstAppearance: "Volcano",
    personality: "Impulsive, over-dramatic, tends to take things to extremes",
    catchphrases: [
      "I'm not having a glass of wine, I'm having SIX!",
      "Tegridy!",
      "I thought this was America!",
      "I'm Lorde!",
    ],
    stats: { intelligence: 85, creativity: 95, speed: 50, accuracy: 60, charisma: 75, luck: 70 },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    workingPhrases: ["Let me science this up...", "Time for some Tegridy!", "I know exactly what to do... maybe."],
    completionPhrases: ["Tegridy! That's how we do it!", "See? I'm good at stuff!"],
    errorPhrases: ["What?! That shouldn't happen!", "I thought this was America!"],
    idlePhrases: ["Hey there, fellow kids...", "Anyone want some Tegridy?"],
    unlocked: false,
    unlockCondition: "Complete 10 tasks successfully",
  },
  {
    id: "gerald",
    name: "Gerald",
    fullName: "Gerald Broflovski",
    category: "extended_families",
    subCategory: "Broflovski Family",
    rarity: "recurring",
    color: "#15803D",
    spritePath: "/southpark/gerald.png",
    occupation: "Lawyer",
    relatives: ["Kyle Broflovski (Son)", "Ike Broflovski (Son)", "Sheila Broflovski (Wife)"],
    firstAppearance: "Cartman Gets an Anal Probe",
    personality: "Intelligent lawyer, sometimes morally ambiguous",
    catchphrases: [
      "As a lawyer...",
      "Now, Kyle...",
      "Sheila, calm down.",
    ],
    stats: { intelligence: 90, creativity: 65, speed: 55, accuracy: 85, charisma: 60, luck: 50 },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    workingPhrases: ["Let me review the facts...", "From a legal perspective...", "Analyzing the situation..."],
    completionPhrases: ["Case closed!", "Successfully resolved!", "Done!"],
    errorPhrases: ["This is problematic...", "We may need a different approach."],
    idlePhrases: ["Reading some legal briefs...", "Drafting documents..."],
    unlocked: false,
    unlockCondition: "Reach Level 7 with Kyle",
  },
];

// ── ADULTS (Townsfolk) ───────────────────────────────────────────────────

const ADULTS: SouthParkCharacter[] = [
  {
    id: "officer_barbrady",
    name: "Officer Barbrady",
    fullName: "Barbrady",
    category: "adults",
    subCategory: "Police Officers",
    rarity: "recurring",
    color: "#1E40AF",
    spritePath: "/southpark/barbrady.png",
    occupation: "Police Officer",
    firstAppearance: "Cartman Gets an Anal Probe",
    personality: "Clueless but well-meaning police officer",
    catchphrases: [
      "Nothing to see here, folks!",
      "Move along!",
      "OK people, move it along.",
    ],
    stats: { intelligence: 40, creativity: 30, speed: 50, accuracy: 45, charisma: 50, luck: 70 },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    workingPhrases: ["Nothing to see here...", "Investigating...", "Move along..."],
    completionPhrases: ["Nothing to see here, task is done!", "Case... closed?"],
    errorPhrases: ["Nothing to see here... wait, this is bad!", "Move along... oh no!"],
    idlePhrases: ["Nothing to see here...", "Move along..."],
    unlocked: false,
    unlockCondition: "Complete 15 tasks",
  },
];

// ── ALL CHARACTERS COMBINED ────────────────────────────────────────────────

export const ALL_CHARACTERS: SouthParkCharacter[] = [
  ...THE_FOUR_BOYS,
  ...FOURTH_GRADERS,
  ...SCHOOL_FACULTY,
  ...EXTENDED_FAMILIES,
  ...ADULTS,
];

// ── HELPER FUNCTIONS ──────────────────────────────────────────────────────

export function getCharacterById(id: string): SouthParkCharacter | undefined {
  return ALL_CHARACTERS.find((c) => c.id === id);
}

export function getCharactersByCategory(category: CharacterCategory): SouthParkCharacter[] {
  return ALL_CHARACTERS.filter((c) => c.category === category);
}

export function getUnlockedCharacters(): SouthParkCharacter[] {
  return ALL_CHARACTERS.filter((c) => c.unlocked);
}

export function getLockedCharacters(): SouthParkCharacter[] {
  return ALL_CHARACTERS.filter((c) => !c.unlocked);
}

export function getMainCharacters(): SouthParkCharacter[] {
  return ALL_CHARACTERS.filter((c) => c.rarity === "main");
}

export function getRecurringCharacters(): SouthParkCharacter[] {
  return ALL_CHARACTERS.filter((c) => c.rarity === "recurring");
}

export function calculatePowerLevel(stats: SouthParkCharacter["stats"]): number {
  return Math.round(
    (stats.intelligence * 1.5 +
      stats.creativity * 1.2 +
      stats.speed * 1.0 +
      stats.accuracy * 1.3 +
      stats.charisma * 0.8 +
      stats.luck * 0.5) /
    6
  );
}

export function getCharacterEmoji(id: string): string {
  const emojis: Record<string, string> = {
    stan: "🧢",
    kyle: "🟢",
    cartman: "🔴",
    kenny: "🧥",
    butters: "😊",
    token: "🎭",
    jimmy: "🎤",
    timmy: "♿",
    craig: "😒",
    tweek: "😱",
    garrison: "📚",
    chef: "👨‍🍳",
    mackey: "🧠",
    randy: "🔬",
    gerald: "⚖️",
    officer_barbrady: "👮",
  };
  return emojis[id] || "👤";
}

export function getCategoryLabel(category: CharacterCategory): string {
  const labels: Record<CharacterCategory, string> = {
    the_four_boys: "The Four Boys",
    "4th_graders": "4th Graders",
    school_faculty: "School Faculty",
    extended_families: "Extended Families",
    adults: "Adults",
    celebrities: "Celebrities",
    other: "Other",
  };
  return labels[category];
}

export function getRarityLabel(rarity: CharacterRarity): string {
  const labels: Record<CharacterRarity, string> = {
    main: "Main Character",
    recurring: "Recurring",
    minor: "Minor",
    background: "Background",
  };
  return labels[rarity];
}

export function getRarityColor(rarity: CharacterRarity): { bg: string; text: string; border: string } {
  const colors: Record<CharacterRarity, { bg: string; text: string; border: string }> = {
    main: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/50" },
    recurring: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/50" },
    minor: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/50" },
    background: { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/50" },
  };
  return colors[rarity];
}

export function getRandomPhrase(phrases: string[]): string {
  return phrases[Math.floor(Math.random() * phrases.length)];
}

export function getWorkingPhrase(characterId: string): string {
  const char = getCharacterById(characterId);
  return char ? getRandomPhrase(char.workingPhrases) : "Working...";
}

export function getCompletionPhrase(characterId: string): string {
  const char = getCharacterById(characterId);
  return char ? getRandomPhrase(char.completionPhrases) : "Done!";
}

export function getErrorPhrase(characterId: string): string {
  const char = getCharacterById(characterId);
  return char ? getRandomPhrase(char.errorPhrases) : "Error!";
}

export function getIdlePhrase(characterId: string): string {
  const char = getCharacterById(characterId);
  return char ? getRandomPhrase(char.idlePhrases) : "...";
}

export function getCatchphrase(characterId: string): string {
  const char = getCharacterById(characterId);
  return char ? getRandomPhrase(char.catchphrases) : "...";
}

// Default character (Stan)
export const DEFAULT_CHARACTER = ALL_CHARACTERS[0];

// Category order for UI display (based on official wiki)
export const CATEGORY_ORDER: CharacterCategory[] = [
  "the_four_boys",
  "4th_graders",
  "school_faculty",
  "extended_families",
  "adults",
  "celebrities",
  "other",
];
