import styles from './JournalFriends.module.css'
import { JournalThread } from '~/components/canvas/shapes/journal-shape/parchment-journal/journal-thread/JournalThread.jsx'
import { motion } from 'framer-motion'
import { useState, useEffect, useRef }  from 'react';

export function JournalFriends() {
    const [selected, setSelected] = useState(null);

    const friendControls = [
        {
            displayName: 'From you',
            value: 'fromYou'
        },
        {
            displayName: 'From others',
            value: 'fromOthers'
        }
    ]
    return (
        <div className={styles.journalFriends}>
            <div className={styles.friendControllerRow}>
                {friendControls.map((control, index) => (
                    <FriendControl 
                        key={index}
                        control={control} 
                        index={index} 
                        selected={selected}
                        setSelected={setSelected}
                    />
                ))}
            </div>
            Friends
        </div>
    )
}

export function FriendControl({ control, index, selected, setSelected }) {
    const buttonRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (buttonRef.current) {
            const { offsetWidth, offsetHeight } = buttonRef.current;
            setDimensions({ width: offsetWidth, height: offsetHeight });
        }
    }, []);


    return (
        <div 
            className={styles.friendControl} 
            ref={buttonRef}
            onPointerDown={()=>setSelected(control.value)}
        >
            {control.displayName}
            {selected === control.value &&
                <motion.svg className={styles.animatedContainer}>
                <JournalThread
                        d={`M 0 0 L ${dimensions.width} 0 L ${dimensions.width} ${dimensions.height} L 0 ${dimensions.height} Z`}
                        delay={0}
                        duration={0.5}
                        strokeWidth={1}
                        persist
                        opacity={0.5}
                        shouldAnimate={true}
                    />
                </motion.svg>
            }
        </div>
    )
}   