import { useEditor, useTools, track } from 'tldraw'
import { useState } from 'react'
import { PiCursorFill, PiPencilSimpleFill } from "react-icons/pi";
import { BiSolidEraser } from "react-icons/bi";
import { TbGlobe, TbLibrary, TbRegex } from "react-icons/tb";
import styles from './CustomToolbar.module.css'

const CustomToolbar = track(() => {
	const editor = useEditor()

	return (
		<div className={styles.customLayout}>
			<div className={styles.customToolbar}>
				<ToolbarButton 
					handleClick={() => editor.setCurrentTool('select')} 
					name='select (V)'
					active={editor.getCurrentToolId() === 'select'}>
					<PiCursorFill />
				</ToolbarButton>
				<ToolbarButton 
					handleClick={() => editor.setCurrentTool('draw')} 
					name='draw (D)'
					active={editor.getCurrentToolId() === 'draw'}>
					<PiPencilSimpleFill />
				</ToolbarButton>
				<ToolbarButton 
					handleClick={() => editor.setCurrentTool('eraser')} 
					name='erase (E)'
					active={editor.getCurrentToolId() === 'eraser'}>
					<BiSolidEraser />
				</ToolbarButton>
				<ToolbarButton 
					handleClick={() => editor.setCurrentTool('thread')} 
					name='thread (T)'
					active={editor.getCurrentToolId() === 'thread'}>
					<TbGlobe />
				</ToolbarButton>
				<ToolbarButton 
					handleClick={() => editor.setCurrentTool('media')} 
					name='media (M)'
					active={editor.getCurrentToolId() === 'media'}>
					<TbLibrary />
				</ToolbarButton>
				<ToolbarButton 
					handleClick={() => editor.setCurrentTool('concept')} 
					name='concept (C)'
					active={editor.getCurrentToolId() === 'concept'}>
					<TbRegex />
				</ToolbarButton>
			</div>
		</div>
	)
})

export default CustomToolbar

function ToolbarButton({ children, handleClick, active, name }){
	const [hovered, setHovered] = useState(false)
	return(
		<div 
			className={`${styles.toolbarButton} ${active ? styles.active : ''}`}
            id={name}
			onPointerDown={handleClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{children}
			{hovered && (
				<div className={styles.tooltip}>
					<p className={styles.tooltipText}>{name}</p>
				</div>
			)}
		</div>
	)
}