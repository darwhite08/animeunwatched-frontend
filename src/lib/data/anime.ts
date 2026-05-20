export type Anime = {
  id: string
  title: string
  titleJapanese: string
  rating: number
  year: number
  episodes: number | null
  type: "TV" | "Movie" | "OVA"
  status: "finished" | "airing"
  studio: string
  genres: string[]
  synopsis: string
  image: string
  tags: string[]
  category: "trending" | "top-rated" | "new" | "all"
  rank: number
}

export const ANIME_DB: Anime[] = [
  {
    id: "fullmetal-alchemist-brotherhood",
    title: "Fullmetal Alchemist: Brotherhood",
    titleJapanese: "鋼の錬金術師 BROTHERHOOD",
    rating: 9.1,
    year: 2009,
    episodes: 64,
    type: "TV",
    status: "finished",
    studio: "Bones",
    genres: ["Action", "Fantasy", "Shonen"],
    synopsis:
      "Two brothers use alchemy in a desperate attempt to restore their bodies after a failed ritual. Their journey uncovers a vast government conspiracy and the darkest secrets of their world. A story of sacrifice, redemption, and the price of power.",
    image:
      "https://images.unsplash.com/photo-1518893063132-36e46dbe2428?q=80&w=800&auto=format&fit=crop",
    tags: ["alchemy", "brothers", "sacrifice", "redemption", "government conspiracy", "epic", "emotional"],
    category: "all",
    rank: 1,
  },
  {
    id: "steins-gate",
    title: "Steins;Gate",
    titleJapanese: "シュタインズ・ゲート",
    rating: 9.0,
    year: 2011,
    episodes: 24,
    type: "TV",
    status: "finished",
    studio: "White Fox",
    genres: ["Sci-Fi", "Thriller", "Psychological"],
    synopsis:
      "A self-proclaimed mad scientist accidentally discovers time travel through a microwave and must navigate the catastrophic consequences. Every timeline altered brings unintended tragedy, forcing him to face unbearable choices. A slow-burn thriller that rewards patience with devastating payoff.",
    image:
      "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80&w=800&auto=format&fit=crop",
    tags: ["time travel", "scientific", "tragedy", "divergence", "thriller", "mind-bending", "emotional"],
    category: "all",
    rank: 2,
  },
  {
    id: "attack-on-titan",
    title: "Attack on Titan",
    titleJapanese: "進撃の巨人",
    rating: 9.0,
    year: 2013,
    episodes: 87,
    type: "TV",
    status: "finished",
    studio: "MAPPA",
    genres: ["Action", "Thriller", "Seinen"],
    synopsis:
      "Humanity cowers behind massive walls to survive monstrous giants that devour people without reason. When the walls are breached, one boy vows to exterminate every titan. What begins as survival horror evolves into one of anime's most politically complex narratives.",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
    tags: ["titans", "survival", "dark", "war", "revolution", "political", "shocking twists"],
    category: "all",
    rank: 3,
  },
  {
    id: "hunter-x-hunter-2011",
    title: "Hunter x Hunter (2011)",
    titleJapanese: "ハンター×ハンター",
    rating: 9.0,
    year: 2011,
    episodes: 148,
    type: "TV",
    status: "finished",
    studio: "Madhouse",
    genres: ["Action", "Fantasy", "Shonen"],
    synopsis:
      "A boy searches for his missing father who is a legendary hunter while befriending rivals and facing increasingly lethal challenges. The series subverts shonen expectations with brutal consequences and morally grey antagonists. Its Chimera Ant arc remains a landmark of anime storytelling.",
    image:
      "https://images.unsplash.com/photo-1627163439134-7a8c47e08208?q=80&w=800&auto=format&fit=crop",
    tags: ["hidden strength", "friendship", "dark shonen", "strategy", "evolution", "power system", "emotional depth"],
    category: "top-rated",
    rank: 4,
  },
  {
    id: "monster",
    title: "Monster",
    titleJapanese: "モンスター",
    rating: 8.8,
    year: 2004,
    episodes: 74,
    type: "TV",
    status: "finished",
    studio: "Madhouse",
    genres: ["Thriller", "Psychological", "Seinen"],
    synopsis:
      "A brilliant surgeon saves a boy's life against orders, only to discover the child grows up to become a serial killer. He abandons his prestigious career to chase a monster of his own creation across Europe. A methodical, morally intense thriller about guilt and justice.",
    image:
      "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=800&auto=format&fit=crop",
    tags: ["serial killer", "guilt", "europe", "crime", "dark", "mature", "philosophical"],
    category: "top-rated",
    rank: 5,
  },
  {
    id: "cowboy-bebop",
    title: "Cowboy Bebop",
    titleJapanese: "カウボーイビバップ",
    rating: 8.8,
    year: 1998,
    episodes: 26,
    type: "TV",
    status: "finished",
    studio: "Sunrise",
    genres: ["Sci-Fi", "Action", "Seinen"],
    synopsis:
      "A crew of misfit bounty hunters drift through the solar system chasing fugitives and fleeing their pasts. Jazz, blues, and existential melancholy weave through episodic stories that feel like noir cinema in space. A timeless masterpiece of style, music, and loneliness.",
    image:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop",
    tags: ["space", "bounty hunters", "jazz", "noir", "loneliness", "stylish", "classic"],
    category: "top-rated",
    rank: 6,
  },
  {
    id: "neon-genesis-evangelion",
    title: "Neon Genesis Evangelion",
    titleJapanese: "新世紀エヴァンゲリオン",
    rating: 8.6,
    year: 1995,
    episodes: 26,
    type: "TV",
    status: "finished",
    studio: "Gainax",
    genres: ["Sci-Fi", "Psychological", "Action"],
    synopsis:
      "Teenage pilots operate giant mechs to fight alien creatures called Angels, but the real war is fought inside their fractured psyches. The series deconstructs the mecha genre while diving into clinical depression, abandonment, and identity. Its controversial ending remains one of anime's most discussed moments.",
    image:
      "https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=800&auto=format&fit=crop",
    tags: ["mecha", "psychological", "depression", "existential", "deconstruction", "iconic", "symbolic"],
    category: "top-rated",
    rank: 7,
  },
  {
    id: "vinland-saga",
    title: "Vinland Saga",
    titleJapanese: "ヴィンランド・サガ",
    rating: 8.8,
    year: 2019,
    episodes: 48,
    type: "TV",
    status: "finished",
    studio: "MAPPA",
    genres: ["Action", "Seinen", "Historical"],
    synopsis:
      "A young Viking warrior seeks revenge for his father's murder, only to gradually question whether violence can ever be the answer. Set against brutal Norse raids, the saga becomes a profound meditation on pacifism and purpose. One of the most emotionally mature action anime ever made.",
    image:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80https://images.unsplash.com/photo-1476611338391-6f395a0dd82e?q=80&w=800&auto=format&fit=cropw=800https://images.unsplash.com/photo-1476611338391-6f395a0dd82e?q=80&w=800&auto=format&fit=cropauto=formathttps://images.unsplash.com/photo-1476611338391-6f395a0dd82e?q=80&w=800&auto=format&fit=cropfit=crop",
    tags: ["vikings", "revenge", "pacifism", "historical", "dark", "mature", "character growth"],
    category: "top-rated",
    rank: 8,
  },
  {
    id: "berserk-1997",
    title: "Berserk",
    titleJapanese: "ベルセルク",
    rating: 8.6,
    year: 1997,
    episodes: 25,
    type: "TV",
    status: "finished",
    studio: "OLM",
    genres: ["Action", "Seinen", "Horror"],
    synopsis:
      "A wandering mercenary named Guts joins a charismatic band of fighters led by the enigmatic Griffith, forging bonds that lead to unimaginable betrayal. Set in a brutal medieval fantasy world, it examines ambition, fate, and the cost of dreams. The Eclipse remains anime's most shocking single episode.",
    image:
      "https://images.unsplash.com/photo-1547623641-d2c56c03e2a7?q=80&w=800&auto=format&fit=crop",
    tags: ["dark fantasy", "betrayal", "fate", "gore", "swords", "mercenary", "tragedy"],
    category: "top-rated",
    rank: 9,
  },
  {
    id: "death-note",
    title: "Death Note",
    titleJapanese: "デスノート",
    rating: 8.6,
    year: 2006,
    episodes: 37,
    type: "TV",
    status: "finished",
    studio: "Madhouse",
    genres: ["Thriller", "Psychological", "Seinen"],
    synopsis:
      "A genius student discovers a supernatural notebook that kills anyone whose name is written in it and sets out to become a god of the new world. A brilliant detective pursues him in an increasingly tense battle of wits. A cat-and-mouse thriller about justice, power, and corruption.",
    image:
      "https://images.unsplash.com/photo-1568716353609-12bfe8c6c5be?q=80&w=800&auto=format&fit=crop",
    tags: ["cat and mouse", "genius", "god complex", "supernatural notebook", "detective", "moral grey", "mind games"],
    category: "top-rated",
    rank: 10,
  },
  {
    id: "mob-psycho-100",
    title: "Mob Psycho 100",
    titleJapanese: "モブサイコ100",
    rating: 8.7,
    year: 2016,
    episodes: 37,
    type: "TV",
    status: "finished",
    studio: "Bones",
    genres: ["Action", "Comedy", "Shonen"],
    synopsis:
      "A powerful psychic middle schooler tries to suppress his abilities and live an ordinary life, guided by a con-man mentor. The series uses its absurd premise to tell a genuine story about emotional growth and self-worth. One of the best-animated shows ever made.",
    image:
      "https://images.unsplash.com/photo-1518799175676-a0fed7996acb?q=80&w=800&auto=format&fit=crop",
    tags: ["overpowered", "emotional repression", "coming of age", "animation showcase", "comedy", "psychic", "mentor"],
    category: "trending",
    rank: 11,
  },
  {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    titleJapanese: "呪術廻戦",
    rating: 8.6,
    year: 2020,
    episodes: 47,
    type: "TV",
    status: "airing",
    studio: "MAPPA",
    genres: ["Action", "Shonen", "Horror"],
    synopsis:
      "A boy swallows a cursed finger to save classmates and becomes the host of history's most powerful curse. He enrolls in a secret school that trains sorcerers to exorcise supernatural threats. Savage fight choreography and compelling curses make it the definitive modern shonen.",
    image:
      "https://images.unsplash.com/photo-1626544827763-d516dce335e2?q=80&w=800&auto=format&fit=crop",
    tags: ["curses", "sorcerers", "overpowered", "dark shonen", "brutal", "modern", "school setting"],
    category: "trending",
    rank: 12,
  },
  {
    id: "demon-slayer",
    title: "Demon Slayer: Kimetsu no Yaiba",
    titleJapanese: "鬼滅の刃",
    rating: 8.6,
    year: 2019,
    episodes: 44,
    type: "TV",
    status: "airing",
    studio: "ufotable",
    genres: ["Action", "Shonen", "Fantasy"],
    synopsis:
      "A kind boy returns home to find his family slaughtered by demons and his sister transformed into one. He trains to become a demon slayer to find a cure and avenge his family. Ufotable's breathtaking animation elevated the manga into a global phenomenon.",
    image:
      "https://images.unsplash.com/photo-1604076913837-52ab5629fde9?q=80&w=800&auto=format&fit=crop",
    tags: ["demons", "siblings", "breath styles", "stunning animation", "revenge", "shonen", "emotional"],
    category: "trending",
    rank: 13,
  },
  {
    id: "chainsaw-man",
    title: "Chainsaw Man",
    titleJapanese: "チェンソーマン",
    rating: 8.5,
    year: 2022,
    episodes: 12,
    type: "TV",
    status: "airing",
    studio: "MAPPA",
    genres: ["Action", "Horror", "Seinen"],
    synopsis:
      "A desperately poor boy merges with his chainsaw devil dog and becomes a devil hunter to survive. What follows is a gonzo action-horror story that subverts every expectation with gory glee. MAPPA's cinematic presentation made it an instant cult classic.",
    image:
      "https://images.unsplash.com/photo-1619532550766-12c525d012bc?q=80&w=800&auto=format&fit=crop",
    tags: ["devils", "chainsaw", "gross", "unpredictable", "dark humor", "cinema style", "subversive"],
    category: "trending",
    rank: 14,
  },
  {
    id: "frieren",
    title: "Frieren: Beyond Journey's End",
    titleJapanese: "葬送のフリーレン",
    rating: 9.0,
    year: 2023,
    episodes: 28,
    type: "TV",
    status: "finished",
    studio: "Madhouse",
    genres: ["Fantasy", "Seinen"],
    synopsis:
      "An immortal elf mage who helped defeat the demon king returns decades later to understand the humans she outlived. The series reimagines the fantasy epic from the perspective of someone who has already won. Quiet, melancholic, and deeply moving.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    tags: ["immortal", "grief", "slow life", "magic", "post-adventure", "melancholic", "introspective"],
    category: "new",
    rank: 15,
  },
  {
    id: "solo-leveling",
    title: "Solo Leveling",
    titleJapanese: "俺だけレベルアップな件",
    rating: 8.4,
    year: 2024,
    episodes: 12,
    type: "TV",
    status: "airing",
    studio: "A-1 Pictures",
    genres: ["Action", "Fantasy", "Shonen"],
    synopsis:
      "The world's weakest hunter gains a unique system that lets only him grow stronger through completing quests. Starting from absolute zero, Sung Jinwoo's ascent to become the most powerful being is viscerally satisfying. A manhwa adaptation that became one of anime's biggest recent events.",
    image:
      "https://images.unsplash.com/photo-1511300636408-a63a89df3482?q=80&w=800&auto=format&fit=crop",
    tags: ["leveling up", "overpowered protagonist", "dungeon", "system", "underdog", "power fantasy", "manhwa"],
    category: "new",
    rank: 16,
  },
  {
    id: "dungeon-meshi",
    title: "Delicious in Dungeon",
    titleJapanese: "ダンジョン飯",
    rating: 8.6,
    year: 2024,
    episodes: 24,
    type: "TV",
    status: "finished",
    studio: "Trigger",
    genres: ["Fantasy", "Comedy", "Shonen"],
    synopsis:
      "An adventurer decides to survive a dungeon by cooking and eating the monsters inside it after his party loses their food supply. What sounds absurd becomes a surprisingly deep exploration of ecology, culture, and survival. Trigger delivers gorgeous animation with warmth and humor.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop",
    tags: ["dungeon", "food", "cooking monsters", "worldbuilding", "comedy", "cozy", "adventure"],
    category: "new",
    rank: 17,
  },
  {
    id: "spy-x-family",
    title: "Spy x Family",
    titleJapanese: "スパイファミリー",
    rating: 8.5,
    year: 2022,
    episodes: 37,
    type: "TV",
    status: "airing",
    studio: "Wit Studio",
    genres: ["Action", "Comedy", "Shonen"],
    synopsis:
      "A spy, an assassin, and a telepath child form a fake family to complete a mission while hiding their true identities from each other. The irony is that they all secretly care more than they admit. A perfect blend of action, comedy, and unexpected warmth.",
    image:
      "https://images.unsplash.com/photo-1511895426328-dc8714191011?q=80&w=800&auto=format&fit=crop",
    tags: ["spy", "found family", "comedy", "disguise", "wholesome", "secret identities", "action comedy"],
    category: "trending",
    rank: 18,
  },
  {
    id: "mushishi",
    title: "Mushishi",
    titleJapanese: "蟲師",
    rating: 8.7,
    year: 2005,
    episodes: 26,
    type: "TV",
    status: "finished",
    studio: "Artland",
    genres: ["Fantasy", "Seinen"],
    synopsis:
      "A wandering specialist travels through rural Japan investigating enigmatic life-forms called Mushi that interact with humans in mysterious ways. Each episode is a self-contained folk tale about nature, illness, and the uncanny. Utterly tranquil and haunting at once.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    tags: ["atmospheric", "nature", "folk horror", "episodic", "slow burn", "supernatural", "meditative"],
    category: "top-rated",
    rank: 19,
  },
  {
    id: "violet-evergarden",
    title: "Violet Evergarden",
    titleJapanese: "ヴァイオレット・エヴァーガーデン",
    rating: 8.7,
    year: 2018,
    episodes: 13,
    type: "TV",
    status: "finished",
    studio: "Kyoto Animation",
    genres: ["Fantasy", "Romance", "Seinen"],
    synopsis:
      "A former child soldier with prosthetic arms becomes a ghostwriter to understand the last words a person she loved ever said to her. Through writing letters for others, she slowly learns what it means to feel. KyoAni's animation turns every frame into a watercolor painting.",
    image:
      "https://images.unsplash.com/photo-1519120944692-1a8d8cfc107f?q=80&w=800&auto=format&fit=crop",
    tags: ["emotional", "healing", "war aftermath", "letters", "love", "trauma", "beautiful animation"],
    category: "top-rated",
    rank: 20,
  },
  {
    id: "puella-magi-madoka-magica",
    title: "Puella Magi Madoka Magica",
    titleJapanese: "魔法少女まどか☆マギカ",
    rating: 8.7,
    year: 2011,
    episodes: 12,
    type: "TV",
    status: "finished",
    studio: "Shaft",
    genres: ["Psychological", "Thriller", "Horror"],
    synopsis:
      "A girl is offered the chance to become a magical girl and have any wish granted. The series quickly reveals the horrifying cost behind magical-girl contracts. A genre deconstruction that reframed how anime handles dark themes.",
    image:
      "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=800&auto=format&fit=crop",
    tags: ["magical girl deconstruction", "dark", "despair", "wish", "genre subversion", "psychological horror", "short"],
    category: "top-rated",
    rank: 21,
  },
  {
    id: "code-geass",
    title: "Code Geass: Lelouch of the Rebellion",
    titleJapanese: "コードギアス 反逆のルルーシュ",
    rating: 8.7,
    year: 2006,
    episodes: 50,
    type: "TV",
    status: "finished",
    studio: "Sunrise",
    genres: ["Action", "Sci-Fi", "Psychological"],
    synopsis:
      "An exiled prince gains the power to command anyone to obey him and leads a revolution against a global empire using brilliant tactical warfare. Every episode ends with a cliffhanger engineered to perfection. A melodramatic chess game that earns its ending.",
    image:
      "https://images.unsplash.com/photo-1614728263952-84ea256f9d4e?q=80&w=800&auto=format&fit=crop",
    tags: ["rebellion", "strategy", "anti-hero", "power", "chess", "mecha", "political"],
    category: "trending",
    rank: 22,
  },
  {
    id: "your-lie-in-april",
    title: "Your Lie in April",
    titleJapanese: "四月は君の嘘",
    rating: 8.7,
    year: 2014,
    episodes: 22,
    type: "TV",
    status: "finished",
    studio: "A-1 Pictures",
    genres: ["Romance", "Comedy", "Shonen"],
    synopsis:
      "A piano prodigy who can no longer hear his own playing meets a violinist whose free spirit reignites his love for music. Their intertwined performances become a vehicle for grief, healing, and first love. Visually poetic with a conclusion that devastates.",
    image:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=800&auto=format&fit=crop",
    tags: ["music", "romance", "tragedy", "grief", "piano", "first love", "beautiful"],
    category: "trending",
    rank: 23,
  },
  {
    id: "one-punch-man",
    title: "One Punch Man",
    titleJapanese: "ワンパンマン",
    rating: 8.6,
    year: 2015,
    episodes: 24,
    type: "TV",
    status: "airing",
    studio: "Madhouse",
    genres: ["Action", "Comedy", "Shonen"],
    synopsis:
      "A hero who trained so hard he can defeat any enemy with a single punch now struggles with existential boredom. The comedy of an overpowered protagonist craving challenge mirrors deeper questions about purpose and recognition. Season one's animation by Madhouse remains unmatched.",
    image:
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=800&auto=format&fit=crop",
    tags: ["overpowered", "comedy", "superhero", "satire", "bald", "action comedy", "parody"],
    category: "new",
    rank: 24,
  },
]

export function searchAnime(query: string): Anime[] {
  if (!query.trim()) return ANIME_DB
  const q = query.toLowerCase().trim()
  return ANIME_DB.filter((anime) => {
    if (anime.title.toLowerCase().includes(q)) return true
    if (anime.titleJapanese.toLowerCase().includes(q)) return true
    if (anime.tags.some((tag) => tag.includes(q))) return true
    if (anime.genres.some((genre) => genre.toLowerCase().includes(q))) return true
    if (anime.studio.toLowerCase().includes(q)) return true
    if (anime.synopsis.toLowerCase().includes(q)) return true
    return false
  })
}

export function filterAnime(
  category: string,
  genres: string[],
  type: string,
): Anime[] {
  return ANIME_DB.filter((anime) => {
    const categoryMatch =
      category === "all" ||
      anime.category === "all" ||
      anime.category === category

    const genreMatch =
      genres.length === 0 ||
      genres.every((g) => anime.genres.includes(g))

    const typeMatch = type === "" || type === "all" || anime.type === type

    return categoryMatch && genreMatch && typeMatch
  })
}
