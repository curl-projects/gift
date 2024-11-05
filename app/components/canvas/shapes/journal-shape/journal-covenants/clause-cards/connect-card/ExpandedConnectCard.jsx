// gift-frontend/app/components/canvas/shapes/journal-shape/journal-covenants/clause-cards/connect-card/ExpandedConnectCard.jsx
import { useEffect, useState, useCallback, useRef } from 'react';
import styles from './ExpandedConnectCard.module.css';
import { EditorContent, useEditor } from '@tiptap/react';
import { Node } from "@tiptap/core";
import { Heading } from '@tiptap/extension-heading';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import Link from "@tiptap/extension-link";
import Placeholder from '@tiptap/extension-placeholder';
import * as showdown from 'showdown';
import StarterKit from '@tiptap/starter-kit';
import { useCovenantContext } from "~/components/synchronization/CovenantContext";
import { useCardState } from "~/components/canvas/shapes/journal-shape/journal-covenants/CardStateContext.jsx";
import { CovenantMainClause } from "~/components/canvas/custom-ui/utilities/ConstellationLabelPainter.jsx";
import { motion } from "framer-motion";

const OneLiner = Node.create({
  name: "oneLiner",
  topNode: true,
  content: "block",
});

const mockArticles = [
    {
        title: "Idea 1",
        content: "This is the content of article 1",
    },
    {
        title: "Article 2",
        content: "This is the content of article 2",
    },
    {
        title: "Article 3",
        content: "This is the content of article 3",
    },
    {
        title: "Article 4",
        content: "This is the content of article 4",
    },
    {
        title: "Article 5",
        content: "This is the content of article 5",
    }
]


function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

