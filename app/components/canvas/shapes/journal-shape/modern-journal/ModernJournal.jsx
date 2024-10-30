import { useState, useEffect } from 'react';
import styles from './ModernJournal.module.css';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from "@tiptap/extension-link";
import * as showdown from 'showdown';
import { useDataContext } from '~/components/synchronization/DataContext';
import { JournalThread } from '~/components/canvas/shapes/journal-shape/parchment-journal/journal-thread/JournalThread.jsx'
import { motion, useAnimate } from 'framer-motion';
import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { BsArrowBarLeft } from "react-icons/bs";
import { getRandomLepchaCharacter } from '~/components/canvas/helpers/language-funcs';
import { createShapeId } from 'tldraw';
import { journalRightOffset, journalLeftOffset } from '../JournalShapeUtil';
import { JournalCovenants } from '../journal-covenants/JournalCovenants';

const pages = [
  {
    page: 'elevator-pitch',
    content: 'elevator-pitch'
  },
]



function updateTemporaryAnnotation(tldrawEditor, editor, fromPos, toPos, excerpt, glyphChange = false) {
  const tempAnnotationId = createShapeId('temp-annotation')
  const startCoords = editor.view.coordsAtPos(fromPos);

  if (fromPos && toPos) {

    tldrawEditor.deselect(tempAnnotationId)

    const tempAnnotation = tldrawEditor.getShape({ type: "annotation", id: tempAnnotationId })


    console.log("TEMP ANNOTATION:", tempAnnotation)

    if (tempAnnotation) {
      tldrawEditor.updateShape({
        id: tempAnnotationId,
        type: 'annotation',
        opacity: 1,
        x: excerpt.x + excerpt.props.w + 40,
        y: tldrawEditor.screenToPage({ x: 0, y: startCoords.top }).y,
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

export function ModernJournal({ shape, contentRef, tldrawEditor }) {
  // DATA CONTEXT
  const { data } = useDataContext();
  const { journalMode, setJournalMode } = useStarFireSync();

  // TEXT EDITOR CONTEXT
  const converter = new showdown.Converter();
  const [selectionPosition, setSelectionPosition] = useState({from: null, to: null})
  const [htmlContent, setHtmlContent] = useState("");
  const [scrollChange, setScrollChange] = useState(null)

  // ANIMATION CONTEXT
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [scope, animate] = useAnimate();

  useEffect(()=>{
    setIsInitialLoad(false);
  }, [])

  useEffect(() => {
    if (isInitialLoad) return;
    const offsetX = journalMode.position === 'left' ? window.innerWidth * (journalRightOffset - journalLeftOffset) : -window.innerWidth * (journalRightOffset - journalLeftOffset);
    const animationDuration = 0.2;
    // animate the editor
    animate(contentRef.current, { x: offsetX }, { duration: 0, ease: 'easeInOut' }).then(() => {
      animate(contentRef.current, { x: 0 }, { duration: animationDuration, ease: 'easeInOut' })
    })

    // animate the intro line
    animate(scope.current, { x: offsetX }, { duration: 0, ease: 'easeInOut' }).then(() => {
      animate(scope.current, { x: 0 }, { duration: animationDuration, ease: 'easeInOut' })
    })
  }, [journalMode.position, animate]);

  // ANNOTATION POSITIONS:
  // useEffect(() => {
  //   const handleResize = () => {
  //       // update annotation positions on resize
  //       // updateAnnotationPositions(tldrawEditor, editor, annotations, excerpt)
  //       updateTemporaryAnnotation(tldrawEditor, editor, selectionPosition.from, selectionPosition.to, shape)

  //   };

  //   const resizeObserver = new ResizeObserver(handleResize);
  //   if (contentRef?.current) {
  //     resizeObserver.observe(contentRef.current);
  //   }

  //   return () => {
  //     if (contentRef?.current) {
  //       resizeObserver.unobserve(contentRef.current);
  //     }
  //     resizeObserver.disconnect();
  //   };
  // }, [contentRef.current, tldrawEditor, shape]);
  
  // UPDATE POSITIONS ON SCROLL
  useEffect(()=>{
    console.log("UPDATING ANNOTATION SCROLL")
    // updateAnnotationPositions(tldrawEditor, editor, annotations, excerpt)
    updateTemporaryAnnotation(tldrawEditor, editor, selectionPosition.from, selectionPosition.to, shape)
  }, [scrollChange])


  // load data
  useEffect(() => {
    console.log("DATA:", data.journalEntries)
    const content = journalMode.content || "";
    // const page = data.journalEntries.filter(entry => entry.type === 'journalPage').find(page => page.url === journalMode.page)
    if (content) {
      setHtmlContent(converter.makeHtml(content) || "")
    }
    else {
      setHtmlContent("")
    }
  }, [data, journalMode])

  // configure editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: true,
        paragraph: true
      }),
      // ColorHighlighter.configure({
      //   data: ['Hello'],
      //   tldrawEditor: tldrawEditor,
      // }),
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
      setSelectionPosition({ from: from, to: to })

      const tempAnnotationId = createShapeId('temp-annotation')

      const fragment = editor.state.doc.cut(from, to);
      const nodes = [];
      fragment.forEach(node => {
        nodes.push(node.toJSON());
      });


      const startCoords = editor.view.coordsAtPos(from);
      const endCoords = editor.view.coordsAtPos(to);

      if (nodes && nodes.length !== 0) {
        // set visible if not visible 
        setJournalMode({...journalMode, position: 'left'})
        const tempAnnotation = tldrawEditor.getShape({ type: "annotation", id: tempAnnotationId })
        if (!tempAnnotation) {
          console.log("CREATING TEMP ANNOTATION")
          tldrawEditor.createShape({
            id: tempAnnotationId,
            // figrure out what x and y need to be
            x: shape.x + shape.props.w + 40,
            y: tldrawEditor.screenToPage({ x: 0, y: startCoords.top }).y, // convert this to page space
            // currently only working with glyph annotations

            type: 'annotation',
            isLocked: false,
            opacity: 1,
            props: {
              w: 56,
              h: 56,
              annotationType: "comment",
              from: from,
              to: to,
              temporary: true,
              selected: true,
              glyph: getRandomLepchaCharacter(),

            }
          }).createBinding({ // the binding is only for the persistent selections
            fromId: tempAnnotationId,
            toId: shape.id,
            type: "annotation",
            props: {
            }
          })

          // debouncedTriggerZoom();

        }
        else {
          console.log("UPDATING TEMP ANNOTATION")
          updateTemporaryAnnotation(tldrawEditor, editor, from, to, shape)
          // debouncedTriggerZoom();

        }

      }
      else if (nodes && nodes.length === 0) {
        const tempAnnotationId = createShapeId('temp-annotation')
        console.log("MAKING TEMP ANNOTATION INVISIBLE", tempAnnotationId)
        setJournalMode({...journalMode, position: 'right'})
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
  })

  // update editor content
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(htmlContent);
    }
  }, [htmlContent, editor]);

  return (
    <>
      <motion.div className={styles.shapeContent}
        ref={contentRef}
        initial={{ opacity: 0}}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          opacity: { duration: 0.5, ease: 'easeInOut' },
        }}

        // initial={{ opacity: 0, x: 0 }}
        // animate={{
        //   opacity: 1,
        //   x: journalMode.position === 'left' ? '-20vw' : '0vw',
        // }}
        // transition={{ duration: 0.5 }} // Adjust duration as needed
        // exit={{
        //   opacity: 0,
        // }}


        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onScrollCapture={(e) => {
          setScrollChange(e.target.scrollTop)
          e.stopPropagation()
        }}
        onWheelCapture={(e) => {
          e.stopPropagation();
        }}
      >
        <div className={styles.journalTools}>
          <div
            className={styles.journalToolButton}
            style={{
              transform: journalMode.position === 'left' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            onPointerDown={() => {
              console.log("clicked")
              setJournalMode({
                ...journalMode,
                position: journalMode.position === 'left' ? 'right' : 'left',
              })
            }}>
            <BsArrowBarLeft />
          </div>
        </div>
        {journalMode.position === 'left' &&
          <JournalCovenants shape={shape} />
        }
        <div style={{
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          overflowY: 'scroll',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }}>
          <EditorContent
            editor={editor}
            className="journal-tiptap"
          />
        </div>
      </motion.div>

      <motion.svg 
        className={styles.animatedLine} 
        viewBox={`0 0 ${shape.props.w} ${shape.props.h}`}
        ref={scope}
        >
        <JournalThread
          d={`M -5 -5 L ${shape.props.w + 5} -5 L ${shape.props.w + 5} ${shape.props.h + 5} L -5 ${shape.props.h + 5} Z`}
          delay={0}
          duration={1}
          strokeWidth={1}
          pageContainer
        />
      </motion.svg>
    </>
  )
}