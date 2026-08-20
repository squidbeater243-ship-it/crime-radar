// The FBI does not publish state-level arrest breakdowns by sex or race —
// only national totals exist. These figures are shown on every state page,
// clearly labeled as national data, rather than inventing per-state numbers.
// Source: FBI Uniform Crime Report, 2023 arrest data (~4.59M total arrests).

export const arrestsBySex = [
  { name: 'Male', value: 73.8, color: '#38bdf8' },
  { name: 'Female', value: 26.2, color: '#818cf8' },
];

export const arrestsByRace = [
  { name: 'White', value: 63.6 },
  { name: 'Black', value: 31.8 },
  { name: 'American Indian / Alaska Native', value: 2.4 },
  { name: 'Asian / Pacific Islander', value: 2.2 },
];

export const arrestDataMeta = {
  year: 2023,
  sexNote:
    'National FBI arrest data, 2023 — the FBI does not publish a state-by-state breakdown of arrests by sex, so this reflects the national total rather than this specific state.',
  raceNote:
    'National FBI arrest data, 2023 — state-level breakdowns are not published, so this reflects the national total. This counts who was arrested, not necessarily who committed an offense: arrest figures are shaped heavily by policing intensity, enforcement priorities, and reporting differences between jurisdictions, not just underlying offense rates. Hispanic/Latino origin is tracked by the FBI as a separate ethnicity field, not a race category — about 24.4% of arrestees with ethnicity reported (~87% of all arrestees) identify as Hispanic/Latino.',
  sources: [
    { label: 'FBI — 2023 Crime in the Nation', url: 'https://www.fbi.gov/news/press-releases/fbi-releases-2023-crime-in-the-nation-statistics' },
    { label: 'FBI UCR arrest data by race/ethnicity, 2023', url: 'https://beautifydata.com/united-states-crimes/fbi-ucr/2023/number-of-arrests-by-race-and-ethnicity/total/total' },
  ],
};
