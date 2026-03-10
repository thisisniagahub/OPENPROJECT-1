/**
 * Enhanced Character System
 *
 * Complete character system with stats, levels, abilities, and progression.
 */

export type CharacterRarity = "common" | "rare" | "epic" | "legendary";
export type CharacterAbility = "coding" | "analysis" | "creativity" | "speed" | "accuracy" | "leadership";

export interface CharacterStats {
  intelligence: number;  // 1-100
  creativity: number;    // 1-100
  speed: number;         // 1-100
  accuracy: number;      // 1-100
  charisma: number;      // 1-100
  luck: number;          // 1-100
}

export interface CharacterAbilityDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  cooldown: number; // seconds
  effect: string;
}

export interface CharacterLevel {
  current: number;
  xp: number;
  xpToNext: number;
  totalXp: number;
}

export interface EnhancedCharacter {
  id: string;
  name: string;
  fullName: string;
  nickname?: string;
  spritePath: string;
  portraitPath?: string;
  color: string;
  secondaryColor?: string;

  // Character info
  personality: string;
  bio: string;
  backstory?: string;
  catchphrases: string[];
  voiceStyle: "calm" | "angry" | "nervous" | "excited" | "sarcastic" | "mysterious";

  // Classification
  rarity: CharacterRarity;
  role: string;
  faction?: string;

  // Stats
  stats: CharacterStats;
  level: CharacterLevel;

  // Abilities
  skills: string[];
  abilities: CharacterAbilityDef[];
  passiveAbility?: string;

  // Working phrases
  workingPhrases: string[];
  completionPhrases: string[];
  errorPhrases: string[];
  idlePhrases: string[];

  // Unlock conditions
  unlocked: boolean;
  unlockCondition?: string;

  // Animation frames
  animFrames: {
    idle: number;
    walk: number;
    work: number;
    celebrate: number;
  };
}

// ── STAT CALCULATIONS ─────────────────────────────────────────────────────

export function calculatePowerLevel(stats: CharacterStats): number {
  return Math.round(
    (stats.intelligence * 1.5 +
    stats.creativity * 1.2 +
    stats.speed * 1.0 +
    stats.accuracy * 1.3 +
    stats.charisma * 0.8 +
    stats.luck * 0.5) / 6
  );
}

export function calculateXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function addXp(character: EnhancedCharacter, xpGained: number): EnhancedCharacter {
  let newXp = character.level.xp + xpGained;
  let newLevel = character.level.current;
  let newTotalXp = character.level.totalXp + xpGained;

  while (newXp >= character.level.xpToNext) {
    newXp -= character.level.xpToNext;
    newLevel++;
  }

  return {
    ...character,
    level: {
      current: newLevel,
      xp: newXp,
      xpToNext: calculateXpForLevel(newLevel + 1),
      totalXp: newTotalXp,
    },
  };
}

// ── RARITY COLORS ─────────────────────────────────────────────────────────

export const RARITY_COLORS: Record<CharacterRarity, { bg: string; text: string; border: string; glow: string }> = {
  common: {
    bg: "bg-slate-500/20",
    text: "text-slate-300",
    border: "border-slate-500/50",
    glow: "shadow-slate-500/20",
  },
  rare: {
    bg: "bg-blue-500/20",
    text: "text-blue-300",
    border: "border-blue-500/50",
    glow: "shadow-blue-500/30",
  },
  epic: {
    bg: "bg-purple-500/20",
    text: "text-purple-300",
    border: "border-purple-500/50",
    glow: "shadow-purple-500/40",
  },
  legendary: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-300",
    border: "border-yellow-500/50",
    glow: "shadow-yellow-500/50",
  },
};

// ── CHARACTER DATABASE ────────────────────────────────────────────────────

