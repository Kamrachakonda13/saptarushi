// content/indra-content.js
// Indra content — Telugu only.
// Fill in the arrays below with authoritative Telugu text.
// Grouped as: stotras | poojas | mantras | homa

const IndraContent = {
  deity: 'indra',
  label: 'Indra',
  te: 'శ్రీ ఇంద్రుడు',

  stotras: [
    // {
    //   slug: 'example-stotram',
    //   te: 'ఉదాహరణ స్తోత్రం',
    //   en: 'Example Stotram',
    //   type: 'Stotra',
    //   verses: [
    //     'శ్లోకం ౧ ...',
    //     'శ్లోకం ౨ ...'
    //   ]
    // }
  ],

  poojas: [
    // {
    //   slug: 'example-pooja',
    //   te: 'ఉదాహరణ పూజ',
    //   en: 'Example Pooja',
    //   type: 'Pooja Vidhanam',
    //   steps: [
    //     { step: 1, text: 'మొదటి అడుగు...' },
    //     { step: 2, text: 'రెండవ అడుగు...' }
    //   ]
    // }
  ],

  mantras: [
    // {
    //   slug: 'example-mantra',
    //   te: 'ఉదాహరణ మంత్రం',
    //   en: 'Example Mantra',
    //   type: 'Bija Mantra',
    //   mantra: 'ఓం ...',
    //   meaning: '...',
    //   usage: '...'
    // }
  ],

  homa: [
    // {
    //   slug: 'example-homam',
    //   te: 'ఉదాహరణ హోమం',
    //   en: 'Example Homam',
    //   type: 'Homa',
    //   note: '...',
    //   keyMantras: ['ఓం ...'],
    //   materials: ['నెయ్యి (Ghee)', '...']
    // }
  ]
};

if (typeof module !== 'undefined' && module.exports) module.exports = IndraContent;
else if (typeof window !== 'undefined') window.IndraContent = IndraContent;
