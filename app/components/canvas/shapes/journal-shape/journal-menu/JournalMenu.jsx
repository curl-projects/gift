import styles from "./JournalMenu.module.css"
import { InkBleed } from "~/components/canvas/custom-ui/post-processing-effects/InkBleed"

export function JournalMenu({ page, setPage }){

    const menuItems = [
        {
            name: "Pitch",
            state: 'pitch'
        },
        {
            name: "Cover",
            state: 'cover'
        },

    ]
    return(
        <div className={styles.journalMenu}>
            {menuItems.map((item, index) => (
                    <InkBleed key={index} initialBlur={4} delay={0.5 * index} duration={2} finalBlur={0.5}>
                        <div  className={styles.menuItem} onClick={() => {
                            console.log("Menu Item Clicked")
                            setPage(item.state)}}>
                            <p className={styles.menuItemText}>{item.name}</p>
                        </div>
                    </InkBleed>
            ))}
        </div>
    )
}