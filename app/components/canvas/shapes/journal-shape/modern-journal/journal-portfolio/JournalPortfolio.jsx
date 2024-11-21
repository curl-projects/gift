import styles from './JournalPortfolio.module.css'
import { useState, useEffect } from 'react'
import { useStarFireSync } from '~/components/synchronization/StarFireSync'
import { useDataContext } from '~/components/synchronization/DataContext'
import { ConceptStar } from '~/components/canvas/shapes/concept-shape/ConceptStar';
import { FaJournalWhills } from "react-icons/fa";

export function JournalPortfolio(){
    const { userData, userDataLoading } = useDataContext()
    // view and edit all articles
    // view and edit all concepts

    // edit page for each concept and Article

    useEffect(() => {
        console.log("USER DATA:", userData)
    }, [userData])

    return (
        <div className={styles.journalPortfolio}>
            {(userDataLoading || !userData) &&
                <div>Loading or unavailable</div>
            }
            {userData &&
                <>
                    <div className={styles.journalPortfolioSection}>
                        <p className={styles.journalPortfolioSectionTitle}>Concepts</p>
                        <div className={styles.journalPortfolioSectionContents}>
                        {userData?.user?.concepts?.map((concept, index) => (
                            <ConceptCard key={index} concept={concept} />
                        ))}
                        </div>
                    </div>
                    <div className={styles.journalPortfolioSection}>
                        <p className={styles.journalPortfolioSectionTitle}>Articles</p>
                        <div className={styles.journalPortfolioSectionContents}>
                        {userData?.journalEntries?.map((article, index) => (
                            <ArticleCard key={index} article={article} />
                        ))}
                        </div>
                    </div>
                </>
            }
        </div>
    )
}

export function ConceptCard({ concept }){
    const [pulseTrigger, setPulseTrigger] = useState(0)
    return(
        <div className={styles.conceptCard}>
            <ConceptStar 
                selected={false}
                pulseTrigger={pulseTrigger}
                onClick={() => setPulseTrigger(pulseTrigger + 1)}
                scale={1}
                animationDelay={0}
                collapsed={false}
            />
            <div className={styles.conceptCardTitle}>{concept.title}</div>
        </div>
    )
}

export function ArticleCard({ article }){
    return(
        <div className={styles.articleCard}>
            <div className={styles.articleCardIcon}>
                <FaJournalWhills />
            </div>
            <div className={styles.articleCardTitle}>{article.title}</div>
        </div>
    )
}
