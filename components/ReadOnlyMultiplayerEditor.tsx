import { TDDocument, Tldraw, useFileSystem } from '@tldraw/tldraw'
import * as React from 'react'

interface Props {
	roomId: string
	document: TDDocument
}

const ReadOnlyMultiplayerEditor = ({ document }: Props) => {
	const { onSaveProjectAs, onSaveProject } = useFileSystem()

	return (
		<div className="tldraw">
			<Tldraw
				autofocus
				disableAssets={false}
				showPages={false}
				showMultiplayerMenu={false}
				onSaveProjectAs={onSaveProjectAs}
				onSaveProject={onSaveProject}
				readOnly
				showStyles={false}
				document={document}
			/>
		</div>
	)
}

export default ReadOnlyMultiplayerEditor
