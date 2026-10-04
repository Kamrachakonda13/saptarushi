// content/and-content.js
// Andal / Goda content — Telugu only.
// Andal / Goda is the only female Alvar, known for her 108 Divya Prabandam hymns.

const AndalGodaContent = {
  deity: 'and',
  label: 'Andal / Goda',
  te: 'శ్రీ ఆండాల్ / గోదా దేవి',

  stotras: [
    {
      slug: 'akkara-adisil',
      te: 'శ్రీ Acker Adisil',
      en: 'Akkara Adisil',
      type: 'Pongal',
      verses: [
        'ఓं త polysaccharides... (Telugu stotra verses)'
      ]
    }
  ],

  poojas: [
    {
      slug: 'akkara-adisil-pooja',
      te: ' Acker Adisil Pooja',
      en: 'Akkara Adisil Pooja',
      type: 'Pooja Vidhanam',
      steps: [
        { step: 1, te: ' rice and moong dal wash', en: 'Wash rice and moong dal' },
        { step: 2, te: ' cook with milk', en: 'Cook with milk until soft' },
        { step: 3, te: ' add jaggery syrup', en: 'Add jaggery syrup and mix' },
        { step: 4, te: ' garnish with cashews and raisins', en: 'Garnish with fried cashews and raisins' }
      ]
    }
  ],

  mantras: [
    {
      slug: 'andal-bija-mantra',
      te: 'Andal Bija Mantram',
      en: 'Andal Bija Mantra',
      type: 'Bija Mantra',
      mantra: 'ॐ ऐं ह्रीं क्लींandalaye नमः',
      meaning: 'Salutations to Andal, the divine mother',
      usage: 'Chant during pooja and abhishekam'
    }
  ],

  prasadam: [
    {
      slug: 'akkara-adisil',
      te: ' Acker Adisil',
      en: 'Akkara Adisil',
      type: 'Pongal',
      items: [
        {
          deity: 'శ్రీ ఆండాల్ / గోదా దేవి',
          dish: ' Acker Adisil',
          quantity: 'quantities not fixed - serve according to number of devotees',
          recipe: 'Raw rice - 1/4 cup, Moong dal - 1 tbsp, Jaggery - 1/2 cup, Saffron - a pinch, Cashews - 12, Raisins - 15, Cardamom - a pinch. Cook rice and moong dal in milk until soft. Add jaggery syrup and mix well. Add saffron, cardamom, and fried cashews and raisins. Offer as prasadam.'
        }
      ]
    }
  ],

  homa: [
    {
      slug: 'andal-homa',
      te: 'Andal Homa',
      en: 'Andal Homam',
      type: 'Homa',
      note: 'Performed for devotees seeking divine blessings',
      keyMantras: ['ॐ ऐं ह्रीं क्लीं Andalaye namah'],
      materials: ['Ghee', 'Sesame seeds']
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) module.exports = AndalGodaContent;
else if (typeof window !== 'undefined') window.AndalGodaContent = AndalGodaContent;