export const ENHANCED_CHARACTERS: EnhancedCharacter[] = [
  {
    id: "stan",
    name: "Stan",
    fullName: "Stan Marsh",
    nickname: "The Leader",
    spritePath: "/southpark/stan.png",
    color: "#3B82F6",
    secondaryColor: "#1D4ED8",
    personality: "Level-headed, moral, often the voice of reason",
    bio: "The natural leader of the group. Stan often tries to do the right thing and learns valuable lessons, though he frequently questions the absurdity of the world around him.",
    backstory: "Growing up in South Park, Stan has seen it all - from alien invasions to talking poo. His experiences have shaped him into a thoughtful leader who values friendship above all else.",
    catchphrases: [
      "Oh my God, they killed Kenny!",
      "You guys, I learned something today...",
      "This is pretty messed up right here.",
      "Dude, that's not cool.",
    ],
    voiceStyle: "calm",
    rarity: "legendary",
    role: "Team Leader",
    faction: "The Boys",
    stats: {
      intelligence: 75,
      creativity: 70,
      speed: 65,
      accuracy: 80,
      charisma: 85,
      luck: 60,
    },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    skills: ["Leadership", "Problem Solving", "Moral Compass", "Team Coordination"],
    abilities: [
      {
        id: "rally",
        name: "Rally the Team",
        description: "Boosts all team members' effectiveness for 30 seconds",
        icon: "📣",
        cooldown: 60,
        effect: "team_boost_25%",
      },
      {
        id: "lesson",
        name: "I Learned Something Today",
        description: "Gains bonus XP from completed tasks",
        icon: "💡",
        cooldown: 0,
        effect: "xp_bonus_50%",
      },
    ],
    passiveAbility: "Natural Leader - Team tasks complete 10% faster",
    workingPhrases: [
      "Working on it, dude...",
      "I think I got this figured out...",
      "Just a sec, learning something here...",
    ],
    completionPhrases: [
      "Done! That actually went pretty well.",
      "Finished! I learned something new.",
      "Task complete, guys!",
    ],
    errorPhrases: [
      "Oh man, this is messed up...",
      "I don't feel good about this...",
      "Dude, something went wrong...",
    ],
    idlePhrases: [
      "Hey guys, what's going on?",
      "This is pretty weird...",
      "Anyone else bored?",
    ],
    unlocked: true,
    animFrames: { idle: 2, walk: 4, work: 4, celebrate: 3 },
  },
  {
    id: "kyle",
    name: "Kyle",
    fullName: "Kyle Broflovski",
    nickname: "The Brain",
    spritePath: "/southpark/kyle.png",
    color: "#22C55E",
    secondaryColor: "#15803D",
    personality: "Intelligent, analytical, strong moral sense",
    bio: "The smartest kid in the group with a strong moral compass. Kyle often serves as the moral voice and isn't afraid to stand up for what's right.",
    backstory: "Kyle's analytical mind and strong sense of justice make him the group's strategist. He's always ready to debate and find the logical solution to any problem.",
    catchphrases: [
      "You bastards!",
      "I learned something today...",
      "That's not logical!",
      "Cartman, you're such a fatass!",
    ],
    voiceStyle: "angry",
    rarity: "epic",
    role: "Strategist",
    faction: "The Boys",
    stats: {
      intelligence: 95,
      creativity: 75,
      speed: 55,
      accuracy: 90,
      charisma: 70,
      luck: 50,
    },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    skills: ["Analysis", "Logic", "Debate", "Strategic Planning"],
    abilities: [
      {
        id: "analyze",
        name: "Deep Analysis",
        description: "Provides detailed breakdown of complex problems",
        icon: "🧠",
        cooldown: 45,
        effect: "analysis_boost_40%",
      },
      {
        id: "logic",
        name: "Logical Conclusion",
        description: "Increases accuracy of all task outputs",
        icon: "📊",
        cooldown: 0,
        effect: "accuracy_20%",
      },
    ],
    passiveAbility: "Analytical Mind - Code reviews are 25% more thorough",
    workingPhrases: [
      "Analyzing the problem...",
      "That's not logical, let me fix it...",
      "Processing the data...",
    ],
    completionPhrases: [
      "Finally! That makes sense now.",
      "Task complete, logically speaking.",
      "Done! The solution was obvious.",
    ],
    errorPhrases: [
      "This doesn't make any sense!",
      "That's not logical at all!",
      "Something's wrong with this!",
    ],
    idlePhrases: [
      "This is completely illogical...",
      "I need to think about this...",
      "Has anyone seen my hat?",
    ],
    unlocked: true,
    animFrames: { idle: 2, walk: 4, work: 4, celebrate: 3 },
  },
  {
    id: "cartman",
    name: "Cartman",
    fullName: "Eric Cartman",
    nickname: "The Mastermind",
    spritePath: "/southpark/cartman.png",
    color: "#EF4444",
    secondaryColor: "#B91C1C",
    personality: "Manipulative, selfish, arrogant, but surprisingly capable",
    bio: "The self-proclaimed leader of the group. Cartman is manipulative and selfish, but his schemes sometimes accidentally result in solving problems.",
    backstory: "Love him or hate him, Cartman gets results. His unconventional methods and sheer determination often lead to success, even if the journey is... questionable.",
    catchphrases: [
      "Respect my authoritah!",
      "Screw you guys, I'm going home!",
      "I'm not fat, I'm big-boned!",
      "You will respect my authoritah!",
    ],
    voiceStyle: "sarcastic",
    rarity: "legendary",
    role: "Project Manager",
    faction: "The Boys",
    stats: {
      intelligence: 80,
      creativity: 90,
      speed: 40,
      accuracy: 70,
      charisma: 95,
      luck: 75,
    },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    skills: ["Manipulation", "Strategy", "Leadership (forced)", "Negotiation"],
    abilities: [
      {
        id: "authority",
        name: "Respect My Authoritah!",
        description: "Forces immediate compliance - tasks cannot fail",
        icon: "👮",
        cooldown: 120,
        effect: "task_success_guaranteed",
      },
      {
        id: "scheme",
        name: "Elaborate Scheme",
        description: "Creative solutions to complex problems",
        icon: "🎭",
        cooldown: 60,
        effect: "creativity_boost_50%",
      },
    ],
    passiveAbility: "Magnetic Personality - Tasks involving persuasion are 40% more effective",
    workingPhrases: [
      "I'm working on it, okay?!",
      "Let me handle this my way...",
      "Everyone just calm down!",
    ],
    completionPhrases: [
      "Done! You're welcome!",
      "See? I told you I'd handle it!",
      "Finished! Now respect my authoritah!",
    ],
    errorPhrases: [
      "WHAT?! That's not fair!",
      "SCREW THIS!",
      "This is BS!",
    ],
    idlePhrases: [
      "Whatever, I do what I want!",
      "You guys are stupid.",
      "I'm not fat, I'm just big-boned!",
    ],
    unlocked: true,
    animFrames: { idle: 2, walk: 4, work: 4, celebrate: 3 },
  },
  {
    id: "kenny",
    name: "Kenny",
    fullName: "Kenny McCormick",
    nickname: "The Immortal",
    spritePath: "/southpark/kenny.png",
    color: "#F97316",
    secondaryColor: "#C2410C",
    personality: "Mysterious, loyal, often unlucky",
    bio: "The mysterious member of the group whose speech is muffled by his parka hood. Kenny is surprisingly knowledgeable and always bounces back from any misfortune.",
    backstory: "Kenny's mysterious powers of resurrection make him invaluable for dangerous tasks. His muffled speech hides a sharp wit and deep knowledge.",
    catchphrases: [
      "Mmph mmph mmph!",
      "(Muffled sounds)",
      "...",
      "*muffled agreement*",
    ],
    voiceStyle: "nervous",
    rarity: "epic",
    role: "Risk Taker",
    faction: "The Boys",
    stats: {
      intelligence: 70,
      creativity: 60,
      speed: 85,
      accuracy: 65,
      charisma: 55,
      luck: 100,
    },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    skills: ["Immortality", "Loyalty", "Mysterious Knowledge", "Risk Assessment"],
    abilities: [
      {
        id: "resurrect",
        name: "Immortal Revival",
        description: "Can retry failed tasks without penalty",
        icon: "♻️",
        cooldown: 180,
        effect: "task_retry_free",
      },
      {
        id: "mystery",
        name: "Mysterious Ways",
        description: "Unknown bonuses to random tasks",
        icon: "❓",
        cooldown: 0,
        effect: "random_bonus",
      },
    ],
    passiveAbility: "Cursed Luck - 20% chance of unexpected positive outcome",
    workingPhrases: [
      "Mmph mph mmph...",
      "(concentrating)",
      "*focused mumbling*",
    ],
    completionPhrases: [
      "(success mumble)",
      "Mmph!",
      "*thumbs up*",
    ],
    errorPhrases: [
      "(sad mumble)",
      "Mmph...",
      "*disappointed sounds*",
    ],
    idlePhrases: [
      "...",
      "(muffled humming)",
      "*adjusts hood*",
    ],
    unlocked: true,
    animFrames: { idle: 2, walk: 4, work: 4, celebrate: 3 },
  },
  {
    id: "butters",
    name: "Butters",
    fullName: "Butters Stotch",
    nickname: "The Innocent",
    spritePath: "/southpark/butters.png",
    color: "#06B6D4",
    secondaryColor: "#0891B2",
    personality: "Innocent, naive, optimistic, eager to please",
    bio: "The innocent and naive member who always tries his best. Butters' optimism and eagerness to please sometimes leads to unexpected solutions.",
    backstory: "Despite constant grounding and mishaps, Butters maintains an infectious positivity. His unique perspective often reveals solutions others miss.",
    catchphrases: [
      "Oh hamburgers!",
      "Gee whiz!",
      "That's the darndest thing!",
      "I'm grounded...",
    ],
    voiceStyle: "excited",
    rarity: "rare",
    role: "Enthusiast",
    faction: "The Boys",
    stats: {
      intelligence: 60,
      creativity: 80,
      speed: 75,
      accuracy: 70,
      charisma: 90,
      luck: 65,
    },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    skills: ["Innocence", "Enthusiasm", "Unintentional Problem Solving", "Diplomacy"],
    abilities: [
      {
        id: "enthusiasm",
        name: "Gee Whiz!",
        description: "Extreme enthusiasm speeds up current task",
        icon: "⭐",
        cooldown: 30,
        effect: "speed_boost_30%",
      },
      {
        id: "grounded",
        name: "I'm Grounded...",
        description: "Bonus XP from failures (learning experience)",
        icon: "🚫",
        cooldown: 0,
        effect: "failure_xp_25%",
      },
    ],
    passiveAbility: "Pure Heart - Team morale boosted by 15%",
    workingPhrases: [
      "Oh boy, working real hard!",
      "Gee, this is exciting!",
      "Doing my best, folks!",
    ],
    completionPhrases: [
      "Oh boy, I did it!",
      "Gee whiz, all done!",
      "Finished! That was fun!",
    ],
    errorPhrases: [
      "Oh hamburgers...",
      "Gee, that didn't work...",
      "I messed up...",
    ],
    idlePhrases: [
      "Gee, I wonder what to do...",
      "Anyone need help?",
      "This is fun!",
    ],
    unlocked: true,
    animFrames: { idle: 2, walk: 4, work: 4, celebrate: 3 },
  },
  // ── NEW CHARACTERS ─────────────────────────────────────────────────────
  {
    id: "randy",
    name: "Randy",
    fullName: "Randy Marsh",
    nickname: "The Scientist",
    spritePath: "/southpark/randy.png",
    color: "#8B5CF6",
    secondaryColor: "#6D28D9",
    personality: "Impulsive, over-confident, surprisingly competent at random things",
    bio: "Stan's dad and a geologist. Randy tends to take things to extreme levels, often with chaotic but somehow effective results.",
    backstory: "From Lorde performances to Tegridy Farms, Randy's wild ventures have taught him skills no one expected. His scientific background adds analytical power.",
    catchphrases: [
      "I'm not having a glass of wine, I'm having SIX!",
      "Tegridy!",
      "I thought this was America!",
      "I'm Lorde!",
    ],
    voiceStyle: "excited",
    rarity: "epic",
    role: "Scientist",
    faction: "Adults",
    stats: {
      intelligence: 85,
      creativity: 95,
      speed: 50,
      accuracy: 60,
      charisma: 75,
      luck: 70,
    },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    skills: ["Geology", "Music (Lorde)", "Business", "Tegridy"],
    abilities: [
      {
        id: "tegridy",
        name: "Tegridy Power!",
        description: "Applies 'tegridy' to tasks - enhanced results",
        icon: "🌿",
        cooldown: 90,
        effect: "result_quality_30%",
      },
      {
        id: "lorde",
        name: "Royal Performance",
        description: "Creative tasks get massive boost",
        icon: "👑",
        cooldown: 120,
        effect: "creativity_boost_75%",
      },
    ],
    passiveAbility: "Wild Card - 15% chance of unexpected ability activation",
    workingPhrases: [
      "Let me science this up...",
      "Time for some Tegridy!",
      "I know exactly what to do... maybe.",
    ],
    completionPhrases: [
      "Tegridy! That's how we do it!",
      "See? I told you I'm good at stuff!",
      "Done! Now where's my wine?",
    ],
    errorPhrases: [
      "What?! That shouldn't happen!",
      "I thought this was America!",
      "The goggles do nothing!",
    ],
    idlePhrases: [
      "Hey there, fellow kids...",
      "Anyone want some Tegridy?",
      "I should start a business...",
    ],
    unlocked: false,
    unlockCondition: "Complete 10 tasks successfully",
    animFrames: { idle: 2, walk: 4, work: 4, celebrate: 3 },
  },
  {
    id: "chef",
    name: "Chef",
    fullName: "Jerome McElroy",
    nickname: "The Mentor",
    spritePath: "/southpark/chef.png",
    color: "#DC2626",
    secondaryColor: "#991B1B",
    personality: "Wise, soulful, always ready with advice",
    bio: "The school chef and spiritual guide to the children. Chef's wisdom and life experience make him an invaluable mentor.",
    backstory: "Chef has seen it all and done it all. His soulful advice and culinary skills have guided the children through countless adventures.",
    catchphrases: [
      "Hello there, children!",
      "I'm gonna make love to you, woman!",
      "Now children, let me tell you something...",
      "That's a spicy meat-a-ball!",
    ],
    voiceStyle: "calm",
    rarity: "legendary",
    role: "Mentor",
    faction: "Adults",
    stats: {
      intelligence: 90,
      creativity: 85,
      speed: 60,
      accuracy: 85,
      charisma: 100,
      luck: 55,
    },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    skills: ["Cooking", "Music", "Wisdom", "Guidance"],
    abilities: [
      {
        id: "wisdom",
        name: "Chef's Wisdom",
        description: "Provides perfect guidance for complex tasks",
        icon: "🍳",
        cooldown: 60,
        effect: "task_guidance_100%",
      },
      {
        id: "soul",
        name: "Soulful Performance",
        description: "All team members gain XP bonus",
        icon: "🎵",
        cooldown: 90,
        effect: "team_xp_25%",
      },
    ],
    passiveAbility: "Hello Children - +20% effectiveness when helping others",
    workingPhrases: [
      "Now let me see what we have here...",
      "Time to cook up a solution!",
      "Mm-hmm, I see the problem!",
    ],
    completionPhrases: [
      "Mm-hmm! That's done right!",
      "Satisfying! Like a good meal!",
      "There we go, children!",
    ],
    errorPhrases: [
      "Oh my, that's not good!",
      "Children, we have a problem!",
      "That's a spicy error!",
    ],
    idlePhrases: [
      "Hello there, children!",
      "Want to hear a song?",
      "Love is a wonderful thing...",
    ],
    unlocked: false,
    unlockCondition: "Reach Level 5 with any character",
    animFrames: { idle: 2, walk: 4, work: 4, celebrate: 3 },
  },
  {
    id: "garrison",
    name: "Mr. Garrison",
    fullName: "Herbert Garrison",
    nickname: "The Teacher",
    spritePath: "/southpark/garrison.png",
    color: "#14B8A6",
    secondaryColor: "#0D9488",
    personality: "Unpredictable, often confused, accidentally competent",
    bio: "The eccentric school teacher whose unconventional methods somehow manage to educate. Experience with chaos makes them adaptable.",
    backstory: "Mr. Garrison's journey has been... eventful. From puppet companions to political office, their unique perspective brings unexpected solutions.",
    catchphrases: [
      "Oh, stop it!",
      "Mr. Hat says...",
      "I'm not your buddy, guy!",
      "What's going on here?!",
    ],
    voiceStyle: "sarcastic",
    rarity: "rare",
    role: "Educator",
    faction: "Adults",
    stats: {
      intelligence: 70,
      creativity: 75,
      speed: 65,
      accuracy: 60,
      charisma: 70,
      luck: 80,
    },
    level: { current: 1, xp: 0, xpToNext: 100, totalXp: 0 },
    skills: ["Teaching", "Confusion", "Puppetry", "Adaptability"],
    abilities: [
      {
        id: "confuse",
        name: "Confusing Lecture",
        description: "Confuses enemies/buffs allies randomly",
        icon: "🎭",
        cooldown: 45,
        effect: "random_effect",
      },
      {
        id: "mrhat",
        name: "Ask Mr. Hat",
        description: "Second opinion - reroll task result",
        icon: "🎩",
        cooldown: 120,
        effect: "result_reroll",
      },
    ],
    passiveAbility: "Chaos Factor - Random bonuses appear unexpectedly",
    workingPhrases: [
      "Now class, pay attention...",
      "This should work... I think...",
      "Mr. Hat, what do you think?",
    ],
    completionPhrases: [
      "See? I told you I knew what I was doing!",
      "Oh, stop it! It wasn't that good!",
      "A+ work, if I do say so myself!",
    ],
    errorPhrases: [
      "What?! That's not right!",
      "Mr. Hat, you lied to me!",
      "I'm confused...",
    ],
    idlePhrases: [
      "Where's Mr. Hat?",
      "Children, behave!",
      "This is so frustrating...",
    ],
    unlocked: false,
    unlockCondition: "Complete 5 tasks with any character",
    animFrames: { idle: 2, walk: 4, work: 4, celebrate: 3 },
  },
];

