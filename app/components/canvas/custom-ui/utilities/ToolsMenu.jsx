import { useCallback } from 'react';
import styles from './ToolsMenu.module.css'
import { FaJournalWhills } from "react-icons/fa";
import { GiAstrolabe } from "react-icons/gi";
import { IoTelescope } from "react-icons/io5";
import { createShapeId, useEditor } from 'tldraw';
import { useStarFireSync } from "~/components/synchronization/StarFireSync";
import { useEffect } from 'react';

export function ToolsMenu(){
    const editor = useEditor();
    const { drifting, setDrifting, journalMode, setJournalMode } = useStarFireSync()

    useEffect(()=>{
        console.log('journalMode', journalMode)
    }, [journalMode])

    const handleJournalClick = () => {
        setJournalMode({ active: !journalMode.active, page: journalMode.page || 'elevator-pitch', variant: journalMode.variant })
    };

    const handleAstrolabeClick = () => {
        setDrifting({ active: !drifting.active })
    };

    const handleTelescopeClick = useCallback(() => {
        console.log('telescope');
    }, []);

    const items = [
        {
            id: 'left',
            tool: 'journal',
            icon: <FaJournalWhills />,
            active: journalMode.active,
            onClick: handleJournalClick
        },
        {
            id: 'middle',
            tool: "astrolabe",
            icon: <GiAstrolabe />,
            active: drifting.active,
            onClick: handleAstrolabeClick
        },
        {
            id: 'right',
            tool: 'telescope',
            icon: <IoTelescope />,
            active: false,
            onClick: handleTelescopeClick
        }
    ]

    return(
        <div className={styles.toolsMenu} 
        // onPointerDown={(e) => e.stopPropagation()}
        >
            {items.map((item, index) => (
                <div key={item.id} className={`${styles.item} ${styles[item.id]}`} onPointerDown={(e) => item.onClick()}>
                    <div className={styles.itemInner}>
                        <p className={`${styles.icon} ${item.active ? styles.iconActive : ''}`}>{item.icon}</p>
                    </div>
                </div> 
            ))}
        </div>
    )
}