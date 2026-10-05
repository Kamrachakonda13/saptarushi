// Final image selection for the deities that shipped with an emoji-on-gradient
// placeholder. Chosen by eye from the contact sheets produced by
// tools/fetch-deity-candidates.js -- not by search rank.
//
// pick  = index into the candidate row for that slug
// file  = direct Commons title, for cases where the search did not surface the
//         right work at all
// art   = no photograph exists on Commons; draw an attribute symbol instead
//
// Each note records the iconographic feature that made the choice, since a
// generic "temple" photo would have been wrong for most of these.
module.exports = {
  // --- photograph -----------------------------------------------------------
  vishnu:             { pick: 1, note: 'blue garlanded murti, conch and discus both legible' },
  brahma:             { pick: 5, note: 'four heads legible, full figure with attendants' },
  saraswati:          { pick: 1, note: 'temple murti with veena, single deity' },
  kali:               { pick: 2, note: 'centred garlanded murti under canopy' },
  'durga-saptashati': { pick: 3, note: 'sanctum murti; chosen over the painted panel so it does not duplicate durga.jpg' },
  lalitha:            { pick: 3, note: 'Tripurasundari seated on lion, serpent and canopy visible' },
  nandi:              { pick: 4, note: 'frontal full-form bull, well lit' },
  radha:              { pick: 1, note: 'clear Radha-Krishna pair, unobstructed' },
  sita:               { pick: 1, note: 'vivid Rama-Sita pair in shrine' },
  narasimha:          { pick: 3, note: 'Hampi lion-face close-up, fangs and mane unmistakable' },
  annapurna:          { pick: 4, note: 'cooking ladle in hand, the Annapurna attribute' },
  tulasi:             { pick: 1, note: 'Tulasi plant on a tulasi-vrindavan pedestal' },
  dakshinamurthy:     { pick: 1, note: 'standing on the dwarf figure, his defining vahana' },
  shesha:             { pick: 1, note: 'black stone hooded cobra' },
  bhairava:           { pick: 5, note: 'symmetric vermillion-smeared face with tridents' },
  navadurga:          { pick: 1, note: 'ornate brass nine-goddess panel' },
  padmavathi:         { pick: 1, note: 'garlanded goddess on lotus, stone shrine' },
  chamundi:           { pick: 1, note: 'multi-armed goddess carved in a niche' },
  agni:               { pick: 3, note: 'ram relief -- Agni is its vahana' },
  varuna:             { pick: 1, note: 'public-domain painting, Varuna on his white makara' },
  indra:              { pick: 1, note: 'deity on an elephant; Indra rides Airavata' },
  meenakshi:          { pick: 2, note: 'black-stone goddess in the traditional magenta dress' },
  ganga:              { pick: 2, note: 'white-robed Ganga with crown and kalash' },
  kubera:             { pick: 1, note: 'pot-bellied seated yaksha, the Kubera build' },
  surya:              { pick: 1, note: 'crowned stone deity garlanded in a niche' },
  matrikas:           { pick: 0, note: 'doorway flanked by the Matrika panels' },
  prathyangira:       { pick: 1, note: 'classical painting of the fierce lion-riding form; chosen over the giant modern concrete statues' },

  // Search never returned the right work, so fetch the file by title.
  chandra: { file: 'File:Chandra, The Moon God; Folio from a Book of Dreams LACMA M.83.219.2 (1 of 3).jpg',
             note: 'public-domain LACMA folio; no temple photograph of the moon god exists' },

  // --- drawn attribute symbol ----------------------------------------------
  // Two searches each returned only temple architecture, festival crowds or an
  // unrelated deity. Rather than ship a misleading photo, each gets a drawn
  // symbol of its own attribute.
  // Soma and Chandra are two names for the moon. Giving both the same LACMA
  // folio would put an identical picture twice in the rail, so Soma gets the
  // drawn crescent instead.
  soma:               { art: 'crescent' },
  yama:               { art: 'buffalo' },
  vayu:               { art: 'wind' },
  dattatreya:         { art: 'threeface' },
  kamakshi:           { art: 'lotus' },
  andal:              { art: 'srivilliputhur' },
  parvathi:           { art: 'parvathi' },
  'ekadasha-rudras':  { art: 'rudra' },
  'ashta-lakshmi':    { art: 'ashtalakshmi' },
  'ashta-vasus':      { art: 'vasus' },
  'dwadasha-adityas': { art: 'adityas' },
  rajarajeshwari:     { art: 'padma' },
  visalakshi:         { art: 'padma' },
  gayatri:            { art: 'gayatri' },
};