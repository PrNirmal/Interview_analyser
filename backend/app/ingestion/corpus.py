from pathlib import Path


DATA_DIR = Path("data")


TRANSCRIPTS = [
    {
        "file_path": str(
            DATA_DIR / "Transcript_1_France.txt"
        ),
        "transcript_id": "Transcript_1_France",
        "expert": "Dr. Jean Martin",
        "role": "Head of Urology",
        "market": "France",
    },
    {
        "file_path": str(
            DATA_DIR / "Transcript_2_Germany.txt"
        ),
        "transcript_id": "Transcript_2_Germany",
        "expert": "Anna Keller",
        "role": "Former Hospital Procurement Director",
        "market": "Germany",
    },
    {
        "file_path": str(
            DATA_DIR / "Transcript_3_UK.txt"
        ),
        "transcript_id": "Transcript_3_UK",
        "expert": "Dr. Emily Carter",
        "role": "Consultant Urologist",
        "market": "United Kingdom",
    },
]