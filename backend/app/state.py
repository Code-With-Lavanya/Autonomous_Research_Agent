from typing import TypedDict, Annotated

class ResearchState(TypedDict):
    question: str
    plan: dict | None
    web_results: list
    documents: list
    document_path: str | None
    research: str | None
    citations: str | None
    report: str | None
    review: dict | None
    retry_count: int
