import type { Validation } from "../../types/analysis";

interface ValidationPanelProps {
  validation: Validation;
}

export function ValidationPanel({ validation }: ValidationPanelProps) {
  return (
    <section className="section" id="validation" aria-labelledby="validation-heading">
      <div className="section-heading">
        <h2 id="validation-heading">Validation</h2>
      </div>
      <div className={`validation${validation.valid ? " is-valid" : " is-invalid"}`} role={validation.valid ? "status" : "alert"}>
        <p className="meta-label">{validation.valid ? "Valid" : "Invalid"}</p>
        <p>{validation.message}</p>
      </div>
    </section>
  );
}
