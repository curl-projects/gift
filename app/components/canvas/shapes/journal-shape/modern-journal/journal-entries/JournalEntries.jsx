import styles from './JournalEntries.module.css'
import { JournalEntry } from './JournalEntry'


const mockEntries = [
    {
        type: 'concept',
        title: "Immersive Storytelling",
        content: "Software, to be transformative, must manifest the emotive tools of game design."
        
    },
    {
        type: "article",
        title: "Game Design in Software v2",
        content: "...we must move beyond the current paradigm of software..."
    }
]
export function JournalEntries(){
    return <div className={styles.journalEntries}>
        {mockEntries.map((entry, index) => (
            <JournalEntry 
                key={index} 
                type={entry.type} 
                entry={entry} 
                />
        ))}
    </div>
};
