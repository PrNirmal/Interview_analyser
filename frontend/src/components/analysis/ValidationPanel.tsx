import { ShieldCheck, AlertCircle } from "lucide-react";
import type { Validation } from "../../types/analysis";

interface ValidationPanelProps {
  validation: Validation;
}

export function ValidationPanel({ validation }: ValidationPanelProps) {
  const isValid = validation.valid;

  return (
    <section className="section validation-section" id="validation" aria-labelledby="validation-heading">
      <div className="section-heading">
        <div>
          <span className="kicker">Quality Assurance</span>
          <h2 id="validation-heading">Validation</h2>
        </div>
      </div>
      <div
        className={`validation-card ${isValid ? "is-valid" : "is-invalid"}`}
        role={isValid ? "status" : "alert"}
      >
        <div className="validation-icon-col">
          {isValid ? (
            <ShieldCheck size={20} className="text-ready" />
          ) : (
            <AlertCircle size={20} className="text-danger" />
          )}
        </div>
        <div className="validation-content">
          <span className="meta-label">{isValid ? "Valid" : "Invalid"}</span>
          <p className="validation-msg">{validation.message}</p>
        </div>
      </div>
    </section>
  );
}
