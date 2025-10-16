import clsx from 'clsx';

interface ToggleCellProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  detail?: string;
  disabled?: boolean;
}

const ToggleCell = ({ label, value, onChange, detail, disabled }: ToggleCellProps) => {
  return (
    <button
      type="button"
      className={clsx('cell', 'cell--toggle', disabled && 'cell--disabled')}
      onClick={() => !disabled && onChange(!value)}
      aria-pressed={value}
      disabled={disabled}
    >
      <div className="cell__label">
        <span className="cell__title">{label}</span>
        {detail ? <span className="cell__detail">{detail}</span> : null}
      </div>
      <span className={clsx('toggle-switch', value && 'toggle-switch--on')} aria-hidden>
        <span className="toggle-switch__thumb" />
      </span>
    </button>
  );
};

export default ToggleCell;
