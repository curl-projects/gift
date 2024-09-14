import styles from "./ConstellationLabel.module.css"
import { transliterateToLepcha } from "../../helpers/language-funcs"
import { useStarFireSync } from "~/components/synchronization/StarFireSync"
import { createShapeId, useEditor } from "tldraw"
import { useConstellationMode } from "../utilities/ConstellationModeContext"

export function ConstellationLabel({ name }){
    const { triggerWarp, setTriggerWarp } = useStarFireSync()
    const { overlayMode, setOverlayMode } = useConstellationMode()
    const editor = useEditor()

    return(
        <div className={styles.labelWrapper}>
            <p className={styles.constellationName}>
                <span className={styles.constellationGlyph}>
                    [{transliterateToLepcha(name.split(' ').map(word => word[0]).join(''))}]
                </span>
            </p>
            <div className={styles.metadataRow}>
                <div className={styles.constellationMetadataWrapper}>
                    <p className={styles.constellationMetadataLabel}>Discoverer</p>
                    <p className={styles.constellationMetadataValue}>{name}</p>
                </div>
                <div className={styles.constellationMetadataWrapper}>
                    <p className={styles.constellationMetadataLabel}>Exploration Status</p>
                    <p className={styles.constellationMetadataValue}>3 Remaining</p>
                    <button 
                        onPointerUp={() => {
                            document.body.style.pointerEvents = 'auto';
                            document.body.style.overflow = 'unset';
                            console.log("GIVING CONTROL BACK")
                        }}
                        style={{
                            border: '2px solid green',
                            height: "40px",
                            width: '200px',
                            background: 'green',
                            color: "white",
                        }}
                    >
                        Give Control to Campfire
                    </button>
                    <button 
                        onPointerUp={() => {
                            setTriggerWarp(prev => ({...prev, active: true, accDuration: 1000, deaccDuration: 1000, constAccDuration: 1000}))
                        }}
                        style={{
                            border: '2px solid green',
                            height: "40px",
                            width: '200px',
                            background: 'blue',
                            color: "white",
                        }}
                    >
                        Move to next constellation
                    </button>
                    <button 
                        onPointerUp={() => {
                            const journal = editor.getShape({type: 'journal', id: createShapeId('journal')})


                            // animate the position of the central constellation
                            // this.editor.updateShape({})

                            if(journal && journal.props.expanded){
                                editor.updateShape({
                                    type: "journal",
                                    id: createShapeId('journal'),
                                    props: {
                                        expanded: false,
                                    }
                                })
                            }
                            else if(journal && !journal.props.expanded){
                                editor.updateShape({
                                    type: "journal",
                                    id: createShapeId('journal'),
                                    props: {
                                        expanded: true,
                                    }
                                })
                            }
                            else{
                                const margin = window.innerHeight * 0.1;
                            
                                const { x, y } = editor.screenToPage({x: window.innerWidth * 0.6 - margin, y: margin})

                                editor.createShape({
                                    type: "journal",
                                    id: createShapeId('journal'),
                                    x: x,
                                    y: y,
                                    props: {
                                        expanded: true,
                                    }
                                })
                            }

                        
                        }}
                        style={{
                            border: '2px solid green',
                            height: "40px",
                            width: '200px',
                            background: 'blue',
                            color: "white",
                        }}
                    >
                        Toggle Journal
                    </button>
                </div>
            </div>
        </div>
    )
}