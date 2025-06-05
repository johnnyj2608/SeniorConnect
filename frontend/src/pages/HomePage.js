import React from 'react'
import { useTranslation } from 'react-i18next'
import BirthdaysCard from '../components/homeCards/HomeBirthdaysCard'
import AuditLogsCard from '../components/homeCards/HomeAuditLogsCard'
import StatsCard from '../components/homeCards/HomeStatsCard'
import AbsencesCard from '../components/homeCards/HomeAbsencesCard'
import AssessmentsCard from '../components/homeCards/HomeAssessmentsCard'
import SnapshotsCard from '../components/homeCards/HomeSnapshotsCard'

const HomePage = () => {
  const { t } = useTranslation()

  return (
    <>
      <div className="page-header">
        <div className="page-title-row">
          <h2 className="page-title">&#9782; {t('general.home')}</h2>
        </div>
      </div>

      <div className="home-content content-padding">
        <div className="home-main-panel">
          <StatsCard />
          <AbsencesCard />
          <AssessmentsCard />
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