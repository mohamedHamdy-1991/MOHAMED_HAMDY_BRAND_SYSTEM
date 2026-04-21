// HAMDY brand data — pillars, topics, templates, accents

const ACCENTS = [
  { id: 'AC1', name: 'Burnt Orange', hex: '#EB5A2A', rgb: '235,90,42', mood: 'Urgent, heat-related', cssVar: '--accent-orange' },
  { id: 'AC2', name: 'Soft Peach',   hex: '#F5B59A', rgb: '245,181,154', mood: 'Approachable, human', cssVar: '--accent-peach' },
  { id: 'AC3', name: 'Warm Sand',    hex: '#E2C9A8', rgb: '226,201,168', mood: 'Grounded, earthy', cssVar: '--accent-sand' },
  { id: 'AC4', name: 'Deep Forest',  hex: '#2D5016', rgb: '45,80,22', mood: 'Growth, green infra', cssVar: '--accent-green' },
  { id: 'AC5', name: 'Deep Cobalt',  hex: '#1B3A6B', rgb: '27,58,107', mood: 'Data, BIM, AI', cssVar: '--accent-cobalt' },
  { id: 'AC6', name: 'Rust / Terracotta', hex: '#C0522A', rgb: '192,82,42', mood: 'Materiality, carbon', cssVar: '--accent-rust' },
  { id: 'AC7', name: 'Muted Slate',  hex: '#4A5568', rgb: '74,85,104', mood: 'Architecture history', cssVar: '--accent-slate' }
];

const PILLARS = [
  { id: 'P1', name: 'Urban Heat Crisis', color: '#EB5A2A', cadence: '2×/week', platforms: 'IG + LinkedIn', topics: 'T01–T09', desc: 'UHI, TM59 failures, Part O, UKCP18, overheating in UK flats.' },
  { id: 'P2', name: 'Embodied Carbon & Materials', color: '#C0522A', cadence: '1×/week', platforms: 'LinkedIn + IG', topics: 'T10–T16', desc: 'Whole-life carbon, concrete vs timber, RIBA 2030, retrofit vs rebuild.' },
  { id: 'P3', name: 'Green Infrastructure', color: '#2D5016', cadence: '1×/week', platforms: 'IG + YouTube', topics: 'T17–T23', desc: 'Green roofs, street trees, living walls, evapotranspiration, BNG.' },
  { id: 'P4', name: 'Data, GIS & Spatial Analysis', color: '#1B3A6B', cadence: '1×/week', platforms: 'LI + IG + YT', topics: 'T24–T30', desc: 'EPC mapping, LST thermal imagery, heat risk GIS, Python workflows.' },
  { id: 'P5', name: 'Architecture History & AI', color: '#4A5568', cadence: '2×/week', platforms: 'IG + LI + YT', topics: 'T31–T42', desc: 'History, theory, BIM, digital twins, generative AI, parametric design.' },
  { id: 'P6', name: 'Building Simulation & Tools', color: '#E2C9A8', cadence: '1×/week', platforms: 'LI + YouTube', topics: 'T43–T48', desc: 'EnergyPlus, IES-VE, DesignBuilder, ML energy, performance gap.' },
  { id: 'P7', name: 'Renter Rights & Housing Quality', color: '#F5B59A', cadence: '1×/week', platforms: 'IG + TikTok', topics: 'T49–T55', desc: 'Thermal comfort rights, cold/hot homes, EPC C targets, tenant advocacy.' }
];

