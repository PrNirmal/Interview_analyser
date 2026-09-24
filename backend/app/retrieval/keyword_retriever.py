from langchain_core.documents import Document
from rank_bm25 import BM25Okapi


class KeywordRetriever:
    def __init__(self, documents: list[Document]):
        self.documents = documents

        tokenized_documents = [
            document.page_content.lower().split()
            for document in documents
        ]

        self.bm25 = BM25Okapi(tokenized_documents)

    def retrieve(
        self,
        query: str,
        k: int = 5,
    ) -> list[Document]:

        query_tokens = query.lower().split()

        results = self.bm25.get_top_n(
            query_tokens,
            self.documents,
            n=k,
        )

        return results