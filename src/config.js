// Configuration de l'événement — aucune donnée sensible ici
export const CFG = {
  year:  2026,
  month: 9,   // octobre (0-indexed)
  day:   3,
  mairie:   { h: 14, m: 30, durH: 2.5 },
  ceremony: { h: 17, m:  0, durH: 5   },
};

export const DATE_MAIRIE   = new Date(CFG.year, CFG.month, CFG.day, CFG.mairie.h,   CFG.mairie.m,   0);
export const DATE_CEREMONY = new Date(CFG.year, CFG.month, CFG.day, CFG.ceremony.h, CFG.ceremony.m, 0);
