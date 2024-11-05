import { useState, useEffect, useRef } from 'react';
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
import { FaExpand } from "react-icons/fa";
import { getRandomLepchaCharacter } from '~/components/canvas/helpers/language-funcs';
import { createShapeId, GeoStylePickerSet } from 'tldraw';
import { journalRightOffset, journalLeftOffset } from '../JournalShapeUtil';
import { JournalCovenants } from '../journal-covenants/JournalCovenants';
import { useCovenantContext } from "~/components/synchronization/CovenantContext"

export function ModernJournal({ shape, contentRef, tldrawEditor }) {
  // DATA CONTEXT
  const { data } = useDataContext();
  const { journalMode, setJournalMode, journalZooms, setJournalZooms, focusOnComponent } = useStarFireSync();

  // TEXT EDITOR CONTEXT
  const converter = new showdown.Converter();
  const { annotationsExpanded, setAnnotationsExpanded, setSelectedText } = useCovenantContext()
  const [selectionPosition, setSelectionPosition] = useState({from: null, to: null})
  const [htmlContent, setHtmlContent] = useState("");
  const [scrollChange, setScrollChange] = useState(null)
  const journalCovenantsRef = useRef(null);

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

  
  // load data
  useEffect(() => {
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

      setSelectedText(fragment)

      const startCoords = editor.view.coordsAtPos(from);
      const endCoords = editor.view.coordsAtPos(to);

      if (nodes && nodes.length !== 0) {
        // set visible if not visible 
        setJournalMode({...journalMode, position: 'left'})
     
      }
      else if (nodes && nodes.length === 0) {
        const tempAnnotationId = createShapeId('temp-annotation')
        console.log("MAKING TEMP ANNOTATION INVISIBLE", tempAnnotationId)
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
        style={{
          width: journalMode.position === 'left' ? '150%' : '100%',
        }}

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
        

        <div 
          className={styles.journalContainer}
          style={{
            filter: (focusOnComponent.active && focusOnComponent.component !== 'journal') ? `opacity(${focusOnComponent.opacity})` : 'none'
          }}
          >
        <motion.div 
          className={styles.journalBackground}
          initial={{ opacity: 0}}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.5, ease: 'easeInOut' },
          }}  
          />
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
          <div
            className={styles.journalToolButton}
            style={{
            }}
            onPointerDown={() => {
              console.log("clicked")
              setAnnotationsExpanded(!annotationsExpanded)
            }}>
            <FaExpand />
          </div>
          <div
            className={styles.journalToolButton}
            onPointerDown={() => {
              console.log("clicked")
              setJournalZooms(!journalZooms)
            }}>
            Z
          </div>
        </div>
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
      </div>
      {journalMode.position === 'left' &&
          <JournalCovenants 
            shape={shape} 
            annotationsExpanded={annotationsExpanded}
            journalCovenantsRef={journalCovenantsRef}
            />
      }
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
          strokeWidth={2}
          pageContainer
        />
      </motion.svg>
    </>
  )
}