/**
 * Map Coordinates for BDO Islands
 * Used for the visual Route Map plotter.
 * Coordinates are based on a 1000x1000 grid.
 */

export const MAP_COORDS = {
  // Main Hubs
  "Iliya Island": { x: 750, y: 500, region: "Iliya" },
  "Epheria": { x: 200, y: 650, region: "Epheria" },
  "Velia": { x: 550, y: 550, region: "Balenos" },
  
  // Margoria / Deep Ocean
  "Port Ratt": { x: 100, y: 100, region: "Margoria" },
  "Oquilla's Eye": { x: 450, y: 350, region: "Margoria" },
  "Margoria": { x: 300, y: 200, region: "Margoria" },
  "Vell's Realm": { x: 350, y: 150, region: "Margoria" },

  // Balenos Islands (Near Velia/Iliya)
  "Lema Island": { x: 650, y: 400, region: "Iliya" },
  "Daton Island": { x: 620, y: 450, region: "Iliya" },
  "Racid Island": { x: 700, y: 450, region: "Iliya" },
  "Invernen Island": { x: 550, y: 450, region: "Balenos" },
  "Eberdeen Island": { x: 580, y: 420, region: "Balenos" },
  "Teyamal Island": { x: 450, y: 480, region: "Balenos" },
  "Weita Island": { x: 500, y: 500, region: "Balenos" },
  "Baremi Island": { x: 600, y: 500, region: "Balenos" },
  "Arita Island": { x: 680, y: 520, region: "Iliya" },
  "Barater Island": { x: 720, y: 550, region: "Iliya" },
  "Ostra Island": { x: 780, y: 480, region: "Iliya" },
  
  // Epheria Coast
  "Randis Island": { x: 250, y: 600, region: "Epheria" },
  "Zaramacas Island": { x: 300, y: 550, region: "Epheria" },
  "Modric Island": { x: 350, y: 520, region: "Epheria" },
  "Padix Island": { x: 320, y: 480, region: "Epheria" },
  "Teste Island": { x: 380, y: 550, region: "Epheria" },
  "Riyed Island": { x: 280, y: 550, region: "Epheria" },
  
  // Nox Sea / North of Lema
  "Orisha Island": { x: 650, y: 350, region: "Nox" },
  "Shirna Island": { x: 670, y: 360, region: "Nox" },
  "Almai Island": { x: 630, y: 340, region: "Nox" },
  "Netnume Island": { x: 400, y: 520, region: "Balenos" },
  
  // Eastern Valencia
  "Hakoven Island": { x: 950, y: 400, region: "Hakoven" },
  "Halmad Island": { x: 900, y: 450, region: "Hakoven" },
  "Ancado Inner Harbor": { x: 920, y: 550, region: "Hakoven" },
  "Arehaza": { x: 980, y: 650, region: "Hakoven" },

  // Extra/Minor Islands to populate the dropdown
  "Al-Naha Island": { x: 0, y: 0, region: "Balenos" },
  "Baeza Island": { x: 0, y: 0, region: "Balenos" },
  "Anga Island": { x: 0, y: 0, region: "Balenos" },
  "Rancito Island": { x: 0, y: 0, region: "Balenos" },
  "Kanvera Island": { x: 0, y: 0, region: "Balenos" },
  "Marlene Island": { x: 0, y: 0, region: "Balenos" },
  "Luivano Island": { x: 0, y: 0, region: "Balenos" },
  "Paratama Island": { x: 0, y: 0, region: "Balenos" },
  "Pilava Island": { x: 0, y: 0, region: "Balenos" },
  "Orffs Island": { x: 0, y: 0, region: "Balenos" },
  "Coba Island": { x: 0, y: 0, region: "Balenos" },
  "Tulu Island": { x: 0, y: 0, region: "Balenos" },
  "Serca Island": { x: 0, y: 0, region: "Epheria" },
  "Narvo Island": { x: 0, y: 0, region: "Epheria" },
  "Lisenza Island": { x: 0, y: 0, region: "Epheria" },
  "Lerao Island": { x: 0, y: 0, region: "Epheria" },
  "Derko Island": { x: 0, y: 0, region: "Mediah" },
  "Puchia Island": { x: 0, y: 0, region: "Mediah" },
  "Albresser Island": { x: 0, y: 0, region: "Mediah" },
  "Kasula Island": { x: 0, y: 0, region: "Mediah" },
  "Riyina Island": { x: 0, y: 0, region: "Mediah" },
  "Rameda Island": { x: 0, y: 0, region: "Calpheon" },
  "Thett Island": { x: 0, y: 0, region: "Calpheon" },
  "Dunde Island": { x: 0, y: 0, region: "Calpheon" },
  "Evera Island": { x: 0, y: 0, region: "Calpheon" },
  "Ruluvee Island": { x: 0, y: 0, region: "Calpheon" },
  "Ronda Island": { x: 0, y: 0, region: "Calpheon" },
  "Wrecked Cox Pirates' Ship": { x: 0, y: 0, region: "Margoria" },
  "Star Catcher": { x: 0, y: 0, region: "Margoria" },
  "Margoria Phantom Ship": { x: 0, y: 0, region: "Margoria" },

  // Thai Translations
  "เกาะอิลิยา": { x: 750, y: 500, region: "Iliya" },
  "เอเฟเรีย": { x: 200, y: 650, region: "Epheria" },
  "เวเรีย": { x: 550, y: 550, region: "Balenos" },
  "ท่าเรือรัทท์": { x: 100, y: 100, region: "Margoria" },
  "ดวงตาแห่งโอคิลลัว": { x: 450, y: 350, region: "Margoria" },
  "มาร์โกเรีย": { x: 300, y: 200, region: "Margoria" },
  "อาณาเขตของเบลล์": { x: 350, y: 150, region: "Margoria" },
  "เกาะเลมา": { x: 650, y: 400, region: "Iliya" },
  "เกาะดาตัน": { x: 620, y: 450, region: "Iliya" },
  "เกาะเรซิด": { x: 700, y: 450, region: "Iliya" },
  "เกาะอินเบเนน": { x: 550, y: 450, region: "Balenos" },
  "เกาะเอเวอร์ดีน": { x: 580, y: 420, region: "Balenos" },
  "เกาะเทยามาล": { x: 450, y: 480, region: "Balenos" },
  "เกาะเวย์ทา": { x: 500, y: 500, region: "Balenos" },
  "เกาะบาเรมี": { x: 600, y: 500, region: "Balenos" },
  "เกาะอารีตา": { x: 680, y: 520, region: "Iliya" },
  "เกาะบาราเทอร์": { x: 720, y: 550, region: "Iliya" },
  "เกาะออสตร้า": { x: 780, y: 480, region: "Iliya" },
  "เกาะรันดิส": { x: 250, y: 600, region: "Epheria" },
  "เกาะซารามคัส": { x: 300, y: 550, region: "Epheria" },
  "เกาะโมดริค": { x: 350, y: 520, region: "Epheria" },
  "เกาะพาดิกซ์": { x: 320, y: 480, region: "Epheria" },
  "เกาะเทสเต้": { x: 380, y: 550, region: "Epheria" },
  "เกาะรียีด": { x: 280, y: 550, region: "Epheria" },
  "เกาะโอรีชา": { x: 650, y: 350, region: "Nox" },
  "เกาะชิรินา": { x: 670, y: 360, region: "Nox" },
  "เกาะอัลไม": { x: 630, y: 340, region: "Nox" },
  "เกาะเนทนุม": { x: 400, y: 520, region: "Balenos" },
  "เกาะฮาโคบอน": { x: 950, y: 400, region: "Hakoven" },
  "เกาะฮาลมาด": { x: 900, y: 450, region: "Hakoven" },
  "ท่าเรือข้ามฟากอันคาโด": { x: 920, y: 550, region: "Hakoven" },
  "อาเรฮาจา": { x: 980, y: 650, region: "Hakoven" },
  "เกาะอัลนาฮา": { x: 0, y: 0, region: "Balenos" },
  "เกาะเบซา": { x: 0, y: 0, region: "Balenos" },
  "เกาะอังกา": { x: 0, y: 0, region: "Balenos" },
  "เกาะรันชีโต": { x: 0, y: 0, region: "Balenos" },
  "เกาะคันเบรา": { x: 0, y: 0, region: "Balenos" },
  "เกาะมาร์เลน": { x: 0, y: 0, region: "Balenos" },
  "เกาะลูเวียโน่": { x: 0, y: 0, region: "Balenos" },
  "เกาะพาราตามา": { x: 0, y: 0, region: "Balenos" },
  "เกาะพิลลาวา": { x: 0, y: 0, region: "Balenos" },
  "เกาะโอรฟส์": { x: 0, y: 0, region: "Balenos" },
  "เกาะโคบาร์": { x: 0, y: 0, region: "Balenos" },
  "เกาะทูลู": { x: 0, y: 0, region: "Balenos" },
  "เกาะเซร์คา": { x: 0, y: 0, region: "Epheria" },
  "เกาะนาร์โบ": { x: 0, y: 0, region: "Epheria" },
  "เกาะลีเซนซา": { x: 0, y: 0, region: "Epheria" },
  "เกาะเลราโอ": { x: 0, y: 0, region: "Epheria" },
  "เกาะเดอร์โค": { x: 0, y: 0, region: "Mediah" },
  "เกาะพูเจีย": { x: 0, y: 0, region: "Mediah" },
  "เกาะอัลเบรสเซอร์": { x: 0, y: 0, region: "Mediah" },
  "เกาะคาซูล่า": { x: 0, y: 0, region: "Mediah" },
  "เกาะรีอีนา": { x: 0, y: 0, region: "Mediah" },
  "เกาะราเมดา": { x: 0, y: 0, region: "Calpheon" },
  "เกาะเทด": { x: 0, y: 0, region: "Calpheon" },
  "เกาะดันเด": { x: 0, y: 0, region: "Calpheon" },
  "เกาะเอเบอรา": { x: 0, y: 0, region: "Calpheon" },
  "เกาะลูลูฟวี่": { x: 0, y: 0, region: "Calpheon" },
  "เกาะรอนดา": { x: 0, y: 0, region: "Calpheon" },
  "ซากเรือโจรสลัดค็อกซ์": { x: 0, y: 0, region: "Margoria" },
  "นักตกดาว": { x: 0, y: 0, region: "Margoria" },
  "เรือผีสิงมาร์โกเรีย": { x: 0, y: 0, region: "Margoria" }
};

