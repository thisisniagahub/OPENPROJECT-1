/**
 * South Park Character Configuration
 * 
 * Defines all South Park characters with their sprites, personalities,
 * and unique characteristics for the Agent Town game.
 */

export interface SouthParkCharacter {
  id: string;
  name: string;
  fullName: string;
  spritePath: string;
  color: string; // Primary color for UI
  personality: string;
  catchphrases: string[];
  skills: string[];
  voiceStyle: "calm" | "angry" | "nervous" | "excited" | "sarcastic";
  bio: string;
}

export const SOUTH_PARK_CHARACTERS: SouthParkCharacter[] = [
  {
    id: "stan",
    name: "Stan",
    fullName: "Stan Marsh",
    spritePath: "/southpark/stan.png",
    color: "#3B82F6", // Blue
    personality: "Level-headed, moral, often the voice of reason",
    catchphrases: [
      "Oh my God, they killed Kenny!",
      "You guys, I learned something today...",
      "This is pretty messed up right here.",
      "Dude, that's not cool.",
      "I don't feel so good about this..."
    ],
    skills: ["Leadership", "Problem Solving", "Moral Compass"],
    voiceStyle: "calm",
    bio: "The natural leader of the group. Stan often tries to do the right thing and learns valuable lessons, though he frequently questions the absurdity of the world around him."
  },
  {
    id: "kyle",
    name: "Kyle",
    fullName: "Kyle Broflovski",
    spritePath: "/southpark/kyle.png",
    color: "#22C55E", // Green
    personality: "Intelligent, analytical, strong moral sense",
    catchphrases: [
      "You bastards!",
      "I learned something today...",
      "That's not logical!",
      "Cartman, you're such a fatass!",
      "This doesn't make any sense!"
    ],
    skills: ["Analysis", "Logic", "Debate"],
    voiceStyle: "angry",
    bio: "The smartest kid in the group with a strong moral compass. Kyle often serves as the moral voice and isn't afraid to stand up for what's right."
  },
  {
    id: "cartman",
    name: "Cartman",
    fullName: "Eric Cartman",
    spritePath: "/southpark/cartman.png",
    color: "#EF4444", // Red
    personality: "Manipulative, selfish, arrogant, but surprisingly capable",
    catchphrases: [
      "Respect my authoritah!",
      "Screw you guys, I'm going home!",
      "I'm not fat, I'm big-boned!",
      "Whatever, I do what I want!",
      "You will respect my authoritah!"
    ],
    skills: ["Manipulation", "Strategy", "Leadership (forced)"],
    voiceStyle: "sarcastic",
    bio: "The self-proclaimed leader of the group. Cartman is manipulative and selfish, but his schemes sometimes accidentally result in solving problems."
  },
  {
    id: "kenny",
    name: "Kenny",
    fullName: "Kenny McCormick",
    spritePath: "/southpark/kenny.png",
    color: "#F97316", // Orange
    personality: "Mysterious, loyal, often unlucky",
    catchphrases: [
      "Mmph mmph mmph!",
      "(Muffled sounds)",
      "...",
      "*muffled agreement*",
      "*muffled excitement*"
    ],
    skills: ["Immortality", "Loyalty", "Mysterious Knowledge"],
    voiceStyle: "nervous",
    bio: "The mysterious member of the group whose speech is muffled by his parka hood. Kenny is surprisingly knowledgeable and always bounces back from any misfortune."
  },
  {
    id: "butters",
    name: "Butters",
    fullName: "Butters Stotch",
    spritePath: "/southpark/butters.png",
    color: "#06B6D4", // Cyan
    personality: "Innocent, naive, optimistic, eager to please",
    catchphrases: [
      "Oh hamburgers!",
      "Gee whiz!",
      "That's the darndest thing!",
      "I'm grounded...",
      "Well, I'll be!"
    ],
    skills: ["Innocence", "Enthusiasm", "Unintentional Problem Solving"],
    voiceStyle: "excited",
    bio: "The innocent and naive member who always tries his best. Butters' optimism and eagerness to please sometimes leads to unexpected solutions."
  }
];

