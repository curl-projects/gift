import React, { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from "@tiptap/extension-link";
import * as showdown from 'showdown';
import { Heading } from '@tiptap/extension-heading';
import { Paragraph } from '@tiptap/extension-paragraph';
import { createShapeId } from 'tldraw';
import { ColorHighlighter } from "~/components/canvas/custom-ui/text-editor/HighlightExtension"
import { findHighlightPositions } from "~/components/canvas/helpers/media-funcs"
import { getRandomLepchaCharacter } from '~/components/canvas/helpers/language-funcs';
 
function updateAnnotationPositions(tldrawEditor, editor, annotations, excerpt){
    // create annotations that don't exist
    for(let annotation of annotations){
        const annotationShapeId = createShapeId(annotation.id)
            const startCoords = editor.view.coordsAtPos(annotation.fromPos);
            
            tldrawEditor.updateShape({
                id: annotationShapeId,
                type: "annotation",
                x: excerpt.x + excerpt.props.w + 40,
                y: tldrawEditor.screenToPage({x: 0, y: startCoords.top}).y,
            })
    }
}

function updateTemporaryAnnotation(tldrawEditor, editor, fromPos, toPos, excerpt, glyphChange = false){
    const tempAnnotationId = createShapeId('temp-annotation')
    const startCoords = editor.view.coordsAtPos(fromPos);

    console.log("UPDATING TEMPORARY ANNOTATION")

    if(fromPos && toPos){
        
      tldrawEditor.deselect(tempAnnotationId)

      const tempAnnotation = tldrawEditor.getShape({type: "annotation", id: tempAnnotationId})

        
        console.log("TEMP ANNOTATION:", tempAnnotation)
        
        if(tempAnnotation){
          tldrawEditor.updateShape({
            id: tempAnnotationId,
            type: 'annotation',
            opacity: 1,
            x: excerpt.x + excerpt.props.w + 40,
            y: tldrawEditor.screenToPage({x: 0, y: startCoords.top}).y,
            props: {
                from: fromPos,
                to: toPos,
                selected: true,
                glyph: glyphChange ? getRandomLepchaCharacter() : tempAnnotation.props.glyph, // 
              }
          })
        }
     
    }
}

export default function ExcerptMediaEditor({ excerpt, tldrawEditor, annotations, shapeRef, scrollChange }) {
  const converter = new showdown.Converter();
  const [htmlContent, setHtmlContent] = useState(converter.makeHtml(excerpt.props.media?.content || ""));
  const [annotationHighlights, setAnnotationHighlights] = useState([])
  const [selectionPosition, setSelectionPosition] = useState({from: null, to: null})

//   useEffect(() => {
//     console.log("HTML CONTENT:", htmlContent);
//   }, [htmlContent]);

let debounceTimeout;

function debounce(func, wait) {
    return function(...args) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// const triggerZoom = () => {
//     // trigger the zoom after we stop receiving selection updates
//     const tempAnnotation = tldrawEditor.getShape('temp-annotation')

//     if(tempAnnotation){
//         const mediaBounds = tldrawEditor.getShapePageBounds(excerpt);
//         const annotationBounds = tldrawEditor.getShapePageBounds(tempAnnotation);
        
//         const combinedBounds = {
//             x: Math.min(mediaBounds.x, annotationBounds.x),
//             y: Math.min(mediaBounds.y, annotationBounds.y),
//             w: Math.max(annotationBounds.x + annotationBounds.w, mediaBounds.x + mediaBounds.w) - Math.min(annotationBounds.x, mediaBounds.x),
//             h: Math.max(mediaBounds.h, annotationBounds.h) / 2,
//         };
    
//         tldrawEditor.zoomToBounds(combinedBounds, {
//             animation: {
//                 duration: 300
//             },
//             targetZoom: 4,
//         });
//     }
// };

// const debouncedTriggerZoom = debounce(triggerZoom, 150);


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: true,
        paragraph: true
      }),
      ColorHighlighter.configure({
        data: ['Hello'],
        tldrawEditor: tldrawEditor,
      }),
    //   CustomHeading,
    //   CustomParagraph,
      Link,
    ],
    content: htmlContent,
    onUpdate: ({ editor }) => {
      setHtmlContent(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
        const { from, to } = editor.state.selection;
        setSelectionPosition({from: from, to: to})
        // console.log("FROM:", from)
        // console.log("TO:", to)
    
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
       

        const tempAnnotationId = createShapeId('temp-annotation')
        
        const fragment = editor.state.doc.cut(from, to);
        const nodes = [];
        fragment.forEach(node => {
          nodes.push(node.toJSON());
        });


        const startCoords = editor.view.coordsAtPos(from);
        const endCoords = editor.view.coordsAtPos(to);

        // console.log("START COORDS", startCoords)
        // console.log("START COORDS CANVAS", tldrawEditor.screenToPage({x: 0, y: startCoords.top}))
        // console.log("END COORDS", endCoords)
        // console.log("RECT", rect);

        console.log("NODES:", nodes)

        if(nodes && nodes.length !== 0){
            

            // set visible if not visible 
            const tempAnnotation = tldrawEditor.getShape({type: "annotation", id: tempAnnotationId})
            if(!tempAnnotation){
                console.log("CREATING TEMP ANNOTATION")
                tldrawEditor.createShape({
                    id: tempAnnotationId,
                    // figrure out what x and y need to be
                    x: excerpt.x + excerpt.props.w + 40,
                    y: tldrawEditor.screenToPage({x: 0, y: startCoords.top}).y, // convert this to page space
                    // currently only working with glyph annotations


                    type: 'annotation',
                    isLocked: false,
                    opacity: 1,
                    props: {
                        w: 56,
                        h: 56,
                        annotationType: "glyph",
                        from: from,
                        to: to,
                        temporary: true,
                        selected: true,
                        glyph: getRandomLepchaCharacter(),

                    }
                }).createBinding({ // the binding is only for the persistent selections
                    fromId: tempAnnotationId,
                    toId: excerpt.id,
                    type: "annotation" ,
                    props: {
                    }
                })
                
                // debouncedTriggerZoom();

            }
            else{
              console.log("UPDATING TEMP ANNOTATION")
                updateTemporaryAnnotation(tldrawEditor, editor, from, to, excerpt)
                // debouncedTriggerZoom();

            }
            
        }
        else if(nodes && nodes.length === 0){
            const tempAnnotationId = createShapeId('temp-annotation')
            console.log("MAKING TEMP ANNOTATION INVISIBLE", tempAnnotationId)
            tldrawEditor.updateShape({
                id: tempAnnotationId,
                type: 'annotation',
                opacity: 0,
                props: {
                    selected: false
                }
            })

            // the shape doesn't automatically deselect normally
            tldrawEditor.deselect(tempAnnotationId)
        }
    }
  });

  useEffect(() => {
    const handleResize = () => {
        // update annotation positions on resize
        updateAnnotationPositions(tldrawEditor, editor, annotations, excerpt)
        updateTemporaryAnnotation(tldrawEditor, editor, selectionPosition.from, selectionPosition.to, excerpt)

    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (shapeRef?.current) {
      resizeObserver.observe(shapeRef.current);
    }

    return () => {
      if (shapeRef?.current) {
        resizeObserver.unobserve(shapeRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [shapeRef.current, tldrawEditor, excerpt]);
  
  // UPDATE POSITIONS ON SCROLL
  useEffect(()=>{
    console.log("UPDATING ANNOTATION SCROLL")
    updateAnnotationPositions(tldrawEditor, editor, annotations, excerpt)
    updateTemporaryAnnotation(tldrawEditor, editor, selectionPosition.from, selectionPosition.to, excerpt)
  }, [scrollChange])

  // ADD HIGHLIGHTS FOR ANNOTATIONS
  useEffect(()=>{
    const intHighlightPositions = findHighlightPositions(editor.state.doc, [excerpt.props.content, 'It is timeful'], "rgb(130, 162, 223)");

    const highlightPositions = intHighlightPositions.map(highlight => ({...highlight, color: "rgb(130, 162, 223)", shapeId: excerpt.id}))
    console.log("HIGHLIGHT POSITIONS:", highlightPositions)
    editor.commands.updateData({
        highlights: highlightPositions,
    })

    setTimeout(() => {
        const firstHighlight = document.querySelector('.concept-highlight');
        console.log("FIRST HIGHLIGHT:", firstHighlight)
        if (firstHighlight) {
          firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
  

  }, [editor, excerpt.props.content. annotationHighlights])

  // LOAD ANNOTATIONS
  useEffect(()=>{
    // load all of the annotations
    console.log("ANNOTATIONS:", annotations)


    // create annotations that don't exist
    for(let annotation of annotations){
        const annotationShapeId = createShapeId(annotation.id)
        if(!tldrawEditor.getShape(annotationShapeId)){
            
            const startCoords = editor.view.coordsAtPos(annotation.fromPos);

            console.log("X:", annotation.annotationType)
            // console.log("Y:", tldrawEditor.screenToPage({x: 0, y: startCoords.top}).y)
            
            console.log("CREATING ANNOTATION:", annotation)
            tldrawEditor.createShape({
                id: annotationShapeId,
                type: 'annotation',
            
                x: excerpt.x + excerpt.props.w + 40,
                y: tldrawEditor.screenToPage({x: 0, y: startCoords.top}).y,
                props: {
                    w: annotation.annotationType === "glyph" ? 56 : 200,
                    h: annotation.annotationType === "glyph" ? 56 : 56,
                    annotationType: annotation.annotationType,
                    from: annotation.fromPos,
                    to: annotation.toPos,
                    glyph: annotation.glyph || ""
                }
            }).createBinding({
                fromId: annotationShapeId,
                toId: excerpt.id,
                type: "annotation",
                props: {

                }
            })
        }

        // add annotations to the set of highlights
        const existingHighlights = editor.storage.colorHighlighter.highlights || [];
        const combinedHighlights = [...existingHighlights, ...annotations.map(annotation => ({from: annotation.fromPos, to: annotation.toPos, color: 'rgb(255, 192, 203)', shapeId: createShapeId(annotation.id)}))];
        editor.commands.updateData({
            highlights: combinedHighlights,
        })
    }

    const annotationShapeIds = tldrawEditor.getCurrentPageShapes().filter(shape => shape.type === 'annotation').map(shape => shape.id)

    console.log("ANNOTATION SHAPE IDS:", annotationShapeIds)

    // delete annotations that shouldn't exist
    for(let shapeId of annotationShapeIds){
        console.log("SHAPE ID:", shapeId)
        console.log("ANNOTATIONS MUTATED:", annotations.map(annotation => createShapeId(annotation.id)))
        if(!annotations.map(annotation => createShapeId(annotation.id)).includes(shapeId)){
            console.log("DELETING ANNOTATION")
            tldrawEditor.deleteShape(shapeId);
        }
    }
  }, [annotations])


  useEffect(() => {
    if (editor) {
      editor.commands.setContent(htmlContent);
    }
  }, [htmlContent, editor]);

  return (
    <div style={{
        width: "100%",
        height: "100%",
    }}
    onScrollCapture={(e) => {
        console.log("SCROLL CAPTURE INNER")
        // e.stopPropagation();
    }}
    onScroll={(e) => {
        console.log("SCROLL CAPTURE INNERf")
        // e.stopPropagation();
    }}
    >
      <EditorContent 
        editor={editor}
      />
    </div>
  );
}