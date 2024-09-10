import React, { useEffect, useRef } from 'react';
import styles from './WarpStars.module.css';

export function WarpStars({ 
    speed = 3, 
    density = 10, 
    starSize = 30, 
    backgroundColor = 'transparent', 
    starColor = 'white', 
    warpEffect = true, 
    warpEffectLength = 5
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.onresize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Star {
      constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.size = 0.5 + Math.random();
      }
    }

    const stars = [];
    for (let i = 0; i < density * 1000; i++) {
      stars.push(new Star((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000, 1000 * Math.random()));
    }

    let lastMoveTS = performance.now();
    let drawRequest = null;

    const draw = () => {
      const TIME = performance.now();
      move();
      if (canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas to maintain transparency
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = starColor;
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          const xOnDisplay = s.x / s.z, yOnDisplay = s.y / s.z;
          const size = s.size * starSize / s.z;
          if (size < 0.3) continue;
          ctx.globalAlpha = (1000 - s.z) / 1000;
          if (warpEffect) {
            ctx.beginPath();
            const x2OnDisplay = s.x / (s.z + warpEffectLength * speed), y2OnDisplay = s.y / (s.z + warpEffectLength * speed);
            ctx.moveTo(canvas.width * (xOnDisplay + 0.5) - size / 2, canvas.height * (yOnDisplay + 0.5) - size / 2);
            ctx.lineTo(canvas.width * (x2OnDisplay + 0.5) - size / 2, canvas.height * (y2OnDisplay + 0.5) - size / 2);
            ctx.lineWidth = size;
            ctx.lineCap = "round";
            ctx.strokeStyle = ctx.fillStyle;
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.arc(canvas.width * (xOnDisplay + 0.5) - size / 2, canvas.height * (yOnDisplay + 0.5) - size / 2, size / 2, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      }
      drawRequest = requestAnimationFrame(draw);
    };

    const move = () => {
      const t = performance.now(), speedMulF = (t - lastMoveTS) / (1000 / 60);
      lastMoveTS = t;
      const speedAdjF = Math.pow(0.03, 1 / speedMulF);
      const currentSpeed = speed * speedAdjF + speed * (1 - speedAdjF);
      const adjustedSpeed = currentSpeed * speedMulF;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.z -= adjustedSpeed;
        while (s.z < 1) {
          s.z += 1000;
          s.x = (Math.random() - 0.5) * s.z;
          s.y = (Math.random() - 0.5) * s.z;
        }
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(drawRequest);
    };
  }, [speed, density, starSize, backgroundColor, starColor, warpEffect, warpEffectLength]);

  return <canvas id="warpCanvas" ref={canvasRef} className={styles.warpCanvas}></canvas>;
};

