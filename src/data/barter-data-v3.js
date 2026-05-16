/**
 * BDO Bartering System — Game Data (v3 - Verified Only)
 * Sources: playblackdesert.com, blackdesertfoundry.com, grumpygreen.cricket
 * 
 * IMPORTANT: Values marked [VERIFIED] come from official/reliable sources.
 * Values marked [USER_INPUT] must be entered by the player from their in-game UI.
 * NO made-up values — if we don't know it, we ask the player.
 */

// [VERIFIED] Tier sell prices — from playblackdesert.com April 2026 patch
export const TIER_DATA = {
  T0: { name:"Trade Goods", shortName:"T0", sellPrice:0, weight:0, color:"#7a8a6e", icon:"🛢️" },
  T1: { name:"Tier 1", shortName:"T1", sellPrice:0, weight:100, color:"#8b9dc3", icon:"📦" },
  T2: { name:"Tier 2", shortName:"T2", sellPrice:0, weight:400, color:"#6c9bcf", icon:"📦" },
  T3: { name:"Tier 3", shortName:"T3", sellPrice:1_000_000, weight:900, color:"#4a90d9", icon:"🧰" },
  T4: { name:"Tier 4", shortName:"T4", sellPrice:2_000_000, weight:1000, color:"#3d7cc9", icon:"🧰" },
  T5: { name:"Tier 5", shortName:"T5", sellPrice:10_000_000, sellPriceGreatOcean:25_000_000, weight:1000, color:"#ffd700", icon:"✨" },
  T6: { name:"Tier 6", shortName:"T6", sellPrice:50_000_000, weight:2000, color:"#ff8c00", icon:"🔥" },
  T7: { name:"Tier 7", shortName:"T7", sellPrice:100_000_000, weight:2000, color:"#ff4500", icon:"💎" },
  CC: { name:"Crow Coins", shortName:"CC", sellPrice:0, weight:0, color:"#b57edc", icon:"🪙" },
};

// [VERIFIED] Exchange ratios for LOWER tiers — from multiple community sources
// T5→T6, T6→T7 ratios are NOT publicly documented with exact numbers.
// We let the user input how many items they actually get per trade.
export const EXCHANGE_DATA = {
  "T0→T1": { from:"T0", to:"T1", commonRatios:"Various", bestRatio:"Check in-game" },
  "T1→T2": { from:"T1", to:"T2", commonRatios:"1:1, 1:2, 1:3", bestRatio:"1:3" },
  "T2→T3": { from:"T2", to:"T3", commonRatios:"1:1, 1:2, 1:3", bestRatio:"1:3" },
  "T3→T4": { from:"T3", to:"T4", commonRatios:"1:1, 1:2", bestRatio:"1:2" },
  "T4→T5": { from:"T4", to:"T5", commonRatios:"2:1, 1:1", bestRatio:"1:1" },
  "T5→T6": { from:"T5", to:"T6", commonRatios:"Unknown — check in-game", bestRatio:"Check in-game" },
  "T6→T7": { from:"T6", to:"T7", commonRatios:"Unknown — check in-game", bestRatio:"Check in-game" },
};

// [VERIFIED] Ship stats — from blackdesertfoundry.com, playblackdesert.com
export const SHIP_DATA = {
  "carrack-advance": { name:"Carrack Advance", weightCapacity:16500, inventorySlots:40, note:"Best for bartering" },
  "carrack-balance": { name:"Carrack Balance", weightCapacity:16500, inventorySlots:40, note:"Balanced all-rounder" },
  "carrack-valor":   { name:"Carrack Valor",   weightCapacity:13500, inventorySlots:20, note:"Combat focused" },
  "carrack-volante": { name:"Carrack Volante", weightCapacity:13500, inventorySlots:20, note:"Speed focused" },
  "epheria-caravel": { name:"Epheria Caravel", weightCapacity:10000, inventorySlots:30, note:"Mid-tier barter ship" },
  "epheria-galleass":{ name:"Epheria Galleass",weightCapacity:8000,  inventorySlots:15, note:"Mid-tier combat ship" },
};

