from langchain_core.documents import Document

from app.retrieval.fusion import reciprocal_rank_fusion
from app.retrieval.keyword_retriever import KeywordRetriever
from app.retrieval.semantic_retriever import retrieve_semantic
from app.retrieval.reranker import rerank_documents


class HybridRetriever:

    def __init__(
        self,
        documents: list[Document],
    ):
        self.documents = documents

    def retrieve(
        self,
        query: str,
        k: int = 5,
        transcript_id: str | None = None,
        market: str | None = None,
    ) -> list[Document]:

        scoped_documents = self.documents

        # -----------------------------------------------------
        # 1. Scope to transcript
        # -----------------------------------------------------

        if transcript_id:
            scoped_documents = [
                document
                for document in scoped_documents
                if document.metadata.get("transcript_id")
                == transcript_id
            ]

        # -----------------------------------------------------
        # 2. Scope to market
        # -----------------------------------------------------

        if market:
            scoped_documents = [
                document
                for document in scoped_documents
                if document.metadata.get("market")
                == market
            ]

        # -----------------------------------------------------
        # 3. Prefer expert statements
        # -----------------------------------------------------

        expert_documents = [
            document
            for document in scoped_documents
            if document.metadata.get("speaker") != "Interviewer"
        ]

        if expert_documents:
            scoped_documents = expert_documents

        # -----------------------------------------------------
        # 4. Retrieve a larger candidate pool
        # -----------------------------------------------------

        candidate_k = max(k * 2, 10)

        keyword_retriever = KeywordRetriever(
            scoped_documents
        )

        keyword_results = keyword_retriever.retrieve(
            query=query,
            k=candidate_k,
        )

        semantic_results = retrieve_semantic(
            query=query,
            k=candidate_k,
            transcript_id=transcript_id,
            market=market,
        )

        # -----------------------------------------------------
        # 5. Prevent semantic results from another scope
        # -----------------------------------------------------

        allowed_ids = {
            document.metadata.get("segment_id")
            for document in scoped_documents
        }

        semantic_results = [
            document
            for document in semantic_results
            if document.metadata.get("segment_id")
            in allowed_ids
        ]

        # -----------------------------------------------------
        # 6. Reciprocal Rank Fusion
        # -----------------------------------------------------

        fused_results = reciprocal_rank_fusion(
            result_lists=[
                semantic_results,
                keyword_results,
            ],
            top_n=candidate_k,
        )

        # -----------------------------------------------------
        # 7. Cross-encoder reranking
        # -----------------------------------------------------

        reranked_results = rerank_documents(
            query=query,
            documents=fused_results,
            top_k=k,
        )

        return reranked_results