import React, { useContext} from 'react'
import { useTranslation } from 'react-i18next'
import BirthdaysCard from '../components/cards/HomeBirthdaysCard'
import AuditLogsCard from '../components/cards/HomeAuditLogsCard'
import StatsCard from '../components/cards/HomeStatsCard'
import AbsencesCard from '../components/cards/HomeAbsencesCard'
import EnrollmentsCard from '../components/cards/HomeEnrollmentsCard'
import AssessmentsCard from '../components/cards/HomeAssessmentsCard'
import SnapshotsCard from '../components/cards/HomeSnapshotsCard'
import { AuthContext } from '../context/AuthContext'

const HomePage = () => {
  const { t } = useTranslation()
  const { user } = useContext(AuthContext);

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
          <EnrollmentsCard />
          <AssessmentsCard />
          {(user?.view_snapshots || user?.is_org_admin) && <SnapshotsCard />}
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