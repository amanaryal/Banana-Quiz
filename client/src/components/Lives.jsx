/*
 * Purpose: Draws one banana for each life. Lost lives fade.
 * Theme: Event-driven programming
 */

export default function Lives({ lives, maxLives, shaking }) {
  const total = maxLives || 0;

  return (
    <div className={'lives' + (shaking ? ' life-loss' : '')} aria-label={lives + ' lives left'}>
      {Array.from({ length: total }).map((_, index) => (
        <span key={index} className={index < lives ? 'life' : 'life gone'} aria-hidden="true">❤️</span>
      ))}
    </div>
  );
}