export function ExpandedConnectCard({ covenant, titleScale = 0.6 }) {
  const [htmlContent, setHtmlContent] = useState("");
  const [selectionHtmlContent, setSelectionHtmlContent] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [positions, setPositions] = useState({});
  const [lines, setLines] = useState([]);
  const [isExiting, setIsExiting] = useState(false);
  const [showCentralStar, setShowCentralStar] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  const converter = new showdown.Converter();
  const searchContainerRef = useRef(null);
  const searchTextRef = useRef(null);
  const { covenantCompletion, setCovenantCompletion } = useCovenantContext();
  const { selectedText, connectedItem } = useCardState();

  const centralStar = {
    id: 'central',
    x: 50,    // Middle of the viewBox
    y: 40,    // Top 40% of the viewBox
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: true,
        paragraph: true
      }),
      Link,
      Placeholder.configure({
        placeholder: "Search for something you've written",
        showOnlyWhenEditable: false,
        emptyNodeClass: styles.isEmpty,
        emptyEditorClass: styles.empty,
      }),
    ],
    content: htmlContent,
    editable: true,
    onUpdate: ({ editor }) => {
      const textContent = editor.getText();
      debouncedSearch(textContent);
    },
    onSelectionUpdate: ({ editor }) => { }
  });

  const selectionEditor = useEditor({
    extensions: [
      OneLiner,
      Text,
      Paragraph,
      Heading,
      Link,
      Placeholder.configure({
        placeholder: "Selection Fragment",
        showOnlyWhenEditable: false,
        emptyNodeClass: styles.isEmpty,
        emptyEditorClass: styles.empty,
      }),
    ],
    content: selectionHtmlContent,
    editable: false,
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchText) => {
      if (!searchText.trim()) {
        // If the search term is empty, clear the search results
        setSearchResults([]);
        return;
      }

      const keywords = searchText.toLowerCase().split(' ');
      const results = mockArticles.filter(article =>
        keywords.some(keyword =>
          article.title.toLowerCase().includes(keyword) ||
          article.content.toLowerCase().includes(keyword)
        )
      );
      setSearchResults(results);
    }, 100),
    []
  );

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(htmlContent);
      editor.commands.focus();
    }
  }, [htmlContent, editor]);

  useEffect(() => {
    if (selectedText.value?.textContent) {
      setSelectionHtmlContent(converter.makeHtml(selectedText.value.textContent) || "");
    } else {
      setSelectionHtmlContent("");
    }
  }, [selectedText]);

  useEffect(() => {
    if (selectionEditor) {
      selectionEditor.commands.setContent(selectionHtmlContent);
    }
  }, [selectionHtmlContent, selectionEditor]);

  useEffect(() => {
    if (searchContainerRef.current && searchTextRef.current) {
      // Handle positions and lines when searchResults change
      if (searchResults.length > 0) {
        setShowCentralStar(true);

        // Update positions only if searchResults have changed
        setPositions(prevPositions => {
          const updatedPositions = { ...prevPositions };

          // Remove positions for articles no longer in searchResults
          Object.keys(updatedPositions).forEach(key => {
            if (!searchResults.some(article => article.title === key)) {
              delete updatedPositions[key];
            }
          });

          // Assign positions to new articles
          searchResults.forEach(article => {
            if (!updatedPositions[article.title]) {
              updatedPositions[article.title] = {
                id: article.title,
                x: Math.random() * 100, // Random position in SVG viewBox
                y: Math.random() * 100,
                article: article,
              };
            }
          });

          return updatedPositions;
        });
      } else {
        setPositions({});
        setLines([]);
        setShowCentralStar(false);
      }
    }
  }, [searchResults]);

  useEffect(() => {
    // When positions change, update lines
    const allStars = Object.values(positions);
    if (allStars.length > 0) {
      const path = generatePath([centralStar, ...allStars]);
      setLines(path);
    } else {
      setLines([]);
    }
  }, [positions]);

  const generatePath = (stars) => {
    // Use a simple nearest-neighbor algorithm for a reasonable path
    const unvisited = [...stars];
    const path = [];
    let current = unvisited.shift();
    path.push(current);

    while (unvisited.length > 0) {
      let nearest = unvisited.reduce((prev, curr) => {
        const prevDistance = distance(current, prev);
        const currDistance = distance(current, curr);
        return currDistance < prevDistance ? curr : prev;
      });
      current = nearest;
      unvisited.splice(unvisited.indexOf(nearest), 1);
      path.push(current);
    }

    // Convert path to lines
    const linesArray = [];
    for (let i = 0; i < path.length - 1; i++) {
      linesArray.push({
        id: i,
        x1: path[i].x,
        y1: path[i].y,
        x2: path[i + 1].x,
        y2: path[i + 1].y,
      });
    }
    return linesArray;
  };

  const distance = (a, b) => {
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  return (
    <div className={styles.expandedConnectCard}>
      <div className={styles.covenantTitle} style={{
        transform: `scale(${titleScale})`,
        transformOrigin: 'top left',
        width: `${100 / titleScale}%`,
      }}>
        <CovenantMainClause covenant={covenant} />
      </div>
      <div className={styles.selectionFragmentEditor}>
        <EditorContent
          editor={selectionEditor}
          className={styles.selectionText}
        />
      </div>
      <div className={styles.covenantEntrySearch} ref={searchContainerRef}>
        {connectedItem.value
          ? <div className={styles.attachedIdea}>{connectedItem.value.title}</div>
          : <>
            <div ref={searchTextRef} className={styles.editorContentWrapper}>
              <EditorContent
                editor={editor}
                className={styles.searchText}
              />
            </div>
            <svg viewBox="0 0 100 100" className={styles.starsSvg}>
              {/* Render central star */}
              {showCentralStar && (
                <circle
                  cx={centralStar.x}
                  cy={centralStar.y}
                  r={1.8}
                  className={styles.star}
                />
              )}

              {/* Render other stars with attached text */}
              {Object.values(positions).map((star) => (
                <g key={star.id}>
                  <circle
                    cx={star.x}
                    cy={star.y}
                    r={1.8}
                    className={`${styles.star} ${isExiting ? styles.starExit : ''}`}
                  />
                  <text
                    x={star.x + 2}
                    y={star.y - 2}
                    className={styles.starText}
                  >
                    {star.article.title}
                  </text>
                </g>
              ))}

              {/* Render the lines */}
              {lines.map((line) => (
                <line
                  key={line.id}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  className={`${styles.line} ${isExiting ? styles.lineExit : ''}`}
                />
              ))}
            </svg>
          </>
        }
      </div>
    </div>
  );
}