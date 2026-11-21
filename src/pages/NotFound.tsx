import { Link } from '../lib/router';

export function NotFound() {
  return (
    <section className="notfound wrap" aria-labelledby="nf-title">
      <p className="eyebrow">404 · Not enough evidence</p>
      <h1 id="nf-title">Nothing here.</h1>
      <p>I can’t find that page, and I’d rather say so than guess where you meant to go.</p>
      <div className="notfound__links">
        <Link to="/" className="btn btn--primary">
          Home
        </Link>
        <Link to="/#work" className="btn">
          Selected work
        </Link>
        <Link to="/resume/" className="btn">
          Resume
        </Link>
      </div>
    </section>
  );
}
