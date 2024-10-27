import { useEffect } from "react";
import { useEditor, track } from "tldraw";
import { useStarFireSync } from "~/components/synchronization/StarFireSync";

const MediaArticlePainter = track(() => {
    const editor = useEditor();
    const selectedShapeIds = editor.getSelectedShapeIds();
    const { journalMode, setJournalMode } = useStarFireSync();

    useEffect(()=>{
            console.log("JOURNAL MODE:", journalMode)
    }, [journalMode])

    useEffect(()=>{
        console.log("SELECTED SHAPE IDS:", selectedShapeIds)
    }, [selectedShapeIds])


    useEffect(()=>{
        // deal with the case where the selected shape is an excerpt
        if(selectedShapeIds.length === 1){
            const shape = editor.getShape(selectedShapeIds[0]);
            if(shape.type === 'excerpt'){
                setJournalMode({ active: true, variant: 'modern', page: 'technical-foundations', content: shape.props.media?.content || "" })
            }
            else if(shape.type === 'annotation'){
                // do nothing
                // setJournalMode({ active: true, variant: 'modern', page: 'technical-foundations' })
            }
        }
        else{
            // close the journal
            setJournalMode({ active: false, variant: 'modern', page: 'technical-foundations' })
        }
    }, [selectedShapeIds])
    // open the journal with associated content whenever an excerpt is clicked

    return null;
})

export default MediaArticlePainter;