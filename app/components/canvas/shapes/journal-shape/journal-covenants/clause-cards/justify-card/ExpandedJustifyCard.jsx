import { useState, useEffect } from 'react';
import styles from './ExpandedJustifyCard.module.css';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from "@tiptap/extension-link";
import Placeholder from '@tiptap/extension-placeholder';
import * as showdown from 'showdown';
import { CovenantConjunction, CovenantClause } from "~/components/canvas/custom-ui/utilities/ConstellationLabelPainter.jsx";

export function ExpandedJustifyCard({ modifier, currentCount = 1, titleScale = 0.6 }) {
    const [htmlContent, setHtmlContent] = useState("");
    const converter = new showdown.Converter();

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: true,
                paragraph: true,
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
        <div className={styles.expandedJustifyCard}>
            <div className={styles.gridController}>
                <p
                    className={styles.clauseTitleContainer}
                    style={{
                        transform: `scale(${titleScale})`,
                        transformOrigin: 'top left',
                        width: `${100 / titleScale}%`,
                    }}
                >
                    <CovenantConjunction modifier={modifier} />
                    <CovenantClause modifier={modifier} currentCount={currentCount} />
                </p>
                <EditorContent editor={editor} className={styles.justifyCardEditor} />
            </div>
        </div>
    );
}
