import { useEffect, useState, useCallback, useRef } from 'react';
import styles from './ExpandedConnectCard.module.css'
import { EditorContent, useEditor } from '@tiptap/react';
import { Node } from "@tiptap/core";
import { Heading } from '@tiptap/extension-heading';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import Link from "@tiptap/extension-link";
import Placeholder from '@tiptap/extension-placeholder'
import * as showdown from 'showdown';
import { englishToLepchaMap } from "~/components/canvas/helpers/language-funcs.js"

import { CovenantMainClause } from "~/components/canvas/custom-ui/utilities/ConstellationLabelPainter.jsx"

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
    }
]

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

export function ExpandedConnectCard({ covenant, selectionFragment, currentCount = 0, titleScale = 0.6 }) {
    const [htmlContent, setHtmlContent] = useState("");
    const [selectionHtmlContent, setSelectionHtmlContent] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [itemPositions, setItemPositions] = useState([]);
    const converter = new showdown.Converter();
    const searchContainerRef = useRef(null);
    const searchTextRef = useRef(null);

    const editor = useEditor({
        extensions: [
            OneLiner,
            Text,
            Paragraph,
            Heading,
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
            const content = editor.getHTML();
            debouncedSearch(textContent);
            setHtmlContent(content);
        },
        onSelectionUpdate: ({ editor }) => {
        }
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
            console.log("SEARCH TEXT", searchText);
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
        if (selectionFragment && selectionFragment.textContent) {
            setSelectionHtmlContent(converter.makeHtml(selectionFragment.textContent) || "");
        } else {
            setSelectionHtmlContent("");
        }
    }, [selectionFragment]);

    useEffect(()=>{
        console.log("SEARCH RESULTS", searchResults)
    }, [searchResults])

    useEffect(() => {
        if (selectionEditor) {
            selectionEditor.commands.setContent(selectionHtmlContent);
        }
    }, [selectionHtmlContent, selectionEditor]);

    useEffect(() => {
        if (searchContainerRef.current && searchTextRef.current) {
            const containerWidth = searchContainerRef.current.offsetWidth;
            const containerHeight = searchContainerRef.current.offsetHeight;
            const searchTextWidth = searchTextRef.current.offsetWidth;
            const searchTextHeight = searchTextRef.current.offsetHeight;

            const boxWidth = 10; // Updated to match .connectItem width
            const boxHeight = 10; // Updated to match .connectItem height

            const newPositions = searchResults.map(() => {
                let x, y;
                let attempts = 0;
                const maxAttempts = 100; // limit the number of attempts to find a position

                do {
                    x = Math.random() * (containerWidth - boxWidth);
                    y = Math.random() * (containerHeight - boxHeight);

                    attempts++;
                } while (
                    attempts < maxAttempts &&
                    x + boxWidth > searchTextRef.current.offsetLeft &&
                    x < searchTextRef.current.offsetLeft + searchTextWidth &&
                    y + boxHeight > searchTextRef.current.offsetTop &&
                    y < searchTextRef.current.offsetTop + searchTextHeight
                );

                return { x, y };
            });

            setItemPositions(newPositions);
        }
    }, [searchResults]); // Recalculate positions only when searchResults change

    return (
        <div className={styles.expandedConnectCard}>
            <div className={styles.covenantTitle} style={{
                transform: `scale(${titleScale})`,
                transformOrigin: 'top left',
                width: `${100 / titleScale}%`,
            }}>
                <CovenantMainClause covenant={covenant} currentCount={currentCount} />
            </div>
            <div className={styles.selectionFragmentEditor}>
                <EditorContent
                    editor={selectionEditor}
                    className={styles.selectionText}
                />
            </div>
            <div className={styles.covenantEntrySearch} ref={searchContainerRef}>
                <div ref={searchTextRef}>
                    <EditorContent
                        editor={editor}
                        className={styles.searchText}
                    />
                </div>
                <div className={styles.searchResults}>
                    {searchResults.map((article, index) => (
                        <ConnectItem 
                            key={index} 
                            article={article} 
                            transform={itemPositions[index] || { x: 0, y: 0 }} // Use stored positions
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function ConnectItem({ article, transform={x: 0, y: 0} }) {
    return (
        <div className={styles.connectItem} style={{
            top: `${transform.y}px`,
            left: `${transform.x}px`
        }}>
            <p className={styles.connectItemTitle}>{article.title}</p>
        </div>
    )
}