// Deepam — Telugu Bhakti Books & Audio
// Replica catalog. Matches bhakti-dharma-portal.lovable.app
// Set `localPath` on an audio item to a real mp3 to make it play in-page.

const DeepamData = {
  brand: {
    mark: 'దీ',
    name: 'Saptarushi',
    tagline: 'తెలుగు భక్తి',
  },

  deities: [
    // ---- Trimurti ----
    { slug: 'brahma',       label: 'Brahma',          symbol: '✦', te: 'శ్రీ బ్రహ్మ',              desc: 'The Creator — lord of the four Vedas and of knowledge itself.',                                             content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'vishnu',       label: 'Vishnu',           symbol: '☸', te: 'శ్రీ విష్ణువు',            desc: 'The Preserver — lord of Vaikuntha, sustainer of dharma across the ten avatars.',                            content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'shiva',        label: 'Shiva',            symbol: '☉', te: 'శ్రీ శివుడు',             desc: 'Chants, abhishekam recitals and readings for Mondays, Maha Shivaratri and every quiet evening in between.', content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },

    // ---- Vishnu avatars / forms ----
    { slug: 'venkateswara', label: 'Venkateswara',     symbol: '✦', te: 'శ్రీ వేంకటేశ్వర స్వామి',  desc: 'The Lord of the seven hills. Begin the day with his morning hymns, then move through stotras and scripture.',  content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'rama',         label: 'Rama',             symbol: '☀', te: 'శ్రీ రాముడు',             desc: 'Ramayana readings, bhajans and stotras gathered in one calm place.',                                         content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'krishna',      label: 'Krishna',          symbol: '☾', te: 'శ్రీ కృష్ణుడు',           desc: 'Gita readings, kirtanas and flute-soft bhajans for daily listening.',                                        content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'narasimha',    label: 'Narasimha',        symbol: '🦁', te: 'శ్రీ నృసింహుడు',          desc: 'The man-lion avatar — protector of Prahlada and remover of fear.',                                          content: { stotras: true, poojas: true, mantras: true, prasadam: true, homa: true } },

// ---- Devi / Shakti ----
    { slug: 'durga',        label: 'Durga / Devi',     symbol: '✧', te: 'శ్రీ దుర్గా దేవి',         desc: 'Devi stotras and Navaratri recitals, arranged day by day.',                                                 content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'navadurga',    label: 'Navadurga',        symbol: '🕉', te: 'నవదుర్గలు',               desc: 'The nine forms of Durga — one for each night of Navaratri.',                                                content: { stotras: true, poojas: true, mantras: true, prasadam: true, homa: true } },
    { slug: 'lakshmi',      label: 'Lakshmi',          symbol: '✦', te: 'శ్రీ లక్ష్మీ దేవి',         desc: 'Friday prayers, ashtottaram and hymns for abundance and gratitude.',                                        content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'saraswati',    label: 'Saraswati',        symbol: 'ᬆ', te: 'శ్రీ సరస్వతీ దేవి',        desc: 'Goddess of learning, music and speech — for students and seekers.',                                         content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'lalitha',      label: 'Lalitha',          symbol: '✿', te: 'శ్రీ లలితా దేవి',          desc: 'The supreme goddess of Sri Vidya — Sahasranamam, Trishati and Pancharatnam.',                               content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
{ slug: 'kali',         label: 'Kali',             symbol: '⚔', te: 'శ్రీ కాళీ దేవి',           desc: 'The fierce mother — destroyer of fear and ego.',                                                            content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'kamakshi',     label: 'Kamakshi',         symbol: '◈', te: 'శ్రీ కామాక్షీ దేవి',       desc: 'The presiding goddess of Kanchipuram — grace, love and liberation.',                                        content: { stotras: true, poojas: true, mantras: true, prasadam: true } },
    { slug: 'meenakshi',    label: 'Meenakshi',        symbol: '◈', te: 'శ్రీ మీనాక్షీ దేవి',       desc: 'The fish-eyed goddess of Madurai — queen of the Pandya land.',                                              content: { stotras: true, poojas: true, mantras: true, prasadam: true } },
    { slug: 'visalakshi',   label: 'Visalakshi',       symbol: '◈', te: 'శ్రీ విశాలాక్షీ దేవి',     desc: 'The wide-eyed mother of Kashi — bestower of wisdom and moksha.',                                            content: { stotras: true, poojas: true, mantras: true, prasadam: true, homa: true } },
    { slug: 'padmavathi',   label: 'Padmavathi',       symbol: '❁', te: 'శ్రీ పద్మావతీ దేవి',      desc: 'The lotus-born consort of Venkateswara at Tiruchanoor.',                                                    content: { stotras: true, poojas: true, mantras: true, prasadam: true, homa: true } },
    { slug: 'parvathi',     label: 'Parvathi',         symbol: '☽', te: 'శ్రీ పార్వతీ దేవి',        desc: 'The consort of Shiva — embodiment of shakti and devotion.',                                                 content: { stotras: true, poojas: true, mantras: true, prasadam: true } },
    { slug: 'radha',        label: 'Radha',            symbol: '❀', te: 'శ్రీ రాధా దేవి',           desc: 'The beloved of Krishna — symbol of the soul\'s longing for God.',                                            content: { stotras: true, poojas: true, mantras: true, prasadam: true } },
    { slug: 'sita',         label: 'Sita',             symbol: '❀', te: 'శ్రీ సీతా దేవి',           desc: 'The consort of Rama — model of virtue, patience and devotion.',                                             content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
{ slug: 'andal',          label: 'Andal / Goda',     symbol: '❁', te: 'శ్రీ ఆండాల్ / గోదా దేవి',  desc: 'The only female Alvar — author of Tiruppavai and Nachiyar Thirumozhi.',                                    content: { stotras: true, poojas: true, mantras: true, prasadam: true, homa: true } },
{ slug: 'annapurna',    label: 'Annapurna',        symbol: '🍚', te: 'శ్రీ అన్నపూర్ణాదేవి', desc: 'The goddess of food and nourishment.',                                                      content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
{ slug: 'ashta-lakshmi',label: 'Ashta Lakshmi',    symbol: '🪷', te: 'అష్టలక్ష్ములు', desc: 'The eight forms of Lakshmi.',                                                            content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
{ slug: 'chamundi',     label: 'Chamundi',         symbol: '☾', te: 'శ్రీ చాముండేశ్వరీ దేవి',  desc: 'The slayer of Chanda and Munda — presiding deity of Mysore.',                                              content: { stotras: true, poojas: true, mantras: true, prasadam: true } },
{ slug: 'prathyangira', label: 'Prathyangira',     symbol: '☼', te: 'శ్రీ ప్రత్యంగిరా దేవి',    desc: 'The lion-faced goddess — destroyer of negativity and protector of devotees.',                               content: { stotras: true, poojas: true, mantras: true, prasadam: true } },
{ slug: 'rajarajeshwari', label: 'Rajarajeshwari', symbol: '✺', te: 'శ్రీ రాజరాజేశ్వరీ దేవి',  desc: 'The queen of queens — supreme goddess of the Sri Chakra.',                                                  content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },

    // ---- Other major deities ----
    { slug: 'ganesha',      label: 'Ganesha',          symbol: '◐', te: 'శ్రీ వినాయకుడు',          desc: 'Begin anything here — prayers for a clear start and a steady mind.',                                         content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'hanuman',      label: 'Hanuman',          symbol: '➤', te: 'శ్రీ ఆంజనేయ స్వామి',      desc: 'Chalisa recitals, stotras and Saturday listening for courage and calm.',                                     content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'subrahmanya',  label: 'Subrahmanya',      symbol: '☀', te: 'శ్రీ సుబ్రహ్మణ్య స్వామి',  desc: 'Kavacham recitals and stotras for Skanda devotees.',                                                         content: { stotras: true, poojas: true, mantras: true, prasadam: true, homa: true } },
    { slug: 'ayyappa',      label: 'Ayyappa',          symbol: '✚', te: 'శ్రీ అయ్యప్ప స్వామి',      desc: 'Deeksha-season songs, saranu ghosha and travel prayers.',                                                     content: { stotras: true, poojas: true, mantras: true, prasadam: true } },
    { slug: 'saibaba',      label: 'Saibaba',          symbol: '☽', te: 'శ్రీ సాయిబాబా',           desc: 'Aarti recitals and readings from Shirdi tradition.',                                                         content: { stotras: true, poojas: true, mantras: true, prasadam: true } },
    { slug: 'dattatreya',   label: 'Dattatreya',       symbol: '☬', te: 'శ్రీ దత్తాత్రేయుడు',       desc: 'The combined form of the Trimurti — guru of gurus.',                                                          content: { stotras: true, poojas: true, mantras: true, prasadam: true, homa: true } },

// ---- Planetary / celestial ----
    { slug: 'navagraha',    label: 'Navagraha',        symbol: '☾', te: 'నవగ్రహాలు',              desc: 'Planetary prayers and mantras, one for each of the nine.',                                                   content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'surya',        label: 'Surya',            symbol: '☀', te: 'శ్రీ సూర్య భగవానుడు',     desc: 'The Sun God — giver of health, vitality and clarity.',                                                       content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'chandra',      label: 'Chandra',          symbol: '☽', te: 'శ్రీ చంద్రుడు',           desc: 'The Moon God — lord of the mind and of all that soothes.',                                                   content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'kubera',       label: 'Kubera',           symbol: '⛃', te: 'శ్రీ కుబేరుడు',           desc: 'The lord of wealth — guardian of the northern quarter.',                                                     content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'bhairava',     label: 'Bhairava',         symbol: '⚔', te: 'శ్రీ కాలభైరవుడు',        desc: 'The fierce form of Shiva — guardian of Kashi and of all who seek protection.',                              content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },

    // ---- Natural / elemental ----
    { slug: 'ganga',        label: 'Ganga',            symbol: '≈', te: 'శ్రీ గంగాదేవి',           desc: 'The river goddess — purifier of sins and giver of moksha.',                                                  content: { stotras: true, poojas: true, mantras: true, prasadam: true, homa: true } },
    { slug: 'tulasi',       label: 'Tulasi',           symbol: '❀', te: 'శ్రీ తులసీ దేవి',         desc: 'The sacred basil — beloved of Vishnu and guardian of the home.',                                             content: { stotras: true, poojas: true, mantras: true, prasadam: true, homa: true } },
    { slug: 'gayatri',      label: 'Gayatri',          symbol: 'ᬊ', te: 'శ్రీ గాయత్రీ దేవి',        desc: 'The mother of the Vedas — personification of the Gayatri Mantra.',                                           content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },

    // ---- Vedic devas ----
    { slug: 'agni',         label: 'Agni',             symbol: '🔥', te: 'శ్రీ అగ్ని దేవుడు',       desc: 'The fire god — mouth of the gods and carrier of all offerings.',                                             content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'varuna',       label: 'Varuna',           symbol: '🌊', te: 'శ్రీ వరుణుడు',           desc: 'The lord of waters and of cosmic order.',                                                                    content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'indra',        label: 'Indra',            symbol: '⚡', te: 'శ్రీ ఇంద్రుడు',           desc: 'The king of the devas — wielder of the thunderbolt.',                                                        content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'vayu',         label: 'Vayu',             symbol: '💨', te: 'శ్రీ వాయు దేవుడు',       desc: 'The god of wind.',                                                                                      content: { stotras: true, poojas: true, mantras: true, prasadam: true } },
    { slug: 'yama',         label: 'Yama',             symbol: '☠', te: 'శ్రీ యముడు',           desc: 'The lord of dharma and death.',                                                                          content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'soma',         label: 'Soma',             symbol: '🌙', te: 'శ్రీ సోముడు',           desc: 'The Vedic god of the moon.',                                                                                     content: { stotras: true, poojas: true, mantras: true, prasadam: true } },
    { slug: 'ashta-vasus',  label: 'Ashta Vasus',      symbol: '8️⃣', te: 'అష్టవసువులు',        desc: 'The eight elemental deities.',                                                                                       content: { stotras: true, poojas: true, mantras: true, prasadam: true } },
    { slug: 'ekadasha-rudras', label: 'Ekadasha Rudras', symbol: '🔱', te: 'ఏకాదశ రుద్రులు',  desc: 'The eleven forms of Rudra.',                                                                                      content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'shesha',       label: 'Shesha',           symbol: '🐍', te: 'శ్రీ ఆదిశేషుడు',       desc: 'The primordial serpent.',                                                                                      content: { stotras: true, poojas: true, mantras: true, prasadam: true } },

    // ---- Additional deities ----
    { slug: 'dakshinamurthy', label: 'Dakshinamurthy', symbol: '🕉️', te: 'శ్రీ దక్షిణామూర్తి', desc: 'The silent teacher.',                                                                           content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'durga-saptashati', label: 'Durga Saptashati', symbol: '📖', te: 'దుర్గా సప్తశతీ', desc: 'The 700 verses of Durga.',                                                                  content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'dwadasha-adityas', label: 'Dwadasha Adityas', symbol: '☀️', te: 'ద్వాదశ ఆదిత్యులు', desc: 'The twelve forms of Surya.',                                                             content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'matrikas', label: 'Matrikas', symbol: '🕉', te: 'సప్తమాతృకలు', desc: 'The seven divine mothers.',                                                               content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },
    { slug: 'nandi',      label: 'Nandi',          symbol: '🐂', te: 'శ్రీ నందీశ్వరుడు', desc: 'The bull vehicle of Shiva and the chief of his ganas.',                                             content: { stotras: true, poojas: true, mantras: true, homa: true, prasadam: true } },

    // ---- Planetary / celestial ----

    // ---- Vedic devas ----
  ],

  audio: [
    { slug: 'suprabhatam', deity: 'venkateswara', te: 'శ్రీ వేంకటేశ సుప్రభాతం', en: 'Morning Suprabhatam recital', duration: '12:40', tag: 'Chant', localPath: '', text: 'The morning waking hymn of Sri Venkateswara — Vara veena mrudu tala, a temple bell and a fresh beginning.' },
    { slug: 'venkateswara-geetalu', deity: 'venkateswara', te: 'వేంకటేశ్వర గీతాలు', en: 'Evening bhajan set', duration: '24:02', tag: 'Bhajan', localPath: '', text: 'An evening set of Venkateswara bhajans for winding down after the day.' },
    { slug: 'deepam-aaradhana', deity: 'venkateswara', te: 'దీపం ఆరాధన', en: 'Deepam aaradhana', duration: '15:48', tag: 'Coming soon', localPath: '', comingSoon: true, text: 'A gentle lamp-waving aaradhana, soon to join the library.' },
    { slug: 'shiva-abhishekam', deity: 'shiva', te: 'శివ అభిషేకం', en: 'Abhishekam recital', duration: '18:10', tag: 'Chant', localPath: '', text: 'Rudrabhishekam chants for Shiva — calm, repetitive and clearing.' },
    { slug: 'somavara-prarthana', deity: 'shiva', te: 'సోమవార ప్రార్థన', en: 'Monday evening prayers', duration: '09:22', tag: 'Coming soon', localPath: '', comingSoon: true, text: 'Monday evening prayers for Shiva, coming soon.' },
    { slug: 'rama-bhajan', deity: 'rama', te: 'రామ భజన', en: 'Rama bhajan gathering', duration: '21:35', tag: 'Bhajan', localPath: '', text: 'A village-style Rama bhajan kirtan, easy to hum along to.' },
    { slug: 'krishna-kirtana', deity: 'krishna', te: 'కృష్ణ కీర్తన', en: 'Krishna kirtana', duration: '06:30', tag: 'Bhajan', localPath: '', text: 'A short Krishna kirtana — flute, jati and a bright refrain.' },
    { slug: 'vinayaka-prarthana', deity: 'ganesha', te: 'వినాయక ప్రార్థన', en: 'Vinayaka prarthana', duration: '05:14', tag: 'Chant', localPath: '', text: 'A simple opening prayer to Vinayaka before any new beginning.' },
    { slug: 'anjaneya-shanivara', deity: 'hanuman', te: 'శనివార ఆంజనేయ పఠనం', en: 'Saturday Anjaneya recital', duration: '14:07', tag: 'Chant', localPath: '', text: 'The Saturday Anjaneya recitation for courage and calm.' },
    { slug: 'navaratri-devi', deity: 'durga', te: 'నవరాత్రి దేవి పఠనం', en: 'Navaratri devi recital', duration: '16:44', tag: 'Coming soon', localPath: '', comingSoon: true, text: 'Devi recitals arranged for the nine nights of Navaratri.' },
    { slug: 'shukravara-lakshmi', deity: 'lakshmi', te: 'శుక్రవార లక్ష్మీ ప్రార్థన', en: 'Friday Lakshmi prayers', duration: '08:15', tag: 'Aarti', localPath: '', text: 'Friday Lakshmi prayers with aunty-voice warmth and a steady beat.' },
    { slug: 'sai-aarti', deity: 'saibaba', te: 'సాయి ఆరతి', en: 'Sai aarti', duration: '11:02', tag: 'Aarti', localPath: '', text: 'A serene Sai aarti from the Shirdi tradition.' },
    { slug: 'saranu-ghosha', deity: 'ayyappa', te: 'శరణు ఘోష', en: 'Saranu ghosha', duration: '13:20', tag: 'Coming soon', localPath: '', comingSoon: true, text: 'The Ayyappa saranu ghosha call, coming soon.' },
    { slug: 'skanda-kavacham', deity: 'subrahmanya', te: 'స్కంద కవచం', en: 'Skanda kavacham recital', duration: '10:48', tag: 'Chant', localPath: '', text: 'A clear recital of Sri Skanda Kavacham for Subrahmanya devotees.' },
    { slug: 'navagraha-mantras', deity: 'navagraha', te: 'నవగ్రహ మంత్రాలు', en: 'Navagraha mantras', duration: '19:30', tag: 'Chant', localPath: '', text: 'One mantra for each of the nine planets, chanted slowly.' },
  ],

  books: [
    { slug: 'venkateswara-mahatyam', deity: 'venkateswara', te: 'శ్రీ వేంకటేశ్వర మహాత్మ్యం', en: 'The Hill of Grace — a devotee\'s guide', meta: 'Compiled for daily reading', chapters: [
      { title: 'Before you begin', paras: ['This short guide is meant to be read slowly, a page at a time.', 'It gathers the story of the Hill of Grace — Sri Venkateswara at Tirumala — into three short readings for daily devotion.'] },
      { title: 'The morning practice', paras: ['Begin before sunrise. Light a lamp, sit facing the east, and let the Suprabhatam settle the mind.', 'Read one stanza aloud, then sit in silence for a minute. The practice is repetition with attention.'] },
      { title: 'Festival days', paras: ['On festival days the hill fills with pilgrims. On the eve of Brahmotsavam, offer a coconut and a garland of tulasi.', 'Keep the day simple: one visit, one offering, one prayer said from the heart.'] },
    ] },
    { slug: 'shiva-daily', deity: 'shiva', te: 'శివ ఆరాధన', en: 'Mondays with Shiva', meta: 'Compiled for daily reading', chapters: [
      { title: 'The quiet hour', paras: ['Monday is Shiva\'s day. Keep one quiet hour for him.', 'Pour water over the lingam — or simply pour your attention into silence. Either is an abhishekam.'] },
    ] },
    { slug: 'rama-katha', deity: 'rama', te: 'రామ కథ', en: 'The story of Rama, retold simply', meta: 'Compiled for daily reading', chapters: [
      { title: 'Part one', paras: ['Rama was born to King Dasaratha as the hope of Ayodhya. This retelling keeps the story plain and free of commentary.', 'Read it aloud if you can — the tale is meant for the voice.'] },
    ] },
    { slug: 'krishna-gita-notes', deity: 'krishna', te: 'గీతా పఠన సూచనలు', en: 'Reading the Gita, chapter by chapter', meta: 'Reader\'s notes · Coming soon', comingSoon: true, chapters: [] },
    { slug: 'ganesha-prayers', deity: 'ganesha', te: 'వినాయక ప్రార్థనలు', en: 'Prayers to begin with', meta: 'Compiled for daily reading · Coming soon', comingSoon: true, chapters: [] },
    { slug: 'hanuman-readings', deity: 'hanuman', te: 'శనివార పఠనాలు', en: 'Saturday readings', meta: 'Compiled for daily reading · Coming soon', comingSoon: true, chapters: [] },
  ],
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DeepamData;
}