// content/lalitha-content.js
// Lalitha content — Telugu only.
const LalithaContent = {
  deity: 'lalitha',
  label: 'Lalitha',
  te: 'శ్రీ లలితా దేవి',
  verified: { source: 'stotranidhi.com, hindunidhi.com, sringeri.net', date: '2026-10-04', confidence: 'high' },

  stotras: [
    {
      slug: 'lalitha-trishati',
      te: 'శ్రీ లలితా త్రిశతీ',
      en: 'Lalitha Trishati',
      type: 'Trishati',
      verses: require('./lalitha-trishati.js').verses,
      namavali: require('./lalitha-trishati.js').namavali
    },
    {
      slug: 'lalitha-pancharatnam',
      te: 'శ్రీ లలితా పంచరత్నం',
      en: 'Lalitha Pancharatnam',
      type: 'Pancharatnam',
      verses: [
        'ప్రాతః స్మరామి లలితావదనారవిందం',
        'బింబాధరం పృథులమౌక్తికశోభినాసమ్ |',
        'ఆకర్ణదీర్ఘనయనం మణికుండలాఢ్యం',
        'మందస్మితం మృగమదోజ్జ్వలఫాలదేశమ్ || ౧ ||',
        '',
        'ప్రాతర్భజామి లలితాభుజకల్పవల్లీం',
        'రక్తాంగుళీయలసదంగుళిపల్లవాఢ్యామ్ |',
        'మాణిక్యహేమవలయాంగదశోభమానాం',
        'పిణ్ఢ్రేక్షుచాపకుసుమేషుసృణీర్దధానామ్ || ౨ ||',
        '',
        'ప్రాతః నమామి లలితాచరణారవిందాన్ని',
        'భక్తేష్టదాననిరతం భవసింధుపోతమ్ |',
        'పద్మాసనాదిసురనాయకపూజనీయం',
        'పద్మాంకుశాదిమణిభూషణభూషితాంఘ్రిమ్ || ౩ ||',
        '',
        'ప్రాతః స్తువే పరశివాం లలితాం సురేషీం',
        'భక్తార్తినాశిని సదా శరణాగతానాం |',
        'యా బ్రహ్మవిష్ణుమహేశ్వరపూజనీయా',
        'సా మే శ్రియం దిశతు మాతరమేవ శుభాం || ౪ ||',
        '',
        'యః శ్లోకపంచకమిదం లలితాంబికాయాః',
        'సౌభాగ్యదం సకలసంపదిదాయకం చ |',
        'పఠేత్ సదా లలితాం భజతే స ధన్యః',
        'సర్వాన్ కామాన్ లభతే మనుజోఽత్ర లోకే || ౫ ||',
        '',
        '|| ఇతి శ్రీ శంకరాచార్య కృతం లలితా పంచరత్నం సమాప్తమ్ ||'
      ]
    }
  ],

  poojas: [
    {
      slug: 'lalitha-puja-vidhanam',
      te: 'శ్రీ లలితా పూజా విధానం',
      en: 'Lalitha Puja Vidhanam',
      type: 'Pooja Vidhanam',
      steps: [
        { step: 1, text: 'శుక్రవారం, నవరాత్రి, లేదా పూర్ణిమ రోజున లలితా దేవిని పూజించండి.' },
        { step: 2, text: 'ఉదయాన్నే స్నానం చేసి, పూజా మందిరాన్ని శుభ్రం చేయండి.' },
        { step: 3, text: 'కలశస్థాపన చేసి, గణపతి పూజ చేయండి.' },
        { step: 4, text: 'లలితా దేవిని ఆవాహన చేసి, షోడశోపచార పూజ చేయండి.' },
        { step: 5, text: 'లలితా త్రిశతి, లలితా పంచరత్నం పారాయణం చేయండి.' },
        { step: 6, text: 'ఓం ఐం హ్రీం శ్రీం శ్రీమాత్రే నమః మంత్రాన్ని 108 సార్లు జపించండి.' },
        { step: 7, text: 'పాయసం, చక్కర పొంగలి, పండ్లు నైవేద్యంగా సమర్పించండి.' },
        { step: 8, text: 'హారతి సమర్పించి, ప్రసాదాన్ని పంచీ పెట్టండి.' }
      ]
    }
  ],

  mantras: [
    { slug: 'om-aim-hreem-shreem-shri-matre-namah', te: 'ఓం ఐం హ్రీం శ్రీం శ్రీమాత్రే నమః', en: 'Om Aim Hreem Shreem Shri Matre Namah', type: 'Mula Mantra', mantra: 'ఓం ఐం హ్రీం శ్రీం శ్రీమాత్రే నమః', meaning: 'The mula mantra of Lalitha Tripura Sundari — the supreme goddess of Sri Vidya.', usage: '108 times daily, especially on Fridays and during Navaratri' },
    { slug: 'lalitha-gayatri-mantra', te: 'లలితా గాయత్రీ మంత్రం', en: 'Lalitha Gayatri Mantra', type: 'Gayatri', mantra: 'ఓం లలితాంబికాయై విద్మహే మహాత్రిపురసుందర్యై చ ధీమహి | తన్నో లలితా ప్రచోదయాత్ ||', meaning: 'May we know Lalitha Ambika. May we meditate upon Maha Tripura Sundari. May Lalitha guide and inspire us.', usage: 'Daily at dawn, 108 times' }
  ],

  prasadam: [
    {
      slug: 'lalitha-prasadam',
      te: 'లలితా దేవి ప్రసాదం',
      en: 'Lalitha Prasadam',
      type: 'Prasadam',
      items: [
        {
          deity: 'లలితా దేవి',
          dish: 'పాయసం, చక్కర పొంగలి',
          quantity: '108 చెంచాలు (or 16)',
          recipe: 'పాయసం: బియ్యం - 1/2 కప్పు, పాలు - 3 కప్పులు, పంచదార - 3/4 కప్పు, యాలకులు - 1/2 టీస్పూన్, జీడిపప్పు - 15, కిస్మిస్ - కొద్దిగా, నెయ్యి - 2 టేబుల్స్పూన్లు. బియ్యం కడిగి, ప 상태로 మెత్తగా ఉడికించండి. పంచదార, యాలకులు చేర్చి, మరో 10 నిమిషాలు ఉడికించండి. నెయ్యిలో జీడిపప్పు, కిస్మిస్ వేయించి, పాయసంలో చేర్చిండి. చక్కర పొంగలి: బియ్యం - 1/2 కప్పు, పెసరపప్పు - 2 టేబుల్స్పూన్లు, పాలు - 1 కప్పు, బెల్లం - 3/4 కప్పు, యాలకులు - 1/2 టీస్పూన్. బియ్యం, పప్పు ఉడికించి, పాలు, బెల్లం, యాలకులు చేర్చి, మరో 10 నిమిషాలు ఉడికించండి. లలితా దేవికి పాయసం, చక్కర పొంగలి అత్యంత ప్రియమైన ప్రసాదాలు.'
        }
      ]
    }
  ],

  homa: [
    {
      slug: 'lalitha-homam',
      te: 'శ్రీ లలితా హోమం',
      en: 'Lalitha Homam',
      type: 'Homa',
      note: 'Performed as part of Sri Vidya upasana and Navaratri rituals.',
      keyMantras: ['ఓం ఐం హ్రీం శ్రీం శ్రీమాత్రే నమః', 'ఓం లలితాంబికాయై విద్మహే మహాత్రిపురసుందర్యై చ ధీమహి', 'ఓం ఐం హ్రీం శ్రీం శ్రీమాత్రే నమః స్వాహా'],
      materials: ['నెయ్యి (Ghee)', 'పాలు (Milk)', 'తేనె (Honey)', 'అటుకులు (Puffed rice)', 'కొబ్బరి (Coconut)', 'పసుపు (Turmeric)', 'కుంకుమ (Kumkum)', 'తామర పువ్వులు (Lotus flowers)']
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) module.exports = LalithaContent;
else if (typeof window !== 'undefined') window.LalithaContent = LalithaContent;