// [VERIFIED] Parley constants — from pearlabyss.com, grumpygreen.cricket
export const PARLEY_CONFIG = {
  maxParley: 1_000_000,
  voucherRestore: 250_000,
  refreshBase:     { tradeRefresh:2, shipMaterialRefresh:2 },
  refreshValuePack:{ tradeRefresh:3, shipMaterialRefresh:2 },
  valuePackParleyReduction: 10, // 10% reduction [VERIFIED]
  resetTimeUTC: 6,              // 06:00 UTC
};

// NOTE: Exact parley cost per trade and exact barter level reduction %
// are NOT publicly documented. The game shows them in-game per trade.
// We removed fake percentages. The user inputs their own parley cost from in-game.

// Stockpile thresholds — community recommended minimums
export const DEFAULT_THRESHOLDS = {
  T1: { safe:30, warning:15, critical:5 },
  T2: { safe:30, warning:15, critical:5 },
  T3: { safe:25, warning:10, critical:5 },
  T4: { safe:20, warning:8,  critical:3 },
  T5: { safe:10, warning:5,  critical:2 },
};

export const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

/**
 * [VERIFIED] Barter item names per tier — with item IDs for bdocodex icon lookup
 * Sources: bdocodex.com, grumpygreen.cricket, pearlabyss.com patch notes
 * Each item has: en (English name), th (Thai name), id (bdocodex item ID)
 * 
 * ⚠ Thai names may not be 100% exact to in-game client.
 *   If any name looks wrong, please tell me the correct one from your game!
 */
