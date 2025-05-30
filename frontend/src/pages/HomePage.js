import React from 'react'
import BirthdaysCard from '../components/homeCards/HomeBirthdaysCard'
import AuditLogsCard from '../components/homeCards/HomeAuditLogsCard'
import StatsCard from '../components/homeCards/HomeStatsCard'
import AbsencesCard from '../components/homeCards/HomeAbsencesCard'
import SnapshotsCard from '../components/homeCards/HomeSnapshotsCard'

const HomePage = () => {
  return (
    <>
      <div className="page-header">
        <div className="page-title-row">
          <h2 className="page-title">&#9782; Home</h2>
        </div>
      </div>

      <div className="home-content content-padding">
        <div className="home-main-panel">
          <StatsCard />
          <AbsencesCard />
          <SnapshotsCard />
        </div>
        <div className="home-side-panel">
          <BirthdaysCard />
          <AuditLogsCard />
        </div>
      </div>
    </>
  )
}

export default HomePage