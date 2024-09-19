import { useRef, useState, useEffect, useCallback } from "react"
import styles from "./TitlePainter.module.css"
import { motion, AnimatePresence } from "framer-motion"
import { useStarFireSync } from "~/components/synchronization/StarFireSync";


const motionPaths = [
    "M 0 64.3 L 1.8 63 Q 3.6 65.4 5.7 67.35 Q 7.8 69.3 10.4 70.75 Q 13 72.2 16.25 72.95 A 27.58 27.58 0 0 0 19.528 73.488 Q 21.205 73.667 23.093 73.695 A 47.827 47.827 0 0 0 23.8 73.7 Q 33.4 73.7 38.65 69.45 A 13.685 13.685 0 0 0 43.425 61.527 A 21.25 21.25 0 0 0 43.9 56.9 A 22.808 22.808 0 0 0 43.694 53.747 Q 43.463 52.094 42.973 50.701 A 12.441 12.441 0 0 0 42.55 49.65 A 14.216 14.216 0 0 0 40.659 46.571 A 12.162 12.162 0 0 0 38.95 44.85 A 16.609 16.609 0 0 0 34.799 42.372 A 19.397 19.397 0 0 0 33.7 41.95 Q 30.7 40.9 27.5 40.4 L 19.5 39.1 Q 14.2 38.2 10.75 36.45 A 20.901 20.901 0 0 1 7.867 34.699 A 15.258 15.258 0 0 1 5.25 32.3 Q 3.2 29.9 2.4 27 Q 1.6 24.1 1.6 21 A 21.112 21.112 0 0 1 1.941 17.117 A 15.748 15.748 0 0 1 3.15 13.3 Q 4.7 10 7.55 7.85 A 18.518 18.518 0 0 1 11.674 5.526 A 23.548 23.548 0 0 1 14.4 4.6 A 30.074 30.074 0 0 1 19.185 3.711 A 38.765 38.765 0 0 1 23.3 3.5 Q 29.356 3.5 33.711 4.871 A 19.688 19.688 0 0 1 36.95 6.2 A 23.512 23.512 0 0 1 41.91 9.632 A 19.813 19.813 0 0 1 45 13.2 L 43.3 14.6 Q 40.2 10.1 35.4 7.8 Q 31.641 5.999 26.225 5.608 A 43.482 43.482 0 0 0 23.1 5.5 Q 14 5.5 8.9 9.35 A 12.394 12.394 0 0 0 4.203 16.925 A 19.431 19.431 0 0 0 3.8 21 Q 3.8 25.1 5.1 27.9 A 13.699 13.699 0 0 0 7.434 31.434 A 12.597 12.597 0 0 0 8.6 32.55 A 16.453 16.453 0 0 0 13.118 35.229 A 18.852 18.852 0 0 0 13.7 35.45 A 31.725 31.725 0 0 0 18.677 36.793 A 35.957 35.957 0 0 0 19.9 37 L 27.9 38.3 A 41.36 41.36 0 0 1 31.751 39.109 Q 34.731 39.894 36.95 41.05 A 20.869 20.869 0 0 1 39.76 42.793 Q 41.375 43.994 42.5 45.4 A 15.21 15.21 0 0 1 44.958 49.727 A 14.279 14.279 0 0 1 45.3 50.8 Q 46.1 53.7 46.1 56.8 A 23.166 23.166 0 0 1 45.449 62.468 A 15.157 15.157 0 0 1 40.05 70.95 A 20.973 20.973 0 0 1 32.515 74.639 Q 28.621 75.7 23.8 75.7 A 42.688 42.688 0 0 1 19.707 75.513 Q 17.513 75.302 15.6 74.85 A 29.893 29.893 0 0 1 11.787 73.688 A 24.283 24.283 0 0 1 9.15 72.5 Q 6.3 71 4.1 68.9 Q 1.9 66.8 0 64.3 Z",
    "M 105.6 74.5 L 80 74.5 A 4.175 4.175 0 0 1 78.852 74.356 Q 77.565 73.988 77.224 72.674 A 4.273 4.273 0 0 1 77.1 71.6 L 77.1 24.8 L 57 24.8 L 57 22.9 L 74.2 22.9 A 4.175 4.175 0 0 0 75.348 22.756 Q 76.635 22.388 76.976 21.074 A 4.273 4.273 0 0 0 77.1 20 L 77.1 4.7 L 79.2 4.7 L 79.2 22.9 L 105.6 22.9 L 105.6 24.8 L 79.2 24.8 L 79.2 72.6 L 105.6 72.6 L 105.6 74.5 Z",
    "M 166.5 74.5 L 158.8 74.5 A 4.175 4.175 0 0 1 157.652 74.356 Q 156.365 73.988 156.024 72.674 A 4.273 4.273 0 0 1 155.9 71.6 L 155.9 66.8 L 155.6 66.8 A 15.477 15.477 0 0 1 152.385 70.929 A 20.621 20.621 0 0 1 149.65 73.05 A 14.277 14.277 0 0 1 145.823 74.766 Q 144.029 75.291 141.873 75.521 A 33.759 33.759 0 0 1 138.3 75.7 A 30.285 30.285 0 0 1 133.493 75.344 Q 128.625 74.559 125.6 72.05 A 11.805 11.805 0 0 1 121.548 65.124 A 17.893 17.893 0 0 1 121.2 61.5 Q 121.2 58.4 122.15 55.7 Q 123.1 53 125.35 51.1 Q 127.273 49.476 130.329 48.437 A 24.336 24.336 0 0 1 131.4 48.1 A 24.723 24.723 0 0 1 134.659 47.409 Q 136.367 47.156 138.344 47.06 A 52.477 52.477 0 0 1 140.9 47 L 155.9 47 L 155.9 38.9 Q 155.9 31.1 151.9 27.35 Q 148.099 23.787 141.59 23.609 A 25.313 25.313 0 0 0 140.9 23.6 Q 135.4 23.6 131.1 25.95 A 13.941 13.941 0 0 0 125.837 31.069 A 18.677 18.677 0 0 0 124.6 33.5 L 122.9 32.5 Q 125.1 27.5 129.55 24.6 Q 133.606 21.957 139.696 21.723 A 31.327 31.327 0 0 1 140.9 21.7 Q 147.496 21.7 151.705 24.618 A 13.851 13.851 0 0 1 153.5 26.1 A 14.302 14.302 0 0 1 157.3 32.785 Q 157.912 35.077 157.989 37.81 A 28.195 28.195 0 0 1 158 38.6 L 158 72.6 L 166.5 72.6 L 166.5 74.5 Z M 155.9 59.7 L 155.9 48.8 L 141 48.8 A 46.571 46.571 0 0 0 136.594 48.994 Q 131.946 49.437 129.098 50.895 A 10.148 10.148 0 0 0 127.5 51.9 A 10.631 10.631 0 0 0 124.801 54.896 A 9.673 9.673 0 0 0 123.5 59.9 L 123.5 63.1 A 10.457 10.457 0 0 0 124.077 66.656 Q 125.03 69.31 127.56 71.023 A 11.264 11.264 0 0 0 127.6 71.05 Q 131.188 73.456 136.689 73.757 A 29.516 29.516 0 0 0 138.3 73.8 Q 141.8 73.8 145 72.9 A 18.627 18.627 0 0 0 148.645 71.465 A 15.817 15.817 0 0 0 150.6 70.25 Q 153 68.5 154.45 65.85 A 11.74 11.74 0 0 0 155.757 61.817 A 15.152 15.152 0 0 0 155.9 59.7 Z",
    "M 181.4 74.5 L 181.4 72.6 L 199.2 72.6 L 199.2 24.8 L 181.4 24.8 L 181.4 22.9 L 201.3 22.9 L 201.3 32.9 L 201.6 32.9 Q 202.5 30.8 203.75 29 A 12.767 12.767 0 0 1 206.665 26.021 A 14.462 14.462 0 0 1 206.9 25.85 A 14.34 14.34 0 0 1 209.53 24.385 A 18.246 18.246 0 0 1 211.4 23.7 A 17.02 17.02 0 0 1 214.035 23.126 Q 215.641 22.9 217.5 22.9 L 229 22.9 L 229 24.8 L 217.1 24.8 Q 214 24.8 211.15 25.8 Q 208.3 26.8 206.1 28.85 A 14.054 14.054 0 0 0 203.306 32.516 A 17.113 17.113 0 0 0 202.6 34 Q 201.3 37.1 201.3 41.4 L 201.3 72.6 L 223.9 72.6 L 223.9 74.5 L 181.4 74.5 Z",
    "M 242.5 74.5 L 242.5 72.6 L 262.4 72.6 L 262.4 2.4 L 242.5 2.4 L 242.5 0.5 L 264.5 0.5 L 264.5 72.6 L 284.4 72.6 L 284.4 74.5 L 242.5 74.5 Z",
    "M 305.1 74.5 L 305.1 72.6 L 325.6 72.6 L 325.6 24.8 L 305.1 24.8 L 305.1 22.9 L 327.7 22.9 L 327.7 72.6 L 346.9 72.6 L 346.9 74.5 L 305.1 74.5 Z M 323.7 3.1 L 323.7 2.3 A 2.517 2.517 0 0 1 323.829 1.479 A 2.143 2.143 0 0 1 324.35 0.65 Q 324.958 0.042 326.396 0.003 A 7.432 7.432 0 0 1 326.6 0 Q 327.983 0 328.656 0.486 A 1.583 1.583 0 0 1 328.85 0.65 A 2.195 2.195 0 0 1 329.494 2.116 A 2.933 2.933 0 0 1 329.5 2.3 L 329.5 3.1 A 2.517 2.517 0 0 1 329.371 3.921 A 2.143 2.143 0 0 1 328.85 4.75 Q 328.242 5.358 326.804 5.397 A 7.432 7.432 0 0 1 326.6 5.4 Q 325.217 5.4 324.544 4.914 A 1.583 1.583 0 0 1 324.35 4.75 A 2.195 2.195 0 0 1 323.706 3.284 A 2.933 2.933 0 0 1 323.7 3.1 Z",
    "M 372.5 70.5 L 372.5 70.2 Q 370.391 69.598 369.161 68.456 A 5.311 5.311 0 0 1 368.45 67.65 A 6.706 6.706 0 0 1 367.244 64.377 A 8.568 8.568 0 0 1 367.2 63.5 A 7.617 7.617 0 0 1 367.716 60.651 A 6.958 6.958 0 0 1 369.8 57.85 Q 372.4 55.7 375.7 54.7 L 375.7 54.4 Q 371.4 52.5 369 48.6 A 15.509 15.509 0 0 1 367.093 43.766 Q 366.662 41.808 366.608 39.551 A 27.266 27.266 0 0 1 366.6 38.9 Q 366.6 31.1 371.2 26.4 A 15.157 15.157 0 0 1 378.853 22.23 A 22.687 22.687 0 0 1 383.9 21.7 Q 390.5 21.7 395 25.1 L 395 21.1 A 3.596 3.596 0 0 1 395.154 19.999 Q 395.53 18.831 396.822 18.516 A 4.568 4.568 0 0 1 397.9 18.4 L 409 18.4 L 409 20.3 L 396.9 20.3 L 396.9 26.8 A 15.766 15.766 0 0 1 399.586 30.931 A 18.613 18.613 0 0 1 400.05 32.05 A 17.699 17.699 0 0 1 401.038 36.156 A 22.558 22.558 0 0 1 401.2 38.9 A 21.083 21.083 0 0 1 400.782 43.175 A 17.468 17.468 0 0 1 399.95 46 Q 398.7 49.2 396.4 51.45 Q 394.1 53.7 390.95 54.9 Q 387.8 56.1 383.9 56.1 Q 382.4 56.1 381.1 55.9 Q 379.8 55.7 378.3 55.4 A 24.839 24.839 0 0 0 374.866 56.555 Q 370.881 58.262 369.699 60.954 A 6.017 6.017 0 0 0 369.2 63.4 Q 369.2 64.5 369.55 65.5 A 3.435 3.435 0 0 0 370.314 66.731 A 4.613 4.613 0 0 0 370.9 67.25 A 6.203 6.203 0 0 0 371.828 67.818 Q 372.591 68.203 373.6 68.5 Q 374.835 68.863 376.545 68.963 A 23.397 23.397 0 0 0 377.9 69 L 391.4 69 A 37.595 37.595 0 0 1 395.676 69.226 Q 400.23 69.749 402.927 71.485 A 9.421 9.421 0 0 1 403.9 72.2 Q 407.7 75.4 407.7 80.8 Q 407.7 88.48 401.532 92.081 A 15.435 15.435 0 0 1 401.5 92.1 Q 395.361 95.664 384.027 95.7 A 72.963 72.963 0 0 1 383.8 95.7 A 56.553 56.553 0 0 1 378.238 95.446 Q 371.159 94.744 367.45 92.1 A 12.758 12.758 0 0 1 364.275 88.937 A 10.951 10.951 0 0 1 362.4 82.6 A 13.097 13.097 0 0 1 362.867 79.019 A 10.18 10.18 0 0 1 365.05 75 A 13.807 13.807 0 0 1 368.681 72.117 Q 370.381 71.162 372.5 70.5 Z M 391.1 71 L 375.6 71 A 20.748 20.748 0 0 0 371.745 72.356 A 15.371 15.371 0 0 0 367.8 75 A 9.21 9.21 0 0 0 365.037 80.11 A 13.472 13.472 0 0 0 364.8 82.7 A 10.013 10.013 0 0 0 365.563 86.678 Q 366.643 89.201 369.25 90.9 A 16.152 16.152 0 0 0 373.747 92.882 Q 375.796 93.456 378.234 93.671 A 34.928 34.928 0 0 0 381.3 93.8 L 386.2 93.8 A 42.923 42.923 0 0 0 390.557 93.588 A 33.234 33.234 0 0 0 394.05 93.05 A 21.687 21.687 0 0 0 397.254 92.124 A 16.295 16.295 0 0 0 400.15 90.7 A 11.797 11.797 0 0 0 403.222 87.961 A 11.033 11.033 0 0 0 404.1 86.65 A 10.493 10.493 0 0 0 405.335 83.068 A 13.716 13.716 0 0 0 405.5 80.9 A 11.235 11.235 0 0 0 405.093 77.793 A 8.274 8.274 0 0 0 402.35 73.6 Q 399.2 71 391.1 71 Z M 398.8 40.8 L 398.8 37 Q 398.8 31.3 394.95 27.45 Q 391.1 23.6 383.9 23.6 Q 376.7 23.6 372.85 27.45 A 12.937 12.937 0 0 0 369.001 36.822 A 16.75 16.75 0 0 0 369 37 L 369 40.8 A 13.517 13.517 0 0 0 370.05 46.186 A 12.886 12.886 0 0 0 372.95 50.35 Q 376.755 54.059 383.391 54.195 A 24.854 24.854 0 0 0 383.9 54.2 Q 391.1 54.2 394.95 50.35 A 12.937 12.937 0 0 0 398.799 40.978 A 16.75 16.75 0 0 0 398.8 40.8 Z",
    "M 426.1 74.5 L 426.1 0.5 L 428.2 0.5 L 428.2 30.3 L 428.5 30.3 A 10.96 10.96 0 0 1 430.519 27.07 Q 431.785 25.634 433.65 24.35 A 13.499 13.499 0 0 1 437.543 22.55 Q 440.448 21.7 444.3 21.7 A 24.027 24.027 0 0 1 449.378 22.203 Q 454.309 23.27 457.3 26.6 Q 461.7 31.5 461.7 40.9 L 461.7 74.5 L 459.6 74.5 L 459.6 41.2 A 33.73 33.73 0 0 0 459.282 36.392 Q 458.48 30.839 455.655 27.859 A 10.384 10.384 0 0 0 455.55 27.75 A 13.114 13.114 0 0 0 449.524 24.285 Q 447.434 23.707 444.938 23.617 A 25.951 25.951 0 0 0 444 23.6 Q 440.9 23.6 438.05 24.45 Q 435.2 25.3 433 27 Q 430.8 28.7 429.5 31.3 Q 428.2 33.9 428.2 37.3 L 428.2 74.5 L 426.1 74.5 Z",
    "M 525.6 74.5 L 500 74.5 A 4.175 4.175 0 0 1 498.852 74.356 Q 497.565 73.988 497.224 72.674 A 4.273 4.273 0 0 1 497.1 71.6 L 497.1 24.8 L 477 24.8 L 477 22.9 L 494.2 22.9 A 4.175 4.175 0 0 0 495.348 22.756 Q 496.635 22.388 496.976 21.074 A 4.273 4.273 0 0 0 497.1 20 L 497.1 4.7 L 499.2 4.7 L 499.2 22.9 L 525.6 22.9 L 525.6 24.8 L 499.2 24.8 L 499.2 72.6 L 525.6 72.6 L 525.6 74.5 Z",
]

