import React, { useContext} from 'react'
import { useTranslation } from 'react-i18next'
import BirthdayCard from '../components/cards/HomeBirthdayCard'
import AuditLogCard from '../components/cards/HomeAuditLogCard'
import StatsCard from '../components/cards/HomeStatsCard'
import AbsenceCard from '../components/cards/HomeAbsenceCard'
import EnrollmentCard from '../components/cards/HomeEnrollmentCard'
import AssessmentCard from '../components/cards/HomeAssessmentCard'
import SnapshotCard from '../components/cards/HomeSnapshotCard'
import { AuthContext } from '../context/AuthContext'

const HomePage = () => {
  const { t } = useTranslation()
  const { user } = useContext(AuthContext);

  return (
    <>
      <div className="page-header">
        <div className="page-title-row">
          <h2 className="page-title">&#9782; {t('general.home')}</h2>
          <h2 className="page-title">{t('home.welcome', { name: user?.name })}</h2>
        </div>
      </div>

      <div className="home-content content-padding">
        <div className="home-main-panel">
          <StatsCard />
          <AbsenceCard />
          <EnrollmentCard />
          <AssessmentCard />
          {(user?.view_snapshots || user?.is_org_admin) && <SnapshotCard />}
        </div>
        <div className="home-side-panel">
          <BirthdayCard />
          <AuditLogCard />
        </div>
      </div>
    </>
  )
}

export default HomePage