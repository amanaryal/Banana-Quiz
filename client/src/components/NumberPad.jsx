/*
 * Purpose: Big 0-9 buttons for a thumb on a phone.
 * Theme: Event-driven programming
 */

export default function NumberPad({ onDigit, onBackspace, onCheck, disabled }) {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="pad" role="group" aria-label="Number pad">
      {digits.map((digit) => (
        <button
          key={digit}
          type="button"
          disabled={disabled}
          aria-label={'Digit ' + digit}
          onClick={() => onDigit(digit)}
        >
          {digit}
        </button>
      ))}
      <button type="button" disabled={disabled} aria-label="Delete digit" onClick={onBackspace}>⌫</button>
      <button type="button" disabled={disabled} aria-label="Digit 0" onClick={() => onDigit('0')}>0</button>
      <button type="button" disabled={disabled} onClick={onCheck}>Check</button>
    </div>
  );
}
