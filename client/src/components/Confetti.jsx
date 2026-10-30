/*
 * Purpose: A short burst of coloured squares when a game ends well.
 * Theme: Event-driven programming
 */

import { useEffect, useRef } from 'react';

export default function Confetti({ show }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!show || !canvasRef.current) {
      return undefined;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 80,
      size: 6 + Math.random() * 6,
      speed: 2 + Math.random() * 3,
      color: ['#f0b429', '#fff1c9', '#6b4f2a', '#1d7a4a'][Math.floor(Math.random() * 4)]
    }));

    let frame = 0;
    let animation = 0;

    function draw() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((piece) => {
        piece.y += piece.speed;
        context.fillStyle = piece.color;
        context.fillRect(piece.x, piece.y, piece.size, piece.size * 0.6);
      });
      frame += 1;

      if (frame < 90) {
        animation = requestAnimationFrame(draw);
      } else {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    animation = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animation);
  }, [show]);

  if (!show) {
    return null;
  }

  return <canvas ref={canvasRef} className="confetti" aria-hidden="true" />;
}
