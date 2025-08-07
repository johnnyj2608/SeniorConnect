import React from 'react';
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const SupportsPage = () => {
	const { t, i18n } = useTranslation();
	const { section } = useParams();
	const navigate = useNavigate();
	const lang = i18n.language || 'en';

	let data;
	try {
		data = require(`../data/${lang}/${section}.json`);
	} catch (err) {
		data = require(`../data/en/${section}.json`);
	}

	return (
		<>
            <div className="page-header">
                <div className="page-title-row">
                    <h2 className="page-title">&#9782; {t('settings.support.label')}</h2>
                </div>
            </div>
			<div className="content-padding">
				<div className="support-content card-container">
					<button
						className="support-back-button"
						onClick={() => navigate('/settings')}
					>
						← {t('general.buttons.back')}
					</button>
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
