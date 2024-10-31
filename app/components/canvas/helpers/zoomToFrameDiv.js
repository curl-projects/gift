export function zoomToFrameDiv(divRef, editor){
    if(!divRef.current){
        console.log("DIV REF NOT FOUND")
        return
    }

    console.log("BOUNDING RECT:", divRef.current.getBoundingClientRect())

    const boundingRect = divRef.current.getBoundingClientRect()
    const pageCoords = editor.screenToPage({x: boundingRect.x, y: boundingRect.y})
    console.log("PAGE COORDS:", pageCoords)
    const bounds = {
        x: pageCoords.x,
        y: pageCoords.y,
        w: boundingRect.width,
        h: boundingRect.height
    }

    setTimeout(() => {
    editor.zoomToBounds(bounds, {
        animation: {
            duration: 300
        },
        // targetZoom: 4
        })
    }, 100)
}