export function TitlePainter(){
    const { titleControls } = useStarFireSync();
    const titleRef = useRef(null);
    const onCompleteRef = useRef(titleControls.onComplete);
    const handleKeyDownRef = useRef();
    const [groupBBox, setGroupBBox] = useState({ width: 0, height: 0 });
    const [nextButtonVisible, setNextButtonVisible] = useState(false);

    const updateBBox = () => {
        if (titleRef.current) {
            const bbox = titleRef.current.getBBox();
            setGroupBBox({
                width: bbox.width,
                height: bbox.height
            });
        }
    };

    const handleKeyDown = useCallback((event) => {
        if (event.key === ' ') {
            console.log('triggering listener!')
            setNextButtonVisible(false);
            window.removeEventListener('keydown', handleKeyDownRef.current);
            event.preventDefault();
            titleControls.onComplete && titleControls.onComplete();
        }
    }, [titleControls]);

    useEffect(() => {
        handleKeyDownRef.current = handleKeyDown;
    }, [handleKeyDown]);

    useEffect(() => {
        onCompleteRef.current = titleControls.onComplete;
    }, [titleControls.onComplete]);


    useEffect(()=>{
        if(!titleControls.visible){
            // onCompleteRef.current && onCompleteRef.current();
        }
        else{
            window.addEventListener('keydown', handleKeyDownRef.current);   
        }
    }, [titleControls])

    useEffect(() => {
        updateBBox();
        window.addEventListener('resize', updateBBox);
        return () => window.removeEventListener('resize', updateBBox);
    }, [titleRef.current, titleControls]);

    return(
        <>
        <AnimatePresence>
        
        {titleControls.visible && (
            <>
            <div className={styles.titlePainter}>
               <svg 
                    className={styles.title}
                    width="100vw" // Set the desired width
                    height="100vh" // Set the desired 
                    viewBox="0 0 600 600"
                    preserveAspectRatio="xMidYMid meet" // Center the SVG
                    // filter="url(#pencilTexture4)"
                    // fill="url(#gradient)"
                    // initial={{ opacity: 0 }}
                    // animate={{ opacity: 1 }}
                    // exit={{ opacity: 0 }}
                    // transition={{ duration: 2, delay: 4 }}
                >
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: "#FF9A8B", stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: "#FF6F61", stopOpacity: 1 }} />
                        </linearGradient>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
				        </filter>
                        <filter id="combined">
                            <feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="4" />
                            <feDisplacementMap in="SourceGraphic" scale="4" />
                        </filter>
                    </defs>
                    <g id="svgGroup" strokeLinecap="round" fillRule="evenodd" 
                    style={{stroke:"white", strokeWidth: "0.25mm", fill: "white"}}
                    ref={titleRef}
                    transform={`translate(${(600 - groupBBox.width) / 2}, ${((600 - groupBBox.height) / 2) - 100})`}
                    >
                        {motionPaths.map((path, idx) => 
                             <motion.path 
                             filter="url(#glow) url(#combined)"
                             key={`$title-path-${idx}`}
                             strokeWidth="3px"
                             initial={{ pathLength: 0, fillOpacity: 0, opacity: 1 }}
                             animate={{ 
                                 pathLength: titleControls.visible ? [0, 0.01, 1.5] : [0, 0, 0], 
                                 fillOpacity: titleControls.visible ? [0, 0.01, 0] : [0, 0, 0], 
                                 opacity: titleControls.visible ? [1, 1, 1] : [0, 0, 0]
                             }}
                             exit={{ opacity: 0 }}
                             transition={{ 
                                 duration: titleControls.immediate ? 0 : (titleControls.duration || 1), 
                                 delay: titleControls.delay ? titleControls.delay + idx * 0.25 : idx * 0.25,
                                 times: [0, 0.01, 1],
                                 ease: "easeInOut"
                             }}
                             onAnimationComplete={(animation)=>{
                                console.log("title animation opacity", animation)
                                if(idx === motionPaths.length - 1 && animation.opacity === 0){
                                    console.log('triggering title onComplete', titleControls.onComplete)
                                    onCompleteRef.current && onCompleteRef.current()
                                }
                                else if(idx === (motionPaths.length - 1) && (animation.opacity?.length === 3)){
                                    setNextButtonVisible(true)
                                }
                             }}
                             d={path} 
                             id="0" 
                             vectorEffect="non-scaling-stroke"/>
                        )}
                    </g>
                </svg>
            </div>

            <div
                key='title-component'
                className={styles.titleContainer}
                >
                <div className={styles.titleContainerInner}>
                    <motion.div 
                        key="title-darkening"
                        className={styles.titleContainerDarkening}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: titleControls.visible ? 1 : 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: titleControls.immediate ? 0 : (titleControls.duration || 1), delay: titleControls.delay || 0 }}
                    />
                </div>    
            </div>
            <AnimatePresence>
                {nextButtonVisible && (
                    <motion.div 
                        key='next-button-container'
                        className={styles.nextButtonContainerWrapper}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0 } }}
                        transition={{ duration: 1 }}
                    >
                        <div className={styles.nextButtonContainer}>
                            press space to continue
                        </div>
                    </motion.div>
                 )
                }
            </AnimatePresence>
        </>
        )}
        
        </AnimatePresence>
        </>
    )
}