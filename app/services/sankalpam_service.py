"""Sankalpam service — fill template with personal + date details."""
from datetime import datetime
from typing import Optional
from app.data.sankalpam import (
    COMMON_OPENING, COMMON_HEADER, COMMON_PHALA,
    REGIONS, REGION_ORDER, SAMVATSARA_NAMES,
    SAMVATSARA_BASE_YEAR, SAMVATSARA_BASE_INDEX,
    TITHI_NAMES, VASARA_NAMES, RITU_NAMES, AYANA_NAMES, MASONTH_NAMES,
)


def get_regions() -> list:
    """Return list of available regions for the dropdown."""
    return [
        {"id": rid, "name_te": REGIONS[rid]["name_te"], "name_en": REGIONS[rid]["name_en"]}
        for rid in REGION_ORDER
    ]


def _samvatsara_for(dt: datetime) -> str:
    """Return the Samvatsara name for a given date."""
    # Determine Chaitra-based year
    # If date is Jan-Apr (before Chaitra), it's the previous year's samvatsara
    if dt.month in [1, 2, 3, 4] and dt.month <= 4 and dt.day < 15:
        year = dt.year - 1
    else:
        year = dt.year
    idx = (SAMVATSARA_BASE_INDEX + (year - SAMVATSARA_BASE_YEAR)) % 60
    return SAMVATSARA_NAMES[idx]


def _compute_panchang(dt: datetime) -> dict:
    """Compute panchang values using ephemeris."""
    try:
        from app.services.ephemeris import get_birth_data
        data = get_birth_data(
            name="Panchang",
            dob=dt.strftime("%Y-%m-%d"),
            tob=dt.strftime("%H:%M"),
            pob="Delhi, India", lat=28.61, lon=77.21,
        )
        moon = next((p for p in data.get("planets", []) if p["name"] == "Moon"), None)
        sun = next((p for p in data.get("planets", []) if p["name"] == "Sun"), None)

        if moon and sun:
            moon_abs = _absolute_deg(moon)
            sun_abs = _absolute_deg(sun)
            diff = (moon_abs - sun_abs) % 360
            tithi_num = int(diff / 12)  # 0-29
            tithi_idx = tithi_num
            paksha = "శుక్ల" if tithi_num < 15 else "కృష్ణ"
            tithi_name = TITHI_NAMES[tithi_idx % 30]
            moon_nak = data.get("moon_nakshatra_name", "")
        else:
            paksha = "శుక్ల"
            tithi_name = "పాడ్యమి"
            moon_nak = ""
    except Exception:
        paksha = "శుక్ల"
        tithi_name = "పాడ్యమి"
        moon_nak = ""

    return {"paksha": paksha, "tithi": tithi_name, "nakshatra": moon_nak}


def _absolute_deg(planet):
    signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
             "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    sign = planet.get("sign", "Aries")
    deg = float(planet.get("degree", 0.0))
    for i, s in enumerate(signs):
        if s.lower() in sign.lower():
            return i * 30 + deg
    return deg


def _ritu_for_month(month: int) -> str:
    """Map Gregorian month to Hindu Ritu."""
    if month in [3, 4]:   return "వసంత"
    if month in [5, 6]:   return "గ్రీష్మ"
    if month in [7, 8]:   return "వర్ష"
    if month in [9, 10]:  return "శరద్"
    if month in [11, 12]: return "హేమంత"
    return "శిశిర"


def _masa_for(dt: datetime) -> str:
    """Approximate Hindu lunar month from Gregorian date."""
    idx = (dt.month + 3) % 12
    from app.data.sankalpam import MASONTH_NAMES
    return MASONTH_NAMES[idx]


def _ayana_for(dt: datetime) -> str:
    """Determine Aayana from date — Uttarayana Jan 14 to Jul 14, Dakshinayana rest."""
    if (dt.month, dt.day) >= (1, 14) and (dt.month, dt.day) < (7, 14):
        return "ఉత్తరాయణ"
    return "దక్షిణాయణ"


def generate_sankalpam(
    region_id: str,
    name: str = "[మీ పేరు]",
    gotra: str = "[మీ గోత్రం పేరు]",
    nakshatra: str = "[మీ నక్షత్రం పేరు]",
    rashi: str = "[మీ రాశి పేరు]",
    spouse_name: str = "",
    spouse_gotra: str = "",
    when: Optional[datetime] = None,
) -> dict:
    """Generate the complete Sankalpam text for a region."""
    from app.data.sankalpam import (
        COMMON_OPENING, COMMON_HEADER, COMMON_PHALA,
        REGIONS, REGION_ORDER, SAMVATSARA_NAMES,
        SAMVATSARA_BASE_YEAR, SAMVATSARA_BASE_INDEX,
        TITHI_NAMES, VASARA_NAMES, RITU_NAMES, AYANA_NAMES, MASONTH_NAMES,
    )
    
    if region_id not in REGIONS:
        region_id = "south_india"

    if when is None:
        when = datetime.now()

    region = REGIONS[region_id]

    samvatsara = _samvatsara_for(when)
    aayana = _ayana_for(when)
    ritu = _ritu_for_month(when.month)
    masa = _masa_for(when)
    panchang = _compute_panchang(when)
    vasara = VASARA_NAMES[when.weekday()] if when.weekday() < 7 else "భాను"

    # Date/time block
    datetime_block = (
        f"అస్మిన్ వర్తమానే వ్యావహారిక చాంద్రమానేన "
        f"శ్రీ {samvatsara} నామ సంవత్సరే, "
        f"{aayana}ే, {ritu}ఋతౌ, {masa} మాసే, "
        f"{panchang['paksha']} పక్షే, {panchang['tithi']} తిథౌ, "
        f"{vasara}వాసర యుక్తాయాం, "
        f"{panchang['nakshatra'] or '[నక్షత్రం]'} నక్షత్ర యుక్తాయాం, "
        f"శుభయోగ శుభకరణ ఏవంగుణ విశేషణ విశిష్టాయాం అస్యాం శుభతిథౌ"
    )

    # Karta block
    if spouse_name and spouse_gotra:
        spouse_clause = (
            f", ధర్మపత్నీ సమేతోహం శ్రీమతః {spouse_gotra} గోత్రస్య "
            f"{spouse_name} నామధేయస్య"
        )
    else:
        spouse_clause = ""

    karta_block = (
        f"శ్రీమాన్ {gotra} గోత్రః {nakshatra} నక్షత్రే {rashi} రాశౌ జాతః "
        f"{name} నామధేయః{spouse_clause}"
    )

    # Compose full sankalpam
    full_text = (
        f"{COMMON_OPENING}\n\n"
        f"{COMMON_HEADER}, "
        f"{region['geo_block']}, "
        f"{datetime_block},\n\n"
        f"{karta_block},\n\n"
        f"{COMMON_PHALA}"
    )

    return {
        "region_id": region_id,
        "region_name_te": region["name_te"],
        "region_name_en": region["name_en"],
        "samvatsara": samvatsara,
        "aayana": aayana,
        "ritu": ritu,
        "masa": masa,
        "paksha": panchang["paksha"],
        "tithi": panchang["tithi"],
        "vasara": vasara,
        "nakshatra": panchang["nakshatra"],
        "generated_at": when.isoformat(),
        "full_text": full_text,
        "preview": full_text[:200] + "...",
    }