const TOPICS = [
  // P1
  { id:'T01', pillar:'P1', label:'UHI in Leeds — mapping Landsat LST across postcodes' },
  { id:'T02', pillar:'P1', label:'Why TM59 fails 1960s concrete flats' },
  { id:'T03', pillar:'P1', label:'Part O compliance in practice' },
  { id:'T04', pillar:'P1', label:'UKCP18 future weather files — what they say' },
  { id:'T05', pillar:'P1', label:'Overheating risk maps — who is most exposed' },
  { id:'T06', pillar:'P1', label:'Night-time cooling: why flats can\'t shed heat' },
  { id:'T07', pillar:'P1', label:'Adaptive thermal comfort vs fixed thresholds' },
  { id:'T08', pillar:'P1', label:'Glazing ratios and summer overheating' },
  { id:'T09', pillar:'P1', label:'Heat-related mortality — the 2022 benchmark' },
  // P2
  { id:'T10', pillar:'P2', label:'Embodied vs operational carbon explained' },
  { id:'T11', pillar:'P2', label:'Concrete, steel, timber — a1–a3 comparison' },
  { id:'T12', pillar:'P2', label:'RIBA 2030 Climate Challenge targets' },
  { id:'T13', pillar:'P2', label:'Retrofit vs rebuild — carbon break-even' },
  { id:'T14', pillar:'P2', label:'PAS 2035 retrofit coordination' },
  { id:'T15', pillar:'P2', label:'CLT myths and realities' },
  { id:'T16', pillar:'P2', label:'Cement\'s 8% — why it matters for housing' },
  // P3
  { id:'T17', pillar:'P3', label:'Green roofs — cooling coefficient breakdown' },
  { id:'T18', pillar:'P3', label:'Street trees as passive cooling infrastructure' },
  { id:'T19', pillar:'P3', label:'Living walls — performance claims vs reality' },
  { id:'T20', pillar:'P3', label:'Evapotranspiration cooling explained' },
  { id:'T21', pillar:'P3', label:'Biodiversity Net Gain for building projects' },
  { id:'T22', pillar:'P3', label:'SuDS and urban flood-cool co-benefits' },
  { id:'T23', pillar:'P3', label:'Equitable green-space access in Leeds LSOAs' },
  // P4
  { id:'T24', pillar:'P4', label:'EPC database — mapping 50,000 Leeds records' },
  { id:'T25', pillar:'P4', label:'Landsat LST workflow in QGIS' },
  { id:'T26', pillar:'P4', label:'Heat vulnerability index — what goes in' },
  { id:'T27', pillar:'P4', label:'Python pandas for EPC preprocessing' },
  { id:'T28', pillar:'P4', label:'Green space access by tenure — LSOA analysis' },
  { id:'T29', pillar:'P4', label:'Spatial joins 101 — ArcGIS vs QGIS' },
  { id:'T30', pillar:'P4', label:'Building typology maps from OS MasterMap' },
  // P5
  { id:'T31', pillar:'P5', label:'How AI is changing building design right now' },
  { id:'T32', pillar:'P5', label:'BIM in 2026 — beyond clash detection' },
  { id:'T33', pillar:'P5', label:'Digital twins — hype vs practice' },
  { id:'T34', pillar:'P5', label:'Generative design for building massing' },
  { id:'T35', pillar:'P5', label:'Parametric design — when it helps, when it doesn\'t' },
  { id:'T36', pillar:'P5', label:'AI for energy prediction — the performance gap' },
  { id:'T37', pillar:'P5', label:'Smart buildings — sensors vs intelligence' },
  { id:'T38', pillar:'P5', label:'Computational design primer' },
  { id:'T39', pillar:'P5', label:'Reyner Banham and the well-tempered environment' },
  { id:'T40', pillar:'P5', label:'Ada Lovelace Institute on AI in the built environment' },
  { id:'T41', pillar:'P5', label:'Brutalism revisited — thermal performance audit' },
  { id:'T42', pillar:'P5', label:'Post-occupancy evaluation — why nobody does it' },
  // P6
  { id:'T43', pillar:'P6', label:'EnergyPlus — when to use it, when not to' },
  { id:'T44', pillar:'P6', label:'IES-VE vs DesignBuilder — a field comparison' },
  { id:'T45', pillar:'P6', label:'CIBSE TM54 in practice' },
  { id:'T46', pillar:'P6', label:'ML surrogates for building simulation' },
  { id:'T47', pillar:'P6', label:'The performance gap — 5 root causes' },
  { id:'T48', pillar:'P6', label:'Calibrating a simulation against real meter data' },
  // P7
  { id:'T49', pillar:'P7', label:'Thermal comfort rights in rented UK homes' },
  { id:'T50', pillar:'P7', label:'Cold homes data — excess winter deaths' },
  { id:'T51', pillar:'P7', label:'EPC C by 2028 — what landlords are hiding' },
  { id:'T52', pillar:'P7', label:'Housing quality by tenure — the data' },
  { id:'T53', pillar:'P7', label:'Heatwave advice if you rent' },
  { id:'T54', pillar:'P7', label:'Damp and mould — the legal picture' },
  { id:'T55', pillar:'P7', label:'Awaab\'s Law — what it changes' }
];

