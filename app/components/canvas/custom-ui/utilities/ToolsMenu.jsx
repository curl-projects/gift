import styles from './ToolsMenu.module.css'
import { FaJournalWhills } from "react-icons/fa";
import { GiAstrolabe } from "react-icons/gi";
import { IoTelescope } from "react-icons/io5";

const items = [
    {
        id: 'left',
        tool: 'journal',
        icon: <FaJournalWhills />,
        active: true,
    },
    {
        id: 'middle',
        tool: "astrolabe",
        icon: <GiAstrolabe />,
        active: false,
    },
    {
        id: 'right',
        tool: 'telescope',
        icon: <IoTelescope />,
        active: false,
    }
]
export function ToolsMenu(){
    return(
        <div className={styles.toolsMenu} 
        // onPointerDown={(e) => e.stopPropagation()}
        >
            {items.map((item, index) => (
                <div key={item.id} className={`${styles.item} ${styles[item.id]}`} onPointerDown={(e) => console.log('hi!')}>
                    <div className={styles.itemInner}>
                        <p className={`${styles.icon} ${item.active ? styles.iconActive : ''}`}>{item.icon}</p>
                    </div>
                </div> 
            ))}
        </div>
    )
}