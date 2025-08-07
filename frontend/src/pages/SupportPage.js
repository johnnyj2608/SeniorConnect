import React from 'react';
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom';

import privacyData from '../data/privacy-policy.json';
import termsData from '../data/terms-of-service.json';
import helpData from '../data/help-center.json';

const SupportsPage = () => {
	const { t } = useTranslation();
	const { section } = useParams();

	const dataMap = {
		terms: termsData,
		privacy: privacyData,
		help: helpData,
	};

	const data = dataMap[section];

	return (
		<>
            <div className="page-header">
                <div className="page-title-row">
                    <h2 className="page-title">&#9782; {t(`settings.support.${section}`)}</h2>
                </div>
            </div>
			<div className="support-content content-padding">
				<h3>{data.title}</h3>
				<p><em>{data.date}</em></p>
				<p>{data.introduction}</p>

				{data.sections.map((section, index) => (
					<div key={index} className="support-section">
					<h4>{section.title}</h4>
					<p>{section.content}</p>
					</div>
				))}
    		</div>
		</>
	);
};

export default SupportsPage;
