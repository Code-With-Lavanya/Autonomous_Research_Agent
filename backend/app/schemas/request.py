from pydantic import BaseModel


class ResearchRequest(BaseModel):
    question: str
    document_path: str | None = None