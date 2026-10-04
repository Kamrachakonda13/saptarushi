// fix-commonphalam.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'serve.js');
let content = fs.readFileSync('serve.js', 'utf8');

// Find the exact boundaries
const startMarker = 'const commonPhalam = "మమ ఉపాత్త దురితక్షయద్వారా, శ్రీ పరమేశ్వర ముద్దిశ్య';
const endMarker = 'pending..."";';

const startIdx = content.indexOf(startMarker);
let endIdx = content.indexOf('pending..."";');

if (startIdx === -1 || endIdx === -1) {
    console.log('Markers not found');
    process.exit(1);
}

endIdx += 'pending..."";'.length;

const before = content.slice(0, startIdx);
const after = content.slice(endIdx);

const newSection = `const commonPhalam = "మమ ఉపాత్త దురితక్షయద్వారా, శ్రీ పరమేశ్వర ముద్దిశ్య, శ్రీ పరమేశ్వర ప్రీత్యర్థం, మమ ఉపాత్త దురితక్షయద్వారా, క్షేమ స్థైర్య వీర్య విజయ అభయ ఆయురారోగ్య ఐశ్వర్యాభివృద్ధ్యర్థం, ధర్మార్థ కామమోక్ష చతుర్విధ ఫల పురుషార్థ సిద్ధ్యర్థం, పుత్రపౌత్రాభి వృద్ధ్యర్థం, ఇష్ట కామ్యార్థ సిద్ధ్యర్థం, సకలకార్యేషు సర్వదా దిగ్విజయ సిద్ధ్యర్థం, చింతిత మనోరథ సిద్ధ్యర్థం, ఆముష్మిక సన్మార్గ సిద్ధ్యర్థం, గాఢభక్తి సిద్ధ్యర్థం, కాయక వాచక మానసిక త్రివిధ శేష దోష నివృత్తి ద్వారా, బ్రహ్మహత్యాది మహాపాతక నివృత్యర్థం, మమ జన్మాభ్యాసాత్ జన్మప్రభృతి తత్క్షణ పర్యంతం మధుప్రకాశనతో బాల్య, యౌవన, కౌమార, వార్ధక్య జాగ్రత్త్యవస్థాసు, మనోవాక్కాయేంద్రియ వ్యాపారల రహసిప్రకాశేశ్చ జ్ఞానతో అజ్ఞానతశ్చ చిరకాలాభ్యాసానాం, అనేక జన్మసహస్రోద్భాగితా, ఆధిభౌతిక, ఆధిదైవిక దుఃఖత్రయ నివృత్యర్థం, కోటి సూర్యగ్రహణాం, ఘృతాహుత్యుత్థానాం, సర్వేషాం, పితౄణాం, నరకలోకోత్తరణ ద్వారా శివలోకనివాస సిద్ధ్యర్థం సకలాపచ్ఛాంత్యర్థం, సకల దారిద్ర్య నివృత్యర్థం, శ్రీమహాలక్ష్మీ క్షీరసమృద్ధి సిద్ధ్యర్థం, సర్వవిఘ్నరహిత భూరిసదన్నదాన సిద్ధ్యర్థం, సర్వకామోక్త ఫలసిద్ధ్యర్థం, కైలాసలోక అనేకకాల నివాసానంతరం, శాశ్వత శివపదావాప్త్యర్థం, సకలాభీష్ట ప్రదాయక శ్రీ మహాత్రిపురసుందరి సమేత శ్రీ మహాలింగం పరమశివ దేవతా ప్రీత్యర్థం, పరచక్ర, పరతంత్ర, యంత్రమంత్ర, పరకృత్య మారణాది షట్కర్మ ప్రదోష శాంత్యర్థం, మమ గృహే, రాజ్యలక్ష్మీ, జయలక్ష్మీ, ధనలక్ష్మీ, ధాన్యలక్ష్మీ, సామ్రాజ్యలక్ష్మీ, మోక్షలక్ష్మీ, ధైర్యలక్ష్మీ, విద్యాలక్ష్మీ సిద్ధ్యర్థం, చతుష్షష్టి కలా విద్యా ప్రాప్త్యర్థం, భూత, ప్రేత, పిశాచ, కామినీ, మోహినీ, ఢాకిన్యాది నానాగ్రహోచ్ఛాటనార్థం, అణిమాద్యైశ్వర్య ప్రాప్త్యర్థం, సర్వారిష్ట పరిహారార్థం, మమ శరీరే, వర్తమాన, భవిష్యమాణ, వాత, పిత్త, కఫోద్భవ, నానారోగ నివృత్యర్థం, జ్వర, క్షయ, కుష్ఠ, పాండు, శూల, సర్పాది, భగంధరాదీ నాశక, సమస్తామయ, నిదాన హేతుభూత పాప నివృత్తి ద్వారా సమస్తాయు నిబంధనార్థం, మృత్తికా భువనాంతర సమ్మిళితార్చ那些, భూత, ప్రేత, పిశాచ కూష్మాండ, బ్రహ్మరాక్షసాది పలాయన సిద్ధ్యర్థం, నిరంతరం శివలోక ప్రాప్త్యర్థం, అదౌnake. pending...";

          // Return the response
          const fullText = commonOpening + "\\n\\n" + commonHeader + ", " + region["geo_block"] + ", " + datetimeBlock + "\\n\\n" + kartaBlock + "\\n\\n" + commonPhalam;
          return json(res, 200, { region_id: regionId, region_name_te: region.name_te, region_name_en: region.name_en, samvatsara, aayana, ritu, masa, paksha, tithi, vasara, nakshatra, generated_at: requestWhen.toISOString(), full_text: fullText, preview: fullText.slice(0, 200) + "..." });
        } catch (e) {
          console.error("Sankalpam generation error:", e);
          return json(res, 500, { error: "Failed to generate sankalpam: " + e.message });
        }
      });`;

const newContent = content.slice(0, content.indexOf('const commonPhalam = "మమ')) + newSection + content.slice(content.indexOf('pending..."";') + 'pending..."";'.length);

fs.writeFileSync('serve.js', newContent, 'utf8');
console.log('Fixed commonPhalam');