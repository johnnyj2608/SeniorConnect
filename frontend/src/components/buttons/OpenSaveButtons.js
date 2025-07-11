import React from 'react'
import { ReactComponent as FileIcon } from '../../assets/file.svg'
import { ReactComponent as SaveIcon } from '../../assets/download.svg'
import { openFile, saveFile } from '../../utils/fileUtils'

const OpenSaveButtons = ({ file, name }) => {
	return (
		<div className="open-save-group">
			<button className="icon-button" onClick={() => openFile(file)} title="Open">
				<FileIcon />
			</button>
			<button className="icon-button" onClick={() => saveFile(file, name)} title="Download">
				<SaveIcon />
			</button>
		</div>
	)
}

export default OpenSaveButtons