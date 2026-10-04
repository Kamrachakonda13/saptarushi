// content/gayatri-content.js
// Gayatri content — Telugu only.
const GayatriContent = {
  deity: 'gayatri',
  label: 'Gayatri',
  te: 'శ్రీ గాయత్రీ దేవి',
  stotras: [
    {
      slug: 'gayatri-stotram',
      te: 'శ్రీ గాయత్రీ స్తోత్రం',
      en: 'Gayatri Stotram',
      type: 'Stotram',
      verses: [
        'నమస్తే దేవి గాయత్రీ సావిత్రీ త్రిపదేఽక్షరీ |',
        'అజరేఽమరే మాతా త్రాహి మాం భవసాగరాత్ || ౧ ||',
        '',
        'నమస్తే సూర్యసంకాశే సూర్యసావిత్రికేఽమలే |',
        'బ్రహ్మవిద్యే మహావిద్యే వేదమాతర్నమోఽస్తు తే || ౨ ||',
        '',
        'అనంతకోటిబ్రహ్మాండవ్యాపినీ బ్రహ్మచారిణీ |',
        'నిత్యానందే మహామాయే సర్వజ్ఞే త్వాం నమామ్యహమ్ || ౩ ||',
        '',
        '|| ఇతి శ్రీ గాయత్రీ స్తోత్రం సమాప్తమ్ ||'
      ]
    }
  ],
  poojas: [],
  mantras: [
    { slug: 'gayatri-mantra', te: 'గాయత్రీ మంత్రం', en: 'Gayatri Mantra', type: 'Mula Mantra', mantra: 'ఓం భూర్భువః స్వః | తత్సవితుర్వరేణ్యం | భర్గో దేవస్య ధీమహి | ధియో యో నః ప్రచోదయాత్ ||', meaning: 'The supreme mantra of the Vedas — for wisdom, illumination, and spiritual awakening.', usage: '108 times at dawn, noon, and dusk (sandhya)' }
  ],
  prasadam: [
    {
      slug: 'gayatri-prasadam',
      te: 'గాయత్రీ దేవి ప్రసాదం',
      en: 'Gayatri Prasadam',
      type: 'Prasadam',
      items: [
        { deity: 'గాయత్రీ దేవి', dish: 'హవన్ సామగ్రి (బార్లీ, బియ్యం, నువ్వులు, బెల్లం)', quantity: 'జప సంఖ్యలో 1/10వ వంతు ఆహుతులు', recipe: 'హవన్ సామగ్రి: బార్లీ 1 భాగం, బియ్యం 2 భాగాలు, నువ్వులు 3 భాగాలు, బెల్లం 4 భాగాలు — కలిపి హోమం చేయండి. 2400 ఆహుతులు ఉత్తమం.' }
      ]
    }
  ],
  homa: [
    { slug: 'gayatri-homam', te: 'శ్రీ గాయత్రీ హోమం', en: 'Gayatri Homam', type: 'Homa', note: 'Full Telugu procedure — Laghu Paddhati.', keyMantras: ['ఓం భూర్భువః స్వః | తత్సవితుర్వరేణ్యం | భర్గో దేవస్య ధీమహి | ధియో యో నః ప్రచోదయాత్ ||'], materials: ['నెయ్యి (Ghee)', 'పాలు (Milk)', 'తేనె (Honey)', 'అటుకులు (Puffed rice)', 'కొబ్బరి (Coconut)', 'పసుపు (Turmeric)', 'కుంకుమ (Kumkum)'] }
  ]
};
if (typeof module !== 'undefined' && module.exports) module.exports = GayatriContent;
else if (typeof window !== 'undefined') window.GayatriContent = GayatriContent;