// ── HELPER FUNCTIONS ──────────────────────────────────────────────────────

export function getCharacterById(id: string): EnhancedCharacter | undefined {
  return ENHANCED_CHARACTERS.find((c) => c.id === id);
}

export function getUnlockedCharacters(): EnhancedCharacter[] {
  return ENHANCED_CHARACTERS.filter((c) => c.unlocked);
}

export function getLockedCharacters(): EnhancedCharacter[] {
  return ENHANCED_CHARACTERS.filter((c) => !c.unlocked);
}

export function getCharactersByRarity(rarity: CharacterRarity): EnhancedCharacter[] {
  return ENHANCED_CHARACTERS.filter((c) => c.rarity === rarity);
}

export function getCharactersByFaction(faction: string): EnhancedCharacter[] {
  return ENHANCED_CHARACTERS.filter((c) => c.faction === faction);
}

export function getCharacterStatsDisplay(stats: CharacterStats): { label: string; value: number; color: string }[] {
  return [
    { label: "INT", value: stats.intelligence, color: "text-blue-400" },
    { label: "CRE", value: stats.creativity, color: "text-purple-400" },
    { label: "SPD", value: stats.speed, color: "text-yellow-400" },
    { label: "ACC", value: stats.accuracy, color: "text-green-400" },
    { label: "CHA", value: stats.charisma, color: "text-pink-400" },
    { label: "LCK", value: stats.luck, color: "text-orange-400" },
  ];
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

// Default character
export const DEFAULT_CHARACTER = ENHANCED_CHARACTERS[0];
