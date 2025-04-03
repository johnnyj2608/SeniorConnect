import React, {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModalMain from '../components/ModalMain';
import urlToFile from '../utils/urlToFile';
import { ReactComponent as Arrowleft } from '../assets/arrow-left.svg'
import { ReactComponent as Pencil } from '../assets/pencil.svg'
import { ReactComponent as AddButton } from '../assets/add.svg'
import { 
  formatDate, 
  formatPhone, 
  formatGender, 
  formatSchedule, 
  formatSSN, 
  sortSchedule
} from '../utils/formatUtils';

const MemberPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState({});
  const [auths, setAuths] = useState([])
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');

  const getMember = async () => {
    if (id === 'new') return

    const response = await fetch(`/core/members/${id}/`)
    const data = await response.json()

    const sanitizedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value ?? ""])
    );
    setMember(sanitizedData)
  }

  const getAuthsByMember = async () => {
    if (id === 'new') return

    const response = await fetch(`/core/auths/member/${id}`);
    const data = await response.json();
    setAuths(data);
  };

  useEffect(() => {
    if (id === 'new') {
      setModalOpen(true);
      setModalType('basic');
    } else {
      getMember();
      getAuthsByMember();
    }
    // eslint-disable-next-line
  }, [id])

  const handleBack = () => {
    navigate('/members')
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm('Are you sure you want to delete this member?');
    if (isConfirmed) {
      const response = await fetch(`/core/members/${id}/`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        handleBack();
      }
    }
  };

  const updateState = (savedData) => {
    switch (modalType) {
      case 'basic':
        setMember({
          ...savedData,
          photo: `${savedData.photo}?t=${new Date().getTime()}`,
        });
        break;
      case 'authorization':
        setAuths(savedData);
        break;
      default:
        console.error("Unknown update type:", modalType);
        return;
    }
  };

  const handleSave = async (updatedData) => {
    const sendRequest = async (url, method, data) => {
      const formData = new FormData();
      for (const key in data) {
        if (key === 'photo' && typeof data.photo === 'string') {
          const file = await urlToFile(data.photo, `${id}.jpg`);
          formData.append('photo', file);
          // Photo not updated
        } else if (key === 'schedule' && data.id !== 'new') {
          formData.append(key, JSON.stringify(data[key]));
        } else if (data[key] === null) {
          formData.append(key, '');
        } else {
          formData.append(key, data[key]);
        }
      }
      
      const response = await fetch(url, { method, body: formData });

      if (!response.ok) return Promise.reject(response);

      return response.json();
    };

    const dataArray = Object.values(updatedData);
    let savedData = null;

    switch (modalType) {
      case 'basic':
        const memberEndpoint = `/core/members/${id === 'new' ? '' : id + '/'}`;
        const memberMethod = id === 'new' ? 'POST' : 'PUT';
        savedData = await sendRequest(memberEndpoint, memberMethod, updatedData);
        
        if (id === 'new') {
          navigate(`/member/${savedData.id}`);
        }

        break;

      case 'authorization':
        const deletions = dataArray.filter(auth => auth.deleted);
        const updates = dataArray.filter(auth => auth.edited && !auth.deleted);

        const updatedAuths = await Promise.all(
          updates.map(async (auth) => {
            auth.schedule = sortSchedule(auth.schedule);
            auth.member_id = auth.id === 'new' ? id : auth.member_id;
            const authEndpoint = `/core/auths/${auth.id === 'new' ? '' : auth.id + '/'}`;
            const authMethod = auth.id === 'new' ? 'POST' : 'PUT';
        
            const response = await sendRequest(authEndpoint, authMethod, auth);
        
            if (auth.id === 'new' && response.id) {
              auth.id = response.id;
            }
        
            return auth;
          })
        );

        await Promise.all(
          deletions.map(auth => fetch(`/core/auths/${auth.id}/`, { method: 'DELETE' }))
        );
  
        savedData = dataArray
          .filter(auth => !auth.deleted && auth.id !== 'new')
          .map(auth => updatedAuths.find(updated => updated.id === auth.id) || auth)
          .concat(updatedAuths.filter(updated => !dataArray.some(auth => auth.id === updated.id)));
        break;

      default:
        console.error("Unknown save type:", modalType);
    }
    updateState(savedData);
    setModalOpen(false);
  };

  const handleCancel = () => {
    if (id === 'new') {
      navigate('/members');
    } else {
      setModalOpen(false);
    }
  };

  const handleModalOpen = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const getModalData = () => {
    switch (modalType) {
      case 'authorization':
        return auths;
      case 'basic':
        return member;
      default:
        return {};
    }
  };

  return (
    <div className="member">
      <div className="member-header">
        <h3>
          <Arrowleft onClick={handleBack} />
        </h3>
      </div>
      <div className="member-row">
        <img 
            src={member.photo instanceof File ? URL.createObjectURL(member.photo) : member.photo || "/default-profile.jpg"} 
            alt={member.first_name ? `${member.first_name} ${member.last_name}` : "Member"} 
            className="member-photo"
            onError={(e) => e.target.src = "/default-profile.jpg"}
        />
      </div>
      <div className="member-row">
        <div className="member-half-card">
          <h2>Details</h2>
          <div className="member-container">
            <Pencil className="edit-icon" onClick={() => handleModalOpen('basic')} />
            <div className="member-detail">
              <label>Member ID:</label>
              <span>{member.sadc_member_id || 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>Last Name:</label>
              <span>{member.last_name || 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>First Name:</label>
              <span>{member.first_name || 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>Birth Date:</label>
              <span>{formatDate(member.birth_date) || 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>Gender: </label>
              <span>{formatGender(member.gender) || 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>Phone:</label>
              <span>{member.phone ? formatPhone(member.phone) : 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>Address:</label>
              <span>{member.address || 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>Email:</label>
              <span>{member.email || 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>Medicaid:</label>
              <span>{member.medicaid?.toUpperCase() || 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>SSN:</label>
              <span>{formatSSN(member.ssn) || 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>Language:</label>
              <span>{member.language || 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>Enrollment:</label>
              <span>{formatDate(member.enrollment_date) || 'N/A'}</span>
            </div>

            <div className="member-detail">
              <label>Note:</label>
              <span>{member.note || 'N/A'}</span>
            </div>

          </div>
        </div>
        <div className="member-half-card">
          <h2>Authorization</h2>
          <div className="member-container">
            <AddButton className="edit-icon" onClick={() => handleModalOpen('authorization')} />
            <div className="member-detail">
              <label>Member ID:</label>
              <span>{auths[0]?.mltc_member_id || 'N/A'}</span>
            </div>
            <div className="member-detail">
              <label>MLTC:</label>
              <span>{auths[0]?.mltc || 'N/A'}</span>
            </div>
            <div className="member-detail">
              <label>Auth ID:</label>
              <span>{auths[0]?.mltc_auth_id || 'N/A'}</span>
            </div>
            <div className="member-detail">
              <label>Schedule:</label>
              <span>{formatSchedule(auths[0]?.schedule) || 'N/A'}</span>
            </div>
            <div className="member-detail">
              <label>Start Date:</label>
              <span>{formatDate(auths[0]?.start_date) || 'N/A'}</span>
            </div>
            <div className="member-detail">
              <label>End Date:</label>
              <span>{formatDate(auths[0]?.end_date) || 'N/A'}</span>
            </div>
            <div className="member-detail">
              <label>DX Code:</label>
              <span>{auths[0]?.dx_code || 'N/A'}</span>
            </div>
            <div className="member-detail">
              <label>SDC Code:</label>
              <span>{auths[0]?.sdc_code || 'N/A'}</span>
            </div>
            <div className="member-detail">
              <label>Trans Code:</label>
              <span>{auths[0]?.trans_code || 'N/A'}</span>
            </div>
            {/* If updating auths, prefill with previous info except dates */}
          </div>
        </div>
      </div>
      <div className="member-row">
        <div className="member-half-card">
          <h2>Contacts</h2>
          <div className="member-container">
            <Pencil className="edit-icon" onClick={() => handleModalOpen('contacts')} />
            <div className="member-detail">
              <label>Emergency Contact:</label>
            </div>
            <div className="member-detail">
              <label>Primary Care Provider:</label>
            </div>
            <div className="member-detail">
              <label>Pharmacy:</label>
            </div>
            <div className="member-detail">
              <label>Spouse:</label>
            </div>
          </div>
        </div>
        <div className="member-half-card">
          <h2>Absences</h2>
          <div className="member-container">
            <AddButton className="edit-icon" onClick={() => handleModalOpen('absences')} />
          </div>
        </div>
      </div>
      <div className="member-row">
        <div className="member-full-card">
          <h2>Files</h2>
          <div className="member-container">
            <AddButton className="edit-icon" onClick={() => handleModalOpen('files')} />
            {/* Upload and nickname file */}
            {/* Dispalyed as a gallery of files */}
            {/* Click to open new tab for PDF */}
          </div>
        </div>
      </div>
      <div className="member-row">
        <h3><button className="delete-button" onClick={handleDelete}>Delete</button></h3>
      </div>
      {modalOpen && (
        <ModalMain
          data={getModalData()}
          onClose={handleCancel}
          onSave={handleSave}
          type={modalType}
        />
      )}
    </div>
  )
}

export default MemberPage
