import styles from './People.module.css'
import { useStarFireSync } from '~/components/synchronization/StarFireSync'
import { useNavigate } from '@remix-run/react';

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
    const navigate = useNavigate(); // Add this line to use the navigate function

    return(
        <div className={styles.peopleLayout}>
            {peopleList.map((person, index) => (
                <div key={index} className={styles.person}>
                    <p className={styles.personName} onClick={() => {
                        // this causes an issue where remix won't update the history internally, but there's no workaround 
                        navigate(`/pitch-deck/${person.userId}`, { replace: true });
                        // window.history.replaceState(null, null, `/pitch-deck/${person.userId}`);
                        setTriggerWarp({active: true, accDuration: 1000, deaccDuration: 1000, constAccDuration: 1000}).then(() => {
                            setConstellationLabel({ visible: true, immediate: false, duration: 2, delay: 0, text: person.name })
                        })
                    }}>{person.name}</p>
                </div>
            ))}
        </div>
    )
}