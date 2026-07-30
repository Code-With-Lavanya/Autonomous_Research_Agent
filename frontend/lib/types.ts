/**
 * These types are a direct, field-for-field mirror of the Pydantic models
 * in the backend. Do not add fields here that the backend doesn't return —
 * anything not in `ResearchResponse` (backend/app/schemas/response.py) is
 * dropped by FastAPI's response_model filtering before it ever reaches the
 * client, even if the internal LangGraph state computed it.
 */

/** Mirrors backend/app/schemas/request.py:ResearchRequest */
export interface ResearchRequest {
  question: string;
  document_path?: string | null;
}

/** Mirrors backend/app/schemas/response.py:ResearchResponse */
export interface ResearchResponse {
  approved: boolean;
  score: number;
  feedback: string;
  report: string;
}

/** Mirrors the dict returned by backend/app/api/upload.py:upload_pdf */
export interface UploadResponse {
  message: string;
  filename: string;
  path: string;
}

/** A file that has been uploaded and is attached to the next question. */
export interface AttachedDocument {
  filename: string;
  path: string;
  sizeBytes: number;
}

/** One entry in the local (browser-only) research history. */
export interface HistoryEntry {
  id: string;
  question: string;
  createdAt: string;
  attachedDocument: AttachedDocument | null;
  result: ResearchResponse;
}

export type PipelineStageId =
  | "planner"
  | "information"
  | "research"
  | "citation"
  | "writer"
  | "critic";

export interface PipelineStage {
  id: PipelineStageId;
  index: number;
  label: string;
  agent: string;
  description: string;
}

/**
 * The six LangGraph nodes wired up in backend/graph.py and
 * backend/app/graph/workflow.py, in edge order. Used to drive the pipeline
 * visualization — this list should stay in sync with the actual graph.
 */
export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "planner",
    index: 0,
    label: "Plan",
    agent: "planner_node",
    description: "Decides whether this question needs web search, document retrieval, or both, and drafts a research plan.",
  },
  {
    id: "information",
    index: 1,
    label: "Gather",
    agent: "information_gathering_node",
    description: "Runs Tavily web search and/or the document retriever, depending on the plan.",
  },
  {
    id: "research",
    index: 2,
    label: "Research",
    agent: "research_node",
    description: "Synthesizes the gathered sources into a research summary.",
  },
  {
    id: "citation",
    index: 3,
    label: "Cite",
    agent: "citation_node",
    description: "Extracts references from the gathered sources.",
  },
  {
    id: "writer",
    index: 4,
    label: "Write",
    agent: "writer_node",
    description: "Drafts the full report from the research summary.",
  },
  {
    id: "critic",
    index: 5,
    label: "Review",
    agent: "critic_node",
    description: "Scores the report and either approves it or sends it back to Research for another pass.",
  },
];
