const normalizeStateName = (value) =>
  (value ?? '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z ]/g, '')
    .replace(/\s+/g, ' ');

const stateData = {
  alabama: {
    displayName: 'Alabama',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '417.2 per 100k',
        note: '-13.7% 2023→2024',
      },
      {
        title: 'Property crime rate',
        value: '1,868 per 100k',
        note: '-16.2% 2023→2024 — estimated from adjacent-year data — no direct figure published',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 417.2,
      },
      {
        name: 'Property',
        value: 1868,
      },
    ],
    crimeGrowth: 'Violent -13.7% · Property -16.2% (2023→2024)',
    povertyData: [
      {
        name: 'Alabama',
        value: 15.6,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '15.6% poverty rate',
    incomeNote: 'Alabama\'s official poverty rate is about 3.1 points above the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'Wikipedia — List of U.S. states by violent crime rate (FBI CDE-sourced)',
        url: 'https://en.wikipedia.org/wiki/List_of_U.S._states_and_territories_by_violent_crime_rate',
      },
      {
        label: 'USAFacts — Alabama crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/alabama/',
      },
      {
        label: 'USAFacts — Alabama poverty rate',
        url: 'https://usafacts.org/answers/what-is-the-us-poverty-rate/state/alabama/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  alaska: {
    displayName: 'Alaska',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '733.6 per 100k',
        note: '-1.3% 2023→2024',
      },
      {
        title: 'Property crime rate',
        value: '1,568 per 100k',
        note: '+9.1% 2023→2024 — estimated from adjacent-year data — no direct figure published',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 733.6,
      },
      {
        name: 'Property',
        value: 1568,
      },
    ],
    crimeGrowth: 'Violent -1.3% · Property +9.1% (2023→2024)',
    povertyData: [
      {
        name: 'Alaska',
        value: 10.4,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '10.4% poverty rate',
    incomeNote: 'Alaska\'s official poverty rate is about 2.1 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'Wikipedia — List of U.S. states by violent crime rate (FBI CDE-sourced)',
        url: 'https://en.wikipedia.org/wiki/List_of_U.S._states_and_territories_by_violent_crime_rate',
      },
      {
        label: 'USAFacts — Alaska crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/alaska/',
      },
      {
        label: 'USAFacts — Alaska poverty rate',
        url: 'https://usafacts.org/answers/what-is-the-us-poverty-rate/state/alaska/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  arizona: {
    displayName: 'Arizona',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '433.8 per 100k',
        note: '-2.7% 2023→2024',
      },
      {
        title: 'Property crime rate',
        value: '1,927 per 100k',
        note: '-7.0% 2023→2024 — estimated from adjacent-year data — no direct figure published',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 433.8,
      },
      {
        name: 'Property',
        value: 1927,
      },
    ],
    crimeGrowth: 'Violent -2.7% · Property -7.0% (2023→2024)',
    povertyData: [
      {
        name: 'Arizona',
        value: 12.4,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '12.4% poverty rate',
    incomeNote: 'Arizona\'s official poverty rate is about 0.1 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'Wikipedia — List of U.S. states by violent crime rate (FBI CDE-sourced)',
        url: 'https://en.wikipedia.org/wiki/List_of_U.S._states_and_territories_by_violent_crime_rate',
      },
      {
        label: 'USAFacts — Arizona crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/arizona/',
      },
      {
        label: 'USAFacts — Arizona poverty rate',
        url: 'https://usafacts.org/answers/what-is-the-us-poverty-rate/state/arizona/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  arkansas: {
    displayName: 'Arkansas',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '623.3 per 100k',
        note: '-7.0% 2023→2024',
      },
      {
        title: 'Property crime rate',
        value: '1,697 per 100k',
        note: '+13.7% 2023→2024 — estimated from adjacent-year data — no direct figure published',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 623.3,
      },
      {
        name: 'Property',
        value: 1697,
      },
    ],
    crimeGrowth: 'Violent -7.0% · Property +13.7% (2023→2024)',
    povertyData: [
      {
        name: 'Arkansas',
        value: 15.7,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '15.7% poverty rate',
    incomeNote: 'Arkansas\'s official poverty rate is about 3.2 points above the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'Wikipedia — List of U.S. states by violent crime rate (FBI CDE-sourced)',
        url: 'https://en.wikipedia.org/wiki/List_of_U.S._states_and_territories_by_violent_crime_rate',
      },
      {
        label: 'USAFacts — Arkansas crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/arkansas/',
      },
      {
        label: 'USAFacts — Arkansas poverty rate',
        url: 'https://usafacts.org/answers/what-is-the-us-poverty-rate/state/arkansas/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  california: {
    displayName: 'California',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '508 per 100k',
        note: '+3.3% vs 2022',
      },
      {
        title: 'Property crime rate',
        value: '2,313 per 100k',
        note: '-1.8% vs 2022 — estimated from adjacent-year data — no direct figure published',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 508,
      },
      {
        name: 'Property',
        value: 2313,
      },
    ],
    crimeGrowth: 'Violent +3.3% · Property -1.8% (vs 2022)',
    povertyData: [
      {
        name: 'California',
        value: 12,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '12% poverty rate',
    incomeNote: 'California\'s official poverty rate is about 0.5 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'PPIC — Crime Trends in California',
        url: 'https://www.ppic.org/publication/crime-trends-in-california/',
      },
      {
        label: 'CA DOJ / CLRC — California Crime Data for 2023',
        url: 'https://clrc.ca.gov/CRPC/Pub/Memos/CRPC24-08.pdf',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  colorado: {
    displayName: 'Colorado',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '485.2 per 100k',
        note: '-1.8% 2023→2024',
      },
      {
        title: 'Property crime rate',
        value: '2,330 per 100k',
        note: '+11.3% 2023→2024 — estimated from adjacent-year data — no direct figure published',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 485.2,
      },
      {
        name: 'Property',
        value: 2330,
      },
    ],
    crimeGrowth: 'Violent -1.8% · Property +11.3% (2023→2024)',
    povertyData: [
      {
        name: 'Colorado',
        value: 9.3,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '9.3% poverty rate',
    incomeNote: 'Colorado\'s official poverty rate is about 3.2 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'Wikipedia — List of U.S. states by violent crime rate (FBI CDE-sourced)',
        url: 'https://en.wikipedia.org/wiki/List_of_U.S._states_and_territories_by_violent_crime_rate',
      },
      {
        label: 'USAFacts — Colorado crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/colorado/',
      },
      {
        label: 'USAFacts — Colorado poverty rate',
        url: 'https://usafacts.org/answers/what-is-the-us-poverty-rate/state/colorado/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  connecticut: {
    displayName: 'Connecticut',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '152.4 per 100k',
        note: '-10.8% 2023→2024',
      },
      {
        title: 'Property crime rate',
        value: '1,565 per 100k',
        note: '-12.7% 2023→2024 — estimated from adjacent-year data — no direct figure published',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 152.4,
      },
      {
        name: 'Property',
        value: 1565,
      },
    ],
    crimeGrowth: 'Violent -10.8% · Property -12.7% (2023→2024)',
    povertyData: [
      {
        name: 'Connecticut',
        value: 10.3,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '10.3% poverty rate',
    incomeNote: 'Connecticut\'s official poverty rate is about 2.2 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'Wikipedia — List of U.S. states by violent crime rate (FBI CDE-sourced)',
        url: 'https://en.wikipedia.org/wiki/List_of_U.S._states_and_territories_by_violent_crime_rate',
      },
      {
        label: 'USAFacts — Connecticut crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/connecticut/',
      },
      {
        label: 'USAFacts — Connecticut poverty rate',
        url: 'https://usafacts.org/answers/what-is-the-us-poverty-rate/state/connecticut/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  delaware: {
    displayName: 'Delaware',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '361 per 100k',
        note: '2023 data',
      },
      {
        title: 'Property crime rate',
        value: '3,320 per 100k',
        note: '2023 data',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 361,
      },
      {
        name: 'Property',
        value: 3320,
      },
    ],
    crimeGrowth: '2023 data (year-over-year change not consistently published)',
    povertyData: [
      {
        name: 'Delaware',
        value: 10.5,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '10.5% poverty rate',
    incomeNote: 'Delaware\'s official poverty rate is about 2 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'First State Update — FBI 2023 crime data ranking',
        url: 'https://firststateupdate.com/2025/08/study-delaware-ranks-among-most-dangerous-states-for-families/',
      },
      {
        label: 'Statista — Poverty rate in Delaware',
        url: 'https://www.statista.com/statistics/205445/poverty-rate-in-delaware/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  georgia: {
    displayName: 'Georgia',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '317 per 100k',
        note: '-11.3% vs 2022 — estimated from adjacent-year data — no direct figure published',
      },
      {
        title: 'Property crime rate',
        value: '1,740 per 100k',
        note: '+10.8% vs 2022 — estimated from adjacent-year data — no direct figure published',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 317,
      },
      {
        name: 'Property',
        value: 1740,
      },
    ],
    crimeGrowth: 'Violent -11.3% · Property +10.8% (vs 2022)',
    povertyData: [
      {
        name: 'Georgia',
        value: 13.6,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '13.6% poverty rate',
    incomeNote: 'Georgia\'s official poverty rate is about 1.1 points above the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'John Foy Research — Georgia Crime Index (GBI-sourced)',
        url: 'https://www.johnfoy.com/research/the-georgia-crime-index/',
      },
      {
        label: 'Statista — Poverty rate in Georgia',
        url: 'https://statista.com/statistics/205453/poverty-rate-in-georgia',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  hawaii: {
    displayName: 'Hawaii',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '260 per 100k',
        note: '2023 data',
      },
      {
        title: 'Property crime rate',
        value: '2,435 per 100k',
        note: '2023 data',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 260,
      },
      {
        name: 'Property',
        value: 2435,
      },
    ],
    crimeGrowth: '2023 data (year-over-year change not consistently published)',
    povertyData: [
      {
        name: 'Hawaii',
        value: 10.1,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '10.1% poverty rate',
    incomeNote: 'Hawaii\'s official poverty rate is about 2.4 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'USAFacts — Hawaii crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/hawaii/',
      },
      {
        label: 'Statista — Poverty rate in Hawaii',
        url: 'https://www.statista.com/statistics/205456/poverty-rate-in-hawaii/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  idaho: {
    displayName: 'Idaho',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '235 per 100k',
        note: 'estimated from adjacent-year data — no direct figure published',
      },
      {
        title: 'Property crime rate',
        value: '811 per 100k',
        note: 'estimated from adjacent-year data — no direct figure published',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 235,
      },
      {
        name: 'Property',
        value: 811,
      },
    ],
    crimeGrowth: '2023 data (year-over-year change not consistently published)',
    povertyData: [
      {
        name: 'Idaho',
        value: 10.1,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '10.1% poverty rate',
    incomeNote: 'Idaho\'s official poverty rate is about 2.4 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'Statistic2024 — Idaho crime rate statistics',
        url: 'https://statistic2024.com/idaho-crime-rate-statistics/',
      },
      {
        label: 'Statista — Poverty rate in Idaho',
        url: 'https://www.statista.com/statistics/205457/poverty-rate-in-idaho/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  indiana: {
    displayName: 'Indiana',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '332 per 100k',
        note: '+8.5% vs 2022',
      },
      {
        title: 'Property crime rate',
        value: '1,543 per 100k',
        note: 'estimated from adjacent-year data — no direct figure published',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 332,
      },
      {
        name: 'Property',
        value: 1543,
      },
    ],
    crimeGrowth: 'Violent +8.5% (vs 2022)',
    povertyData: [
      {
        name: 'Indiana',
        value: 12.3,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '12.3% poverty rate',
    incomeNote: 'Indiana\'s official poverty rate is about 0.2 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'USAFacts — Indiana crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/indiana/',
      },
      {
        label: 'Statista — Poverty rate in Indiana',
        url: 'https://www.statista.com/statistics/205462/poverty-rate-in-indiana/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  iowa: {
    displayName: 'Iowa',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '243 per 100k',
        note: '-11.1% vs 2022',
      },
      {
        title: 'Property crime rate',
        value: '1,297 per 100k',
        note: '+9.6% vs 2022 — estimated from adjacent-year data — no direct figure published',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 243,
      },
      {
        name: 'Property',
        value: 1297,
      },
    ],
    crimeGrowth: 'Violent -11.1% · Property +9.6% (vs 2022)',
    povertyData: [
      {
        name: 'Iowa',
        value: 11.3,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '11.3% poverty rate',
    incomeNote: 'Iowa\'s official poverty rate is about 1.2 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'USAFacts — Iowa crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/iowa/',
      },
      {
        label: 'Statista — Poverty rate in Iowa',
        url: 'https://www.statista.com/statistics/205465/poverty-rate-in-indiana/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  kansas: {
    displayName: 'Kansas',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '450 per 100k',
        note: '-3.7% vs 2022',
      },
      {
        title: 'Property crime rate',
        value: '2,250 per 100k',
        note: '2023 data',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 450,
      },
      {
        name: 'Property',
        value: 2250,
      },
    ],
    crimeGrowth: 'Violent -3.7% (vs 2022)',
    povertyData: [
      {
        name: 'Kansas',
        value: 11.2,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '11.2% poverty rate',
    incomeNote: 'Kansas\'s official poverty rate is about 1.3 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'Kansas Bureau of Investigation — 2023 Crime Index',
        url: 'https://www.kansas.gov/kbi/stats/docs/pdf/2023%20Crime%20Index.pdf',
      },
      {
        label: 'USAFacts — Kansas crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/kansas/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  kentucky: {
    displayName: 'Kentucky',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '311 per 100k',
        note: '2023 data',
      },
      {
        title: 'Property crime rate',
        value: '2,208 per 100k',
        note: '2023 data',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 311,
      },
      {
        name: 'Property',
        value: 2208,
      },
    ],
    crimeGrowth: '2023 data (year-over-year change not consistently published)',
    povertyData: [
      {
        name: 'Kentucky',
        value: 16.4,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '16.4% poverty rate',
    incomeNote: 'Kentucky\'s official poverty rate is about 3.9 points above the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'USAFacts — Kentucky crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/kentucky/',
      },
      {
        label: 'Kentucky Center for Economic Policy — poverty data',
        url: 'https://kypolicy.org/new-census-data-shows-slight-improvement-in-2024-poverty-and-incomes-in-kentucky-but-recent-federal-budget-law-threatens-to-move-state-backward/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  louisiana: {
    displayName: 'Louisiana',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '562.1 per 100k',
        note: '2023 data',
      },
      {
        title: 'Property crime rate',
        value: '2,630 per 100k',
        note: '2023 data',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 562.07,
      },
      {
        name: 'Property',
        value: 2630,
      },
    ],
    crimeGrowth: '2023 data (year-over-year change not consistently published)',
    povertyData: [
      {
        name: 'Louisiana',
        value: 18.9,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '18.9% poverty rate',
    incomeNote: 'Louisiana\'s official poverty rate is about 6.4 points above the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'FBI UCR via beautifydata — Louisiana violent crime, 2023',
        url: 'https://beautifydata.com/united-states-crimes/fbi-ucr/2023/number-and-rate-of-violent-crimes-per-state/louisiana',
      },
      {
        label: 'USAFacts — Louisiana crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/louisiana/',
      },
      {
        label: 'Statista — Louisiana poverty rate, 2023',
        url: 'https://www.statista.com/statistics/205469/poverty-rate-in-louisiana/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  maine: {
    displayName: 'Maine',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '102 per 100k',
        note: '2023 data',
      },
      {
        title: 'Property crime rate',
        value: '1,717 per 100k',
        note: '2023 data',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 102,
      },
      {
        name: 'Property',
        value: 1717,
      },
    ],
    crimeGrowth: '2023 data (year-over-year change not consistently published)',
    povertyData: [
      {
        name: 'Maine',
        value: 10.4,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '10.4% poverty rate',
    incomeNote: 'Maine\'s official poverty rate is about 2.1 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'Maine DPS — Crime in Maine 2023',
        url: 'https://www.maine.gov/dps/msp/sites/maine.gov.dps.msp/files/inline-files/2023%20Crime%20In%20Maine%20Final_2.pdf',
      },
      {
        label: 'USAFacts — Maine crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/maine/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  maryland: {
    displayName: 'Maryland',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '440.3 per 100k',
        note: '2023 data',
      },
      {
        title: 'Property crime rate',
        value: '2,147 per 100k',
        note: '2023 data',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 440.3,
      },
      {
        name: 'Property',
        value: 2147,
      },
    ],
    crimeGrowth: '2023 data (year-over-year change not consistently published)',
    povertyData: [
      {
        name: 'Maryland',
        value: 9.5,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '9.5% poverty rate',
    incomeNote: 'Maryland\'s official poverty rate is about 3 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'Maryland General Assembly — Violent Crime and Accountability Trends, Jan 2024',
        url: 'https://mgaleg.maryland.gov/meeting_material/2024/jpr%20-%20133505047428207622%20-%20CSG%20Presentation.pdf',
      },
      {
        label: 'USAFacts — Maryland crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/maryland/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  massachusetts: {
    displayName: 'Massachusetts',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '315 per 100k',
        note: '-3.97% vs 2022 Some figures for this state come from conflicting or indirect secondary sources — treat as approximate.',
      },
      {
        title: 'Property crime rate',
        value: '1,112 per 100k',
        note: '2023 data Some figures for this state come from conflicting or indirect secondary sources — treat as approximate.',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 315,
      },
      {
        name: 'Property',
        value: 1112,
      },
    ],
    crimeGrowth: 'Violent -3.97% (vs 2022)',
    povertyData: [
      {
        name: 'Massachusetts',
        value: 10.4,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '10.4% poverty rate',
    incomeNote: 'Massachusetts\'s official poverty rate is about 2.1 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'NBC Boston — FBI crime data context',
        url: 'https://www.nbcboston.com/news/local/putting-the-fbis-latest-crime-data-into-context-in-mass-and-across-u-s/3164367/',
      },
      {
        label: 'USAFacts — Massachusetts crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/massachusetts/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  michigan: {
    displayName: 'Michigan',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '456.3 per 100k',
        note: '2023 data',
      },
      {
        title: 'Property crime rate',
        value: '1,554 per 100k',
        note: '2023 data',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 456.3,
      },
      {
        name: 'Property',
        value: 1554,
      },
    ],
    crimeGrowth: '2023 data (year-over-year change not consistently published)',
    povertyData: [
      {
        name: 'Michigan',
        value: 13.5,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '13.5% poverty rate',
    incomeNote: 'Michigan\'s official poverty rate is about 1 points above the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'Patch/FBI — Michigan crime data',
        url: 'https://patch.com/michigan/across-mi/crime-or-down-michigan-here-s-what-fbi-data-shows',
      },
      {
        label: 'Michigan Center for Data & Analytics — 2023 ACS 1-Year Highlights',
        url: 'https://www.michigan.gov/mcda/insights/2024/10/09/2023-acs-1-year-highlights',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  minnesota: {
    displayName: 'Minnesota',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '261 per 100k',
        note: '-6.9% vs 2022',
      },
      {
        title: 'Property crime rate',
        value: '1,702 per 100k',
        note: '2023 data',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 261,
      },
      {
        name: 'Property',
        value: 1702,
      },
    ],
    crimeGrowth: 'Violent -6.9% (vs 2022)',
    povertyData: [
      {
        name: 'Minnesota',
        value: 9.3,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '9.3% poverty rate',
    incomeNote: 'Minnesota\'s official poverty rate is about 3.2 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'CBS News — MN BCA 2023 crime data',
        url: 'https://www.cbsnews.com/minnesota/news/violent-crime-data-2023-minnesota-bureau-of-criminal-apprehension',
      },
      {
        label: 'MN DEED — Income & Poverty data',
        url: 'https://mn.gov/deed/newscenter/publications/trends/december-2024/poverty.jsp',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  mississippi: {
    displayName: 'Mississippi',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '210.5 per 100k',
        note: '-17% vs 2022',
      },
      {
        title: 'Property crime rate',
        value: '1,196 per 100k',
        note: 'estimated from adjacent-year data — no direct figure published',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 210.5,
      },
      {
        name: 'Property',
        value: 1196,
      },
    ],
    crimeGrowth: 'Violent -17% (vs 2022)',
    povertyData: [
      {
        name: 'Mississippi',
        value: 14.3,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '14.3% poverty rate',
    incomeNote: 'Mississippi\'s official poverty rate is about 1.8 points above the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'USAFacts — Mississippi crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/mississippi/',
      },
      {
        label: 'USAFacts — Mississippi poverty rate',
        url: 'https://usafacts.org/answers/what-is-the-us-poverty-rate/state/mississippi/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  missouri: {
    displayName: 'Missouri',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '462 per 100k',
        note: '2023 data',
      },
      {
        title: 'Property crime rate',
        value: '2,095 per 100k',
        note: '-10.5% recent trend',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 462,
      },
      {
        name: 'Property',
        value: 2095,
      },
    ],
    crimeGrowth: 'Property -10.5% (recent trend)',
    povertyData: [
      {
        name: 'Missouri',
        value: 12,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '12% poverty rate',
    incomeNote: 'Missouri\'s official poverty rate is about 0.5 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'USAFacts — Missouri crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/missouri/',
      },
      {
        label: 'Census Bureau QuickFacts — Missouri',
        url: 'https://www.census.gov/quickfacts/fact/table/MO/PST045223',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  montana: {
    displayName: 'Montana',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '424 per 100k',
        note: '+5.8% vs 2022',
      },
      {
        title: 'Property crime rate',
        value: '1,834 per 100k',
        note: '-4.4% vs 2022',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 424,
      },
      {
        name: 'Property',
        value: 1834,
      },
    ],
    crimeGrowth: 'Violent +5.8% · Property -4.4% (vs 2022)',
    povertyData: [
      {
        name: 'Montana',
        value: 7.1,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '7.1% poverty rate',
    incomeNote: 'Montana\'s official poverty rate is about 5.4 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'USAFacts — Montana crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/montana/',
      },
      {
        label: 'FRED (Census ACS) — Montana poverty rate 2023',
        url: 'https://fred.stlouisfed.org/series/PE0T4MT30000A647NCEN',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  nebraska: {
    displayName: 'Nebraska',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '156.1 per 100k',
        note: '+17.9% vs 2022 — estimated from adjacent-year data — no direct figure published Some figures for this state come from conflicting or indirect secondary sources — treat as approximate.',
      },
      {
        title: 'Property crime rate',
        value: '1,550 per 100k',
        note: '2023 data Some figures for this state come from conflicting or indirect secondary sources — treat as approximate.',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 156.1,
      },
      {
        name: 'Property',
        value: 1550,
      },
    ],
    crimeGrowth: 'Violent +17.9% (vs 2022)',
    povertyData: [
      {
        name: 'Nebraska',
        value: 10.5,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '10.5% poverty rate',
    incomeNote: 'Nebraska\'s official poverty rate is about 2 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'Nebraska Crime Commission — 2023 Crime in Nebraska Report',
        url: 'https://ncc.nebraska.gov/sites/default/files/doc/2023%20Crime%20in%20Nebraska%20Report.pdf',
      },
      {
        label: 'Statista — Nebraska poverty rate',
        url: 'https://www.statista.com/statistics/205485/poverty-rate-in-nebraska/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  nevada: {
    displayName: 'Nevada',
    lastUpdated: '2024 crime data (FBI/state agency) · 2023 poverty (U.S. Census)',
    verified: true,
    dataYear: 2024,
    povertyDataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '402 per 100k',
        note: '-7.3% vs 2023',
      },
      {
        title: 'Property crime rate',
        value: '2,197 per 100k',
        note: '+13.5% vs 2023',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 402,
      },
      {
        name: 'Property',
        value: 2197,
      },
    ],
    crimeGrowth: 'Violent -7.3% · Property +13.5% (vs 2023)',
    povertyData: [
      {
        name: 'Nevada',
        value: 12,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '12% poverty rate',
    incomeNote: 'Nevada\'s official poverty rate is about 0.5 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'USAFacts — Nevada crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/nevada/',
      },
      {
        label: 'Statista — Nevada poverty rate, 2023',
        url: 'https://www.statista.com/statistics/205487/poverty-rate-in-nevada/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  'new hampshire': {
    displayName: 'New Hampshire',
    lastUpdated: '2024 crime data (FBI/state agency) · 2023 poverty (U.S. Census)',
    verified: true,
    dataYear: 2024,
    povertyDataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '110 per 100k',
        note: '-4.3% vs 2023',
      },
      {
        title: 'Property crime rate',
        value: '918 per 100k',
        note: '-0.66% vs 2023',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 110,
      },
      {
        name: 'Property',
        value: 918,
      },
    ],
    crimeGrowth: 'Violent -4.3% · Property -0.66% (vs 2023)',
    povertyData: [
      {
        name: 'New Hampshire',
        value: 7.2,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '7.2% poverty rate',
    incomeNote: 'New Hampshire\'s official poverty rate is about 5.3 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'USAFacts — New Hampshire crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/new-hampshire/',
      },
      {
        label: 'NH Fiscal Policy Institute, 2023',
        url: 'https://nhfpi.org/blog/new-hampshires-median-household-income-increased-in-2023-poverty-remained-steady/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  'new jersey': {
    displayName: 'New Jersey',
    lastUpdated: '2024 crime data (FBI/state agency) · 2023 poverty (U.S. Census)',
    verified: true,
    dataYear: 2024,
    povertyDataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '218 per 100k',
        note: '-3.4% vs 2023',
      },
      {
        title: 'Property crime rate',
        value: '1,427 per 100k',
        note: '-6.6% vs 2023',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 218,
      },
      {
        name: 'Property',
        value: 1427,
      },
    ],
    crimeGrowth: 'Violent -3.4% · Property -6.6% (vs 2023)',
    povertyData: [
      {
        name: 'New Jersey',
        value: 9.7,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '9.7% poverty rate',
    incomeNote: 'New Jersey\'s official poverty rate is about 2.8 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'USAFacts — New Jersey crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/new-jersey/',
      },
      {
        label: 'USAFacts — New Jersey poverty rate',
        url: 'https://usafacts.org/answers/what-is-the-us-poverty-rate/state/new-jersey/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  'new mexico': {
    displayName: 'New Mexico',
    lastUpdated: '2024 crime data (FBI/state agency) · 2023 poverty (U.S. Census)',
    verified: true,
    dataYear: 2024,
    povertyDataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '717 per 100k',
        note: '-4% vs 2023',
      },
      {
        title: 'Property crime rate',
        value: '2,751 per 100k',
        note: '-4.3% vs 2023',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 717,
      },
      {
        name: 'Property',
        value: 2751,
      },
    ],
    crimeGrowth: 'Violent -4% · Property -4.3% (vs 2023)',
    povertyData: [
      {
        name: 'New Mexico',
        value: 17.8,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '17.8% poverty rate',
    incomeNote: 'New Mexico\'s official poverty rate is about 5.3 points above the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'USAFacts — New Mexico crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/new-mexico/',
      },
      {
        label: 'NM Dept. of Workforce Solutions, 2023',
        url: 'https://www.dws.nm.gov/Portals/0/DM/LMI/Poverty_in_NM_2023.pdf',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  florida: {
    displayName: 'Florida',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '150.7 per 100k',
        note: '2023 data (FDLE data — methodology differs from FBI/other states, not directly comparable)',
      },
      {
        title: 'Property crime rate',
        value: '1,516 per 100k',
        note: '2023 data (FDLE data — methodology differs from FBI/other states, not directly comparable)',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 150.7,
      },
      {
        name: 'Property',
        value: 1516,
      },
    ],
    crimeGrowth: '2023 data (year-over-year change not consistently published)',
    povertyData: [
      {
        name: 'Florida',
        value: 12.3,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '12.3% poverty rate',
    incomeNote: 'Florida\'s official poverty rate is about 0.2 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'FDLE — Property Crimes',
        url: 'https://www.fdle.state.fl.us/cjab/ucr/individual-crime/offenses/property',
      },
      {
        label: 'Florida poverty rate, 2023',
        url: 'https://www.statista.com/statistics/205451/poverty-rate-in-florida/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  illinois: {
    displayName: 'Illinois',
    lastUpdated: '2024 crime data (FBI/state agency) · 2023 poverty (U.S. Census)',
    verified: true,
    dataYear: 2024,
    povertyDataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '289 per 100k',
        note: '-6.3% vs 2023',
      },
      {
        title: 'Property crime rate',
        value: '1,715 per 100k',
        note: '+0.54% vs 2023',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 289,
      },
      {
        name: 'Property',
        value: 1715,
      },
    ],
    crimeGrowth: 'Violent -6.3% · Property +0.54% (vs 2023)',
    povertyData: [
      {
        name: 'Illinois',
        value: 11.6,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '11.6% poverty rate',
    incomeNote: 'Illinois\'s official poverty rate is about 0.9 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'USAFacts — Illinois crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/illinois/',
      },
      {
        label: 'Statista — Illinois poverty rate, 2023',
        url: 'https://www.statista.com/statistics/205459/poverty-rate-in-illinois',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  'new york': {
    displayName: 'New York',
    lastUpdated: '2024 crime data (FBI/state agency) · 2023 poverty (U.S. Census)',
    verified: true,
    dataYear: 2024,
    povertyDataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '380 per 100k',
        note: '-2.8% vs 2023',
      },
      {
        title: 'Property crime rate',
        value: '1,720 per 100k',
        note: '+4.6% vs 2023',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 380,
      },
      {
        name: 'Property',
        value: 1720,
      },
    ],
    crimeGrowth: 'Violent -2.8% · Property +4.6% (vs 2023)',
    povertyData: [
      {
        name: 'New York',
        value: 14.2,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '14.2% poverty rate',
    incomeNote: 'New York\'s official poverty rate is about 1.7 points above the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'USAFacts — New York crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/new-york/',
      },
      {
        label: 'CSS of New York, 2023',
        url: 'https://www.cssny.org/news/entry/latest-census-data-shows-poverty-remains-stubbornly-high-in-new-york-city-analysis',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  'north carolina': {
    displayName: 'North Carolina',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '391 per 100k',
        note: '-0.1% vs 2022',
      },
      {
        title: 'Property crime rate',
        value: '2,065 per 100k',
        note: '+2.8% vs 2022',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 391,
      },
      {
        name: 'Property',
        value: 2065,
      },
    ],
    crimeGrowth: 'Violent -0.1% · Property +2.8% (vs 2022)',
    povertyData: [
      {
        name: 'North Carolina',
        value: 13.4,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '13.4% poverty rate',
    incomeNote: 'North Carolina\'s official poverty rate is about 0.9 points above the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'NC SBI — Crime in North Carolina 2023 Annual Summary',
        url: 'https://www.ncsbi.gov/Services/Crime-Statistics/Crime-in-North-Carolina-Annual-Summaries/2023-Annual-Summary.aspx',
      },
      {
        label: 'World Population Review — Poverty Rate by State',
        url: 'https://worldpopulationreview.com/state-rankings/poverty-rate-by-state',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  'north dakota': {
    displayName: 'North Dakota',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '267.4 per 100k',
        note: '2023 data',
      },
      {
        title: 'Property crime rate',
        value: '1,941 per 100k',
        note: '2023 data',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 267.4,
      },
      {
        name: 'Property',
        value: 1941,
      },
    ],
    crimeGrowth: '2023 data (year-over-year change not consistently published)',
    povertyData: [
      {
        name: 'North Dakota',
        value: 11.1,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '11.1% poverty rate',
    incomeNote: 'North Dakota\'s official poverty rate is about 1.4 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'ND Attorney General — 2023 Crime Report',
        url: 'https://attorneygeneral.nd.gov/wp-content/uploads/2024/06/2023-CrimeReport.pdf',
      },
      {
        label: 'World Population Review — Poverty Rate by State',
        url: 'https://worldpopulationreview.com/state-rankings/poverty-rate-by-state',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  ohio: {
    displayName: 'Ohio',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '287 per 100k',
        note: '2023 data',
      },
      {
        title: 'Property crime rate',
        value: '1,395 per 100k',
        note: '+11.2% 2023→2024 — estimated from adjacent-year data — no direct figure published',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 287,
      },
      {
        name: 'Property',
        value: 1395,
      },
    ],
    crimeGrowth: 'Property +11.2% (2023→2024)',
    povertyData: [
      {
        name: 'Ohio',
        value: 13.4,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '13.4% poverty rate',
    incomeNote: 'Ohio\'s official poverty rate is about 0.9 points above the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'USAFacts — Ohio crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/ohio/',
      },
      {
        label: 'Ohio LSC — Violent and Property Crime Rates',
        url: 'https://www.lsc.ohio.gov/assets/organizations/legislative-service-commission/files/current-ohio-facts-violent-and-property-crime-rates-july-2024.pdf',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  oklahoma: {
    displayName: 'Oklahoma',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '418.2 per 100k',
        note: '-1.4% vs 2022',
      },
      {
        title: 'Property crime rate',
        value: '2,149 per 100k',
        note: '-7.9% vs 2022',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 418.22,
      },
      {
        name: 'Property',
        value: 2149,
      },
    ],
    crimeGrowth: 'Violent -1.4% · Property -7.9% (vs 2022)',
    povertyData: [
      {
        name: 'Oklahoma',
        value: 15.6,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '15.6% poverty rate',
    incomeNote: 'Oklahoma\'s official poverty rate is about 3.1 points above the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'FBI UCR via beautifydata — Oklahoma violent crime, 2023',
        url: 'https://www.beautifydata.com/united-states-crimes/fbi-ucr/2023/number-and-rate-of-violent-crimes-per-state/oklahoma',
      },
      {
        label: 'World Population Review — Poverty Rate by State',
        url: 'https://worldpopulationreview.com/state-rankings/poverty-rate-by-state',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  oregon: {
    displayName: 'Oregon',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '326.3 per 100k',
        note: '-4.7% vs 2022',
      },
      {
        title: 'Property crime rate',
        value: '2,590.7 per 100k',
        note: '-11.7% vs 2022',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 326.3,
      },
      {
        name: 'Property',
        value: 2590.7,
      },
    ],
    crimeGrowth: 'Violent -4.7% · Property -11.7% (vs 2022)',
    povertyData: [
      {
        name: 'Oregon',
        value: 12.2,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '12.2% poverty rate',
    incomeNote: 'Oregon\'s official poverty rate is about 0.3 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'Oregon CJC — 2023 Oregon Uniform Crime Report',
        url: 'https://www.oregon.gov/cjc/CJC%20Document%20Library/2023%20Preliminary%20Oregon%20Uniform%20Crime%20Report.pdf',
      },
      {
        label: 'World Population Review — Poverty Rate by State',
        url: 'https://worldpopulationreview.com/state-rankings/poverty-rate-by-state',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  pennsylvania: {
    displayName: 'Pennsylvania',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '301 per 100k',
        note: '+7.6% see note — estimated from adjacent-year data — no direct figure published Some figures for this state come from conflicting or indirect secondary sources — treat as approximate.',
      },
      {
        title: 'Property crime rate',
        value: '1,565 per 100k',
        note: '-8.3% see note — estimated from adjacent-year data — no direct figure published Some figures for this state come from conflicting or indirect secondary sources — treat as approximate.',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 301,
      },
      {
        name: 'Property',
        value: 1565,
      },
    ],
    crimeGrowth: 'Violent +7.6% · Property -8.3% (see note)',
    povertyData: [
      {
        name: 'Pennsylvania',
        value: 12.1,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '12.1% poverty rate',
    incomeNote: 'Pennsylvania\'s official poverty rate is about 0.4 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'Axios Philadelphia — Pennsylvania violent crime rate declines',
        url: 'https://www.axios.com/local/philadelphia/2023/11/06/pennsylvania-violent-crime-rate-declines',
      },
      {
        label: 'USAFacts — Pennsylvania crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/pennsylvania/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  'rhode island': {
    displayName: 'Rhode Island',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '154 per 100k',
        note: '+10.37% vs 2022',
      },
      {
        title: 'Property crime rate',
        value: '1,032.4 per 100k',
        note: '2023 data',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 154,
      },
      {
        name: 'Property',
        value: 1032.4,
      },
    ],
    crimeGrowth: 'Violent +10.37% (vs 2022)',
    povertyData: [
      {
        name: 'Rhode Island',
        value: 10.8,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '10.8% poverty rate',
    incomeNote: 'Rhode Island\'s official poverty rate is about 1.7 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'USAFacts — Rhode Island crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/rhode-island/',
      },
      {
        label: 'Statista — Rhode Island poverty rate',
        url: 'https://www.statista.com/statistics/205693/poverty-rate-in-rhode-island',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  'south carolina': {
    displayName: 'South Carolina',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '437 per 100k',
        note: '-5.8% vs 2022',
      },
      {
        title: 'Property crime rate',
        value: '1,762 per 100k',
        note: 'estimated from adjacent-year data — no direct figure published',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 437,
      },
      {
        name: 'Property',
        value: 1762,
      },
    ],
    crimeGrowth: 'Violent -5.8% (vs 2022)',
    povertyData: [
      {
        name: 'South Carolina',
        value: 13.9,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '13.9% poverty rate',
    incomeNote: 'South Carolina\'s official poverty rate is about 1.4 points above the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'SC SLED — 2023 Crime in South Carolina',
        url: 'https://www.sled.sc.gov/forms/statistics/2023%20-%20Crime%20in%20South%20Carolina%20(101524).pdf',
      },
      {
        label: 'USAFacts — South Carolina crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/south-carolina/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  'south dakota': {
    displayName: 'South Dakota',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '350 per 100k',
        note: '2023 data',
      },
      {
        title: 'Property crime rate',
        value: '1,550 per 100k',
        note: '+2.3% 2023→2024 — estimated from adjacent-year data — no direct figure published',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 350,
      },
      {
        name: 'Property',
        value: 1550,
      },
    ],
    crimeGrowth: 'Property +2.3% (2023→2024)',
    povertyData: [
      {
        name: 'South Dakota',
        value: 11.8,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '11.8% poverty rate',
    incomeNote: 'South Dakota\'s official poverty rate is about 0.7 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'SD NIBRS — Crime in South Dakota 2023',
        url: 'https://sdcrime.nibrs.com/Publication/Archived/-2.Crime%20in%20South%20Dakota%202023.pdf',
      },
      {
        label: 'USAFacts — South Dakota crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/south-dakota/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  tennessee: {
    displayName: 'Tennessee',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '628 per 100k',
        note: '2023 data',
      },
      {
        title: 'Property crime rate',
        value: '2,360 per 100k',
        note: '+2.6% vs 2022',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 628,
      },
      {
        name: 'Property',
        value: 2360,
      },
    ],
    crimeGrowth: 'Property +2.6% (vs 2022)',
    povertyData: [
      {
        name: 'Tennessee',
        value: 14,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '14% poverty rate',
    incomeNote: 'Tennessee\'s official poverty rate is about 1.5 points above the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'TBI — Crime Insight, Violent Crime 2023 Tennessee',
        url: 'https://crimeinsight.tbi.tn.gov/tops/report/violent-crimes/tennessee/2023/pdf',
      },
      {
        label: 'Sycamore Institute — 2023 Census Data on Income & Poverty in TN',
        url: 'https://sycamoretn.org/2023-income-poverty-tn/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  texas: {
    displayName: 'Texas',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '406 per 100k',
        note: '-6% vs 2022',
      },
      {
        title: 'Property crime rate',
        value: '2,358 per 100k',
        note: '-2.7% vs 2022 — estimated from adjacent-year data — no direct figure published',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 406,
      },
      {
        name: 'Property',
        value: 2358,
      },
    ],
    crimeGrowth: 'Violent -6% · Property -2.7% (vs 2022)',
    povertyData: [
      {
        name: 'Texas',
        value: 13.7,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '13.7% poverty rate',
    incomeNote: 'Texas\'s official poverty rate is about 1.2 points above the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'USAFacts — Texas crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/texas/',
      },
      {
        label: 'Texas poverty rate, 2023',
        url: 'https://www.statista.com/statistics/314935/poverty-rate-in-texas',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  utah: {
    displayName: 'Utah',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '232 per 100k',
        note: '2023 data',
      },
      {
        title: 'Property crime rate',
        value: '1,631 per 100k',
        note: '-14% vs 2022',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 232,
      },
      {
        name: 'Property',
        value: 1631,
      },
    ],
    crimeGrowth: 'Property -14% (vs 2022)',
    povertyData: [
      {
        name: 'Utah',
        value: 9.5,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '9.5% poverty rate',
    incomeNote: 'Utah\'s official poverty rate is about 3 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'Utah CCJJ — Update on Utah\'s Crime Rates Since 2020 Spike',
        url: 'https://justice.utah.gov/wp-content/uploads/CCJJ-Issue-Brief-2023-Crime-Rates-Update-Since-2020-Crime-Spike.pdf',
      },
      {
        label: 'USAFacts — Utah poverty rate',
        url: 'https://usafacts.org/answers/what-is-the-us-poverty-rate/state/utah/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  vermont: {
    displayName: 'Vermont',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '210.4 per 100k',
        note: '2023 data',
      },
      {
        title: 'Property crime rate',
        value: '1,793.9 per 100k',
        note: '2023 data',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 210.4,
      },
      {
        name: 'Property',
        value: 1793.9,
      },
    ],
    crimeGrowth: '2023 data (year-over-year change not consistently published)',
    povertyData: [
      {
        name: 'Vermont',
        value: 9.7,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '9.7% poverty rate',
    incomeNote: 'Vermont\'s official poverty rate is about 2.8 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'FBI UCR via beautifydata — Vermont violent & property crime, 2023',
        url: 'https://beautifydata.com/united-states-crimes/fbi-ucr/2023/total-violent-and-property-crimes-per-state/vermont',
      },
      {
        label: 'USAFacts — Vermont crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/vermont/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  virginia: {
    displayName: 'Virginia',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '241.6 per 100k',
        note: '2023 data',
      },
      {
        title: 'Property crime rate',
        value: '1,670 per 100k',
        note: '2023 data',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 241.6,
      },
      {
        name: 'Property',
        value: 1670,
      },
    ],
    crimeGrowth: '2023 data (year-over-year change not consistently published)',
    povertyData: [
      {
        name: 'Virginia',
        value: 10.2,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '10.2% poverty rate',
    incomeNote: 'Virginia\'s official poverty rate is about 2.3 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'USAFacts — Virginia crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/virginia/',
      },
      {
        label: 'USAFacts — Virginia poverty rate',
        url: 'https://usafacts.org/answers/what-is-the-us-poverty-rate/state/virginia/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  washington: {
    displayName: 'Washington',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '311.5 per 100k',
        note: '-5.5% vs 2022',
      },
      {
        title: 'Property crime rate',
        value: '2,946.2 per 100k',
        note: '-11.9% vs 2022',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 311.5,
      },
      {
        name: 'Property',
        value: 2946.2,
      },
    ],
    crimeGrowth: 'Violent -5.5% · Property -11.9% (vs 2022)',
    povertyData: [
      {
        name: 'Washington',
        value: 10.3,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '10.3% poverty rate',
    incomeNote: 'Washington\'s official poverty rate is about 2.2 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'Lynnwood Times — 2023 Washington crime rates',
        url: 'https://lynnwoodtimes.com/2024/07/09/washington-crime-240709/',
      },
      {
        label: 'USAFacts — Washington poverty rate',
        url: 'https://usafacts.org/answers/what-is-the-us-poverty-rate/state/washington-state/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  'west virginia': {
    displayName: 'West Virginia',
    lastUpdated: '2024 crime data (FBI/state agency) · 2023 poverty (U.S. Census)',
    verified: true,
    dataYear: 2024,
    povertyDataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '249 per 100k',
        note: '2024 data Some figures for this state come from conflicting or indirect secondary sources — treat as approximate.',
      },
      {
        title: 'Property crime rate',
        value: '1,162 per 100k',
        note: '2024 data Some figures for this state come from conflicting or indirect secondary sources — treat as approximate.',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 249,
      },
      {
        name: 'Property',
        value: 1162,
      },
    ],
    crimeGrowth: '2024 data (year-over-year change not consistently published)',
    povertyData: [
      {
        name: 'West Virginia',
        value: 16.7,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '16.7% poverty rate',
    incomeNote: 'West Virginia\'s official poverty rate is about 4.2 points above the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'USAFacts — West Virginia crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/west-virginia/',
      },
      {
        label: 'WV Center on Budget & Policy — 2023 poverty',
        url: 'https://wvpolicy.org/poverty-in-west-virginia-fell-in-2023-but-remains-stubbornly-high-for-children-and-families/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  wisconsin: {
    displayName: 'Wisconsin',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '298 per 100k',
        note: '-6.5% 2023→2024 — estimated from adjacent-year data — no direct figure published',
      },
      {
        title: 'Property crime rate',
        value: '1,082 per 100k',
        note: '+6.7% 2023→2024 — estimated from adjacent-year data — no direct figure published',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 298,
      },
      {
        name: 'Property',
        value: 1082,
      },
    ],
    crimeGrowth: 'Violent -6.5% · Property +6.7% (2023→2024)',
    povertyData: [
      {
        name: 'Wisconsin',
        value: 10.7,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '10.7% poverty rate',
    incomeNote: 'Wisconsin\'s official poverty rate is about 1.8 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'USAFacts — Wisconsin crime rate',
        url: 'https://usafacts.org/answers/what-is-the-crime-rate-in-the-us/state/wisconsin/',
      },
      {
        label: 'USAFacts — Wisconsin poverty rate',
        url: 'https://usafacts.org/answers/what-is-the-us-poverty-rate/state/wisconsin/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
  wyoming: {
    displayName: 'Wyoming',
    lastUpdated: '2023 data (FBI / state agency / U.S. Census)',
    verified: true,
    dataYear: 2023,
    crimeMeta: [
      {
        title: 'Violent crime rate',
        value: '201.9 per 100k',
        note: '-5.3% vs 2022',
      },
      {
        title: 'Property crime rate',
        value: '1,469.9 per 100k',
        note: '-10.2% vs 2022',
      },
    ],
    crimeData: [
      {
        name: 'Violent',
        value: 201.9,
      },
      {
        name: 'Property',
        value: 1469.9,
      },
    ],
    crimeGrowth: 'Violent -5.3% · Property -10.2% (vs 2022)',
    povertyData: [
      {
        name: 'Wyoming',
        value: 11.3,
      },
      {
        name: 'National average',
        value: 12.5,
      },
    ],
    incomeHeadline: '11.3% poverty rate',
    incomeNote: 'Wyoming\'s official poverty rate is about 1.2 points below the national average of 12.5% (2023, U.S. Census Bureau, ACS 1-year). Poverty rate correlates with higher property crime rates in national criminological research, but is one of many contributing factors, not a direct cause.',
    sources: [
      {
        label: 'Wyoming official crime statistics (WY DCI)',
        url: 'https://crimestats.wyo.gov/tops/report/violent-crimes/wyoming/2023',
      },
      {
        label: 'USAFacts — Wyoming poverty rate',
        url: 'https://usafacts.org/answers/what-is-the-us-poverty-rate/state/wyoming/',
      },
      {
        label: 'U.S. Census Bureau — Poverty in States and Metropolitan Areas: 2023',
        url: 'https://www.census.gov/library/publications/2024/acs/acsbr-022.html',
      },
    ],
  },
};

const stateSlugs = Object.keys(stateData);
const stateNames = stateSlugs.map((slug) => stateData[slug].displayName).sort((a, b) => a.localeCompare(b));

export { normalizeStateName, stateSlugs, stateNames };
export default stateData;
