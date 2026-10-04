// content/narasimha-content.js
// Narasimha content — Telugu only.
const NarasimhaContent = {
  deity: 'narasimha',
  label: 'Narasimha',
  te: 'శ్రీ నృసింహుడు',
  stotras: [
    {
      slug: 'runa-vimochana-narasimha-stotram',
      te: 'శ్రీ ఋణమోచన నృసింహ స్తోత్రం',
      en: 'Runa Vimochana Narasimha Stotram',
      type: 'Stotram',
      verses: [
        'ధ్యానమ్ – వాగీశా యస్య వదనే లక్ష్మీర్యస్య చ వక్షసి |',
        'యస్యాస్తే హృదయే సంవిత్తం నృసింహమహం భజే ||',
        '',
        'దేవతాకార్యసిద్ధ్యర్థం సభాస్తంభసముద్భవమ్ |',
        'శ్రీనృసింహం మహావీరం నమామి ఋణముక్తయే || ౧ ||',
        '',
        'లక్ష్మ్యాలింగిత వామాంకం భక్తానాం వరదాయకమ్ |',
        'శ్రీనృసింహం మహావీరం నమామి ఋణముక్తయే || ౨ ||',
        '',
        'ఆంత్రమాలాధరం శంఖచక్రాబ్జాయుధధారిణమ్ |',
        'శ్రీనృసింహం మహావీరం నమామి ఋణముక్తయే || ౩ ||',
        '',
        'స్మరణాత్ సర్వపాపఘ్నం కద్రూజావరశాసనమ్ |',
        'శ్రీనృసింహం మహావీరం నమామి ఋణముక్తయే || ౪ ||',
        '',
        'సింహనాదేన మహతా దిగంతభయనాశనమ్ |',
        'శ్రీనృసింహం మహావీరం నమామి ఋణముక్తయే || ౫ ||',
        '',
        'ప్రహ్లాదవరదం శ్రీమత్పద్మనాభమివ ప్రభుమ్ |',
        'శ్రీనృసింహం మహావీరం నమామి ఋణముక్తయే || ౬ ||',
        '',
        '|| ఇతి శ్రీ ఋణమోచన నృసింహ స్తోత్రం సమాప్తమ్ ||'
      ]
    }
  ],
  poojas: [
    {
      slug: 'narasimha-puja-vidhanam',
      te: 'శ్రీ నృసింహ పూజా విధానం',
      en: 'Narasimha Puja Vidhanam',
      type: 'Pooja Vidhanam',
      steps: [
        { step: 1, text: 'నృసింహ జయంతి లేదా స్వాతి రోజున నృసింహుడిని పూజించాలి.' },
        { step: 2, text: 'ఉదయాన్నే స్నానం చేసి, పూజా మందిరాన్ని శుభ్రం చేయండి.' },
        { step: 3, text: 'నృసింహుడిని ఆవాహన చేసి, షోడశోపచార పూజ చేయండి.' },
        { step: 4, text: 'ఋణమోచన నృసింహ స్తోత్రం, నృసింహ అష్టోత్తరం పారాయణం చేయండి.' },
        { step: 5, text: 'ఓం నృసింహాయ నమః మంత్రాన్ని 108 సార్లు జపించండి.' },
        { step: 6, text: 'పండ్లు, తేనె, పాలు నైవేద్యంగా సమర్పించండి.' }
      ]
    }
  ],
  mantras: [
    { slug: 'om-nrisimhaya-namah', te: 'ఓం నృసింహాయ నమః', en: 'Om Nrisimhaya Namah', type: 'Mula Mantra', mantra: 'ఓం నృసింహాయ నమః', meaning: 'The mula mantra of Narasimha — for protection from fear and removal of debts.', usage: '108 times on Swati and during Narasimha Jayanti' },
    { slug: 'narasimha-gayatri-mantra', te: 'నృసింహ గాయత్రీ మంత్రం', en: 'Narasimha Gayatri Mantra', type: 'Gayatri', mantra: 'ఓం వజ్రనఖాయ విద్మహే తీక్ష్ణదంష్ట్రాయ ధీమహి | తన్నో నృసింహః ప్రచోదయాత్ ||', meaning: 'May we know the one with adamantine nails. May we meditate upon the sharp-fanged one. May Narasimha guide and inspire us.', usage: 'Daily at dawn, 108 times' }
  ],
  prasadam: [
    {
      slug: 'narasimha-prasadam',
      te: 'నృసింహుడి ప్రసాదం',
      en: 'Narasimha Prasadam',
      type: 'Prasadam',
      items: [
        { deity: 'నృసింహుడు', dish: 'పానకం, పండ్లు', quantity: '16 చెంచాలు', recipe: 'పానకం: బెల్లం, నీరు, యాలకులు, మిరియాలు, అల్లం — కలిపి సమర్పించండి. అహోబిలంలో పానకం సగం నృసింహుడు స్వీకరిస్తాడు, సగం ప్రసాదంగా భక్తులకు ఇస్తారు.' }
      ]
    }
  ],
  homa: []
};
if (typeof module !== 'undefined' && module.exports) module.exports = NarasimhaContent;
else if (typeof window !== 'undefined') window.NarasimhaContent = NarasimhaContent;
