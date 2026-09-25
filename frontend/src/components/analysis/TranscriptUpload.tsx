import { useState, useRef, type FormEvent, type DragEvent } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadTranscript } from "../../api/corpus";
import { ApiError, userFacingError } from "../../api/errors";
import { useAnalysis } from "../../context/AnalysisContext";
import { parseTranscriptHeader } from "../../lib/transcriptHeader";
import { Button } from "../ui/Button";

const MAX_BYTES = 15 * 1024 * 1024;

function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error ?? new Error("The transcript could not be read."));
    reader.readAsText(file);
  });
}

interface TranscriptUploadProps {
  onSuccess?: () => void;
  className?: string;
}

export function TranscriptUpload({ onSuccess, className = "" }: TranscriptUploadProps) {
  const { addTranscript } = useAnalysis();
  const [file, setFile] = useState<File | null>(null);
  const [expert, setExpert] = useState("");
  const [role, setRole] = useState("");
  const [market, setMarket] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function onFileSelected(next: File | null) {
    setFile(next);
    setError(null);
    if (!next) return;
    if (next.name.toLowerCase().endsWith(".txt")) {
      const text = await readFileText(next);
      const header = parseTranscriptHeader(text);
      setExpert((current) => current || header.expert || "");
      setRole((current) => current || header.role || "");
      setMarket((current) => current || header.market || "");
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0] ?? null;
    if (droppedFile) {
      void onFileSelected(droppedFile);
      if (fileInputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(droppedFile);
        fileInputRef.current.files = dt.files;
      }
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Choose a .txt, .pdf, or .docx transcript.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Transcript files must be 15 MB or smaller.");
      return;
    }
    if (!expert.trim() || !role.trim() || !market.trim()) {
      setError("Enter the expert, role, and market for this transcript.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const saved = await uploadTranscript({ file, expert, role, market });
      addTranscript(saved);
      setFile(null);
      setExpert("");
      setRole("");
      setMarket("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onSuccess?.();
    } catch (caught) {
      const apiError =
        caught instanceof ApiError
          ? caught
          : new ApiError(0, "NETWORK_ERROR", "The analysis service could not be reached.");
      setError(userFacingError(apiError).description);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={`upload-card ${className}`.trim()}>
      <div className="upload-card-header">
        <div className="upload-header-title">
          <UploadCloud size={18} className="upload-header-icon" />
          <h3>Add expert interview</h3>
        </div>
        <span className="upload-badge">Supported: .txt, .pdf, .docx</span>
      </div>

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="transcript-file-input" className="field-label">
            Transcript file
          </label>
        </div>

        <div
          className={`dropzone ${isDragging ? "is-dragover" : ""} ${file ? "has-file" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="Upload transcript file"
        >
          <input
            id="transcript-file-input"
            ref={fileInputRef}
            className="sr-only-input"
            type="file"
            accept=".txt,.pdf,.docx,text/plain,application/pdf"
            onChange={(event) => void onFileSelected(event.target.files?.[0] ?? null)}
          />

          <div className="dropzone-content">
            {file ? (
              <div className="dropzone-selected">
                <FileText size={24} className="file-icon" />
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    {(file.size / 1024).toFixed(1)} KB · Ready to link
                  </span>
                </div>
                <CheckCircle2 size={18} className="check-icon" />
              </div>
            ) : (
              <>
                <UploadCloud size={24} className="dropzone-icon" />
                <p className="dropzone-prompt">
                  <strong>Click to upload</strong> or drag transcript here
                </p>
                <p className="dropzone-sub">.txt · .pdf · .docx (up to 15MB)</p>
              </>
            )}
          </div>
        </div>

        <div className="upload-fields-grid">
          <div className="form-group">
            <label htmlFor="expert-input" className="field-label">
              Expert
            </label>
            <input
              id="expert-input"
              className="field-input"
              value={expert}
              onChange={(event) => setExpert(event.target.value)}
              placeholder="e.g. Dr. Ada Okonkwo"
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role-input" className="field-label">
              Role
            </label>
            <input
              id="role-input"
              className="field-input"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="e.g. Consultant Urologist"
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="market-input" className="field-label">
              Market
            </label>
            <input
              id="market-input"
              className="field-input"
              value={market}
              onChange={(event) => setMarket(event.target.value)}
              placeholder="e.g. Spain"
              autoComplete="off"
            />
          </div>
        </div>

        {error ? (
          <div className="upload-error-row" role="alert">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="upload-actions">
          <p className="upload-hint">
            Metadata headers in .txt files (Expert, Role, Market) will auto-populate these fields.
          </p>
          <Button
            type="submit"
            variant="secondary"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Add transcript"}
          </Button>
        </div>
      </form>
    </div>
  );
}
