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

function updateAnnotationPositions(tldrawEditor, editor, annotations, excerpt){
    // create annotations that don't exist
    console.log("UPDATING ANNOTATION POSITIONS")
    for(let annotation of annotations){
        const annotationShapeId = createShapeId(annotation.id)
            const startCoords = editor.view.coordsAtPos(annotation.fromPos);

            console.log("X:", excerpt.x + excerpt.props.w + 40)
            console.log("Y:", tldrawEditor.screenToPage({x: 0, y: startCoords.top}).y)
            
            tldrawEditor.updateShape({
                id: annotationShapeId,
                type: "annotation",
                x: excerpt.x + excerpt.props.w + 40,
                y: tldrawEditor.screenToPage({x: 0, y: startCoords.top}).y,
            })
    }
}

function updateTemporaryAnnotation(tldrawEditor, editor, fromPos, toPos, excerpt){
    const tempAnnotationId = createShapeId('temp-annotation')
    const startCoords = editor.view.coordsAtPos(fromPos);

    tldrawEditor.updateShape({
        id: tempAnnotationId,
        type: 'annotation',
        isLocked: false,
        opacity: 1,
        x: excerpt.x + excerpt.props.w + 40,
        y: tldrawEditor.screenToPage({x: 0, y: startCoords.top}).y,
        props: {
            from: fromPos,
            to: toPos,
        }
    })
}

export default function ExcerptMediaEditor({ excerpt, tldrawEditor, annotations, shapeRef, scrollChange }) {
  const converter = new showdown.Converter();
  const [htmlContent, setHtmlContent] = useState(converter.makeHtml(excerpt.props.media?.content || ""));
  const [annotationHighlights, setAnnotationHighlights] = useState([])
  const [selectionPosition, setSelectionPosition] = useState({from: null, to: null})

//   useEffect(() => {
//     console.log("HTML CONTENT:", htmlContent);
//   }, [htmlContent]);

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

        if(nodes && nodes.length !== 0){
            // set visible if not visible 
            const tempAnnotation = tldrawEditor.getShape({type: "annotation", id: tempAnnotationId})
            if(!tempAnnotation){
                // console.log("CREATING TEMP ANNOTATION")
                tldrawEditor.createShape({
                    id: tempAnnotationId,
                    // figrure out what x and y need to be
                    x: excerpt.x + excerpt.props.w + 40,
                    y: tldrawEditor.screenToPage({x: 0, y: startCoords.top}).y, // convert this to page space
                    type: 'annotation',
                    isLocked: false,
                    opacity: 1,
                    props: {
                        from: from,
                        to: to
                    }
                }).createBinding({ // the binding is only for the persistent selections
                    fromId: tempAnnotationId,
                    toId: excerpt.id,
                    type: "annotation" ,
                    props: {
                    }
                })
            }
            else{
                tldrawEditor.updateShape({
                    id: tempAnnotationId,
                    type: 'annotation',
                    isLocked: false,
                    opacity: 1,
                    x: excerpt.x + excerpt.props.w + 40,
                    y: tldrawEditor.screenToPage({x: 0, y: startCoords.top}).y,
                    props: {
                        from: from,
                        to: to,
                    }
                })
            }
            
        }
        else if(nodes && nodes.length === 0){
            tldrawEditor.updateShape({
                id: tempAnnotationId,
                type: 'annotation',
                isLocked: true,
                opacity: 0
            })
        }



        // get the canvas position from these screen coordinates
        
        // also get the canvas position of the right hand side of the media

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
  
  useEffect(()=>{
    console.log("UPDATING ANNOTATION SCROLL")
    updateAnnotationPositions(tldrawEditor, editor, annotations, excerpt)
    updateTemporaryAnnotation(tldrawEditor, editor, selectionPosition.from, selectionPosition.to, excerpt)
  }, [scrollChange])

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

  useEffect(()=>{
    // load all of the annotations
    console.log("ANNOTATIONS:", annotations)


    // create annotations that don't exist
    for(let annotation of annotations){
        const annotationShapeId = createShapeId(annotation.id)
        if(!tldrawEditor.getShape(annotationShapeId)){
            
            const startCoords = editor.view.coordsAtPos(annotation.fromPos);

            console.log("X:", excerpt.x + excerpt.props.w + 40)
            console.log("Y:", tldrawEditor.screenToPage({x: 0, y: startCoords.top}).y)
            
            console.log("CREATING ANNOTATION:", annotation)
            tldrawEditor.createShape({
                id: annotationShapeId,
                type: "annotation",
                x: excerpt.x + excerpt.props.w + 40,
                y: tldrawEditor.screenToPage({x: 0, y: startCoords.top}).y,
                props: {
                    from: annotation.fromPos,
                    to: annotation.toPos
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