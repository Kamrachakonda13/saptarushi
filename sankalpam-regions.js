// sankalpam-regions.js
// Clean Telugu geographic clauses for Sankalpam. No foreign-language pollution.

window.SANKALPAM_REGIONS = [

  // ============ భారతదేశం — దక్షిణం ============
  {
    id: 'andhra-telangana',
    group: 'భారతదేశం',
    label: 'ఆంధ్రప్రదేశ్ / తెలంగాణ',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః దక్షిణ దిగ్భాగే, శ్రీశైలస్య దక్షిణ దిగ్భాగే, కృష్ణా గోదావర్యోః మధ్య దేశే, కృష్ణా నద్యాః తీరే, ఆంధ్ర దేశే',
    defaultCities: ['హైదరాబాద్', 'విజయవాడ', 'విశాఖపట్నం', 'తిరుపతి', 'వరంగల్', 'గుంటూరు'],
    panchangPlaces: ['India|Hyderabad', 'India|Vijayawada', 'India|Visakhapatnam', 'India|Tirupati', 'India|Warangal']
  },
  {
    id: 'karnataka',
    group: 'భారతదేశం',
    label: 'కర్ణాటక',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః దక్షిణ దిగ్భాగే, శ్రీశైలస్య దక్షిణ దిగ్భాగే, తుంగభద్రా కావేర్యోః మధ్య దేశే, కర్ణాటక దేశే',
    defaultCities: ['బెంగళూరు', 'మైసూరు', 'హుబ్బళి', 'మంగళూరు', 'బెళగావి'],
    panchangPlaces: ['India|Bengaluru', 'India|Mysuru', 'India|Mangaluru']
  },
  {
    id: 'tamil-nadu',
    group: 'భారతదేశం',
    label: 'తమిళనాడు',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః దక్షిణ దిగ్భాగే, కావేరీ నద్యాః తీరే, ద్రావిడ దేశే, తమిళ దేశే',
    defaultCities: ['చెన్నై', 'మధురై', 'కోయంబత్తూరు', 'తిరుచిరాపల్లి', 'సేలం', 'కాంచీపురం'],
    panchangPlaces: ['India|Chennai', 'India|Madurai', 'India|Coimbatore']
  },
  {
    id: 'kerala',
    group: 'భారతదేశం',
    label: 'కేరళ',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః దక్షిణ దిగ్భాగే, మలయాచలస్య పశ్చిమ దిగ్భాగే, పెరియార్ భరతప్పుళా నద్యోః తీరే, మలయాళ దేశే, కేరళ దేశే',
    defaultCities: ['తిరువనంతపురం', 'కొచ్చి', 'కోళికోడ్', 'త్రిస్సూర్', 'గురువాయూర్'],
    panchangPlaces: ['India|Thiruvananthapuram', 'India|Kochi', 'India|Kozhikode']
  },

  // ============ భారతదేశం — పశ్చిమం ============
  {
    id: 'maharashtra',
    group: 'భారతదేశం',
    label: 'మహారాష్ట్ర',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః దక్షిణ దిగ్భాగే, వింధ్యాచలస్య దక్షిణ దిగ్భాగే, గోదావరీ నద్యాః తీరే, మహారాష్ట్ర దేశే',
    defaultCities: ['ముంబై', 'పూనే', 'నాగపూర్', 'నాసిక్', 'షోలాపూర్'],
    panchangPlaces: ['India|Mumbai', 'India|Pune', 'India|Nagpur']
  },
  {
    id: 'gujarat',
    group: 'భారతదేశం',
    label: 'గుజరాత్',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః పశ్చిమ దిగ్భాగే, వింధ్యాచలస్య దక్షిణ దిగ్భాగే, నర్మదా సబర్మత్యోః తీరే, గుజరాత్ దేశే',
    defaultCities: ['అహ్మదాబాద్', 'సూరత్', 'వడోదర', 'రాజ్కోట్', 'ద్వారక'],
    panchangPlaces: ['India|Ahmedabad', 'India|Surat', 'India|Vadodara']
  },
  {
    id: 'rajasthan',
    group: 'భారతదేశం',
    label: 'రాజస్థాన్',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః పశ్చిమ దిగ్భాగే, అరవళీ పర్వతస్య pasukan దిగ్భాగే, చంబల్ నద్యాః తీరే, రాజస్థాన దేశే',
    defaultCities: ['జైపూర్', 'జోధ్పూర్', 'ఉదయపూర్', 'అజ్మీర్', 'పుష్కర్'],
    panchangPlaces: ['India|Jaipur', 'India|Jodhpur', 'India|Udaipur']
  },

  // ============ భారతదేశం — ఉత్తరం ============
  {
    id: 'uttar-pradesh',
    group: 'భారతదేశం',
    label: 'ఉత్తర ప్రదేశ్',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః ఉత్తర దిగ్భాగే, వింధ్యాచలస్య ఉత్తర దిగ్భాగే, గంగాయమునయోః తీరే, ఉత్తర ప్రదేశదేశే',
    defaultCities: ['లక్నో', 'కాన్పూర్', 'అయోధ్య', 'వారణాసి', 'ప్రయాగరాజ్', 'మథుర'],
    panchangPlaces: ['India|Lucknow', 'India|Kanpur', 'India|Ayodhya']
  },
  {
    id: 'kashi',
    group: 'భారతదేశం',
    label: 'కాశీ క్షేత్రం',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః ఉత్తర దిగ్భాగే, వింధ్యాచలస్య ఉత్తర దిగ్భాగే, ఆర్యావర్తక దేశే, కాశీ క్షేత్రే, ఆనందవనే, మహాశ్మశానే, అవిముక్త క్షేత్రే, భాగీరథ్యాః పర్ష్చిమ తీరే, శ్రీ విశ్వేశ్వర చరణసన్నిధౌ',
    defaultCities: ['వారణాసి', 'సారనాథ్', 'రామనగర్'],
    panchangPlaces: ['India|Varanasi', 'India|Sarnath']
  },
  {
    id: 'delhi-ncr',
    group: 'భారతదేశం',
    label: 'ఢిల్లీ ప్రాంతం',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః ఉత్తర దిగ్భాగే, వింధ్యాచలస్య ఉత్తర దిగ్భాగే, యమునా నద్యాః తీరే, కురు దేశే, ఢిల్లీ నగరే',
    defaultCities: ['ఢిల్లీ', 'కొత్త ఢిల్లీ', 'గురుగ్రామ్', 'నోయిడా', 'ఫరీదాబాద్'],
    panchangPlaces: ['India|Delhi', 'India|New Delhi', 'India|Gurugram']
  },

  // ============ భారతదేశం — ఇతర రాష్ట్రాలు ============
  {
    id: 'west-bengal',
    group: 'భారతదేశం',
    label: 'పశ్చిమ బెంగాల్',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః ఉత్తర దిగ్భాగే, గంగాభాగీరథ్యోః తీరే, గౌడ దేశే, బంగ దేశే',
    defaultCities: ['కోల్కతా', 'హౌరా', 'దుర్గాపూర్', 'తారాపీఠ్'],
    panchangPlaces: ['India|Kolkata', 'India|Howrah']
  },
  {
    id: 'odisha',
    group: 'భారతదేశం',
    label: 'ఒడిశా',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః ఆగ్నేయ దిగ్భాగే, మహేంద్ర పర్వతస్య తూర్పు దిగ్భాగే, మహానదీ నద్యాః తీరే, ఉత్కళ దేశే, ఒడిశా దేశే',
    defaultCities: ['భువనేశ్వర్', 'కటక్', 'పూరి', 'కోణార్క్'],
    panchangPlaces: ['India|Bhubaneswar', 'India|Cuttack', 'India|Puri']
  },
  {
    id: 'madhya-pradesh',
    group: 'భారతదేశం',
    label: 'మధ్య ప్రదేశ్',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః దక్షిణ దిగ్భాగే, వింధ్యాచలస్య దక్షిణ దిగ్భాగే, నర్మదా నద్యాః తీరే, మధ్యదేశే, మహాకోశల దేశే',
    defaultCities: ['భోపాల్', 'ఇండోర్', 'ఉజ్జయిని', 'ఓంకారేశ్వర్'],
    panchangPlaces: ['India|Bhopal', 'India|Indore', 'India|Ujjain']
  },
  {
    id: 'punjab-haryana',
    group: 'భారతదేశం',
    label: 'పంజాబ్ / హర్యానా',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః ఉత్తర దిగ్భాగే, హిమవతః దక్షిణ దిగ్భాగే, సతద్రుః నద్యాః తీరే, పంచనద దేశే, పంజాబ్ దేశే',
    defaultCities: ['అమృత్సర్', 'లూధియానా', 'చండీగఢ్', 'కురుక్షేత్ర'],
    panchangPlaces: ['India|Amritsar', 'India|Ludhiana', 'India|Chandigarh']
  },
  {
    id: 'himachal-uttarakhand',
    group: 'భారతదేశం',
    label: 'హిమాచల్ / ఉత్తరాఖండ్',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః ఉత్తర దిగ్భాగే, హిమవతః పర్వతస్య మధ్య దిగ్భాగే, గంగాయమునయోః ప్రథమ తీరే, దేవభూమౌ, హిమాచల దేశే',
    defaultCities: ['షిమ్లా', 'ధర్మశాల', 'హరిద్వార్', 'ఋషికేశ్', 'బద్రీనాథ్'],
    panchangPlaces: ['India|Shimla', 'India|Haridwar', 'India|Rishikesh']
  },
  {
    id: 'bihar-jharkhand',
    group: 'భారతదేశం',
    label: 'బీహార్ / జార్ఖండ్',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః ఉత్తర దిగ్భాగే, గంగా నద్యాః తీరే, మగధ దేశే, బీహార్ దేశే',
    defaultCities: ['పట్నా', 'గయ', 'బోధ్ గయ', 'భాగల్పూర్', 'రాంచీ'],
    panchangPlaces: ['India|Patna', 'India|Gaya']
  },
  {
    id: 'northeast',
    group: 'భారతదేశం',
    label: 'ఈశాన్య భారతదేశం',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః ఉత్తర దిగ్భాగే, బ్రహ్మపుత్ర నద్యాః తీరే, ప్రాగ్జ్యోతిష దేశే, కామరూప దేశే',
    defaultCities: ['గౌహతి', 'షిల్లాంగ్', 'ఇంఫాల్', 'కోహిమా', 'ఐజ్వాల్'],
    panchangPlaces: ['India|Guwahati', 'India|Shillong']
  },
  {
    id: 'goa',
    group: 'భారతదేశం',
    label: 'గోవా',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః దక్షిణ దిగ్భాగే, సహ్యాద్రేః పశ్చిమ దిగ్భాగే, మాండవీ నద్యాః తీరే, గోమంతక దేశే, గోవా దేశే',
    defaultCities: ['పనాజీ', 'మడ్గావ్', 'వాస్కో డ గామా'],
    panchangPlaces: ['India|Panaji', 'India|Margao']
  },

  // ============ పొరుగు దేశాలు ============
  {
    id: 'sri-lanka',
    group: 'పొరుగు దేశాలు',
    label: 'శ్రీలంక',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః దక్షిణ దిగ్భాగే, హిందూ మహాసముద్ర మధ్యే, లంకా ద్వీపే, సింహళ దేశే',
    defaultCities: ['కొలంబో', 'కాండీ', 'అనురాధాపుర', 'జాఫ్నా', 'గల్లె'],
    panchangPlaces: ['Sri Lanka|Colombo', 'Sri Lanka|Kandy']
  },
  {
    id: 'nepal',
    group: 'పొరుగు దేశాలు',
    label: 'నేపాల్',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః ఉత్తర దిగ్భాగే, హిమవతః పర్వతస్య మధ్య దిగ్భాగే, బాగ్మతీ నద్యాః తీరే, నేపాల దేశే',
    defaultCities: ['కాఠ్మండు', 'పోఖరా', 'ముక్తినాథ్', 'లంబిని'],
    panchangPlaces: ['Nepal|Kathmandu', 'Nepal|Pokhara']
  },

  // ============ ఉత్తర అమెరికా ============
  {
    id: 'usa-east',
    group: 'ఉత్తర అమెరికా',
    label: 'అమెరికా — తూర్పు తీరం',
    clause: 'క్రౌంచద్వీపే, రమణకవర్షే, ఐంద్రఖండే, మేరోః పశ్చిమ దిగ్భాగే, ఉత్తర అమెరికా ఖండే, అట్లాంటిక్ సాగరస్య పశ్చిమ తీరే, మిసిసిపీ నద్యాః పూర్వ తీరే',
    defaultCities: ['న్యూయార్క్', 'న్యూజెర్సీ', 'బోస్టన్', 'వాషింగ్టన్', 'అట్లాంటా', 'మయామి'],
    panchangPlaces: ['USA|New York', 'USA|Boston', 'USA|Washington DC', 'USA|Atlanta', 'USA|Miami']
  },
  {
    id: 'usa-central',
    group: 'ఉత్తర అమెరికా',
    label: 'అమెరికా — మధ్య ప్రాంతం',
    clause: 'క్రౌంచద్వీపే, రమణకవర్షే, ఐంద్రఖండే, మేరోః పశ్చిమ దిగ్భాగే, ఉత్తర అమెరికా ఖండే, మిసిసిపీ మిస్సోరీ నద్యోః మధ్య దేశే',
    defaultCities: ['షికాగో', 'డెట్రాయిట్', 'క్లీవ్లాండ్', 'సెయింట్ లూయిస్', 'మిన్నియాపోలిస్'],
    panchangPlaces: ['USA|Chicago', 'USA|Detroit', 'USA|Cleveland', 'USA|Minneapolis']
  },
  {
    id: 'usa-south',
    group: 'ఉత్తర అమెరికా',
    label: 'అమెరికా — దక్షిణ ప్రాంతం',
    clause: 'క్రౌంచద్వీపే, రమణకవర్షే, ఐంద్రఖండే, మేరోః పశ్చిమ దిగ్భాగే, ఉత్తర అమెరికా ఖండే, మెక్సికో గల్ఫస్య ఉత్తర తీరే, టెక్సాస్ రాష్ట్రే',
    defaultCities: ['డల్లాస్', 'హ్యూస్టన్', 'ఆస్టిన్', 'శాన్ ఆంటోనియో', 'నాష్విల్'],
    panchangPlaces: ['USA|Dallas', 'USA|Houston', 'USA|Austin', 'USA|Nashville']
  },
  {
    id: 'usa-west',
    group: 'ఉత్తర అమెరికా',
    label: 'అమెరికా — పశ్చిమ తీరం',
    clause: 'క్రౌంచద్వీపే, రమణకవర్షే, ఐంద్రఖండే, మేరోః పశ్చిమ దిగ్భాగే, ఉత్తర అమెరికా ఖండే, పసిఫిక్ సాగరస్య పూర్వ తీరే, రాకీ పర్వతస్య పశ్చిమ దిగ్భాగే',
    defaultCities: ['లాస్ ఏంజెల్స్', 'శాన్ ఫ్రాన్సిస్కో', 'శాన్ డియాగో', 'సియాటిల్', 'పోర్ట్లాండ్'],
    panchangPlaces: ['USA|Los Angeles', 'USA|San Francisco', 'USA|San Diego', 'USA|Seattle']
  },
  {
    id: 'usa-mountain',
    group: 'ఉత్తర అమెరికా',
    label: 'అమెరికా — పర్వత ప్రాంతం',
    clause: 'క్రౌంచద్వీపే, రమణకవర్షే, ఐంద్రఖండే, మేరోః పశ్చిమ దిగ్భాగే, ఉత్తర అమెరికా ఖండే, రాకీ పర్వతస్య మధ్య దేశే',
    defaultCities: ['డెన్వర్', 'సాల్ట్ లేక్ సిటీ', 'ఆల్బుకర్క్', 'లాస్ వేగాస్'],
    panchangPlaces: ['USA|Denver', 'USA|Salt Lake City', 'USA|Las Vegas']
  },
  {
    id: 'canada',
    group: 'ఉత్తర అమెరికా',
    label: 'కెనడా',
    clause: 'క్రౌంచద్వీపే, రమణకవర్షే, ఐంద్రఖండే, మేరోః పశ్చిమ దిగ్భాగే, కెనడా దేశే, గ్రేట్ లేక్స్ ఉత్తర తీరే',
    defaultCities: ['టొరంటో', 'వాంకోవర్', 'మాంట్రియల్', 'ఒట్టవా', 'కాల్గరీ'],
    panchangPlaces: ['Canada|Toronto', 'Canada|Vancouver', 'Canada|Montreal', 'Canada|Ottawa']
  },

  // ============ ఐరోపా ============
  {
    id: 'uk',
    group: 'ఐరోపా',
    label: 'బ్రిటన్',
    clause: 'శాల్మలీద్వీపే, ప్లక్షవర్షే, కింపురుష ఖండే, మేరోః వాయువ్య దిగ్భాగే, అట్లాంటిక్ సముద్ర తీరే, గ్రేట్ బ్రిటన్ దేశే, బృహదారణ్య క్షేత్రే',
    defaultCities: ['లండన్', 'బర్మింగ్హామ్', 'మాంచెస్టర్', 'ఎడిన్బర్గ్', 'లీడ్స్', 'గ్లాస్గో'],
    panchangPlaces: ['UK|London', 'UK|Birmingham', 'UK|Manchester', 'UK|Edinburgh']
  },
  {
    id: 'western-europe',
    group: 'ఐరోపా',
    label: 'పశ్చిమ ఐరోపా',
    clause: 'శాల్మలీద్వీపే, ప్లక్షవర్షే, కింపురుష ఖండే, మేరోః వాయువ్య దిగ్భాగే, యూరప్ ఖండే, పశ్చిమ ఐరోపా దేశే',
    defaultCities: ['పారిస్', 'బెర్లిన్', 'ఆమ్స్టర్డామ్', 'బ్రస్సెల్స్', 'ఫ్రాంక్ఫర్ట్', 'మ్యూనిచ్'],
    panchangPlaces: ['France|Paris', 'Germany|Berlin', 'Germany|Frankfurt', 'Netherlands|Amsterdam']
  },
  {
    id: 'southern-europe',
    group: 'ఐరోపా',
    label: 'దక్షిణ ఐరోపా',
    clause: 'షాల్మలీద్వీపే, ప్లక్షవర్షే, కింపురుష ఖండే, మేరోః వాయువ్య దిగ్భాగే, మధ్యధరా సముద్రస్య ఉత్తర తీరే, దక్షిణ ఐరోపా దేశే',
    defaultCities: ['రోమ్', 'మాడ్రిడ్', 'బార్సిలోనా', 'ఏథెన్స్', 'మిలాన్', 'లిస్బన్'],
    panchangPlaces: ['Italy|Rome', 'Spain|Madrid', 'Spain|Barcelona', 'Greece|Athens']
  },

  // ============ ఓషియానియా ============
  {
    id: 'australia',
    group: 'ఓషియానియా',
    label: 'ఆస్ట్రేలియా',
    clause: 'ప్లక్షద్వీపే, ఐలవర్షే, నవఖండే, మేరోః ఆగ్నేయ దిగ్భాగే, దక్షిణ సముద్ర మధ్యే, అస్త్రలయ దేశే, ఆస్ట్రేలియా ఖండే',
    defaultCities: ['సిడ్నీ', 'మెల్బోర్న్', 'బ్రిస్బేన్', 'పెర్త్', 'అడిలైడ్'],
    panchangPlaces: ['Australia|Sydney', 'Australia|Melbourne', 'Australia|Brisbane']
  },
  {
    id: 'new-zealand',
    group: 'ఓషియానియా',
    label: 'న్యూజిలాండ్',
    clause: 'ప్లక్షద్వీపే, ఐలవర్షే, నవఖండే, మేరోః ఆగ్నేయ దిగ్భాగే, దక్షిణ సముద్ర మధ్యే, న్యూజిలాండ్ ద్వీపే',
    defaultCities: ['ఆక్లాండ్', 'వెల్లింగ్టన్', 'క్రైస్ట్చర్చ్'],
    panchangPlaces: ['New Zealand|Auckland', 'New Zealand|Wellington']
  },
  {
    id: 'fiji-pacific',
    group: 'ఓషియానియా',
    label: 'ఫిజీ / పసిఫిక్ ద్వీపాలు',
    clause: 'ప్లక్షద్వీపే, ఐలవర్షే, నవఖండే, మేరోః ఆగ్నేయ దిగ్భాగే, పసిఫిక్ సాగర మధ్యే, ఫిజీ ద్వీపే',
    defaultCities: ['సువా', 'నాడి', 'లౌటోకా'],
    panchangPlaces: ['Fiji|Suva', 'Fiji|Nadi']
  },

  // ============ আফ్రికా ============
  {
    id: 'east-africa',
    group: 'ఆఫ్రికా',
    label: 'తూర్పు আফ్రికా',
    clause: 'షాల్మలీద్వీపే, కుశవర్షే, మేరోః నైరుతి దిగ్భాగే, హిందూ మహాసముద్రస్య పర్ష్చిమ తీరే, తూర్పు আফ్రికా దేశే',
    defaultCities: ['నైరోబి', 'దార్ ఎస్ సలామ్', 'కంపాలా'],
    panchangPlaces: ['Kenya|Nairobi', 'Tanzania|Dar es Salaam']
  },
  {
    id: 'west-africa',
    group: 'ఆఫ్రికా',
    label: 'పశ్చిమ আফ్రికా',
    clause: 'షాల్మలీద్వీపే, కుశవర్షే, మేరోః నైరుతి దిగ్భాగే, అట్లాంటిక్ సాగరస్య తూర్పు తీరే, పశ్చిమ আফ్రికా దేశే',
    defaultCities: ['లాగోస్', 'అబూజా', 'అక్రా', 'డకార్'],
    panchangPlaces: ['Nigeria|Lagos', 'Ghana|Accra']
  },
  {
    id: 'south-africa',
    group: 'ఆఫ్రికా',
    label: 'దక్షిణ আফ్రికా',
    clause: 'షాల్మలీద్వీపే, కుశవర్షే, మేరోః నైరుతి దిగ్భాగే, హిందూ మహాసముద్ర అట్లాంటిక్ సాగరయోః సంగమే, దక్షిణ আফ్రికా దేశే',
    defaultCities: ['జోహన్నెస్బర్గ్', 'కేప్ టౌన్', 'డర్బన్', 'ప్రిటోరియా'],
    panchangPlaces: ['South Africa|Johannesburg', 'South Africa|Cape Town']
  },

  // ============ మధ్యప్రాచ్యం ============
  {
    id: 'gulf',
    group: 'మధ్యప్రాచ్యం',
    label: 'గల్ఫ్ దేశాలు',
    clause: 'జంబూద్వీపే, క్రౌంచద్వీపయోః మధ్యే, పశ్చిమ దిగ్భాగే, మరిభూమి క్షేత్రే, అరబ్ దేశే, పారసీక సముద్ర తీరే',
    defaultCities: ['దుబాయ్', 'అబుధాబి', 'షార్జా', 'దోహా', 'రియాధ్', 'మస్కట్'],
    panchangPlaces: ['UAE|Dubai', 'UAE|Abu Dhabi', 'Qatar|Doha', 'Saudi Arabia|Riyadh']
  },
  {
    id: 'israel-turkey',
    group: 'మధ్యప్రాచ్యం',
    label: 'ఇజ్రాయెల్ / టర్కీ',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః పశ్చిమ దిగ్భాగే, మధ్యధరా సముద్రస్య పూర్వ తీరే, పశ్చిమ ఆసియా దేశే',
    defaultCities: ['జెరూసలేం', 'టెల్ అవీవ్', 'ఇస్తాంబుల్', 'అంకారా'],
    panchangPlaces: ['Israel|Jerusalem', 'Turkey|Istanbul']
  },

  // ============ ఆగ్నేయ ఆసియా ============
  {
    id: 'singapore-malaysia',
    group: 'ఆగ్నేయ ఆసియా',
    label: 'సింగపూర్ / మలేషియా',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః ఆగ్నేయ దిగ్భాగే, హిందూ మహాసముద్ర మధ్యే, సువర్ణ ద్వీపే, మలయ దేశే',
    defaultCities: ['సింగపూర్', 'కౌలాలంపూర్', 'పెనాంగ్'],
    panchangPlaces: ['Singapore|Singapore', 'Malaysia|Kuala Lumpur']
  },
  {
    id: 'japan-korea',
    group: 'తూర్పు ఆసియా',
    label: 'జపాన్ / కోరియా',
    clause: 'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః ఉత్తర దిగ్భాగే, శాకద్వీపే, జపాన్ దేశే, కోరియా దేశే',
    defaultCities: ['టోక్యో', 'ఒసాకా', 'క్యోటో', 'సియోల్'],
    panchangPlaces: ['Japan|Tokyo', 'Japan|Osaka', 'South Korea|Seoul']
  },

  // ============ దక్షిణ అమెరికా / కరేబియన్ ============
  {
    id: 'caribbean',
    group: 'అమెరికా',
    label: 'కరేబియన్',
    clause: 'క్రౌంచద్వీపే, రమణకవర్షే, ఐంద్రఖండే, మేరోః పশ্চিম దిగ్భాగే, కరేబియన్ సముద్ర మధ్యే, పసచిమ భారత ద్వీపే',
    defaultCities: ['పోర్ట్ ఆఫ్ స్పెయిన్', 'జార్జ్టౌన్', 'పరామరిబో'],
    panchangPlaces: ['Trinidad and Tobago|Port of Spain', 'Guyana|Georgetown']
  },
  {
    id: 'south-america',
    group: 'అమెరికా',
    label: 'దక్షిణ అమెరికా',
    clause: 'క్రౌంచద్వీపే, రమణకవర్షే, ఐంద్రఖండే, మేరోః అభివృద్ధి దిగ్భాగే, దక్షిణ అమెరికా ఖండే, బ్రెజిల్ దేశే',
    defaultCities: ['సావో పాలో', 'రియో డి జనీరో', 'బ్యూనస్ ఐరిస్', 'లిమా'],
    panchangPlaces: ['Brazil|Sao Paulo', 'Argentina|Buenos Aires']
  }
];