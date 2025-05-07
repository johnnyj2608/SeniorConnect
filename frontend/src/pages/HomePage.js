import React from 'react'
import BirthdaysCard from '../components/homeCards/homeBirthdaysCard'
import AuditLogsCard from '../components/homeCards/homeAuditLogsCard'
import MembersCard from '../components/homeCards/homeMembersCard'
import AbsencesCard from '../components/homeCards/homeAbsencesCard'
import AuthorizationsCard from '../components/homeCards/homeAuthCard'
import SnapshotsCard from '../components/homeCards/homeSnapshotsCard'

const HomePage = () => {
  return (
    <>
      <div className="page-header">
        <div className="page-title-row">
          <h2 className="page-title">&#9782; Home</h2>
        </div>
      </div>

      <div className="home-grid">
        <div className="home-side-panel">
          <BirthdaysCard />
        </div>
        <div className="home-main-panel">
          <MembersCard />
          <AbsencesCard />
          <BirthdaysCard showInMain={true} />
          <AuthorizationsCard />
          <SnapshotsCard />
        </div>
        <div className="home-side-panel">
          <AuditLogsCard />
        </div>
      </div>
    </>
  )
}

export default HomePage