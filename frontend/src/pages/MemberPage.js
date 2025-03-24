import React, {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactComponent as Arrowleft } from '../assets/arrow-left.svg'
import { ReactComponent as Pencil } from '../assets/pencil.svg'

const MemberPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState({
    sadc_member_id: '',
    mltc: '',
    first_name: '',
    last_name: '',
    birth_date: '',
    gender: '',
    address: '',
    phone: '',
    email: '',
    medicaid: '',
    care_manager: '',
    primary_care_provider: '',
    pharmacy: '',
    spouse: '',
  });

  const [editing, setEditing] = useState(false);

  const getMember = async () => {
    if (id === 'new') return

    const response = await fetch(`/core/members/${id}/`)
    const data = await response.json()

    const sanitizedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value ?? ""])
    );

    setMember(sanitizedData)
  }

  useEffect(() => {
    getMember()
    // eslint-disable-next-line
  }, [id])

  const handleCreate = async () => {
    await fetch(`/core/members/`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sadc_member_id: parseInt(member.sadc_member_id),
        mltc: parseInt(member.mltc),
        first_name: member.first_name,
        last_name: member.last_name,
        birth_date: member.birth_date,
        gender: member.gender,
        address: member.address || null,
        phone: member.phone,
        email: member.email || null,
        medicaid: member.medicaid,
        care_manager: member.care_manager ? parseInt(member.care_manager) : null,
        primary_care_provider: member.primary_care_provider ? parseInt(member.primary_care_provider) : null,
        pharmacy: member.pharmacy ? parseInt(member.pharmacy) : null,
        spouse: member.spouse ? parseInt(member.spouse) : null,
      }),
    });
  };

  const handleUpdate = async () => {
    await fetch(`/core/members/${id}/`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sadc_member_id: member.sadc_member_id,
        mltc: member.mltc,
        first_name: member.first_name,
        last_name: member.last_name,
        birth_date: member.birth_date,
        gender: member.gender,
        address: member.address || null,
        phone: member.phone,
        email: member.email || null,
        medicaid: member.medicaid,
        care_manager: member.care_manager || null,
        primary_care_provider: member.primary_care_provider || null,
        pharmacy: member.pharmacy || null,
        spouse: member.spouse || null,
      }),
    });
    
  };

  const handleSave = async () => {
    if (id !== 'new') {
      await handleUpdate()
    } else {
      await handleCreate()
    }
    console.log('Saving')
  };

  const handleBack = () => {
    navigate('/members')
  };

  const handleEdit = () => {
    setEditing(true);
    console.log('editing')
  };

  const handleCancel = () => {
    setEditing(false);
    setMember(member);
    console.log('cancel')
  };

  const handleDelete = async () => {
    await fetch(`/core/members/${id}/`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setEditing(false);
    handleBack();
  };

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setMember((prevMember) => ({
      ...prevMember,
      [field]: value,
    }));
  };

  const {
    sadc_member_id,
    mltc,
    first_name,
    last_name,
    birth_date,
    gender,
    phone,
    email,
    medicaid,
    address,
    care_manager,
    primary_care_provider,
    pharmacy,
    spouse,
  } = member;

  return (
    <div className="member">
      <div className="member-header">
        <h3>
          {editing ? (
            <button onClick={handleCancel}>Cancel</button>
          ) : (
            <Arrowleft onClick={handleBack} />
          )}
        </h3>
        <h3>
          {editing ? (
            <button onClick={handleSave}>Save</button>
          ) : (
            <Pencil onClick={handleEdit} />
            // If new, initialize save button
          )}
        </h3>
      </div>
      <div className="member-row">
        <div className="member-half-card">
          {/* Member Photo */}
          <div className="member-input">
            <label>Member ID:</label>
            {editing ? (
              <input 
                type="number"
                value={sadc_member_id} 
                onChange={handleChange('sadc_member_id')}
              />
            ) : (
              <span>{sadc_member_id || 'N/A'}</span>
            )}
          </div>

          <div className="member-input">
            <label>Last Name:</label>
            {editing ? (
              <input 
                type="text"
                value={last_name} 
                onChange={handleChange('last_name')}
              />
            ) : (
              <span>{last_name || 'N/A'}</span>
            )}
          </div>

          <div className="member-input">
            <label>First Name:</label>
            {editing ? (
              <input 
                type="text"
                value={first_name} 
                onChange={handleChange('first_name')}
              />
            ) : (
              <span>{first_name || 'N/A'}</span>
            )}
          </div>

          <div className="member-input">
            <label>Date of Birth:</label>
            {editing ? (
              <input 
                type="date"
                value={birth_date} 
                onChange={handleChange('birth_date')}
              />
            ) : (
              <span>{birth_date || 'N/A'}</span>
            )}
          </div>

          <div className="member-input">
            <label>Gender: </label>
            {editing ? (
              <select 
                value={gender} 
                onChange={handleChange('gender')}>
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            ) : (
              <span>{gender || 'N/A'}</span>
            )}
          </div>

          <div className="member-input">
            <label>Phone:</label>
            {editing ? (
              <input 
                type="number"
                value={phone} 
                onChange={handleChange('phone')}
              />
            ) : (
              <span>{phone || 'N/A'}</span>
            )}
          </div>

          <div className="member-input">
            <label>Address:</label>
            {editing ? (
              <input 
                type="text"
                value={address} 
                onChange={handleChange('address')}
              />
            ) : (
              <span>{address || 'N/A'}</span>
            )}
          </div>

          <div className="member-input">
            <label>Email:</label>
            {editing ? (
              <input 
                type="email"
                value={email} 
                onChange={handleChange('email')}
              />
            ) : (
              <span>{email || 'N/A'}</span>
            )}
          </div>

          <div className="member-input">
            <label>Medicaid:</label>
            {editing ? (
              <input 
                type="text"
                value={medicaid} 
                onChange={handleChange('medicaid')}
              />
            ) : (
              <span>{medicaid || 'N/A'}</span>
            )}
          </div>
        </div>
        <div className="member-half-card">

          <label>MLTC:</label>
          <label>Member ID:</label>
          <label>Auth ID:</label>
          <label>Diagnosis:</label>
          <label>Schedule:</label>
          <label>Start Date:</label>
          <label>End Date:</label>
          <label>Transportation:</label>
          <label>CM Name:</label>
          <label>CM Phone:</label>
          {/* If updating auth, prefill with previous info except dates */}
        </div>
      </div>
      <div className="member-row">
        <div className="member-half-card">
          <label>Emergency Contact:</label>
          <label>Primary Care Provider:</label>
          <label>Pharmacy:</label>
          <label>Spouse:</label>
        </div>
        <div className="member-half-card">
          {/* Upcoming absences */}
          {/* Click plus button to add range */}
        </div>
      </div>
      <div className="member-row">
        <div className="member-full-card">
          {/* Upload and nickname file */}
          {/* Dispalyed as a gallery of files */}
          {/* Click to open new tab for PDF */}
        </div>
      </div>
      <div className="member-row">
          {editing ? (
            <h3><button className="delete-button" onClick={handleDelete}>Delete</button></h3>
          ) : (
            null
          )}
      </div>
    </div>
  )
}

export default MemberPage
