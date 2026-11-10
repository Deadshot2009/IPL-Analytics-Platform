export const TEAM_META = {
  "Mumbai Indians": { short: "MI", primary: "#004BA0", accent: "#D1AB3E", text: "#FFFFFF" },
  "Chennai Super Kings": { short: "CSK", primary: "#F9CD05", accent: "#0081E9", text: "#000000" },
  "Royal Challengers Bengaluru": { short: "RCB", primary: "#DA1818", accent: "#CBA92B", text: "#FFFFFF" },
  "Royal Challengers Bangalore": { short: "RCB", primary: "#DA1818", accent: "#CBA92B", text: "#FFFFFF" },
  "Kolkata Knight Riders": { short: "KKR", primary: "#3A225D", accent: "#B3A123", text: "#FFFFFF" },
  "Rajasthan Royals": { short: "RR", primary: "#EA1A85", accent: "#254AA5", text: "#FFFFFF" },
  "Sunrisers Hyderabad": { short: "SRH", primary: "#F26522", accent: "#000000", text: "#FFFFFF" },
  "Delhi Capitals": { short: "DC", primary: "#004C93", accent: "#E41C38", text: "#FFFFFF" },
  "Delhi Daredevils": { short: "DD", primary: "#004C93", accent: "#E41C38", text: "#FFFFFF" },
  "Punjab Kings": { short: "PBKS", primary: "#ED1B24", accent: "#DCDDDF", text: "#FFFFFF" },
  "Kings XI Punjab": { short: "KXIP", primary: "#ED1B24", accent: "#DCDDDF", text: "#FFFFFF" },
  "Gujarat Titans": { short: "GT", primary: "#1B2133", accent: "#DAAF54", text: "#FFFFFF" },
  "Lucknow Super Giants": { short: "LSG", primary: "#0057E7", accent: "#FF6B35", text: "#FFFFFF" },
  "Deccan Chargers": { short: "DCG", primary: "#003366", accent: "#A0A0A0", text: "#FFFFFF" },
  "Gujarat Lions": { short: "GL", primary: "#E04F16", accent: "#1A3D64", text: "#FFFFFF" },
  "Pune Warriors": { short: "PWI", primary: "#2F9BE3", accent: "#000000", text: "#FFFFFF" },
  "Rising Pune Supergiant": { short: "RPS", primary: "#7A1856", accent: "#DE5824", text: "#FFFFFF" },
  "Rising Pune Supergiants": { short: "RPS", primary: "#7A1856", accent: "#DE5824", text: "#FFFFFF" },
  "Kochi Tuskers Kerala": { short: "KTK", primary: "#6F2C91", accent: "#F37023", text: "#FFFFFF" }
};

export function getTeamMeta(teamName) {
  return TEAM_META[teamName] || { short: teamName ? teamName.substring(0, 3).toUpperCase() : "IPL", primary: "#FF6B35", accent: "#A3E635", text: "#FFFFFF" };
}
