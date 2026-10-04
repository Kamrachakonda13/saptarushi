document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('sankalpam-form');
    const regionSelect = document.getElementById('region');
    const output = document.getElementById('sankalpam-output');

    // Load regions on page load
    try {
        const resp = await fetch('/api/sankalpam/regions');
        const data = await resp.json();
        data.regions.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.id;
            opt.textContent = r.name_te;
            regionSelect.appendChild(opt);
        });
    } catch (e) {
        regionSelect.innerHTML = '<option>Failed to load regions</option>';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const payload = {
            region_id: fd.get('region'),
            name: fd.get('name') || '',
            gotra: fd.get('gotra') || '',
            nakshatra: fd.get('nakshatra') || '',
            rashi: fd.get('rashi') || '',
            spouse_name: fd.get('spouse_name') || '',
            spouse_gotra: fd.get('spouse_gotra') || '',
        };

        if (!payload.region_id) {
            alert('దయచేసి ప్రాంతాన్ని ఎంచుకోండి');
            return;
        }

        output.innerHTML = '<p>సంకల్పం తయారవుతుంది...</p>';
        output.style.display = 'block';

        try {
            const resp = await fetch('/api/sankalpam/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await resp.json();

            output.innerHTML = `
                <div class="sankalpam-meta">
                    <span>ప్రాంతం: <strong>${data.region_name_te}</strong></span>
                    <span>సంవత్సరం: <strong>${data.samvatsara}</strong></span>
                </div>
                <div class="region-badge">${data.samvatsara} నామ సంవత్సరం · ${data.aayana} · ${data.ritu} ఋతువు · ${data.masa} మాసం · ${data.paksha} పక్షం · ${data.tithi} తిథి · ${data.vasara}వారం</div>
                <div style="font-family:'Noto Sans Telugu',serif; font-size:1.08rem; line-height:2;">${data.full_text}</div>
                <div class="sankalpam-actions">
                    <button class="btn-ghost" onclick="copySankalpam()">📋 కాపీ చేయండి</button>
                    <button class="btn-ghost" onclick="printSankalpam()">🖨️ ప్రింట్ చేయండి</button>
                </div>
            `;
            window._sankalpamText = data.full_text;
        } catch (e) {
            output.innerHTML = '<p style="color:#B91C1C;">Error: ' + e.message + '</p>';
        }
    });

    window.copySankalpam = () => {
        if (window._sankalpamText) {
            navigator.clipboard.writeText(window._sankalpamText);
            alert('సంకల్పం క్లిప్‌బోర్డ్‌కు కాపీ చేయబడింది');
        }
    };

    window.printSankalpam = () => {
        window.print();
    };
});