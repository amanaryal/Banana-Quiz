/*
 * Purpose: The countdown bar. Colour follows the time that is left.
 * Theme: Event-driven programming
 */

export default function TimerBar({ timeLeft, total }) {
  const safeTotal = total || 1;
  const percent = Math.max(0, Math.min(100, (timeLeft / safeTotal) * 100));
  let zone = 'ok';

  if (percent <= 33) {
    zone = 'danger';
  } else if (percent <= 60) {
    zone = 'warn';
  }

  const shaking = timeLeft <= 5 && timeLeft > 0;

  return (
    <div className={'timer ' + zone + (shaking ? ' shake' : '')} aria-label={'Time left ' + Math.ceil(timeLeft) + ' seconds'}>
      <div className="timer-fill" style={{ width: percent + '%' }} />
      <span>{Math.ceil(timeLeft)}s</span>
    </div>
  );
}
