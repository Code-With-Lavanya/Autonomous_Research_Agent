from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from app.services.document_loader import load_document
from langchain_huggingface import HuggingFaceEmbeddings
from app.state import ResearchState

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vectorstore = Chroma(
    persist_directory="vector_db",
    embedding_function=embeddings
)


def prepare_documents(file_path):
    documents = load_document(file_path)

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    docs = text_splitter.split_documents(documents)

    return docs

def index_document(file_path):
    """Converts a PDF file into a vector store."""
    docs = prepare_documents(file_path)
    vectorstore.add_documents(docs)
    return vectorstore

def get_relevant_documents(query):
    retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={
            "k": 5,
            "fetch_k": 20
        }
    )
    return retriever.invoke(query)


def document_retriever_node(state:ResearchState):
    """Processes a file and updates the state with relevant documents."""
    if "document_path" not in state:
        raise ValueError("Document path not found in state.")

    document_path = state["document_path"]
    index_document(document_path)
    relevant_docs = get_relevant_documents(state["question"])
    state["documents"] = relevant_docs
    return state
