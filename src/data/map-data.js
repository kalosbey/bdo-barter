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
  "Arehaza": { x: 980, y: 650, region: "Hakoven" }
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