export const BARTER_ITEMS = {
  T0: [
      {
          "id": "trade_goods",
          "en": "Trade Goods",
          "th": "สินค้าแลกเปลี่ยน"
      }
  ],
  T1: [
      {
          "id": 800007,
          "en": "Ancient Urn Piece",
          "th": "สะเก็ดไหโบราณ"
      },
      {
          "id": 800009,
          "en": "Cherry Tree Seed Pouch",
          "th": "ห่อเมล็ดต้นเชอรี่ นานกิง"
      },
      {
          "id": 800006,
          "en": "Chewy Raw Gizzard",
          "th": "ปลาโคกดิบ"
      },
      {
          "id": 800001,
          "en": "Dried Blue Rose",
          "th": "กุหลาบฟ้าตากแห้ง"
      },
      {
          "id": 800013,
          "en": "Fertile Soil",
          "th": "ดินที่อุดมสมบูรณ์"
      },
      {
          "id": 800002,
          "en": "Giant Fish Bone",
          "th": "ก้างปลาขนาดใหญ่"
      },
      {
          "id": 800010,
          "en": "Golden Sand",
          "th": "ทรายสีทอง"
      },
      {
          "id": 800003,
          "en": "Naval Ration",
          "th": "เสบียงรบบนเรือ"
      },
      {
          "id": 800014,
          "en": "Pirates' Gunpowder",
          "th": "ดินระเบิดของโจรสลัด"
      },
      {
          "id": 800005,
          "en": "Raft Toy",
          "th": "ชิ้นส่วนอุปกรณ์แพ"
      },
      {
          "id": 800012,
          "en": "Rakeflower Seed Pouch",
          "th": "ห่อเมล็ดแฝดกระถินฝรั่ง"
      },
      {
          "id": 800011,
          "en": "Roa Flower Seed Pouch",
          "th": "ห่อเมล็ดดอกโรอา"
      },
      {
          "id": 800004,
          "en": "Stained Seagull Figurine",
          "th": "รูปปั้นนกนางนวลที่มีคราบ"
      },
      {
          "id": 800008,
          "en": "Unidentified Ancient Mural",
          "th": "จิตกรรมโบราณปริศนา"
      }
  ],
  T2: [
      {
          "id": 800024,
          "en": "Balanced Stone Pagoda",
          "th": "หอคอยหินที่มีความสมดุล"
      },
      {
          "id": 800022,
          "en": "Big Stone Slab",
          "th": "แผ่นหินที่กว้างใหญ่"
      },
      {
          "id": 800020,
          "en": "Conch Shell Ornament",
          "th": "ประดับเปลือกปูเสฉวน"
      },
      {
          "id": 800016,
          "en": "Cron Castle Gold Coin",
          "th": "เหรียญทองปราสาทครอน"
      },
      {
          "id": 800019,
          "en": "Filtered Drinking Water",
          "th": "น้ำดื่มบริสุทธิ์"
      },
      {
          "id": 800015,
          "en": "Islanders' Lunchbox",
          "th": "ข้าวกล่องหมู่บ้านเกาะ"
      },
      {
          "id": 800026,
          "en": "Monster Tentacle",
          "th": "ไฮดราสิ่งมีชีวิตประหลาด"
      },
      {
          "id": 800023,
          "en": "Narvo Sea Cucumber",
          "th": "ปลิงทะเลจากเกาะนาร์โว"
      },
      {
          "id": 800018,
          "en": "Opulent Marble",
          "th": "ลูกแก้วหลากสี"
      },
      {
          "id": 800027,
          "en": "Pirate Gold Coin",
          "th": "เหรียญทองโจรสลัด"
      },
      {
          "id": 800017,
          "en": "Pirate Ship Mast",
          "th": "เสากระโดงเรือโจรสลัด"
      },
      {
          "id": 800025,
          "en": "Sea Survival Kit",
          "th": "อุปกรณ์กู้ภัยในทะเล"
      },
      {
          "id": 800021,
          "en": "Supreme Oyster Box",
          "th": "กล่องหอยนางรมระดับสูง"
      },
      {
          "id": 800028,
          "en": "Urchin Spine",
          "th": "หนามหอยเม่น"
      }
  ],
  T3: [
      {
          "id": 800041,
          "en": "Ancient Orders",
          "th": "ใบคำสั่งเก่า"
      },
      {
          "id": 800042,
          "en": "Blue Candle Bundle",
          "th": "กองเทียนหอมสีฟ้า"
      },
      {
          "id": 800036,
          "en": "Gooey Monster Blood",
          "th": "โลหิตสิ่งมีชีวิตประหลาดหนึบหนับ"
      },
      {
          "id": 800040,
          "en": "Lopters Fishnet",
          "th": "ตาข่ายล็อบตอส"
      },
      {
          "id": 800029,
          "en": "Old Hourglass",
          "th": "นาฬิกาทรายเก่า"
      },
      {
          "id": 800031,
          "en": "Pirates' Supply Box",
          "th": "กล่องเสบียงของโจรสลัด"
      },
      {
          "id": 800039,
          "en": "Rare Herb Pile",
          "th": "กองสมุนไพรที่หายาก"
      },
      {
          "id": 800035,
          "en": "Round Knife",
          "th": "มีดพระจันทร์เสี้ยวสำหรับปรุงอาหาร"
      },
      {
          "id": 800032,
          "en": "Scout Binoculars",
          "th": "กล้องส่องทางไกลทหารพราน"
      },
      {
          "id": 800034,
          "en": "Skull Decorated Teacup",
          "th": "ถ้วยชาประดับกะโหลก"
      },
      {
          "id": 800038,
          "en": "Skull Symbol Carpet",
          "th": "พรมลายกะโหลก"
      },
      {
          "id": 800033,
          "en": "Stalactite Fragment",
          "th": "สะเก็ดหินย้อย"
      },
      {
          "id": 800030,
          "en": "Torn Pirate Treasure Map",
          "th": "แผนที่สมบัติของโจรสลัดที่ฉีกขาด"
      },
      {
          "id": 800037,
          "en": "Weasel Leather Coat",
          "th": "โค้ทหนังพังพอน"
      }
  ],
  T4: [
      {
          "id": 800046,
          "en": "Amethyst Fragment",
          "th": "สะเก็ดพลอยสีม่วง"
      },
      {
          "id": 800050,
          "en": "Boatman's Manual",
          "th": "ตำราฝึกทักษะของคนพายเรือ"
      },
      {
          "id": 800055,
          "en": "Bronze Candlestick",
          "th": "เชิงเทียนทองสัมฤทธิ์"
      },
      {
          "id": 800049,
          "en": "Green Salt Lump",
          "th": "ก้อนเกลือสีคราม"
      },
      {
          "id": 800054,
          "en": "Headless Dragon Figurine",
          "th": "รูปปั้นมังกรคอหัก"
      },
      {
          "id": 800043,
          "en": "Marine Knights' Helm",
          "th": "หมวกของกลุ่มอัศวินเรือ"
      },
      {
          "id": 800047,
          "en": "Marine Knights' Spear",
          "th": "หอกของกลุ่มอัศวินเรือ"
      },
      {
          "id": 800051,
          "en": "Old Chest with Gold Coins",
          "th": "กล่องเก่าแก่บรรจุเหรียญทอง"
      },
      {
          "id": 800045,
          "en": "Opulent Thread Spool",
          "th": "กลุ่มไหมหลากสี"
      },
      {
          "id": 800053,
          "en": "Panacea",
          "th": "ยาแก้สรรพโรค"
      },
      {
          "id": 800056,
          "en": "Pirate's Key",
          "th": "กุญแจแห่งโจรสลัด"
      },
      {
          "id": 800052,
          "en": "Seashell Deco",
          "th": "ประดับเปลือกหอย"
      },
      {
          "id": 800048,
          "en": "Solidified Lava",
          "th": "ลาวาที่แข็งตัว"
      },
      {
          "id": 800044,
          "en": "Stolen Pirate Dagger",
          "th": "มีดเหน็บที่ขโมยจากกลุ่มโจรสลัด"
      }
  ],
  T5: [
      {
          "id": 800066,
          "en": "102 Year Old Golden Herb",
          "th": "สมุนไพรทอง 102 ปี"
      },
      {
          "id": 800058,
          "en": "37 Year Old Herbal Wine",
          "th": "เหล้า 37 ปี"
      },
      {
          "id": 800059,
          "en": "Azure Quartz",
          "th": "ควอตซ์ฟ้า"
      },
      {
          "id": 800072,
          "en": "Cox Pirates' Journal",
          "th": "บันทึกของกลุ่มโจรสลัดค็อกซ์"
      },
      {
          "id": 800068,
          "en": "Elixir of Youth",
          "th": "น้ำยาอ่อนเยาว์"
      },
      {
          "id": 800063,
          "en": "Faded Gold Dragon Figurine",
          "th": "รูปปั้นมังกรทองที่เจือจาง"
      },
      {
          "id": 800065,
          "en": "Golden Fish Scale",
          "th": "เกล็ดปลาสีทอง"
      },
      {
          "id": 800069,
          "en": "Luxury Patterned Fabric",
          "th": "ผ้าลายหรูหรา"
      },
      {
          "id": 800070,
          "en": "Mysterious Rock",
          "th": "หินปริศนา"
      },
      {
          "id": 800075,
          "en": "Observatory Report",
          "th": "ใบรายงานดาราศาสตร์"
      },
      {
          "id": 800057,
          "en": "Octagonal Box",
          "th": "หีบเก็บของแปดเหลี่ยม"
      },
      {
          "id": 800071,
          "en": "Opulent Coral Trinket",
          "th": "ประดับดาบปะการังหลากสี"
      },
      {
          "id": 800074,
          "en": "Otters Fish Hook",
          "th": "เบ็ดชนเผ่านาก"
      },
      {
          "id": 800067,
          "en": "Portrait of the Ancient",
          "th": "ภาพวาดจินตนาการคนโบราณ"
      },
      {
          "id": 800073,
          "en": "Rust Repair Tool",
          "th": "อุปกรณ์ซ่อมเหล็ก"
      },
      {
          "id": 800061,
          "en": "Statue's Tear",
          "th": "น้ำตาของรูปปั้น"
      },
      {
          "id": 800062,
          "en": "Supreme Gold Candlestick",
          "th": "เชิงเทียนทองระดับสูงสุด"
      },
      {
          "id": 800060,
          "en": "Taxidermied Morpho Butterfly",
          "th": "ประดับผีเสื้อบินเร็ว"
      },
      {
          "id": 800064,
          "en": "Taxidermied White Caterpillar",
          "th": "ของประดับหนอนสีขาว"
      }
  ],
  T6: [
      { "id": 800201, "en": "Valencia Sand Shield", "th": "" },
      { "id": 800202, "en": "Valencian Desert Fine Sword", "th": "" },
      { "id": 800203, "en": "Fancy Camel Hide", "th": "" },
      { "id": 800204, "en": "Golden Sand Ring", "th": "" },
      { "id": 800205, "en": "Top-Quality Coconut Syrup", "th": "" },
      { "id": 800206, "en": "Traditional Arehazan Tea", "th": "" },
      { "id": 800207, "en": "Miniature Arehaza Lighthouse", "th": "" },
      { "id": 800208, "en": "Golden Cactus Bouquet", "th": "" },
      { "id": 800209, "en": "Forest Fairy Perfume", "th": "" },
      { "id": 800210, "en": "Kamasylvian Sculpture", "th": "" },
      { "id": 800211, "en": "Moonlit Crystal Lamp", "th": "" },
      { "id": 800212, "en": "Mossy Silver Log Decoration", "th": "" },
      { "id": 800213, "en": "Black Rose Bouquet", "th": "" },
      { "id": 800214, "en": "Moonlit Crystal Shard", "th": "" },
      { "id": 800215, "en": "Moonshade Aged Wine", "th": "" },
      { "id": 800216, "en": "Shadow Ornament Mirror", "th": "" },
      { "id": 800217, "en": "Bamboo Sap Crate", "th": "" },
      { "id": 800218, "en": "Nampo Persimmon Crate", "th": "" },
      { "id": 800219, "en": "High-quality Ink-scented Box", "th": "" },
      { "id": 800220, "en": "Hanji Country Wild Berry Crate", "th": "" },
      { "id": 800221, "en": "Top-Quality Blue Underglaze Porcelain Crate", "th": "" },
      { "id": 800222, "en": "Top-Quality Gamtu Crate", "th": "" },
      { "id": 800223, "en": "Brass Bowl Crate", "th": "" },
      { "id": 800224, "en": "Sharp Safflower Blade Crate", "th": "" }
  ],
  T7: [
      { "id": 800225, "en": "Top-Quality Heidelian Wine", "th": "" },
      { "id": 800226, "en": "Golden Flour Sack", "th": "" },
      { "id": 800227, "en": "Organic Honey Crate", "th": "" },
      { "id": 800228, "en": "Traditional Balenos Decorative Anchor", "th": "" },
      { "id": 800229, "en": "Golden Eagle Brooch", "th": "" },
      { "id": 800230, "en": "Calpheon Knights' Combat Manual", "th": "" },
      { "id": 800231, "en": "Calpheon Golden Candle Stand", "th": "" },
      { "id": 800232, "en": "Calpheonian Artisan's Pearl Necklace", "th": "" },
      { "id": 800233, "en": "Sausan Military Supply", "th": "" },
      { "id": 800234, "en": "Stonetail Carrot Healthy Food Crate", "th": "" },
      { "id": 800235, "en": "Omar Lava Powder", "th": "" },
      { "id": 800236, "en": "Tarif Magic Jar", "th": "" },
      { "id": 800237, "en": "Rusalka's Thorny Bouquet", "th": "" },
      { "id": 800238, "en": "Sturdy Caphras Timber", "th": "" },
      { "id": 800239, "en": "Top-Quality Hakinza Perfume", "th": "" },
      { "id": 800240, "en": "Throne of Edana Records", "th": "" },
      { "id": 800241, "en": "Artisan's Seashell Necklace", "th": "" },
      { "id": 800242, "en": "Balenosian Sailor's Telescope", "th": "" },
      { "id": 800243, "en": "Balenos Whale Sculpture", "th": "" },
      { "id": 800244, "en": "Balenos Salt Flower", "th": "" },
      { "id": 800245, "en": "Balenos Starlight Salt", "th": "" },
      { "id": 800246, "en": "Balenos Relic Fragment", "th": "" },
      { "id": 800247, "en": "Balenos Rainbow Coral", "th": "" },
      { "id": 800248, "en": "Rainbow Sea Crystal Piece", "th": "" }
  ]
};

// Flat master list of ALL barter items (for dropdowns — no tier restriction)
export const ALL_BARTER_ITEMS = [];
for (const tier in BARTER_ITEMS) {
  if (Array.isArray(BARTER_ITEMS[tier])) {
    BARTER_ITEMS[tier].forEach(item => {
      if (!ALL_BARTER_ITEMS.find(x => x.id === item.id)) {
        ALL_BARTER_ITEMS.push(item);
      }
    });
  }
}
ALL_BARTER_ITEMS.sort((a, b) => a.en.localeCompare(b.en));

/**
 * Get item icon URL from local assets
 */
export function getBarterItemIcon(itemObj) {
  if (!itemObj || !itemObj.id) return null;
  return `assets/icons/${itemObj.id}.webp`;
}

/**
 * Find a barter item object by name — searches ALL items, not tier-locked
 */
export function findBarterItem(name) {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  return ALL_BARTER_ITEMS.find(item =>
    (item.en && item.en.toLowerCase() === lower) ||
    (item.th && item.th.toLowerCase() === lower)
  ) || null;
}