/**
 * Helper to find coordinates using fuzzy matching on the location string.
 */
export const getCustomCoords = () => {
  try {
    const data = localStorage.getItem('bdo_custom_map_coords');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

export const saveCustomCoord = (name, x, y) => {
  const custom = getCustomCoords();
  custom[name] = { x, y, custom: true };
  localStorage.setItem('bdo_custom_map_coords', JSON.stringify(custom));
};

export const removeCustomCoord = (name) => {
  const custom = getCustomCoords();
  delete custom[name];
  localStorage.setItem('bdo_custom_map_coords', JSON.stringify(custom));
};

export const findCoords = (locationString) => {
  if (!locationString) return null;
  const search = locationString.toLowerCase();
  
  // 1. Check custom coordinates first
  const customCoords = getCustomCoords();
  for (const [key, data] of Object.entries(customCoords)) {
    if (search.includes(key.toLowerCase()) || key.toLowerCase().includes(search) || key.toLowerCase() === search) {
      return { name: key, ...data };
    }
  }

  // 2. Try exact or partial match in our hardcoded dict
  for (const [key, data] of Object.entries(MAP_COORDS)) {
    if (search.includes(key.toLowerCase()) || key.toLowerCase().includes(search)) {
      return { name: key, ...data };
    }
  }
  
  // Fallback to region grouping mapping if exact island isn't found
  if (search.includes("iliya") || search.includes("east")) return MAP_COORDS["Iliya Island"];
  if (search.includes("epheria") || search.includes("west")) return MAP_COORDS["Epheria"];
  if (search.includes("margoria") || search.includes("north")) return MAP_COORDS["Oquilla's Eye"];
  if (search.includes("hakoven") || search.includes("valencia")) return MAP_COORDS["Hakoven Island"];

  return null;
};
