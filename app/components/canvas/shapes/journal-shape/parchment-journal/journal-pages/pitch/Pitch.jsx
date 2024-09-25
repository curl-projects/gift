import styles from './Pitch.module.css'
import journalStyles from "~/components/canvas/shapes/journal-shape/parchment-journal/ParchmentJournal.module.css"
import { InkBleed } from "~/components/canvas/custom-ui/post-processing-effects/InkBleed"
import { useStarFireSync } from "~/components/synchronization/StarFireSync"

const pitchText = [
    {type: 'heading', text: "Starlight"},
    {type: 'paragraph', text: "Starlight is a game set in the cosmos and built around social portfolios: spaces where you can understand your own creative process, learn from the ideas of others, and imprint your thoughts upon the stars."},
    {type: 'paragraph', text: "It is designed for those who wish to capture their thoughts in a humane way, collaborate on big ideas with others, and forge friendships with people online in a way that is impossible in traditional social networks."},
    {type: 'paragraph', text: "Armed with a journal and astrolabe, players chart through constellations of ideas woven together by both other players and historical figures. Each constellation has a unique covenant: a set of conditions for proving that you understand its ideas, left behind by its creator."},
    {type: 'paragraph', text: "Through fulfilling these covenants, players can transcribe the glyphs of their designers, allowing players to forge friendships with each other as they prove their understanding."},
    {type: 'paragraph', text: "As players venture further into the cosmos, they uncover lost skills in traversal, research and starweaving as they develop their own constellation alongside a community of others."},
    {type: 'paragraph', text: "Starlight constructs a protocol for social connection and ideation out of the core loop of a video game, one rooted in both understanding of the self and deep empathy for others. It is built around the principle that an understanding of the thoughts of another is a crucial foundation of meaningful connection."},
    {type: 'paragraph', text: "Starlight uses the uniquely expressive tools of games -- narrative, challenge, catharsis -- to create experiences of introspection, wonder and empathy: goals far beyond the scope of most software."},
]
export function Pitch(){
    const { setNarratorEvent } = useStarFireSync();
    return(
    <div 
    className={styles.pitchLayout}
    onWheelCapture={(e) => {
        e.stopPropagation();
    }}
    onPointerDown={(e) => {
        e.stopPropagation();
    }}
    onScrollCapture={(e) => {
        e.stopPropagation();
    }}
    >
        {pitchText.map((script, index) => (
                    {
                        'paragraph': <InkBleed
                                        divKey={`journal-paragraph-${index}`}
                                        key={index}
                                        initialBlur={4}
                                        finalBlur={0.7}
                                        delay={0}
                                        duration={2}>
                                        <p key={index} className={journalStyles.journalSmallText}>{script.text}</p>
                                      </InkBleed>,
                        'heading': <InkBleed
                                        divKey={`journal-heading-${index}`}
                                        key={index}
                                        initialBlur={4}
                                        finalBlur={0.7}
                                        delay={0}
                                        duration={2}>
                                        <h1 key={index} className={journalStyles.journalLargeText}>{script.text}</h1>
                                    </InkBleed>,
                    }[script.type]
        ))}
        <div className={journalStyles.learnMoreContainer}>
        <InkBleed
            divKey={`journal-learn-more`}
            initialBlur={4}
            finalBlur={0.3}
            delay={0}
            duration={2}>
            <h1 
                className={journalStyles.journalLinkText} 
                onClick={() => setNarratorEvent('elevator-pitch')}>
                Learn More
            </h1>
        </InkBleed>
        </div>
    </div>
    )
}