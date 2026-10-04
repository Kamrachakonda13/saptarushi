"""Sankalpam API endpoints."""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.sankalpam_service import get_regions, generate_sankalpam

router = APIRouter(prefix="/api/sankalpam", tags=["sankalpam"])


class SankalpamRequest(BaseModel):
    region_id: str
    name: Optional[str] = ""
    gotra: Optional[str] = ""
    nakshatra: Optional[str] = ""
    rashi: Optional[str] = ""
    spouse_name: Optional[str] = ""
    spouse_gotra: Optional[str] = ""
    when: Optional[str] = None  # ISO datetime


@router.get("/regions")
async def api_regions():
    """List of regions for the dropdown."""
    from app.services.sankalpam_service import get_regions
    return {"regions": get_regions()}


@router.post("/generate")
async def api_generate(req: dict):
    """Generate full Sankalpam text."""
    when_dt = None
    if req.get("when"):
        try:
            when_dt = datetime.fromisoformat(req["when"])
        except (ValueError, TypeError):
            pass
    
    from app.services.sankalpam_service import generate_sankalpam
    result = generate_sankalpam(
        region_id=req.get("region_id", "south_india"),
        name=req.get("name") or "[మీ పేరు]",
        gotra=req.get("gotra") or "[మీ గోత్రం పేరు]",
        nakshatra=req.get("nakshatra") or "[మీ నక్షత్రం పేరు]",
        rashi=req.get("rashi") or "[మీ రాశి పేరు]",
        spouse_name=req.get("spouse_name"),
        spouse_gotra=req.get("spouse_gotra"),
        when=when_dt,
    )
    return result