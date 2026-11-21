// A claim always renders with its context and its source (council amendment 1).
import type { Claim as ClaimT } from '../content/types';

export function Claim({ claim, as: Tag = 'div', showSource = true }: { claim: ClaimT; as?: 'div' | 'li'; showSource?: boolean }) {
  return (
    <Tag className="claim">
      <span className="claim__value">{claim.value}</span>
      <span className="claim__label">{claim.label}</span>
      {claim.context && <span className="claim__context">{claim.context}</span>}
      {showSource && (
        <span className="claim__source">
          Source:{' '}
          {claim.source.href ? (
            <a href={claim.source.href} target="_blank" rel="noopener noreferrer">
              {claim.source.label}
            </a>
          ) : (
            claim.source.label
          )}
          {claim.status === 'owner-stated' ? '' : ` · read ${claim.asOf}`}
        </span>
      )}
    </Tag>
  );
}
