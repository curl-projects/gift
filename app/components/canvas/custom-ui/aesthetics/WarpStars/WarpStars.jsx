import React, { useEffect, useRef, useState } from 'react';
import { useConstellationMode } from '~/components/canvas/custom-ui/utilities/ConstellationModeContext.jsx';
import styles from './WarpStars.module.css';


function timeStamp(){
	if(window.performance.now)return window.performance.now(); else return Date.now();
}




export function WarpStars({ 
    density = 20, 
    starSize = 100, 
    backgroundColor = 'transparent', 
    starColor = 'white', 
    warpEffect = true, 
    warpEffectLength = 5 
}) {

  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const paramsRef = useRef({
      depth: 1000,
      speed: 1,
      starSize,
      backgroundColor,
      starColor,
      warpEffect,
      warpEffectLength
  });
  const { warpStarsActive, setWarpStarsActive } = useConstellationMode();

  const animateParam = (param, targetValue, duration) => {
      return new Promise((resolve) => {
          const startValue = paramsRef.current[param];
          const startTime = performance.now();

          const animate = () => {
              const currentTime = performance.now();
              const elapsedTime = currentTime - startTime;
              const progress = Math.min(elapsedTime / duration, 1);
              paramsRef.current[param] = startValue + (targetValue - startValue) * progress;

              if (progress < 1) {
                  requestAnimationFrame(animate);
              } else {
                  resolve();
              }
          };

          requestAnimationFrame(animate);
      });
  };

  useEffect(()=>{
    setWarpStarsActive(true)
    console.log('warpStarsActive', warpStarsActive)
    setTimeout(()=>{
        animateParam('speed', 0.05, 4000).then(()=>{
            animateParam('warpEffectLength', 1, 500)
        })
    //   setWarpStarsActive(false)
    }, 1000)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context');
      return;
    }
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

    if (starsRef.current.length === 0) {
      for (let i = 0; i < density * 1000; i++) {
        starsRef.current.push(new Star((Math.random() - 0.5) * paramsRef.current.depth, (Math.random() - 0.5) * paramsRef.current.depth, paramsRef.current.depth * Math.random()));
      }
      console.log('Stars initialized:', starsRef.current.length);
    }

    let lastMoveTS = performance.now();
    let drawRequest = null;

    const draw = () => {
      console.log('Drawing frame');
      const TIME = performance.now();
      move();
      if (canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas to maintain transparency
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = paramsRef.current.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = paramsRef.current.starColor;
        for (let i = 0; i < starsRef.current.length; i++) {
          const s = starsRef.current[i];
          const xOnDisplay = s.x / s.z, yOnDisplay = s.y / s.z;
          const size = s.size * paramsRef.current.starSize / s.z;
          if (size < 0.3) continue;
          ctx.globalAlpha = (1000 - s.z) / 1000;
          if (paramsRef.current.warpEffect) {
            ctx.beginPath();
            const x2OnDisplay = s.x / (s.z + paramsRef.current.warpEffectLength * paramsRef.current.speed), y2OnDisplay = s.y / (s.z + paramsRef.current.warpEffectLength * paramsRef.current.speed);
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
      const currentSpeed = paramsRef.current.speed * speedAdjF + paramsRef.current.speed * (1 - speedAdjF);
      const adjustedSpeed = currentSpeed * speedMulF;
      for (let i = 0; i < starsRef.current.length; i++) {
        const s = starsRef.current[i];
        s.z -= adjustedSpeed;

          while (s.z < 1) { // this changes the stars position
            s.z += paramsRef.current.depth;
            s.x = (Math.random() - 0.5) * s.z;
            s.y = (Math.random() - 0.5) * s.z;
          }
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(drawRequest);
    };
  }, [density]);

  const update = (newConfig) => {
    Object.assign(paramsRef.current, newConfig);
  };

  return <canvas id="warpCanvas" ref={canvasRef} className={styles.warpCanvas} />;
};

