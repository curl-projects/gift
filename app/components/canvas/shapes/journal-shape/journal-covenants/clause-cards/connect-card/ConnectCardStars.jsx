import React, { useState, useEffect, useRef } from 'react';
import styles from "./ConnectCardStars.module.css";
import { TextScramble } from "~/components/canvas/custom-ui/post-processing-effects/text-scramble/TextScramble";
import { motion } from "framer-motion";

export function ConnectCardStars() {
  const [stars, setStars] = useState([]);
  const [lines, setLines] = useState([]);
  const [isExiting, setIsExiting] = useState(false);
  const [showCentralStar, setShowCentralStar] = useState(false);
  const svgRef = useRef(null);
  const textRef = useRef(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Define the central star
  const centralStar = {
    id: 'central',
    x: 50,    // Middle of the viewBox
    y: 40,    // Top 20% of the viewBox
  };

  useEffect(() => {
    let isMounted = true;

    const animate = async () => {
      if (isMounted) {
        // Wait for the initial line animation to complete
        // await sleep(1000); // Duration of the initial line animation

        // Show the central star
        setShowCentralStar(true);

        // Proceed with the main animation loop
        while (isMounted) {
          // Step 1: Generate stars
          const newStars = generateStars();
          setStars(newStars);

          // Wait for stars to appear
          await sleep(1000);

          // Include the central star in the path
          const allStars = [centralStar, ...newStars];

          // Step 2: Generate a reasonable shortest path
          const path = generatePath(allStars);
          setLines(path);

          // Wait for the lines to animate
          await sleep(2000);

          // Step 3: Pause
          await sleep(1000);

          // Step 4: Trigger exit animations
          setIsExiting(true);

          // Wait for exit animations to complete
          await sleep(1000); // Duration of exit animations

          // Step 5: Reset state for next iteration
          setLines([]);
          setStars([]);
          setIsExiting(false);

          // Wait before restarting the loop
          await sleep(1000);
        }
      }
    };

    animate();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (textRef.current && animationComplete) {
      const fx = new TextScramble(textRef.current, styles.dud, true);

      // Trigger the text scramble effect whenever stars change
      fx.setText("Connect");
    }
  }, [stars, animationComplete]);

  const generateStars = () => {
    const numStars = Math.floor(Math.random() * 4) + 5; // Between 5 and 8
    const starsArray = [];
    for (let i = 0; i < numStars; i++) {
      starsArray.push({
        id: i,
        x: Math.random() * 100, // Random position in SVG viewBox
        y: Math.random() * 100,
      });
    }
    return starsArray;
  };

  const generatePath = (stars) => {
    // Use a simple nearest-neighbor algorithm for a reasonable path
    const unvisited = [...stars];
    const path = [];
    let current = unvisited.shift();
    path.push(current);

    while (unvisited.length > 0) {
      let nearest = unvisited.reduce((prev, curr) => {
        const prevDistance = distance(current, prev);
        const currDistance = distance(current, curr);
        return currDistance < prevDistance ? curr : prev;
      });
      current = nearest;
      unvisited.splice(unvisited.indexOf(nearest), 1);
      path.push(current);
    }

    // Convert path to lines
    const linesArray = [];
    for (let i = 0; i < path.length - 1; i++) {
      linesArray.push({
        id: i,
        x1: path[i].x,
        y1: path[i].y,
        x2: path[i + 1].x,
        y2: path[i + 1].y,
      });
    }
    return linesArray;
  };

  const distance = (a, b) => {
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  return (
    <div className={styles.container}>
      <svg ref={svgRef} viewBox="0 0 100 100" className={styles.starsSvg}>
        <defs>
        <linearGradient id="linearGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
        </defs>

        {/* Render the initial line */}
        <line
          x1={centralStar.x}
          y1={0}
          x2={centralStar.x}
          y2={centralStar.y}
          className={styles.initialLine}
        //   stroke={`url(#linearGradient)`}
        //   strokeWidth={1}



        //   style={{
        //     stroke: "url(#lineGradient)"
        //   }}

        />

        {/* Render the central star */}
        {showCentralStar && (
          <circle
            key={centralStar.id}
            cx={centralStar.x}
            cy={centralStar.y}
            r={1.8}
            className={styles.star}
          />
        )}

        {/* Render the other stars */}
        {stars.map((star) => (
          <circle
            key={star.id}
            cx={star.x}
            cy={star.y}
            r={1.8}
            className={`${styles.star} ${isExiting ? styles.starExit : ''}`}
          />
        ))}

        {/* Render the lines */}
        {lines.map((line) => (
          <line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            className={`${styles.line} ${isExiting ? styles.lineExit : ''}`}
          />
        ))}
      </svg>
      <motion.div 
        className={styles.containerText}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        onAnimationComplete={() => setAnimationComplete(true)}
      >
        <span ref={textRef}></span>
      </motion.div>
    </div>
  );
}
