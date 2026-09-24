from pathlib import Path

from app.ingestion.document_loader import load_document
from app.ingestion.transcript_parser import parse_transcript
from app.ingestion.metadata import segments_to_documents
from app.retrieval.embeddings import OpenRouterEmbeddings
from app.retrieval.vector_store import get_vector_store


TEST_FILE = Path(__file__).parent / "Transcript_2_Germany_test.txt"


def test_full_retrieval_pipeline():

    # --------------------------------------------------
    # 1. Load transcript
    # --------------------------------------------------
    documents = load_document(str(TEST_FILE))

    assert documents, "Document loader returned no documents"

    print("\n1. Document Loading")
    print("-------------------")
    print("Documents loaded:", len(documents))


    # --------------------------------------------------
    # 2. Parse transcript
    # --------------------------------------------------
    segments = parse_transcript(
        documents=documents,
        transcript_id="Transcript_2_Germany_test",
        expert="Anna Keller",
        role="Former Hospital Procurement Director",
        market="Germany",
    )

    assert segments, "Transcript parser returned no segments"

    print("\n2. Transcript Parsing")
    print("---------------------")
    print("Segments:", len(segments))


    # --------------------------------------------------
    # 3. Convert to LangChain Documents
    # --------------------------------------------------
    retrieval_documents = segments_to_documents(segments)

    assert retrieval_documents

    print("\n3. Metadata Conversion")
    print("----------------------")
    print("Retrieval documents:", len(retrieval_documents))

    print("Example metadata:")
    print(retrieval_documents[0].metadata)


    # --------------------------------------------------
    # 4. Test embedding
    # --------------------------------------------------
    embeddings = OpenRouterEmbeddings()

    query = "What are the main barriers to robotic surgery adoption?"

    vector = embeddings.embed_query(query)

    assert vector
    assert len(vector) > 0

    print("\n4. Embedding")
    print("------------")
    print("Model embedding dimensions:", len(vector))
    print("First 5 values:", vector[:5])


    # --------------------------------------------------
    # 5. Add documents to ChromaDB
    # --------------------------------------------------
    vector_store = get_vector_store()

    vector_store.add_documents(retrieval_documents)

    print("\n5. ChromaDB")
    print("----------")
    print("Documents added:", len(retrieval_documents))


    # --------------------------------------------------
    # 6. Semantic search
    # --------------------------------------------------
    results = vector_store.similarity_search(
        query,
        k=3,
    )

    assert results
    assert len(results) <= 3

    print("\n6. Semantic Retrieval")
    print("---------------------")

    for index, result in enumerate(results, start=1):

        print(f"\nResult {index}")
        print("-------------")
        print("Text:", result.page_content)
        print("Metadata:", result.metadata)


    # --------------------------------------------------
    # 7. Validate metadata
    # --------------------------------------------------
    for result in results:

        metadata = result.metadata

        assert metadata["segment_id"]
        assert metadata["transcript_id"]
        assert metadata["expert"]
        assert metadata["role"]
        assert metadata["market"]
        assert metadata["timestamp"]
        assert metadata["speaker"]

    print("\n7. Validation")
    print("-------------")
    print("All retrieved documents contain required metadata.")