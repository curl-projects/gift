import styles from './Pitch.module.css'
import journalStyles from "~/components/canvas/shapes/journal-shape/parchment-journal/ParchmentJournal.module.css"
import { InkBleed } from "~/components/canvas/custom-ui/post-processing-effects/InkBleed"
import { useStarFireSync } from "~/components/synchronization/StarFireSync"
import { motion } from "framer-motion"

// Extracted animation variants
const ringVariants = {
    hidden: { scale: 0, x: "-50%", y: "-50%" },
    visible: (delay = 0) => ({
        scale: 1,
        x: "-50%", 
        y: "-50%",
        transition: { duration: 0.5, ease: "easeOut", delay }
    })
};

const dashedRingVariants = {
    hidden: { scale: 0, rotate: 0, x: "-50%", y: "-50%" },
    visible: (delay = 0) => ({
        scale: 1.5, // Larger than the largest outer ring
        rotate: 360,
        x: "-50%",
        y: "-50%",
        transition: { duration: 1, ease: "easeOut", delay }
    }),
    rotate: {
        rotate: [0, 360],
        transition: { repeat: Infinity, duration: 10, ease: "linear" }
    },
    exit: {
        scale: 0,
        x: "-50%",
        y: "-50%",
        transition: { duration: 0.3, ease: "easeIn" }
    }
};

const orbitingRingVariants = {
    hidden: { scale: 0, rotate: 0, x: "-50%", y: "-50%" },
    visible: (custom) => ({
        scale: 1, // Larger than the largest outer ring
        rotate: 360,
        x: "-50%",
        y: "-50%",
        transition: { duration: 1, ease: "easeOut", delay: custom.delay }
    }),
    rotate: {
        rotate: [0, 360],
        transition: { repeat: Infinity, duration: 40, ease: "linear" }
    },
    exit: {
        scale: 0,
        rotate: 0,
        x: "-50%",
        y: "-50%",
        transition: { duration: 0.2, ease: "easeIn" }
    }
};

const moonVariants = {
    hidden: { scale: 0 },
    visible: {
        scale: 1,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

// Define animation variants for the moon's orbit
const moonOrbitVariants = {
    rotate: {
        rotate: [0, 360],
        transition: { repeat: Infinity, duration: 10, ease: "linear" }
    },
    animate: {
        x: "-50%",
        y: "-50%",
    }
};

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

    const randomDelay = 0.2

    return(
        <div 
            className={styles.pitchLayout}
            onWheelCapture={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onScrollCapture={(e) => e.stopPropagation()}
        >
            <div className={styles.outerCircleContainer}>
                <div className={styles.circleContainer}>
                    <motion.div
                        className={`${styles.extremeOuterRing} nameCircle`}
                        initial="hidden"
                        animate="visible"
                        custom={randomDelay + 1.5} // Delay for outermost ring
                        variants={ringVariants}
                    />
                     <motion.div
                        className={`${styles.moonOrbit} nameCircle`}
                        variants={moonOrbitVariants}
                        animate={["animate", "rotate"]}
                    >
                        <motion.div
                            className={styles.moon}
                            initial="hidden"
                            animate="visible"
                            variants={moonVariants}
                        />
                    </motion.div>
                    <motion.div
                        className={`${styles.mostOuterRing} nameCircle`}
                        initial="hidden"
                        animate="visible"
                        custom={randomDelay + 1.25} // Delay for outer ring
                        variants={ringVariants}
                    />
                    <motion.div
                        className={`${styles.outerRing} nameCircle`}
                        initial="hidden"
                        animate="visible"
                        custom={randomDelay + 1.0} // Delay for outer ring
                        variants={ringVariants}
                    />
                    <motion.div
                        className={`${styles.innerRing} nameCircle`}
                        initial="hidden"
                        animate="visible"
                        custom={randomDelay + 0.75} // Delay for inner ring
                        variants={ringVariants}
                    />
                    <motion.div
                        className={`${styles.glow} nameCircle`}
                        initial="hidden"
                        animate="visible"
                        custom={randomDelay + 0.5} // Delay for glow
                        variants={ringVariants}
                    />
                    <motion.div
                        className={`${styles.innerGlow} nameCircle`}
                        initial="hidden"
                        animate="visible"
                        custom={randomDelay + 0.25} // Delay for inner glow
                        variants={ringVariants}
                    />
                    <motion.div
                        className={`${styles.circle} nameCircle`}
                        initial="hidden"
                        animate="visible"
                        custom={randomDelay} // No delay for circle
                        variants={ringVariants}
                    />
                    <motion.div
                        initial="hidden"
                        className={`${styles.ripple} ripple`}
                        variants={ringVariants}
                        transition={{ delay: 0 }}
                    />
                    
                    {/* Add the orbiting moon */}
                   
                </div>
            </div>
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
                        onPointerDown={() => {
                            console.log('clicking')
                            setNarratorEvent('elevator-pitch')
                            }}>
                        Learn More
                    </h1>
                </InkBleed>
            </div>
        </div>
    )
}