/**
 * Состав подписок GTA+ и Ubisoft+ Classics.
 *
 * Источник — официальная страница подписок PlayStation Store
 * (store.playstation.com/ru-ua/pages/subscriptions) и каталог Ubisoft+
 * Classics там же. Список статичный: в нашем API этих подборок нет,
 * а названия нужны покупателю до обращения к менеджеру.
 */

export interface SubGame {
  title: string;
  platforms?: string[];
}

export const GTA_PLUS_GAMES: SubGame[] = [
  { title: 'Grand Theft Auto V', platforms: ['PS5', 'PS4'] },
  { title: 'Grand Theft Auto Online', platforms: ['PS5'] },
  { title: 'Red Dead Redemption', platforms: ['PS5', 'PS4'] },
  { title: 'Grand Theft Auto: The Trilogy — The Definitive Edition', platforms: ['PS5', 'PS4'] },
  { title: 'L.A. Noire', platforms: ['PS4'] },
  { title: 'Bully', platforms: ['PS4'] },
];

export const UBISOFT_CLASSICS_GAMES: SubGame[] = [
  { title: 'Аватар: Рубежи Пандоры' },
  { title: "Tom Clancy's Ghost Recon Wildlands" },
  { title: "Assassin's Creed Одиссея" },
  { title: 'Far Cry 5' },
  { title: 'The Crew Motorfest' },
  { title: "Assassin's Creed Мираж" },
  { title: "Tom Clancy's Ghost Recon Breakpoint" },
  { title: "Assassin's Creed Вальгалла" },
  { title: "Assassin's Creed Единство" },
  { title: 'Star Wars Outlaws' },
  { title: 'Riders Republic' },
  { title: 'Watch Dogs 2' },
  { title: 'Rayman Legends' },
  { title: "Assassin's Creed Истоки" },
  { title: 'Far Cry 3 Classic Edition' },
  { title: 'Far Cry 6' },
  { title: 'Monopoly' },
  { title: 'Far Cry 4' },
  { title: "Tom Clancy's Rainbow Six Осада" },
  { title: "Assassin's Creed The Ezio Collection" },
  { title: 'Skull and Bones' },
  { title: "Assassin's Creed IV: Черный флаг" },
  { title: 'Watch Dogs' },
  { title: 'The Crew 2' },
  { title: 'UNO' },
  { title: "Tom Clancy's The Division 2" },
  { title: 'Trials Fusion' },
  { title: "Assassin's Creed Синдикат" },
  { title: 'Anno 1800' },
  { title: 'Far Cry Primal' },
  { title: 'Far Cry New Dawn' },
  { title: "Tom Clancy's The Division" },
  { title: "Assassin's Creed III Remastered" },
  { title: 'Watch Dogs: Legion' },
  { title: 'Trials Rising' },
  { title: 'For Honor' },
  { title: 'Prince of Persia: The Lost Crown' },
  { title: "Assassin's Creed Изгой" },
  { title: "Tom Clancy's Rainbow Six Extraction" },
  { title: 'Legendary Fishing' },
  { title: 'Rabbids: Party of Legends' },
  { title: 'Hungry Shark World' },
  { title: 'Child of Light' },
  { title: 'Valiant Hearts: The Great War' },
  { title: 'Steep' },
  { title: 'Южный Парк: Палка Истины' },
  { title: 'South Park: The Fractured but Whole' },
  { title: 'Trackmania Turbo' },
  { title: 'Monopoly Переполох' },
  { title: "Assassin's Creed Freedom Cry" },
  { title: 'Immortals Fenyx Rising' },
  { title: 'The Settlers: New Allies' },
  { title: 'Rabbids Invasion' },
  { title: 'The Rogue Prince of Persia' },
  { title: 'Far Cry 3: Blood Dragon' },
  { title: 'Starlink: Battle for Atlas' },
  { title: 'Oddballers' },
  { title: "Assassin's Creed Chronicles: Russia" },
  { title: "Assassin's Creed Chronicles: China" },
  { title: 'Zombi' },
  { title: "Assassin's Creed Chronicles: Индия" },
  { title: 'Space Junkies' },
  { title: 'Eagle Flight' },
  { title: 'Transference' },
  { title: 'Risk: Urban Assault' },
  { title: 'Trials of the Blood Dragon' },
  { title: 'Werewolves Within' },
];
