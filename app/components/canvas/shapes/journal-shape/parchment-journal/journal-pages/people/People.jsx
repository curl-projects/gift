import styles from './People.module.css'
import { useStarFireSync } from '~/components/synchronization/StarFireSync'

const peopleList = [
    {
        name: "A Complete Stranger",
        userId: "stranger",
    },
    {
        name: "Shakespeare",
        userId: "shakespeare",
    },
    {
        name: "That Coworker That You Hung Out With That One Time",
        userId: "coworker",
    },
    {
        name: "David Attenborough",
        userId: "attenborough",
    },
    {
        name: "Yourself",
        userId: "yourself",
    }
]

export function People(){
    const { setTriggerWarp, setConstellationLabel } = useStarFireSync();

    return(
        <div className={styles.peopleLayout}>
            {peopleList.map((person, index) => (
                <div key={index} className={styles.person}>
                    <p className={styles.personName} onClick={() => {
                        setTriggerWarp({active: true, accDuration: 1000, deaccDuration: 1000, constAccDuration: 1000}).then(() => {
                            setConstellationLabel({ visible: true, immediate: false, duration: 2, delay: 0, text: person.name })
                        })
                    }}>{person.name}</p>
                </div>
            ))}
        </div>
    )
}