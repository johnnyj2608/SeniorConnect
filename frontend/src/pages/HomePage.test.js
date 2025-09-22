import React from 'react'
import { render, screen } from '@testing-library/react'
import HomePage from './HomePage'
import { AuthContext } from '../context/AuthContext'

jest.mock('../components/cards/HomeBirthdayCard', () => () => <div>BirthdayCard</div>)
jest.mock('../components/cards/HomeAuditLogCard', () => () => <div>AuditLogCard</div>)
jest.mock('../components/cards/HomeStatsCard', () => () => <div>StatsCard</div>)
jest.mock('../components/cards/HomeAbsenceCard', () => () => <div>AbsenceCard</div>)
jest.mock('../components/cards/HomeEnrollmentCard', () => () => <div>EnrollmentCard</div>)
jest.mock('../components/cards/HomeAssessmentCard', () => () => <div>AssessmentCard</div>)
jest.mock('../components/cards/HomeSnapshotCard', () => () => <div>SnapshotCard</div>)

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, options) => {
            if (key === 'home.welcome') return `Welcome, ${options?.name}`
            return key
        }
    })
}))

describe('HomePage', () => {
    const renderWithUser = (user) => {
        return render(
            <AuthContext.Provider value={{ user }}>
                <HomePage />
            </AuthContext.Provider>
        )
    }

    it('renders page titles with user name', () => {
        const user = { name: 'Alice', view_snapshots: true }
        renderWithUser(user)

        expect(screen.getByText((content) => content.includes('general.home'))).toBeInTheDocument()
        expect(screen.getByText((content) => content.includes('Welcome, Alice'))).toBeInTheDocument()
    })

    it('renders main panel cards', () => {
        const user = { name: 'Alice', view_snapshots: true }
        renderWithUser(user)

        const mainCards = ['StatsCard', 'AbsenceCard', 'EnrollmentCard', 'AssessmentCard', 'SnapshotCard']
        mainCards.forEach((card) => {
            expect(screen.getByText(card)).toBeInTheDocument()
        })
    })

    it('renders side panel cards', () => {
        const user = { name: 'Alice', view_snapshots: true }
        renderWithUser(user)

        const sideCards = ['BirthdayCard', 'AuditLogCard']
        sideCards.forEach((card) => {
            expect(screen.getByText(card)).toBeInTheDocument()
        })
    })

    it('does not render SnapshotCard if user cannot view snapshots', () => {
        const user = { name: 'Bob', view_snapshots: false, is_org_admin: false }
        renderWithUser(user)

        expect(screen.queryByText('SnapshotCard')).not.toBeInTheDocument()
    })

    it('renders SnapshotCard if user is org admin', () => {
        const user = { name: 'Charlie', view_snapshots: false, is_org_admin: true }
        renderWithUser(user)

        expect(screen.getByText('SnapshotCard')).toBeInTheDocument()
    })
})