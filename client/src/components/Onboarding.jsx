function Waves({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 80" fill="none">
      {[0, 14, 28, 42].map((offset) => (
        <path
          key={offset}
          d={`M-10 ${25 + offset} 10 ${5 + offset} 30 ${25 + offset} 50 ${5 + offset} 70 ${25 + offset} 90 ${5 + offset} 110 ${25 + offset} 130 ${5 + offset}`}
          stroke="currentColor"
          strokeWidth="6"
        />
      ))}
    </svg>
  );
}

export default function Onboarding({ onStart }) {
  return (
    <main className="onboarding">
      <div className="onboarding-hero" aria-hidden="true">
        <span className="orbit orbit-outer" />
        <span className="orbit orbit-inner" />
        <Waves className="waves waves-top" />
        <Waves className="waves waves-bottom" />
      </div>
      <div className="onboarding-content">
        <h1>Manage What To Do</h1>
        <p>
          The best way to manage what you have to do,
          <br />
          don’t forget your plans.
        </p>
        <button type="button" onClick={onStart}>
          Get Started
        </button>
      </div>
    </main>
  );
}
