// tools/deity-image-sources.js
// Curated search terms for the deities that still have a placeholder tile.
// The generic rail title is often ambiguous on Commons ("Durga" may be a
// festival, a weapon or a person), so each entry carries an explicit term
// aimed at a temple murti, plus any extra terms worth trying in order.
//
// status: 'missing' means the pill currently renders the emoji-on-gradient
// placeholder SVG in assets/deities.

module.exports = {
  brahma:            { terms: ['Brahma idol temple murti', 'Brahma statue temple India'] },
  vishnu:            { terms: ['Vishnu idol temple', 'Vishnu murti temple'] },
  narasimha:         { terms: ['Lakshmi Narasimha statue Hampi', 'Narasimha idol temple'] },
  navadurga:         { terms: ['Navadurga idol', 'Navadurga murti temple'] },
  saraswati:         { terms: ['Saraswati idol temple', 'Saraswati murti'] },
  lalitha:           { terms: ['Lalitha Tripurasundari idol', 'Tripurasundari idol temple'] },
  kali:              { terms: ['Kali idol temple', 'Kalika murti temple'] },
  kamakshi:          { terms: ['Kamakshi Amman idol', 'Kamakshi Amman murti temple'] },
  meenakshi:         { terms: ['Meenakshi Amman idol', 'Meenakshi goddess statue temple', 'Meenakshi idol sanctum'] },
  visalakshi:        { terms: ['Visalakshi idol temple', 'Visalakshi Perumal'] },
  padmavathi:        { terms: ['Padmavathi idol temple', 'Padmavathi murti'] },
  parvathi:          { terms: ['Parvati idol temple', 'Parvathi murti', 'Parvati goddess statue'] },
  radha:             { terms: ['Radha Krishna idol temple', 'Radha murti'] },
  sita:              { terms: ['Sita Rama idol temple', 'Sita murti temple'] },
  andal:             { terms: ['Andal idol temple', 'Kodhai Andal statue', 'Andal murti shrine'] },
  annapurna:         { terms: ['Annapurna idol temple', 'Annapurna Devi murti'] },
  'ashta-lakshmi':   { terms: ['Ashta Lakshmi', 'Ashtalakshmi idol'] },
  chamundi:          { terms: ['Chamundeshwari idol temple', 'Chamundi murti Mysore'] },
  prathyangira:      { terms: ['Pratyangira', 'Pratyangira idol temple'] },
  rajarajeshwari:    { terms: ['Rajarajeshwari idol', 'Rajarajeshwari murti temple'] },
  dattatreya:        { terms: ['Dattatreya idol temple', 'Dattatreya statue three faces', 'Dattatreya murti'] },
  surya:             { terms: ['Surya idol temple India', 'Surya statue temple Konark', 'Sun god Surya idol'] },
  chandra:           { terms: ['Chandra moon god idol', 'Chandra statue temple', 'Chandra The Moon God LACMA folio'] },
  kubera:            { terms: ['Kubera statue temple', 'Kubera yaksha image'] },
  bhairava:          { terms: ['Bhairava idol temple', 'Bhairava statue'] },
  ganga:             { terms: ['Ganga murti idol temple', 'Ganga goddess idol', 'Ganga temple statue'] },
  tulasi:            { terms: ['Tulasi plant shrine', 'Tulsi Vrindavan'] },
  gayatri:           { terms: ['Gayatri Devi idol', 'Gayatri murti temple'] },
  agni:              { terms: ['Agni deity idol', 'Agni statue temple'] },
  varuna:            { terms: ['Varuna idol statue', 'Varuna deity image'] },
  indra:             { terms: ['Indra deity statue', 'Indra idol'] },
  vayu:              { terms: ['Vayu statue temple', 'Vayu deity image', 'Wind god Vayu image'] },
  yama:              { terms: ['Yamraj idol temple', 'Yama statue temple India', 'Yama deity idol shrine'] },
  // No temple photograph of Soma exists on Commons; the moon god is only
  // represented in classical manuscript painting, so a public-domain LACMA folio
  // is both the most canonical and the only freely licensed option.
  soma:              { terms: ['Chandra The Moon God LACMA folio', 'Soma sculpture India'] },
  'ashta-vasus':     { terms: ['Ashta Vasus', 'Vasudeva Ashta Vasu temple'] },
  'ekadasha-rudras': { terms: ['Ekadasha Rudra statue', 'Eleven Rudras image'] },
  shesha:            { terms: ['Shesha serpent statue', 'Shesha idol temple'] },
  dakshinamurthy:    { terms: ['Dakshinamurti idol', 'Dakshinamurthy statue temple'] },
  'durga-saptashati':{ terms: ['Durga idol temple', 'Durga murti sanctum'] },
  'dwadasha-adityas':{ terms: ['Dwadasha Adityas', 'Aditya sun god statue temple'] },
  matrikas:          { terms: ['Saptamatrika temple sculpture', 'Matrika goddess image', 'Saptamatrika idol'] },
  nandi:             { terms: ['Nandi bull statue temple', 'Nandi idol'] },
};