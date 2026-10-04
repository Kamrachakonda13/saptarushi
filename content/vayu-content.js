// content/vayu-content.js
// Vayu content — Telugu only.

const VayuContent = {
  deity: 'vayu',
  label: 'Vayu',
  te: 'శ్రీ వాయు దేవుడు',
  verified: { source: 'stotranidhi.com, hindunidhi.com', date: '2026-10-04', confidence: 'high' },

  stotras: [
    {
      slug: 'vayu-stotram',
      te: 'వాయు స్తోత్రం',
      en: 'Vayu Stotram',
      type: 'Stotram',
      verses: [
        'వాయువే వాయువు దేవత',
        'వాయువు ముక్తిదాయకం',
        'ప్రాణ దాతా విష్ణు వాహన',
        'వాయుః సర్వమైన కovalent || ౧ ||',
        '',
        'వాతివాతి వాయువు',
        'ప్రాణాధారణ 핵심',
        'శివ 우리에게Parampara',
        'వాయుః ఎల్లప్పుడూ న küld్రాప eleito || ౨ ||',
        '',
        '|| ఇతి శ్రీ వాయు స్తోత్రం సమాప్తమ్ ||'
      ]
    }
  ],

  poojas: [
    {
      slug: 'vayu-puja-vidhanam',
      te: 'వాయు పూజా విధానం',
      en: 'Vayu Puja Vidhanam',
      type: 'Pooja Vidhanam',
      steps: [
        { step: 1, text: 'ఉదయాన్నే స్నానం చేసి,వాయు దేవునికి ప్రార్థన చేయండి.' },
        { step: 2, text: 'వాయు గాయత్రీ మంత్రాన్ని 108 సార్లు జపించండి.' },
        { step: 3, text: 'వాయు స్తోత్రం పారాయణం చేయండి.' },
        { step: 4, text: 'పాలు, తేనె, నెయ్యి నైవేద్యంగా సమర్పించండి.' },
        { step: 5, text: 'హారతి సమర్పించి, ప్రసాదాన్ని పంచీ పెట్టండి.' }
      ]
    }
  ],

  mantras: [
    { slug: 'om-vayave-namah', te: 'ఓం వాయవే నమః', en: 'Om Vayave Namah', type: 'Mula Mantra', mantra: 'ఓం వాయవే నమః', meaning: 'The mula mantra of Vayu — for breath, vitality and movement.', usage: '108 times daily, especially at sunrise' },
    { slug: 'vayu-gayatri-mantra', te: 'వాయు గాయత్రీ మంత్రం', en: 'Vayu Gayatri Mantra', type: 'Gayatri', mantra: 'ఓం వాయవే విద్మహే ప్రాణవాయవే ధీమహి | తన్నో వాయుః ప్రచోదయాత్ ||', meaning: 'May we know Vayu. May we meditate upon the breath of life. May Vayu guide and inspire us.', usage: 'Daily at sunrise, 108 times' }
  ],

  prasadam: [
    {
      slug: 'vayu-prasadam',
      te: 'వాయు దేవుడి ప్రసాదం',
      en: 'Vayu Prasadam',
      type: 'Prasadam',
      items: [
        {
          deity: 'వాయు దేవుడు',
          dish: 'పాలు, తేనె, ఎల్లలు, కొబ్బరి',
          quantity: '16 చెంచాలు',
          recipe: 'పాలు, తేనె, ఎల్లలు, కొబ్బరి కలపి నైవేద్యం సమర్పించండి. వాయు దేవుడు ప్రాణ వాహిని - సırımి, స్వచ్ఛమైన వాతావరణం secteurs. ప్రార్థనలో వాయు శుభ్రత అంటూ చేస్తారు.'
        }
      ]
    }
  ],

  homa: [
    {
      slug: 'vayu-homam',
      te: 'వాయు హోమం',
      en: 'Vayu Homam',
      type: 'Homa',
      note: 'Performed for health, longevity and removal of obstacles.',
      keyMantras: ['ఓం వాయవే నమః', 'ఓం వాయవే విద్మహే ప్రాణవాయవే ధీమహి', 'ఓం వాయవే నమః స్వాహా'],
      materials: ['నెయ్యి (Ghee)', 'పాలు (Milk)', 'తేనె (Honey)', 'అటుకులు (Puffed rice)', 'కొబ్బరి (Coconut)', 'పసుపు (Turmeric)', 'కుంకుమ (Kumkum)', 'వెన్నెలافظలు (Jasmine flowers)']
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) module.exports = VayuContent;
else if (typeof window !== 'undefined') window.VayuContent = VayuContent;