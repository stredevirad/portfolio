// Plain, single-column resume. Rendered for Recruiter mode (in place of the home page), at /resume/,
// and printed to the PDF at build time — one content source, so they can never disagree.
import { site } from '../content/site';
import { experience } from '../content/experience';
import { projects } from '../content/projects';
import { achievements } from '../content/achievements';
import { skillGroups } from '../content/skills';
import { Link } from '../lib/router';
import { withBase } from '../lib/base';
import { setRecruiter } from '../components/Toggles';
import { IconDownload } from '../components/Icons';

const detailed = projects.filter((p) => p.caseStudy);
const others = projects.filter((p) => !p.caseStudy);

export function Resume({ mode }: { mode: 'recruiter' | 'page' }) {
  const work = experience.filter((x) => x.kind === 'work');
  const edu = experience.filter((x) => x.kind === 'education');
  return (
    <div className="resume wrap">
      <div className="resume__sheet">
        <div className="resume__bar no-print" role="region" aria-label="Resume actions">
          <p>{mode === 'recruiter' ? 'Recruiter mode: the plain, printable version of this site.' : 'Resume — the plain, printable version of this site.'}</p>
          <div>
            <a className="btn btn--primary btn--small" href={withBase(site.resumePdf)} download>
              <IconDownload /> Download resume (PDF)
            </a>
            {mode === 'recruiter' ? (
              <button type="button" className="btn btn--small" onClick={() => setRecruiter(false)}>
                Exit recruiter mode
              </button>
            ) : (
              <Link to="/" className="btn btn--small">
                Full site
              </Link>
            )}
          </div>
        </div>

        <header>
          <h1>{site.name}</h1>
          <p className="resume__role">AI &amp; Python engineer — LLM agents, evaluation pipelines and well-tested Python backends.</p>
          <ul className="resume__contact" role="list">
            <li>{site.location}</li>
            <li>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
            <li>
              <a href={site.github}>github.com/{site.githubHandle}</a>
            </li>
            <li>
              <a href={site.linkedin}>linkedin.com/in/{site.linkedinHandle}</a>
            </li>
            <li>
              <a href={site.url}>{site.url.replace('https://', '')}</a>
            </li>
          </ul>
        </header>

        <section aria-labelledby="r-summary">
          <h2 id="r-summary">Summary</h2>
          <p>
            {site.intro} I build systems that show their evidence or abstain when it is thin. {site.availability}
          </p>
        </section>

        <section aria-labelledby="r-edu">
          <h2 id="r-edu">Education</h2>
          {edu.map((x) => (
            <div className="resume__item" key={x.id}>
              <div className="resume__line">
                <h3>{x.title}</h3>
                <span className="resume__meta">{x.period}</span>
              </div>
              <p className="resume__meta">
                {x.orgGloss ?? x.org}, {x.location} · {x.points.join(' ')}
              </p>
            </div>
          ))}
        </section>

        <section aria-labelledby="r-exp">
          <h2 id="r-exp">Experience</h2>
          {work.map((x) => (
            <div className="resume__item" key={x.id}>
              <div className="resume__line">
                <h3>
                  {x.title}, {x.orgGloss ? `${x.orgGloss} (${x.org})` : x.org}
                </h3>
                <span className="resume__meta">{x.period}</span>
              </div>
              <ul className="resume__points">
                {x.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section aria-labelledby="r-proj">
          <h2 id="r-proj">Projects</h2>
          {detailed.map((p) => (
            <div className="resume__item" key={p.slug}>
              <div className="resume__line">
                <h3>
                  {p.title} — {p.kicker}
                </h3>
                <span className="resume__meta">{p.stack.filter((t) => t !== 'C++').slice(0, 5).join(', ')}</span>
              </div>
              <ul className="resume__points">
                <li>{p.oneLiner}</li>
                {p.headline && (
                  <li>
                    {p.headline.value} {p.headline.label}
                    {p.headline.context ? ` (${p.headline.context})` : ''}.
                  </li>
                )}
                {p.role !== p.headline?.context && !p.oneLiner.startsWith(p.role) && <li>{p.role}.</li>}
              </ul>
            </div>
          ))}
          <div className="resume__item">
            <h3>Other projects</h3>
            <ul className="resume__points">
              {others.map((p) => (
                <li key={p.slug}>
                  <b>{p.title}</b> — {p.oneLiner}
                  {p.status ? ` ${p.status}.` : ''}
                  {p.award ? ` ${p.award}.` : ''}
                  {p.team ? ' Team project.' : ''}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="r-awards">
          <h2 id="r-awards">Awards and certifications</h2>
          <ul className="resume__points">
            {achievements.map((a) => (
              <li key={a.id}>
                <b>{a.title}</b> — {a.detail}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="r-skills">
          <h2 id="r-skills">Skills</h2>
          <div className="resume__skills">
            {skillGroups.map((g) => (
              <p key={g.id}>
                <b>{g.label}:</b> {g.skills.map((s) => s.label).join(', ')}
              </p>
            ))}
          </div>
        </section>

        <p className="resume__foot">
          Every number above links to its source on {site.url.replace('https://', '')}. Facts last checked {site.lastVerified}.
        </p>
      </div>
    </div>
  );
}
