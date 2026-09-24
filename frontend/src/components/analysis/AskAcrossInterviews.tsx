import { useState, type FormEvent } from "react";
import { askAcrossInterviews } from "../../api/analysis";
import { ApiError, userFacingError } from "../../api/errors";
import { useAnalysis } from "../../context/AnalysisContext";

export function AskAcrossInterviews() {
  const { session } = useAnalysis();
  const [question, setQuestion] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session || pending) return;
    setPending(true);
    setNotice(null);
    try {
      await askAcrossInterviews({ question });
    } catch (caught) {
      const error =
        caught instanceof ApiError
          ? caught
          : new ApiError(0, "NETWORK_ERROR", "The analysis service could not be reached.");
      const message = userFacingError(error);
      setNotice(`${message.title} ${message.description}`.trim());
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="section" id="ask" aria-labelledby="ask-heading">
      <div className="section-heading">
        <h2 id="ask-heading">Ask across interviews</h2>
      </div>
      <form className="ask" onSubmit={(event) => void onSubmit(event)}>
        <label htmlFor="ask-question">Ask across interviews</label>
        <textarea
          id="ask-question"
          name="question"
          rows={3}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Which market has the longest adoption timeline?"
          disabled={!session || pending}
        />
        <div className="ask-row">
          <p className="quiet">
            {session
              ? "Questions use the analysis API. This service does not currently expose a question endpoint."
              : "Run an analysis before asking across interviews."}
          </p>
          <button type="submit" className="button button-primary" disabled={!session || pending}>
            {pending ? "Asking" : "Ask Question"}
          </button>
        </div>
        {notice ? (
          <p className="ask-notice" role="status">
            {notice}
          </p>
        ) : null}
      </form>
    </section>
  );
}
