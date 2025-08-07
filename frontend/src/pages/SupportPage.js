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
                    <h2 className="page-title">&#9782; {t('settings.support.label')}</h2>
                </div>
            </div>
			<div className="content-padding">
				<div className="support-content card-container">
					<h3 className="support-title">{data.title}</h3>
					<p className="support-date"><em>{data.date}</em></p>
					<p>{data.introduction}</p>

					{data.sections.map((section, index) => (
						<div key={index} className="support-section">
							<h4>{section.title}</h4>
							{section.content && <p>{section.content}</p>}

							{section.articles && (
							<div className="support-articles">
								{section.articles.map((article, i) => (
									<div key={i} className="support-article">
									<h5>Q: {article.question}</h5>
									<p>A: {article.answer}</p>
									</div>
								))}
							</div>
							)}
						</div>
					))}
				</div>
				
    		</div>
		</>
	);
};

export default SupportsPage;