const CAROUSEL_TYPES = {
  A: { name:'Case Study',       slides: ['Cover','Problem','Evidence','Analysis','Data Chart','Conclusion','CTA'] },
  B: { name:'Tutorial',         slides: ['Cover','Intro','Step 1','Step 2','Step 3','Step 4','Step 5','Summary / CTA'] },
  C: { name:'Explainer',        slides: ['Cover','Context','Point 1','Point 2','Point 3','Illustration','Example','CTA'] },
  D: { name:'Research Findings',slides: ['Cover','Hypothesis','Methodology','Chart 1','Chart 2','Finding','What it means','CTA'] },
  E: { name:'Tool Walkthrough', slides: ['Cover','What it is','Why it matters','Screenshot 1','Screenshot 2','Pro tip','CTA'] },
  F: { name:'Comparison',       slides: ['Cover','Option A','Option B','Side-by-side','Verdict','CTA'] },
  G: { name:'Roundup / List',   slides: ['Cover','Item 1','Item 2','Item 3','Item 4','Item 5','CTA'] },
  H: { name:'Narrative',        slides: ['Cover','Hook','Beat 1','Beat 2','Beat 3','Beat 4','Resolution','CTA'] }
};

const POST_TYPES = {
  A: 'Text-Led',
  B: 'Data Callout',
  C: 'Photo Overlay',
  D: 'Pull Quote',
  E: 'Illustration',
  F: 'Tutorial Step'
};

const STORY_FRAMES = ['Hook','Problem','Insight','Evidence','CTA'];

const HASHTAGS_IG = [
  '#UrbanHeat','#BuildingScience','#SustainableArchitecture','#GreenInfrastructure',
  '#ClimateAdaptation','#EmbodiedCarbon','#ThermalComfort','#UrbanPlanning',
  '#UrbanDesign','#Architecture','#PhDResearch','#BuildingSimulation',
  '#GISMapping','#DataViz','#NetZero','#BuildingPerformance',
  '#AIinArchitecture','#BIM','#DigitalTwin','#ArchitectureAndAI',
  '#SmartBuildings','#ClimateChange','#SustainabilityUK','#HousingCrisis','#RenterRights'
];
const HASHTAGS_LI = [
  '#UrbanResilience','#BuildingScience','#EmbodiedCarbon','#ThermalComfort',
  '#GreenInfrastructure','#SustainableDesign','#BIM','#AIArchitecture',
  '#ClimateAdaptation','#NetZeroBuildings','#UrbanHeatIsland','#PhDResearch'
];

const VOICE_DO = [
  'Start bold + specific',
  'Include technical detail (TM59, EPC, LSOA, dataset names)',
  'Explain jargon on first use',
  'End with a provocative, genuine question',
  'Use real data with a source',
  'Write "why this matters to you" in every post'
];
const VOICE_DONT = [
  '"Excited to share…"',
  '"Game-changer."',
  '"In today\'s fast-paced world…"',
  'Generic sustainability fluff',
  'Vague CTAs — "What do you think?"',
  'More than 3 emojis'
];

const DIMENSIONS = [
  ['Instagram Post',        '1080 × 1080', '60px safe margins'],
  ['Instagram Story / Reel','1080 × 1920', '120px top/bottom'],
  ['LinkedIn Post / Carousel','1080 × 1080','60px margins'],
  ['LinkedIn Banner',       '1584 × 396',  '40px margins'],
  ['YouTube Thumbnail',     '1280 × 720',  '40px margins'],
  ['YouTube Channel Banner','2560 × 1440', 'safe centre 1546 × 423']
];

const SCHEDULE = [
  ['Mon','Instagram Carousel','Deep, researched — 7–8 slides'],
  ['Tue','LinkedIn Post','Evidence-led, specialists first'],
  ['Wed','Instagram Post / Story','Quick stat or provocation'],
  ['Thu','Behind the Science','Personal, reflective, vulnerable'],
  ['Fri','YouTube / LinkedIn','Long-form or tutorial']
];

// expose
window.HAMDY = {
  ACCENTS, PILLARS, TOPICS, CAROUSEL_TYPES, POST_TYPES, STORY_FRAMES,
  HASHTAGS_IG, HASHTAGS_LI, VOICE_DO, VOICE_DONT, DIMENSIONS, SCHEDULE
};
