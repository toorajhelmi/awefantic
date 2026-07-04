import AnalyticsPageView from "./analytics-page-view";
import WaitlistForm from "./waitlist-form";

const pillars = [
  {
    title: "Clarify the promise",
    body: "Turn a rough product idea into a public-facing message that visitors can react to immediately.",
  },
  {
    title: "Capture early signal",
    body: "Collect qualified interest before committing to a larger product workflow or launch motion.",
  },
  {
    title: "Build from evidence",
    body: "Use the first waitlist responses to decide which slice deserves engineering attention next.",
  },
];

export default function HomePage() {
  return (
    <main>
      <AnalyticsPageView />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Awfantic early access</p>
          <h1>Validate the product people actually want before you overbuild.</h1>
          <p className="lede">
            Awfantic is a focused demand-validation workspace for founders and
            lean teams. Join the waitlist to help shape the first workflow.
          </p>
          <div className="hero-actions" aria-label="Primary actions">
            <a className="button button-primary" href="#waitlist">
              Join the waitlist
            </a>
            <a className="button button-secondary" href="#how-it-works">
              See how it works
            </a>
          </div>
        </div>

        <div className="signal-card" aria-label="Awfantic validation loop">
          <span className="card-label">Validation loop</span>
          <ol>
            <li>Publish the promise</li>
            <li>Collect qualified demand</li>
            <li>Prioritize the next product slice</li>
          </ol>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <p className="eyebrow">Why this exists</p>
        <h2>Awfantic starts with signal, not ceremony.</h2>
        <div className="pillar-grid">
          {pillars.map((pillar) => (
            <article className="pillar" key={pillar.title}>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="waitlist-section" id="waitlist">
        <div>
          <p className="eyebrow">Get early access</p>
          <h2>Tell us where product clarity would help most.</h2>
          <p>
            We will use your answer to prioritize the first Awfantic workflow.
            No account, payment, or email automation is created by this MVP.
          </p>
        </div>
        <WaitlistForm />
      </section>
    </main>
  );
}
