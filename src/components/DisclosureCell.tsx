import clsx from 'clsx';
import { ReactNode } from 'react';

interface DisclosureCellProps {
  label: string;
  detail?: ReactNode;
  onClick?: () => void;
  accent?: boolean;
}

const DisclosureCell = ({ label, detail, onClick, accent }: DisclosureCellProps) => {
  return (
    <button type="button" className={clsx('cell', 'cell--disclosure', accent && 'cell--accent')} onClick={onClick}>
      <div className="cell__label">
        <span className="cell__title">{label}</span>
        {detail ? <span className="cell__detail">{detail}</span> : null}
      </div>
      <span className="cell__chevron" aria-hidden>
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L7 6L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
  );
};

export default DisclosureCell;
