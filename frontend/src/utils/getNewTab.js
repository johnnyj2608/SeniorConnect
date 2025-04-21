import getActiveAuthIndex from '../utils/getActiveAuthIndex';

const getNewTab = (type, localData, id) => {
    switch (type) {
        case 'authorizations': {
            const activeAuthIndex = getActiveAuthIndex(localData);
            return {
                id: 'new',
                member: id,
                mltc_member_id: localData[activeAuthIndex]?.mltc_member_id || '',
                mltc: localData[activeAuthIndex]?.mltc || '',
                mltc_auth_id: '',
                schedule: localData[activeAuthIndex]?.schedule || [],
                start_date: '',
                end_date: '',
                dx_code: localData[activeAuthIndex]?.dx_code || '',
                sdc_code: localData[activeAuthIndex]?.sdc_code || '',
                trans_code: localData[activeAuthIndex]?.trans_code || '',
                active: true,
                edited: true,
            };
        }
        case 'contacts': {
            return {
                id: 'new',
                members: [id],
                contact_type: '',
                name: '',
                phone: '',
                relationship_type: '',
                edited: true,
            };
        }
        case 'absences': {
            return {
                id: 'new',
                member: id,
                absence_type: '',
                start_date: '',
                end_date: '',
                note: '',
                edited: true,
            };
        }
        default:
            return null;
    }
};

export default getNewTab;