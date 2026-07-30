from pydantic import BaseModel


class ResearchResponse(BaseModel):
    approved: bool
    score: int
    feedback: str
    report: str