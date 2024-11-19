import { useCallback, useState } from 'react';
import styles from './ToolsMenu.module.css'
import { FaJournalWhills } from "react-icons/fa";
import { GiAstrolabe } from "react-icons/gi";
import { IoTelescope } from "react-icons/io5";
import { createShapeId, useEditor } from 'tldraw';
import { useStarFireSync } from "~/components/synchronization/StarFireSync";
import { useEffect } from 'react';
import * as BABYLON from '@babylonjs/core';

export function ToolsMenu(){
    const editor = useEditor();
    const { drifting, setDrifting, 
            journalMode, setJournalMode, 
            minimapMode, setMinimapMode, 
            constellationLabel, setConstellationLabel,
            campfireView, setCampfireView,
            conceptList, setConceptList
        } = useStarFireSync();

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipText, setTooltipText] = useState('');

    useEffect(()=>{
        console.log('journalMode', journalMode);
    }, [journalMode]);


    const handleJournalClick = () => {
        console.log("JOURNAL CLICK MODE:", journalMode);
        // setJournalMode({ active: !journalMode.active, page: journalMode.page || "elevator-pitch", variant: journalMode.variant || 'modern'});
        setJournalMode({ active: !journalMode.active, variant: "modern", position: 'right', content: "Hello HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello"});
    };

    const handleAstrolabeClick = () => {
        // setDrifting({ active: !drifting.active });
        setMinimapMode({ active: !minimapMode.active });
        console.log("astrolabe")

    };

    const handleTelescopeClick = () => {
        console.log('telescope');
        setConstellationLabel({ visible: !constellationLabel.visible });
    };

    const handleMouseEnter = (text) => {
        setTooltipText(text);
        setTooltipVisible(true);
    };

    const handleMouseLeave = () => {
        setTooltipVisible(false);
    };

    const items = [
        {
            id: 'left',
            tool: 'journal',
            icon: <FaJournalWhills />,
            active: journalMode.active,
            onClick: handleJournalClick,
            tooltip: 'Journal'
        },
        {
            id: 'middle',
            tool: "astrolabe",
            icon: <GiAstrolabe />,
            active: minimapMode.active,
            onClick: handleAstrolabeClick,
            tooltip: 'Minimap'
        },
        {
            id: 'right',
            tool: 'telescope',
            icon: <IoTelescope />,
            active: constellationLabel.visible,
            onClick: handleTelescopeClick,
            tooltip: 'Labels'
        }
    ];

    return(
        <div className={styles.outerToolsMenu}>
            <div className={styles.toolsMenu}>
                {items.map((item) => (
                    <div 
                        key={item.id} 
                        className={`${styles.item} ${styles[item.id]}`} 
                        onPointerDown={(e) => item.onClick()}
                        onMouseEnter={() => handleMouseEnter(item.tooltip)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className={styles.itemInner}>
                            <p className={`${styles.icon} ${item.active ? styles.iconActive : ''}`}>{item.icon}</p>
                        </div>
                    </div> 
                ))}
            </div>
            {tooltipVisible && <p className={styles.toolsTooltip}>{tooltipText}</p>}
        </div>
    );
}