// Template gallery content — pre-filled Mohamed Hamdy carousels, posts, stories

(function(){
  const { defaultText, defaultShape, defaultImage } = window.HAMDY_EDITOR;

  function text(content, opts) { return defaultText({ content, ...opts }); }
  function rect(opts) { return defaultShape('rect', opts); }

  function withZ(els) { els.forEach((e,i) => e.zIndex = i+1); return els; }

  // ---------- Carousel templates ----------
  const tplCarousels = [
    {
      id:'c1', pillar:'P1', title:'Urban overheating patterns in Leeds postcodes',
      subtitle:'Research Findings · 8 slides', type:'D', accent:'#EB5A2A',
      slides: [
        { label:'Cover', bg:'#070707', els: withZ([
          text('URBAN HEAT · RESEARCH', {x:80,y:80,w:720,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:2,color:'#F6F3EE'}),
          rect({x:80,y:480,w:80,h:4,fill:'#EB5A2A'}),
          text('Why 40% of Leeds flats will fail TM59 by 2050.',{x:80,y:520,w:920,h:360,fontFamily:"'Space Grotesk', sans-serif",fontSize:72,fontWeight:800,color:'#F6F3EE',lineHeight:1.05}),
          text('MOHAMED HAMDY · LEEDS BECKETT',{x:80,y:960,w:700,h:30,fontFamily:"'Roboto Condensed', sans-serif",fontSize:14,fontWeight:700,uppercase:true,letterSpacing:3,color:'#9CA3AF'}),
          text('swipe →',{x:860,y:960,w:180,h:30,fontFamily:"'Roboto Condensed', sans-serif",fontSize:14,fontWeight:700,uppercase:true,letterSpacing:3,color:'#EB5A2A',align:'right'})
        ])},
        { label:'Hypothesis', bg:'#F6F3EE', els: withZ([
          text('01 / 08',{x:880,y:60,w:140,h:28,fontFamily:"'Roboto Condensed', sans-serif",fontSize:14,fontWeight:700,uppercase:true,letterSpacing:2,color:'#6B7280',align:'right'}),
          rect({x:80,y:200,w:60,h:4,fill:'#EB5A2A'}),
          text('HYPOTHESIS',{x:80,y:225,w:700,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:3,color:'#C0522A'}),
          text('Older concrete flats overheat more than post-2010 stock — but the gap widens fastest in social housing.',{x:80,y:290,w:920,h:320,fontFamily:"'Space Grotesk', sans-serif",fontSize:52,fontWeight:700,color:'#070707',lineHeight:1.1})
        ])},
        { label:'Methodology', bg:'#070707', els: withZ([
          text('02 / 08',{x:880,y:60,w:140,h:28,fontFamily:"'Roboto Condensed', sans-serif",fontSize:14,fontWeight:700,uppercase:true,letterSpacing:2,color:'#9CA3AF',align:'right'}),
          rect({x:80,y:200,w:60,h:4,fill:'#EB5A2A'}),
          text('METHODOLOGY',{x:80,y:225,w:700,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:3,color:'#F5B59A'}),
          text('50,000 EPC records · Landsat LST 2018–2024 · TM59 re-run with UKCP18 2050 high-emission.',{x:80,y:290,w:920,h:300,fontFamily:"'Space Grotesk', sans-serif",fontSize:44,fontWeight:700,color:'#F6F3EE',lineHeight:1.15}),
          text('Source — EPC Register · Landsat 8 · CIBSE TM59 2020',{x:80,y:980,w:800,h:24,fontFamily:"'Inter', sans-serif",fontSize:13,fontStyle:'italic',color:'#9CA3AF'})
        ])},
        { label:'Chart 1', bg:'#F6F3EE', els: withZ([
          text('03 / 08',{x:880,y:60,w:140,h:28,fontFamily:"'Roboto Condensed', sans-serif",fontSize:14,fontWeight:700,uppercase:true,letterSpacing:2,color:'#6B7280',align:'right'}),
          text('LST BY POSTCODE · JULY 2022',{x:80,y:100,w:700,h:32,fontFamily:"'Roboto Condensed', sans-serif",fontSize:18,fontWeight:700,uppercase:true,letterSpacing:3,color:'#C0522A'}),
          // fake bar chart with rects
          rect({x:80,y:400,w:110,h:260,fill:'#070707'}),
          rect({x:220,y:340,w:110,h:320,fill:'#070707'}),
          rect({x:360,y:260,w:110,h:400,fill:'#EB5A2A'}),
          rect({x:500,y:180,w:110,h:480,fill:'#EB5A2A'}),
          rect({x:640,y:300,w:110,h:360,fill:'#070707'}),
          rect({x:780,y:380,w:110,h:280,fill:'#070707'}),
          text('LS1   LS2   LS6   LS11  LS14  LS27',{x:80,y:680,w:820,h:30,fontFamily:"'Inter', sans-serif",fontSize:16,fontWeight:600,color:'#070707',letterSpacing:3}),
          text('Land surface temp peaks in inner-city LS6 and LS11 — same postcodes where EPC D/E stock clusters.',{x:80,y:740,w:920,h:180,fontFamily:"'Inter', sans-serif",fontSize:22,color:'#070707',lineHeight:1.45}),
          text('Source — Landsat 8, ARD level 2',{x:80,y:980,w:800,h:24,fontFamily:"'Inter', sans-serif",fontSize:13,fontStyle:'italic',color:'#6B7280'})
        ])},
        { label:'Chart 2', bg:'#070707', els: withZ([
          text('04 / 08',{x:880,y:60,w:140,h:28,fontFamily:"'Roboto Condensed', sans-serif",fontSize:14,fontWeight:700,uppercase:true,letterSpacing:2,color:'#9CA3AF',align:'right'}),
          text('40%',{x:80,y:260,w:920,h:320,fontFamily:"'Space Grotesk', sans-serif",fontSize:340,fontWeight:800,color:'#EB5A2A',letterSpacing:-10,lineHeight:1}),
          text('of Leeds flats fail TM59 under 2050 weather — rising to 61% in social housing.',{x:80,y:620,w:920,h:240,fontFamily:"'Space Grotesk', sans-serif",fontSize:38,fontWeight:500,color:'#F6F3EE',lineHeight:1.2})
        ])},
        { label:'Finding', bg:'#F6F3EE', els: withZ([
          text('05 / 08',{x:880,y:60,w:140,h:28,fontFamily:"'Roboto Condensed', sans-serif",fontSize:14,fontWeight:700,uppercase:true,letterSpacing:2,color:'#6B7280',align:'right'}),
          rect({x:80,y:200,w:60,h:4,fill:'#EB5A2A'}),
          text('FINDING',{x:80,y:225,w:700,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:3,color:'#C0522A'}),
          text('The overheating risk map overlaps almost perfectly with the 40% most deprived LSOAs.',{x:80,y:290,w:920,h:420,fontFamily:"'Space Grotesk', sans-serif",fontSize:52,fontWeight:700,color:'#070707',lineHeight:1.12})
        ])},
        { label:'So what', bg:'#070707', els: withZ([
          text('06 / 08',{x:880,y:60,w:140,h:28,fontFamily:"'Roboto Condensed', sans-serif",fontSize:14,fontWeight:700,uppercase:true,letterSpacing:2,color:'#9CA3AF',align:'right'}),
          rect({x:80,y:200,w:60,h:4,fill:'#EB5A2A'}),
          text('WHAT IT MEANS',{x:80,y:225,w:700,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:3,color:'#F5B59A'}),
          text('Part O alone won\'t save existing stock. Retrofit priority should follow heat + deprivation — not postcode averages.',{x:80,y:290,w:920,h:560,fontFamily:"'Space Grotesk', sans-serif",fontSize:44,fontWeight:700,color:'#F6F3EE',lineHeight:1.2})
        ])},
        { label:'CTA', bg:'#070707', els: withZ([
          text('MOHAMED HAMDY',{x:0,y:460,w:1080,h:60,fontFamily:"'Space Grotesk', sans-serif",fontSize:48,fontWeight:800,color:'#F6F3EE',letterSpacing:3,align:'center'}),
          rect({x:500,y:540,w:80,h:3,fill:'#EB5A2A'}),
          text('Full methodology + maps on my LinkedIn →',{x:80,y:640,w:920,h:60,fontFamily:"'Roboto Condensed', sans-serif",fontSize:24,fontWeight:700,uppercase:true,letterSpacing:2,color:'#EB5A2A',align:'center'}),
          text('Follow for urban climate research.',{x:80,y:720,w:920,h:40,fontFamily:"'Inter', sans-serif",fontSize:18,color:'#9CA3AF',align:'center'})
        ])}
      ]
    },
    {
      id:'c2', pillar:'P3', title:'How green roofs reduce building temperatures',
      subtitle:'Explainer · 7 slides', type:'C', accent:'#2D5016',
      slides: [
        { label:'Cover', bg:'#070707', els: withZ([
          text('GREEN INFRASTRUCTURE',{x:80,y:80,w:720,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:2,color:'#F6F3EE'}),
          rect({x:80,y:480,w:80,h:4,fill:'#2D5016'}),
          text('Green roofs cool more than shade.',{x:80,y:520,w:920,h:360,fontFamily:"'Space Grotesk', sans-serif",fontSize:76,fontWeight:800,color:'#F6F3EE',lineHeight:1.05}),
          text('swipe →',{x:860,y:960,w:180,h:30,fontFamily:"'Roboto Condensed', sans-serif",fontSize:14,fontWeight:700,uppercase:true,letterSpacing:3,color:'#2D5016',align:'right'})
        ])},
        { label:'Point 1', bg:'#F6F3EE', els: withZ([
          text('01',{x:80,y:140,w:200,h:200,fontFamily:"'Space Grotesk', sans-serif",fontSize:180,fontWeight:800,color:'#2D5016'}),
          text('EVAPOTRANSPIRATION',{x:80,y:380,w:920,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:3,color:'#2D5016'}),
          text('Plants move water from root to air, pulling heat with it. A wet green roof can be 15°C cooler than bitumen.',{x:80,y:440,w:920,h:400,fontFamily:"'Space Grotesk', sans-serif",fontSize:42,fontWeight:500,color:'#070707',lineHeight:1.25})
        ])},
        { label:'Point 2', bg:'#070707', els: withZ([
          text('02',{x:80,y:140,w:200,h:200,fontFamily:"'Space Grotesk', sans-serif",fontSize:180,fontWeight:800,color:'#2D5016'}),
          text('THERMAL MASS',{x:80,y:380,w:920,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:3,color:'#2D5016'}),
          text('The substrate acts as a second layer of insulation — slowing heat transfer into the flat below by hours.',{x:80,y:440,w:920,h:400,fontFamily:"'Space Grotesk', sans-serif",fontSize:42,fontWeight:500,color:'#F6F3EE',lineHeight:1.25})
        ])},
        { label:'Point 3', bg:'#F6F3EE', els: withZ([
          text('03',{x:80,y:140,w:200,h:200,fontFamily:"'Space Grotesk', sans-serif",fontSize:180,fontWeight:800,color:'#2D5016'}),
          text('ALBEDO SHIFT',{x:80,y:380,w:920,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:3,color:'#2D5016'}),
          text('Vegetation reflects more shortwave and emits less longwave — cooling the surrounding air, not just the building.',{x:80,y:440,w:920,h:400,fontFamily:"'Space Grotesk', sans-serif",fontSize:40,fontWeight:500,color:'#070707',lineHeight:1.25})
        ])},
        { label:'Example', bg:'#070707', els: withZ([
          rect({x:80,y:200,w:60,h:4,fill:'#2D5016'}),
          text('REAL DATA',{x:80,y:225,w:700,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:3,color:'#F5B59A'}),
          text('A Sheffield study found extensive green roofs reduced under-slab temperature by 3.9°C on heatwave days.',{x:80,y:290,w:920,h:560,fontFamily:"'Space Grotesk', sans-serif",fontSize:44,fontWeight:700,color:'#F6F3EE',lineHeight:1.2}),
          text('Source — Speak et al., Building & Environment, 2013',{x:80,y:980,w:800,h:24,fontFamily:"'Inter', sans-serif",fontSize:13,fontStyle:'italic',color:'#9CA3AF'})
        ])},
        { label:'Why you care', bg:'#F6F3EE', els: withZ([
          rect({x:80,y:200,w:60,h:4,fill:'#2D5016'}),
          text('WHY IT MATTERS TO YOU',{x:80,y:225,w:900,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:3,color:'#2D5016'}),
          text('If you live on the top floor of a 1960s block, a green roof is the single biggest cooling intervention your landlord can do.',{x:80,y:290,w:920,h:560,fontFamily:"'Space Grotesk', sans-serif",fontSize:44,fontWeight:700,color:'#070707',lineHeight:1.2})
        ])},
        { label:'CTA', bg:'#070707', els: withZ([
          text('MOHAMED HAMDY',{x:0,y:460,w:1080,h:60,fontFamily:"'Space Grotesk', sans-serif",fontSize:48,fontWeight:800,color:'#F6F3EE',letterSpacing:3,align:'center'}),
          rect({x:500,y:540,w:80,h:3,fill:'#2D5016'}),
          text('More on passive cooling → follow',{x:80,y:640,w:920,h:60,fontFamily:"'Roboto Condensed', sans-serif",fontSize:26,fontWeight:700,uppercase:true,letterSpacing:2,color:'#2D5016',align:'center'})
        ])}
      ]
    },
    {
      id:'c3', pillar:'P2', title:'Retrofit vs rebuild: embodied carbon comparison',
      subtitle:'Case Study · 7 slides', type:'A', accent:'#C0522A',
      slides: [
        { label:'Cover', bg:'#070707', els: withZ([
          text('EMBODIED CARBON',{x:80,y:80,w:720,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:2,color:'#F6F3EE'}),
          rect({x:80,y:480,w:80,h:4,fill:'#C0522A'}),
          text('Retrofit wins — until it doesn\'t.',{x:80,y:520,w:920,h:360,fontFamily:"'Space Grotesk', sans-serif",fontSize:78,fontWeight:800,color:'#F6F3EE',lineHeight:1.05})
        ])},
        { label:'Problem', bg:'#F6F3EE', els: withZ([
          rect({x:80,y:200,w:60,h:4,fill:'#C0522A'}),
          text('THE PROBLEM',{x:80,y:225,w:700,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:3,color:'#C0522A'}),
          text('"It\'s easier to just knock it down." That\'s almost never true at whole-life scale.',{x:80,y:290,w:920,h:460,fontFamily:"'Space Grotesk', sans-serif",fontSize:52,fontWeight:700,color:'#070707',lineHeight:1.15})
        ])},
        { label:'Evidence', bg:'#070707', els: withZ([
          text('800',{x:80,y:260,w:460,h:260,fontFamily:"'Space Grotesk', sans-serif",fontSize:260,fontWeight:800,color:'#C0522A',letterSpacing:-8}),
          text('kgCO₂e / m²',{x:80,y:540,w:460,h:40,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:2,color:'#F5B59A'}),
          text('is the typical embodied carbon of a new UK home. Deep retrofit is 120–250.',{x:80,y:620,w:920,h:260,fontFamily:"'Space Grotesk', sans-serif",fontSize:40,fontWeight:500,color:'#F6F3EE',lineHeight:1.25})
        ])},
        { label:'Chart', bg:'#F6F3EE', els: withZ([
          text('KGCO₂E / M² — WHOLE LIFE',{x:80,y:100,w:900,h:30,fontFamily:"'Roboto Condensed', sans-serif",fontSize:18,fontWeight:700,uppercase:true,letterSpacing:3,color:'#C0522A'}),
          text('Retrofit',{x:80,y:260,w:220,h:30,fontFamily:"'Inter', sans-serif",fontSize:16,fontWeight:600,color:'#070707'}),
          rect({x:80,y:300,w:230,h:80,fill:'#2D5016'}),
          text('180',{x:330,y:320,w:200,h:60,fontFamily:"'Space Grotesk', sans-serif",fontSize:40,fontWeight:800,color:'#070707'}),
          text('Rebuild',{x:80,y:440,w:220,h:30,fontFamily:"'Inter', sans-serif",fontSize:16,fontWeight:600,color:'#070707'}),
          rect({x:80,y:480,w:860,h:80,fill:'#C0522A'}),
          text('800',{x:960,y:500,w:100,h:60,fontFamily:"'Space Grotesk', sans-serif",fontSize:40,fontWeight:800,color:'#070707',align:'right'}),
          text('Even with 30 years of higher heating demand, retrofit stays ahead.',{x:80,y:680,w:920,h:200,fontFamily:"'Inter', sans-serif",fontSize:24,color:'#070707',lineHeight:1.4})
        ])},
        { label:'Conclusion', bg:'#070707', els: withZ([
          rect({x:80,y:200,w:60,h:4,fill:'#C0522A'}),
          text('THE VERDICT',{x:80,y:225,w:700,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:3,color:'#F5B59A'}),
          text('Retrofit beats rebuild on carbon in 9 out of 10 housing cases — even when you cost the operational penalty.',{x:80,y:290,w:920,h:560,fontFamily:"'Space Grotesk', sans-serif",fontSize:44,fontWeight:700,color:'#F6F3EE',lineHeight:1.2})
        ])},
        { label:'You', bg:'#F6F3EE', els: withZ([
          rect({x:80,y:200,w:60,h:4,fill:'#C0522A'}),
          text('FOR RENTERS & OWNERS',{x:80,y:225,w:900,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:3,color:'#C0522A'}),
          text('Ask: can the shell stay? That\'s the first carbon-honest question.',{x:80,y:290,w:920,h:460,fontFamily:"'Space Grotesk', sans-serif",fontSize:52,fontWeight:700,color:'#070707',lineHeight:1.15})
        ])},
        { label:'CTA', bg:'#070707', els: withZ([
          text('MOHAMED HAMDY',{x:0,y:460,w:1080,h:60,fontFamily:"'Space Grotesk', sans-serif",fontSize:48,fontWeight:800,color:'#F6F3EE',letterSpacing:3,align:'center'}),
          rect({x:500,y:540,w:80,h:3,fill:'#C0522A'}),
          text('Deeper numbers on LinkedIn →',{x:80,y:640,w:920,h:60,fontFamily:"'Roboto Condensed', sans-serif",fontSize:26,fontWeight:700,uppercase:true,letterSpacing:2,color:'#C0522A',align:'center'})
        ])}
      ]
    },
    {
      id:'c4', pillar:'P5', title:'How AI is changing building design right now',
      subtitle:'Explainer · 7 slides', type:'C', accent:'#1B3A6B',
      slides: [
        { label:'Cover', bg:'#070707', els: withZ([
          text('AI + ARCHITECTURE',{x:80,y:80,w:720,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:2,color:'#F6F3EE'}),
          rect({x:80,y:480,w:80,h:4,fill:'#1B3A6B'}),
          text('AI isn\'t coming for architects. It\'s already inside BIM.',{x:80,y:520,w:920,h:380,fontFamily:"'Space Grotesk', sans-serif",fontSize:68,fontWeight:800,color:'#F6F3EE',lineHeight:1.05})
        ])},
        { label:'What it is', bg:'#F6F3EE', els: withZ([
          rect({x:80,y:200,w:60,h:4,fill:'#1B3A6B'}),
          text('WHAT',{x:80,y:225,w:700,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:3,color:'#1B3A6B'}),
          text('Surrogate models that predict energy, daylight and overheating in seconds — not overnight.',{x:80,y:290,w:920,h:560,fontFamily:"'Space Grotesk', sans-serif",fontSize:48,fontWeight:700,color:'#070707',lineHeight:1.2})
        ])},
        { label:'Use 1', bg:'#070707', els: withZ([
          text('01',{x:80,y:140,w:200,h:200,fontFamily:"'Space Grotesk', sans-serif",fontSize:180,fontWeight:800,color:'#1B3A6B'}),
          text('MASSING',{x:80,y:380,w:920,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:3,color:'#F5B59A'}),
          text('Thousands of massing options ranked by daylight, solar gain, and GFA — in a feedback loop that fits inside a meeting.',{x:80,y:440,w:920,h:400,fontFamily:"'Space Grotesk', sans-serif",fontSize:38,fontWeight:500,color:'#F6F3EE',lineHeight:1.25})
        ])},
        { label:'Use 2', bg:'#F6F3EE', els: withZ([
          text('02',{x:80,y:140,w:200,h:200,fontFamily:"'Space Grotesk', sans-serif",fontSize:180,fontWeight:800,color:'#1B3A6B'}),
          text('PERFORMANCE GAP',{x:80,y:380,w:920,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:3,color:'#1B3A6B'}),
          text('ML calibration against meter data closes the gap between design models and real-world use.',{x:80,y:440,w:920,h:400,fontFamily:"'Space Grotesk', sans-serif",fontSize:38,fontWeight:500,color:'#070707',lineHeight:1.25})
        ])},
        { label:'Use 3', bg:'#070707', els: withZ([
          text('03',{x:80,y:140,w:200,h:200,fontFamily:"'Space Grotesk', sans-serif",fontSize:180,fontWeight:800,color:'#1B3A6B'}),
          text('DIGITAL TWIN',{x:80,y:380,w:920,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:3,color:'#F5B59A'}),
          text('A living model that learns from sensors — useful only if someone actually reads it.',{x:80,y:440,w:920,h:400,fontFamily:"'Space Grotesk', sans-serif",fontSize:38,fontWeight:500,color:'#F6F3EE',lineHeight:1.25})
        ])},
        { label:'Limit', bg:'#F6F3EE', els: withZ([
          rect({x:80,y:200,w:60,h:4,fill:'#1B3A6B'}),
          text('THE LIMIT',{x:80,y:225,w:700,h:36,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:3,color:'#1B3A6B'}),
          text('AI is fast, but it inherits whatever bias sits in your training data. "Better" is still an architect\'s word.',{x:80,y:290,w:920,h:560,fontFamily:"'Space Grotesk', sans-serif",fontSize:44,fontWeight:700,color:'#070707',lineHeight:1.2})
        ])},
        { label:'CTA', bg:'#070707', els: withZ([
          text('MOHAMED HAMDY',{x:0,y:460,w:1080,h:60,fontFamily:"'Space Grotesk', sans-serif",fontSize:48,fontWeight:800,color:'#F6F3EE',letterSpacing:3,align:'center'}),
          rect({x:500,y:540,w:80,h:3,fill:'#1B3A6B'}),
          text('Follow for AI + building science →',{x:80,y:640,w:920,h:60,fontFamily:"'Roboto Condensed', sans-serif",fontSize:26,fontWeight:700,uppercase:true,letterSpacing:2,color:'#1B3A6B',align:'center'})
        ])}
      ]
    }
  ];

  const tplPosts = [
    {
      id:'p1', pillar:'P1', title:'Text-Led · TM59 failures', accent:'#EB5A2A',
      slide: { label:'Post A', bg:'#070707', els: withZ([
        text('OVERHEATING',{x:60,y:340,w:960,h:220,fontFamily:"'Space Grotesk', sans-serif",fontSize:140,fontWeight:800,color:'#EB5A2A',letterSpacing:-4}),
        text('TM59 FAILURES IN UK HOUSING',{x:60,y:580,w:960,h:40,fontFamily:"'Roboto Condensed', sans-serif",fontSize:28,fontWeight:700,uppercase:true,letterSpacing:3,color:'#F6F3EE'}),
        text('Four of five new-build flats in Leeds failed TM59 when re-run against UKCP18 2050.',{x:60,y:660,w:960,h:180,fontFamily:"'Inter', sans-serif",fontSize:22,color:'#F6F3EE',lineHeight:1.5}),
        text('MOHAMED HAMDY',{x:60,y:960,w:500,h:30,fontFamily:"'Roboto Condensed', sans-serif",fontSize:14,fontWeight:700,uppercase:true,letterSpacing:3,color:'#9CA3AF'})
      ])}
    },
    {
      id:'p2', pillar:'P4', title:'Stat Callout · EPC records mapped', accent:'#1B3A6B',
      slide: { label:'Post B', bg:'#F6F3EE', els: withZ([
        text('50,000',{x:60,y:120,w:960,h:260,fontFamily:"'Space Grotesk', sans-serif",fontSize:220,fontWeight:800,color:'#1B3A6B',letterSpacing:-6}),
        text('EPC RECORDS MAPPED IN LEEDS',{x:60,y:420,w:960,h:60,fontFamily:"'Roboto Condensed', sans-serif",fontSize:32,fontWeight:700,uppercase:true,letterSpacing:3,color:'#070707'}),
        rect({x:0,y:540,w:1080,h:540,fill:'#070707'}),
        text('Plotted against Landsat LST to find where heat risk and poor insulation overlap.',{x:60,y:620,w:960,h:240,fontFamily:"'Inter', sans-serif",fontSize:24,color:'#F6F3EE',lineHeight:1.45}),
        text('MOHAMED HAMDY · LEEDS SUSTAINABILITY INSTITUTE',{x:60,y:990,w:960,h:30,fontFamily:"'Roboto Condensed', sans-serif",fontSize:14,fontWeight:700,uppercase:true,letterSpacing:3,color:'#9CA3AF'})
      ])}
    },
    {
      id:'p3', pillar:'P2', title:'Pull Quote · Embodied carbon', accent:'#F5B59A',
      slide: { label:'Post D', bg:'#F5B59A', els: withZ([
        text('"The carbon is already spent before a single person moves in."',{x:80,y:200,w:920,h:520,fontFamily:"'Space Grotesk', sans-serif",fontSize:56,fontWeight:700,color:'#070707',lineHeight:1.15}),
        text('— ON EMBODIED CARBON IN NEW HOUSING',{x:80,y:820,w:920,h:40,fontFamily:"'Roboto Condensed', sans-serif",fontSize:20,fontWeight:700,uppercase:true,letterSpacing:3,color:'#070707'}),
        text('MOHAMED HAMDY',{x:80,y:960,w:500,h:30,fontFamily:"'Roboto Condensed', sans-serif",fontSize:14,fontWeight:700,uppercase:true,letterSpacing:3,color:'#070707'})
      ])}
    }
  ];

  const tplStories = [
    {
      id:'s1', pillar:'P1', title:'UHI — what it is, why it matters, what you can do', accent:'#EB5A2A',
      frames: [
        { label:'Hook', bg:'#070707', els: withZ([
          text('1 / 5',{x:60,y:160,w:200,h:32,fontFamily:"'Roboto Condensed', sans-serif",fontSize:16,fontWeight:700,uppercase:true,letterSpacing:3,color:'#9CA3AF'}),
          rect({x:60,y:220,w:60,h:4,fill:'#EB5A2A'}),
          text('THE CITY WON\'T COOL DOWN',{x:60,y:280,w:960,h:200,fontFamily:"'Space Grotesk', sans-serif",fontSize:96,fontWeight:800,color:'#F6F3EE',lineHeight:1.05})
        ])},
        { label:'Problem', bg:'#F6F3EE', els: withZ([
          text('2 / 5',{x:60,y:160,w:200,h:32,fontFamily:"'Roboto Condensed', sans-serif",fontSize:16,fontWeight:700,uppercase:true,letterSpacing:3,color:'#6B7280'}),
          rect({x:60,y:220,w:60,h:4,fill:'#EB5A2A'}),
          text('Flats stay 6°C hotter overnight than the countryside.',{x:60,y:280,w:960,h:1000,fontFamily:"'Space Grotesk', sans-serif",fontSize:80,fontWeight:800,color:'#070707',lineHeight:1.08})
        ])},
        { label:'Insight', bg:'#070707', els: withZ([
          text('3 / 5',{x:60,y:160,w:200,h:32,fontFamily:"'Roboto Condensed', sans-serif",fontSize:16,fontWeight:700,uppercase:true,letterSpacing:3,color:'#9CA3AF'}),
          rect({x:60,y:220,w:60,h:4,fill:'#EB5A2A'}),
          text('Night-time temperature is what kills people — not the midday peak.',{x:60,y:280,w:960,h:1200,fontFamily:"'Space Grotesk', sans-serif",fontSize:72,fontWeight:800,color:'#F6F3EE',lineHeight:1.1})
        ])},
        { label:'Evidence', bg:'#F6F3EE', els: withZ([
          text('4 / 5',{x:60,y:160,w:200,h:32,fontFamily:"'Roboto Condensed', sans-serif",fontSize:16,fontWeight:700,uppercase:true,letterSpacing:3,color:'#6B7280'}),
          text('40%',{x:60,y:280,w:960,h:400,fontFamily:"'Space Grotesk', sans-serif",fontSize:360,fontWeight:800,color:'#EB5A2A',letterSpacing:-10}),
          text('of Leeds flats fail TM59 against 2050 weather.',{x:60,y:680,w:960,h:300,fontFamily:"'Space Grotesk', sans-serif",fontSize:44,fontWeight:500,color:'#070707',lineHeight:1.25})
        ])},
        { label:'CTA', bg:'#070707', els: withZ([
          text('5 / 5',{x:60,y:160,w:200,h:32,fontFamily:"'Roboto Condensed', sans-serif",fontSize:16,fontWeight:700,uppercase:true,letterSpacing:3,color:'#9CA3AF'}),
          text('MOHAMED HAMDY',{x:0,y:780,w:1080,h:60,fontFamily:"'Space Grotesk', sans-serif",fontSize:56,fontWeight:800,color:'#F6F3EE',letterSpacing:3,align:'center'}),
          rect({x:500,y:870,w:80,h:3,fill:'#EB5A2A'}),
          text('Swipe up for the full research →',{x:60,y:940,w:960,h:40,fontFamily:"'Roboto Condensed', sans-serif",fontSize:22,fontWeight:700,uppercase:true,letterSpacing:2,color:'#EB5A2A',align:'center'})
        ])}
      ]
    }
  ];

  window.HAMDY_TEMPLATES = { tplCarousels, tplPosts, tplStories };
})();
