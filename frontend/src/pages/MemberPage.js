import React, {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModalMain from '../components/ModalMain';
import { formatDate, formatPhone, formatGender, formatSchedule, formatSSN } from '../utils/formatUtils';
import urlToFile from '../utils/urlToFile';
import { ReactComponent as Arrowleft } from '../assets/arrow-left.svg'
import { ReactComponent as Pencil } from '../assets/pencil.svg'
import { ReactComponent as AddButton } from '../assets/add.svg'

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
      setModalType('details');
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
            setMember(savedData);
            break;
        case 'authorization':
            setAuths((prevAuths) => {
                const updatedAuths = prevAuths.map(auth =>
                    auth.id === savedData.id ? savedData : auth
                );
                return updatedAuths.length ? updatedAuths : [savedData];
            });
            break;
        default:
            console.error("Unknown update type:", modalType);
            return;
    }
  };

  const handleSave = async (updatedData) => {
    let endpoint = '';
    let method = id === 'new' ? 'POST' : 'PUT';

    switch (modalType) {
      case 'basic':
        endpoint = `/core/members/${id === 'new' ? '' : id + '/'}`;

        const formData = new FormData();
        for (const key in updatedData) {
            if (key === 'photo' && typeof updatedData.photo === 'string') {
                const file = await urlToFile(updatedData.photo, `${id}.jpg`);
                formData.append('photo', file);
            } else {
                formData.append(key, updatedData[key]);
            }
        }

        const response = await fetch(endpoint, {
            method,
            body: formData,
        });

        if (response.ok) {
          const savedData = await response.json();
          updateState(savedData);
          setModalOpen(false);
        }

        break;

      case 'authorization':
        const authArray = Object.values(updatedData);
        
        authArray
          .filter(auth => auth.edited)
          .map(async (auth) => {
            const authEndpoint = `/core/auths/${auth.id === 'new' ? '' : auth.id + '/'}`;
            const authMethod = auth.id === 'new' ? 'POST' : 'PUT';
            auth.member_id = auth.id === 'new' ? id : auth.member_id;

            const response = await fetch(authEndpoint, {
                method: authMethod,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(auth),
            });

            if (response.ok) {
              const savedData = await response.json();
              updateState(savedData);
              setModalOpen(false);
            } else {
              Promise.reject(response);
            }
          });
        break;

      default:
        console.error("Unknown save type:", modalType);
        return;
    }

    if (!endpoint) return;
    // Ensure new members if cancel go back, save stay
};


  // const handleSave = async (updatedData) => {
  //   const requiredFields = ['sadc_member_id', 'first_name', 'last_name', 'birth_date', 'gender'];
  //   const missingFields = requiredFields.filter(field => !updatedData[field]);
  //   if (missingFields.length > 0) {
  //     alert(`Please fill in the following required fields: ${missingFields.join(", ")}`);
  //     return;
  //   }

  //   const formData = new FormData();
  //   for (const key in updatedData) {
  //     if (key === 'photo' && typeof updatedData.photo === 'string') {
  //       const file = await urlToFile(updatedData.photo, `${id}.jpg`);
  //       formData.append('photo', file);
  //     } else if (updatedData[key] && typeof updatedData[key] === 'object' && updatedData[key].id) {
  //         formData.append(key, updatedData[key].id);
  //     } else {
  //       formData.append(key, updatedData[key]);
  //     }
  //   }

  //   let response;
  //   if (id === 'new') {
  //     response = await fetch(`/core/members/`, {
  //       method: 'POST',
  //       body: formData,
  //     });

  //     if (response.ok) {
  //       const savedMember = await response.json();
  //       setModalOpen(false); 
  //       navigate(`/member/${savedMember.id}`);
  //     }
  //   } else {
  //     response = await fetch(`/core/members/${id}/`, {
  //       method: 'PUT',
  //       body: formData,
  //     });

  //     if (response.ok) {
  //       setMember(updatedData);
  //       setModalOpen(false);
  //     }
  //   }
  // };

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
              <label>Diagnosis:</label>
              <span>{auths[0]?.diagnosis || 'N/A'}</span>
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
