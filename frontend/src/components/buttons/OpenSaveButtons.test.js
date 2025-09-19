import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import OpenSaveButtons from './OpenSaveButtons'

jest.mock('../../utils/fileUtils', () => ({
    openFile: jest.fn(),
    saveFile: jest.fn(),
}))

import { openFile, saveFile } from '../../utils/fileUtils'

describe('OpenSaveButtons', () => {
    const file = { content: 'test' }
    const name = 'myfile.txt'

    beforeEach(() => {
        jest.clearAllMocks()
        render(<OpenSaveButtons file={file} name={name} />)
    })

    it('renders both Open and Download buttons', () => {
        const openButton = screen.getByRole('button', { name: /open/i })
        const downloadButton = screen.getByRole('button', { name: /download/i })

        expect(openButton).toBeInTheDocument()
        expect(downloadButton).toBeInTheDocument()
    })

    it('calls openFile with the correct argument when Open button is clicked', async () => {
        const openButton = screen.getByRole('button', { name: /open/i })
        await userEvent.click(openButton)
        expect(openFile).toHaveBeenCalledTimes(1)
        expect(openFile).toHaveBeenCalledWith(file)
    })

    it('calls saveFile with the correct arguments when Download button is clicked', async () => {
        const downloadButton = screen.getByRole('button', { name: /download/i })
        await userEvent.click(downloadButton)
        expect(saveFile).toHaveBeenCalledTimes(1)
        expect(saveFile).toHaveBeenCalledWith(file, name)
    })
})
