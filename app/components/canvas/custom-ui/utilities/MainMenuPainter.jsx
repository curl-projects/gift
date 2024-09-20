import styles from "./MainMenuPainter.module.css"
import { useState, useEffect } from "react"
import { useStarFireSync } from '~/components/synchronization/StarFireSync';

export function MainMenuPainter() {
    const menuItems = [
        {
            name: 'Elevator Pitch',
            onClick: () => {
                console.log("Elevator Pitch")
            }
        
        },
        {
            name: "Design Philosophy",
            onClick: () => {
                console.log("Design Philosophy")
            }
        },
        {
            name: "Mechanics",
            onClick: () => {
                console.log("Mechanics")
            }
        },
        {
            name: "Market Analysis",
            onClick: () => {
                console.log("Market Analysis")
            }
        },
        {
            name: "Technical Foundations",
            onClick: () => {
                console.log("Technical Foundations")
            }
        }
    ]

    return(
        <div className={styles.mainMenu}>
            {menuItems.map((item, idx) =>
                <p className={styles.menuItem} key={idx} onPointerDown={item.onClick}>{item.name}</p>
            )}
        </div>
    )
}