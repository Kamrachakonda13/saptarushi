// content/chandra-content.js
// Chandra content — Telugu only.
const ChandraContent = {
  deity: 'chandra',
  label: 'Chandra',
  te: 'శ్రీ చంద్రుడు',
  stotras: [
    {
      slug: 'chandra-stotram-1',
      te: 'శ్రీ చంద్ర స్తోత్రం 1',
      en: 'Chandra Stotram 1',
      type: 'Stotram',
      verses: [
        'నమశ్చంద్రాయ సోమాయేందవే కుముదబంధవే |',
        'విలోహితాయ శుభ్రాయ శుక్లాంబరధరాయ చ || ౧ ||',
        '',
        'త్వమేవ సర్వలోకానామాప్యాయనకరః సదా |',
        'క్షీరోద్భవాయ దేవాయ నమః శంకరశేఖర || ౨ ||',
        '',
        'యుగానాం యుగకర్తా త్వం నిశానాథో నిశాకరః |',
        'సంవత్సరాణాం మాసానామృతూనాం తు తథైవ చ || ౩ ||',
        '',
        'దక్షిణాయణమాసానాం వర్తతే త్వం నిశాకర |',
        'ఉత్తరాయణమాసానాం వర్తతే త్వం నిశాకర || ౪ ||',
        '',
        'యజ్ఞానాం చైవ సర్వేషాం ఫలదాతా త్వమేవ చ |',
        'ఓషధీనాం చ సర్వాసాం రసానాం చైవ సర్వశః || ౫ ||',
        '',
        '|| ఇతి శ్రీ చంద్ర స్తోత్రం 1 సమాప్తమ్ ||'
      ]
    }
  ],
  poojas: [],
  mantras: [
    { slug: 'om-somaya-namah', te: 'ఓం సోమాయ నమః', en: 'Om Somaya Namah', type: 'Mula Mantra', mantra: 'ఓం సోమాయ నమః', meaning: 'The mula mantra of Chandra — for mental peace and emotional balance.', usage: '108 times on Mondays' },
    { slug: 'chandra-gayatri-mantra', te: 'చంద్ర గాయత్రీ మంత్రం', en: 'Chandra Gayatri Mantra', type: 'Gayatri', mantra: 'ఓం పద్మధరాయ విద్మహే హేమరూపాయ ధీమహి | తన్నో సోమః ప్రచోదయాత్ ||', meaning: 'May we know the lotus-bearer. May we meditate upon the golden form. May Soma guide and inspire us.', usage: 'Daily at dusk, 108 times' }
  ],
  prasadam: [
    {
      slug: 'chandra-prasadam',
      te: 'చంద్రుడి ప్రసాదం',
      en: 'Chandra Prasadam',
      type: 'Prasadam',
      items: [
        { deity: 'చంద్రుడు', dish: 'పాలు, అటుకులు, తెల్ల పూలు', quantity: '16 చెంచాలు', recipe: 'పాలు మరిగించి, అటుకులు, తెల్ల పూలు కలిపి సమర్పించండి. చంద్రుడికి తెల్ల రంగు ప్రియం.' }
      ]
    }
  ],
  homa: []
};
if (typeof module !== 'undefined' && module.exports) module.exports = ChandraContent;
else if (typeof window !== 'undefined') window.ChandraContent = ChandraContent;
