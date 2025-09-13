import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatTime } from '../../utils/formatUtils';
import NameDisplay from '../layout/NameDisplay';

const AssessmentItem = ({ assessment }) => {

    return (
        <li>
            <Link to={`/members/${assessment.member}`} className="home-item">
                <span className="home-item-primary">
                    <p>
                        <NameDisplay
                            sadcId={assessment.sadc_member_id}
                            memberName={assessment.member_name}
                            altName={assessment.alt_name}
                        />
                    </p>
                    <p>— {assessment.user_name}</p>
                </span>
                <span className="home-item-secondary">
                    <p>{formatDate(assessment.start_date)}</p>
                    <p>{formatTime(assessment.time)}</p> 
                </span>
            </Link>
        </li>
    );
};

export default memo(AssessmentItem);