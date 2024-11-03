import { useState, useEffect } from 'react';
import styles from './ExpandedJustifyCard.module.css';
import { EditorContent, useEditor } from '@tiptap/react';
import { Node } from "@tiptap/core";
import StarterKit from '@tiptap/starter-kit';
import { Heading } from '@tiptap/extension-heading';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import Link from "@tiptap/extension-link";
import Placeholder from '@tiptap/extension-placeholder';
import * as showdown from 'showdown';
import { CovenantConjunction, CovenantClause } from "~/components/canvas/custom-ui/utilities/ConstellationLabelPainter.jsx";

export function ExpandedJustifyCard({ modifier, currentCount = 1, titleScale=0.6 }) {
    const [htmlContent, setHtmlContent] = useState("");
    const converter = new showdown.Converter();

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: true,
                paragraph: true
            }),
            Link,
            Placeholder.configure({
                placeholder: "Capture your thoughts",
                showOnlyWhenEditable: false,
                emptyNodeClass: styles.isEmpty,
                emptyEditorClass: styles.empty,
            }),
        ],
        content: htmlContent,
        editable: true,
    });

    useEffect(() => {
        if (editor) {
            editor.commands.setContent(htmlContent);
        }
    }, [htmlContent, editor]);

    return (
        <div className={styles.expandedJustifyCard} style={{
            display: 'grid',
            gridTemplateRows: '1fr',
            gridTemplateColumns: '1fr',
            width: '100%',
            height: '100%',
            border: '2px solid black',
            padding: '20px',
        }}>
            <div className={styles.gridController}>
                <p className={styles.clauseTitleContainer} style={{
                    transform: `scale(${titleScale})`,
                    transformOrigin: 'top left',
                    width: `${100/titleScale}%`,
                }}>
                    <CovenantConjunction modifier={modifier} />
                    <CovenantClause modifier={modifier} currentCount={currentCount} />
                </p>
                <EditorContent 
                    editor={editor} 
                    className={styles.justifyCardEditor}
                />
            </div>
        </div>
    );
}
