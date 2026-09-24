import re

from langchain_core.documents import Document

from app.domain.transcript import TranscriptSegment


TIMESTAMP_PATTERN = re.compile(r"^(\d{2}:\d{2})\s*")

SPEAKER_PATTERN = re.compile(
    r"^([^:]{1,100}):\s*(.*)$"
)


def parse_transcript(
    documents: list[Document],
    transcript_id: str,
    expert: str,
    role: str,
    market: str,
) -> list[TranscriptSegment]:

    segments: list[TranscriptSegment] = []

    current_timestamp: str | None = None
    current_speaker: str | None = None
    current_text: list[str] = []

    def save_segment() -> None:
        if not current_timestamp or not current_text:
            return

        text = " ".join(current_text).strip()

        if not text:
            return

        segments.append(
            TranscriptSegment(
                segment_id=f"{transcript_id}-{len(segments) + 1}",
                transcript_id=transcript_id,
                expert=expert,
                role=role,
                market=market,
                timestamp=current_timestamp,
                speaker=current_speaker or expert,
                text=text,
            )
        )

    for document in documents:

        lines = document.page_content.splitlines()

        for raw_line in lines:

            # Remove invisible characters
            line = (
                raw_line
                .replace("\u200b", "")
                .replace("\ufeff", "")
                .strip()
            )

            if not line:
                continue

            # -----------------------------------------
            # Timestamp
            # -----------------------------------------

            timestamp_match = TIMESTAMP_PATTERN.match(line)

            if timestamp_match:

                save_segment()

                current_timestamp = timestamp_match.group(1)
                current_speaker = None
                current_text = []

                remaining = line[
                    timestamp_match.end():
                ].strip()

                if remaining:
                    speaker_match = SPEAKER_PATTERN.match(
                        remaining
                    )

                    if speaker_match:
                        current_speaker = (
                            speaker_match.group(1).strip()
                        )

                        text = (
                            speaker_match.group(2).strip()
                        )

                        if text:
                            current_text.append(text)

                    else:
                        current_text.append(remaining)

                continue

            # -----------------------------------------
            # Speaker + text
            # -----------------------------------------

            speaker_match = SPEAKER_PATTERN.match(line)

            if speaker_match:

                current_speaker = (
                    speaker_match.group(1).strip()
                )

                text = (
                    speaker_match.group(2).strip()
                )

                if text:
                    current_text.append(text)

                continue

            # -----------------------------------------
            # Continuation line
            # -----------------------------------------

            if current_timestamp:
                current_text.append(line)

    save_segment()

    return segments