// Character selection helpers
export function getCharacterById(id: string): SouthParkCharacter | undefined {
  return SOUTH_PARK_CHARACTERS.find(c => c.id === id);
}

export function getRandomCatchphrase(characterId: string): string {
  const character = getCharacterById(characterId);
  if (!character) return "...";
  const idx = Math.floor(Math.random() * character.catchphrases.length);
  return character.catchphrases[idx];
}

// Default character (fallback)
export const DEFAULT_CHARACTER: SouthParkCharacter = SOUTH_PARK_CHARACTERS[0];

// Character working phrases for agent tasks
export const WORKING_PHRASES: Record<string, string[]> = {
  stan: [
    "Working on it, dude...",
    "I think I got this figured out...",
    "Just a sec, learning something here...",
    "Trying my best here...",
    "This is actually pretty interesting..."
  ],
  kyle: [
    "Analyzing the problem...",
    "That's not logical, let me fix it...",
    "Processing the data...",
    "Looking at this from all angles...",
    "There's a logical solution here..."
  ],
  cartman: [
    "I'm working on it, okay?!",
    "Let me handle this my way...",
    "Everyone just calm down!",
    "I know exactly what to do...",
    "This is gonna be awesome!"
  ],
  kenny: [
    "Mmph mph mmph...",
    "(concentrating)",
    "*focused mumbling*",
    "...",
    "(determined sounds)"
  ],
  butters: [
    "Oh boy, working real hard!",
    "Gee, this is exciting!",
    "Doing my best, folks!",
    "Almost got it, I think!",
    "This is fun!"
  ]
};

export function getWorkingPhrase(characterId: string): string {
  const phrases = WORKING_PHRASES[characterId] || WORKING_PHRASES.stan;
  return phrases[Math.floor(Math.random() * phrases.length)];
}

// Task completion phrases
export const COMPLETION_PHRASES: Record<string, string[]> = {
  stan: [
    "Done! That actually went pretty well.",
    "Finished! I learned something new.",
    "Task complete, guys!",
    "That's a wrap!",
    "Nailed it!"
  ],
  kyle: [
    "Finally! That makes sense now.",
    "Task complete, logically speaking.",
    "Done! The solution was obvious.",
    "Finished! I knew we could do it.",
    "That's how it's done!"
  ],
  cartman: [
    "Done! You're welcome!",
    "See? I told you I'd handle it!",
    "Finished! Now respect my authoritah!",
    "Task complete! I'm a genius!",
    "That's how Cartman does it!"
  ],
  kenny: [
    "(success mumble)",
    "Mmph!",
    "*thumbs up*",
    "(happy sounds)",
    "Mm mmph!"
  ],
  butters: [
    "Oh boy, I did it!",
    "Gee whiz, all done!",
    "Finished! That was fun!",
    "I'm so proud of myself!",
    "All done, folks!"
  ]
};

export function getCompletionPhrase(characterId: string): string {
  const phrases = COMPLETION_PHRASES[characterId] || COMPLETION_PHRASES.stan;
  return phrases[Math.floor(Math.random() * phrases.length)];
}

// Error/failure phrases
export const ERROR_PHRASES: Record<string, string[]> = {
  stan: [
    "Oh man, this is messed up...",
    "I don't feel good about this...",
    "Dude, something went wrong...",
    "This isn't right...",
    "We've got a problem here..."
  ],
  kyle: [
    "This doesn't make any sense!",
    "That's not logical at all!",
    "Something's wrong with this!",
    "This is completely illogical!",
    "I can't figure this out!"
  ],
  cartman: [
    "WHAT?! That's not fair!",
    "SCREW THIS!",
    "This is BS!",
    "I don't deserve this!",
    "You guys are stupid!"
  ],
  kenny: [
    "(sad mumble)",
    "Mmph...",
    "*disappointed sounds*",
    "(confused noise)",
    "..."
  ],
  butters: [
    "Oh hamburgers...",
    "Gee, that didn't work...",
    "I messed up...",
    "I'm grounded...",
    "That's not good..."
  ]
};

export function getErrorPhrase(characterId: string): string {
  const phrases = ERROR_PHRASES[characterId] || ERROR_PHRASES.stan;
  return phrases[Math.floor(Math.random() * phrases.length)];
}
