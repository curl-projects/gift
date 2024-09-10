import React, { useEffect, useState } from 'react';
import styles from './Stars.module.css';
import { useEditor, track } from 'tldraw';

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
  const editor = useEditor();

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
      document.head.removeChild(styleElement);
    };
  }, []);

//   useEffect(() => {
//     if (selectedShapeId && ['excerpt', 'concept'].includes(editor.getShape(selectedShapeId).type)){
//       const viewportCenter = editor.getViewportScreenCenter();
//       const shapeCenter = editor.pageToScreen(editor.getShapePageBounds(selectedShapeId).center);

//       const diffX = viewportCenter.x - shapeCenter.x;
//       const diffY = viewportCenter.y - shapeCenter.y;

//       setStartTransform(prevTransform => ({
//         x: prevTransform.x,
//         y: prevTransform.y
//       }));
//       setEndTransform(prevTransform => ({
//         x: prevTransform.x + diffX,
//         y: prevTransform.y + diffY
//       }));

//       // Update the style element content
//       const styleElement = document.getElementById('stars-animation-styles');
//       if (styleElement) {
//         styleElement.textContent = `
//           :root {
//             --stars-translateX-start: ${startTransform.x}px;
//             --stars-translateY-start: ${startTransform.y}px;
//             --stars-translateX-end: ${endTransform.x + diffX}px;
//             --stars-translateY-end: ${endTransform.y + diffY}px;
//           }
//         `;

//         console.log("STARS STYLE ELEMENT:", styleElement.textContent);
//       }

//       // Toggle the animation class to restart the animation
//       setAnimationToggle(prev => !prev);
//     }
//   }, [selectedShapeId]);

//   useEffect(() => {
//     if (selectedShapeId) {
//       setIsTransitioning(true);
//       const timer = setTimeout(() => setIsTransitioning(false), 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [selectedShapeId]);

  useEffect(() => {
    setShadowsSmall(generateBoxShadow(700));
    setShadowsMedium(generateBoxShadow(200));
    setShadowsBig(generateBoxShadow(100));
    setShadowsBigOffset(generateBoxShadow(50, 0, 0, 'orange'));
  }, []);

  return (
    <>
      <div id="stars" className={`${styles.stars}`} style={{ boxShadow: shadowsSmall }}></div>
      <div id="stars2" className={`${styles.stars2}`} style={{ boxShadow: shadowsMedium }}></div>
      <div id="stars3" className={`${styles.stars3}`} style={{ boxShadow: shadowsBig }}></div>
      <div id="offsetStars" className={`${styles.offsetStars}`} style={{ boxShadow: shadowsBigOffset }}></div>
    </>
  );
});