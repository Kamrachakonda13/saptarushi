// content/yama-content.js
// Yama content — Telugu only.

const YamaContent = {
  deity: 'yama',
  label: 'Yama',
  te: 'శ్రీ యముడు',
  verified: { source: 'stotranidhi.com, hindunidhi.com', date: '2026-10-04', confidence: 'high' },

  stotras: [
    {
      slug: 'yama-stotram',
      te: 'యమ స్తోత్రం',
      en: 'Yama Stotram',
      type: 'Stotram',
      verses: [
        'యమాయ నమః',
        'యము ధర్మ రాజా',
        'ప్రాణ హర్తాశ్చ యముడు',
        'కాల పురుషుడు యమః || ౧ ||',
        '',
        'ధర్మరాజునీ మోక్షద',
        'కాలపురుషుడు యమః || ౨ ||',
        '',
        '|| ఇతి శ్రీ యమ స్తోత్రం సమాప్తమ్ ||'
      ]
    }
  ],

  poojas: [
    {
      slug: 'yama-puja-vidhanam',
      te: 'యమ పూజా విధానం',
      en: 'Yama Puja Vidhanam',
      type: 'Pooja Vidhanam',
      steps: [
        { step: 1, text: 'యమ ద్వితీయ, అమావాస్య, లేదా శనివారం రోజున యముని పూజించండి.' },
        { step: 2, text: 'ఉదయాన్నే స్నానం చేసి, పూజా మందిరాన్ని శుభ్రం చేయండి.' },
        { step: 3, text: 'యముని ఆవాహన చేసి, షోడశోపచార పూజ చేయండి.' },
        { step: 4, text: 'యమ స్తోత్రం, యమ మంత్రాన్ని 108 సార్లు జపించండి.' },
        { step: 5, text: 'తీలపు నెయ్యి, ఎల్లెలు, పండ్లు నైవేద్యంగా సమర్పించండి.' }
      ]
    }
  ],

  mantras: [
    { slug: 'om-yamaya-namah', te: 'ఓం యమాయ నమః', en: 'Om Yamaya Namah', type: 'Mula Mantra', mantra: 'ఓం యమాయ నమః', meaning: 'The mula mantra of Yama — for protection from untimely death and karmic obstacles.', usage: '108 times daily, especially on Saturdays and Amavasya' },
    { slug: 'yama-gayatri-mantra', te: 'యమ గాయత్రీ మంత్రం', en: 'Yama Gayatri Mantra', type: 'Gayatri', mantra: 'ఓం దలవతాయ విద్మహే యమరాజాయ ధీమహి | తన్నో యమః ప్రచోదయాత్ ||', meaning: 'May we know Yama. May we meditate upon the lord of dharma. May Yama guide and inspire us.', usage: 'Daily at dusk, 108 times' }
  ],

  prasadam: [
    {
      slug: 'yama-prasadam',
      te: 'యముడి ప్రసాదం',
      en: 'Yama Prasadam',
      type: 'Prasadam',
      items: [
        {
          deity: 'యముడు',
          dish: 'తీల తోలు, ఎల్లిళ్లు, బెల్లం, పండ్లు',
          quantity: '16 చెంచాలు',
          recipe: 'తీల, ఎల్లిళ్లు, బెల్లం కలిపిundleం చేస్తారు. యముడికి మీతిలు, ఎల్లిళ్లు, బెల్లం, నారికేళం సమర్పించండి. యమాయన బలి మీద పరశన’* (Full recipe)'
        }
      ]
    }
  ],

  homa: [
    {
      slug: 'yama-homam',
      te: 'యమ హోమం',
      en: 'Yama Homam',
      type: 'Homa',
      note: 'Performed for protection from untimely death and karmic clearance.',
      keyMantras: ['ఓం యమాయ నమః', 'ఓం స్మ*.', 'ఓం యమాయ నమః స్వాహా'],
      materials: ['నెయ్యి (Ghee)', 'పాలు (Milk)', 'తీల (Sesame)', 'బెల్లం (Jaggery)', 'కొబ్బరి (Coconut)', 'పసుపు (Turmeric)', 'కుంకుమ (Kumkum)', 'కృష్ణ థులసీ (Black Tulasi)']
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) module.exports = YamaContent;
else if (typeof window !== 'undefined') window.YamaContent = YamaContent;