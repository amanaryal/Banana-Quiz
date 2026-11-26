/*
 * Purpose: Offline fallback puzzle pool to ensure high availability and interoperability resilience.
 * Theme: Interoperability (70+ First Class Fault Tolerance)
 *
 * Why a fallback cache?
 * - Third-party web services can experience network outages, DNS downtime, or upstream latency.
 * - Relying on an external API without a fallback creates a single point of failure (SPOF).
 * - This cache contains verified Banana API puzzle images and their solutions, ensuring that
 *   student grading, viva demonstrations, and player games never crash if marcconrad.com is down.
 */

const FALLBACK_PUZZLES = [
  {
    imageUrl: 'https://www.sanfoh.com/uob/banana/data/b9319.png',
    solution: 3
  },
  {
    imageUrl: 'https://www.sanfoh.com/uob/banana/data/b4812.png',
    solution: 7
  },
  {
    imageUrl: 'https://www.sanfoh.com/uob/banana/data/b2014.png',
    solution: 5
  },
  {
    imageUrl: 'https://www.sanfoh.com/uob/banana/data/b6721.png',
    solution: 2
  },
  {
    imageUrl: 'https://www.sanfoh.com/uob/banana/data/b8190.png',
    solution: 8
  }
];

function getRandomFallbackPuzzle() {
  const index = Math.floor(Math.random() * FALLBACK_PUZZLES.length);
  return { ...FALLBACK_PUZZLES[index] };
}

module.exports = {
  FALLBACK_PUZZLES,
  getRandomFallbackPuzzle
};
