import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from './Stars.module.css';
import { useEditor, track } from 'tldraw';
import { useStarFireSync } from '~/components/synchronization/StarFireSync';

function generateBoxShadow(n, offsetX = 0, offsetY = 0, color = '#FFF') {
  let value = `${Math.random() * 2800 + offsetX}px ${Math.random() * 2800 + offsetY}px 0px 0px ${color}`; // No blur and spread, with offset
  for (let i = 1; i < n; i++) {
    value += `, ${Math.random() * 2800 + offsetX}px ${Math.random() * 2800 + offsetY}px 0px 0px ${color}`; // No blur and spread, with offset
  }
  return value;
}

function applyOffset(boxShadow, offsetX, offsetY, color) {
  return boxShadow.split(', ').map(shadow => {
    const [x, y, blur, spread, originalColor] = shadow.split(' ');
    const newX = parseFloat(x) + offsetX + 'px';
    const newY = parseFloat(y) + offsetY + 'px';
    return `${newX} ${newY} ${blur} ${spread} ${color || originalColor}`;
  }).join(', ');
}

export const Stars = track(() => {
  const { starControls } = useStarFireSync();
  const onCompleteRef = useRef(starControls.onComplete);

  useEffect(() => {
    onCompleteRef.current = starControls.onComplete;
  }, [starControls.onComplete]);

  const [shadowsSmall, setShadowsSmall] = useState('');
  const [shadowsMedium, setShadowsMedium] = useState('');
  const [shadowsBig, setShadowsBig] = useState('');
  const [shadowsBigOffset, setShadowsBigOffset] = useState('');
//   const [startTransform, setStartTransform] = useState({ x: 0, y: 0 });
//   const [endTransform, setEndTransform] = useState({ x: 0, y: 0 });
//   const [isTransitioning, setIsTransitioning] = useState(false);
//   const [animationToggle, setAnimationToggle] = useState(false); // New state for toggling animation

//   const selectedShapeId = editor.getOnlySelectedShapeId();

  useEffect(() => {
    // Create a single style element
    const styleElement = document.createElement('style');
    styleElement.id = 'stars-animation-styles';
    document.head.appendChild(styleElement);

    return () => {
      // Clean up the style element when the component unmounts
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  useEffect(() => {
    setShadowsSmall(generateBoxShadow(700));
    setShadowsMedium(generateBoxShadow(200));
    setShadowsBig(generateBoxShadow(100));
    setShadowsBigOffset(generateBoxShadow(50, 0, 0, 'orange'));
  }, []);

  // useEffect(()=>{
  //   console.log("STAR CONTROLS", starControls)
  // }, [starControls])

  const introDuration = 10
  return (
    <>
      <motion.div
        id="stars"
        className={`${styles.stars}`}
        style={{ boxShadow: shadowsSmall }}
        initial={{ opacity: 0 }}
        animate={{ opacity: starControls?.visible ? 1 : 0 }}
        transition={{ duration: starControls?.immediate ? 0 : introDuration }}
        onAnimationComplete={(animation) => {
          console.log("STARS COMPLETED!")
          console.log("STAR CONTROLS", starControls)
          onCompleteRef.current && onCompleteRef.current();
        }}
      ></motion.div>
      <motion.div
        id="stars2"
        className={`${styles.stars2}`}
        style={{ boxShadow: shadowsMedium }}
        initial={{ opacity: 0 }}
        animate={{ opacity: starControls?.visible ? 1 : 0 }}
        transition={{ duration: starControls?.immediate ? 0 : introDuration }}
      ></motion.div>
      <motion.div
        id="stars3"
        className={`${styles.stars3}`}
        style={{ boxShadow: shadowsBig }}
        initial={{ opacity: 0 }}
        animate={{ opacity: starControls?.visible ? 4 : 0 }}
        transition={{ duration: starControls?.immediate ? 0 : introDuration }}
      ></motion.div>
      <motion.div
        id="offsetStars"
        className={`${styles.offsetStars}`}
        style={{ boxShadow: shadowsBigOffset }}
        initial={{ opacity: 0 }}
        animate={{ opacity: starControls?.visible ? 1 : 0 }}
        transition={{ duration: starControls?.immediate ? 0 : introDuration }}
      ></motion.div>
    </>
  );
});