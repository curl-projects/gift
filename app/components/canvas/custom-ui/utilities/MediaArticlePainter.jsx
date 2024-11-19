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
        if(selectedShapeIds.length !== 1){
            // close the journal
            setJournalMode({ active: false, variant: 'modern', position: 'right' })
        }
    }, [selectedShapeIds])


    useEffect(()=>{
        if(journalMode.active){
            // configure opacity logic
        }
    }, [journalMode])

    return null;
})

export default MediaArticlePainter;