interface SliderCellProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  formatter?: (value: number) => string;
}

const SliderCell = ({ label, value, onChange, min = 0, max = 100, step = 1, formatter }: SliderCellProps) => {
  const displayValue = formatter ? formatter(value) : `${value}`;

  return (
    <div className="cell cell--slider">
      <div className="cell__label">
        <span className="cell__title">{label}</span>
        <span className="cell__detail">{displayValue}</span>
      </div>
      <input
        className="cell__slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
};

export default SliderCell;
