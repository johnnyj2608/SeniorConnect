import React, {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactComponent as Arrowleft } from '../assets/arrow-left.svg'

const MemberPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

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

  const [mltcOptions, setMltcOptions] = useState([]);

  const getMember = async () => {
    if (id === 'new') return

    const response = await fetch(`/core/members/${id}/`)
    const data = await response.json()
    setMember(data)
  }

  const getMltcOptions = async () => {
    const response = await fetch('/core/mltc/');
    const data = await response.json();
    setMltcOptions(data);
  };

  useEffect(() => {
    getMember()
    getMltcOptions();
    // eslint-disable-next-line
  }, [id])

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setMember((prevMember) => ({
      ...prevMember,
      [field]: value,
    }));
  };

  const createMember = async () => {
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

  const updateMember = async () => {
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

  const deleteMember = async () => {
    await fetch(`/core/members/${id}/`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
      },
    });
    navigate('/')
  };

  const handleSubmit = async () => {

    const requiredFields = [
      'sadc_member_id', 
      'first_name', 
      'last_name', 
      'birth_date', 
      'gender', 
      'phone', 
      'medicaid'
    ];
  
    const allFieldsFilled = requiredFields.every((field) => {
      const value = member[field];
      if (typeof value === 'string') {
        return value.trim() !== '';
      }
      return value !== null && value !== undefined && value !== '';
    });
    const atLeastOneFieldFilled = requiredFields.some((field) => {
      const value = member[field];
      if (typeof value === 'string') {
        return value.trim() !== '';
      }
      return value !== null && value !== undefined && value !== '';
    });
    
    if (allFieldsFilled) {
      if (id !== 'new') {
        await updateMember()
      } else {
        await createMember()
      }
      navigate('/')
    } else if (atLeastOneFieldFilled) {
      alert('Please fill in all required fields')
    } else {
      navigate('/')
    }
  }

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
          <Arrowleft onClick={handleSubmit} />
        </h3>
        {id !== 'new' ? (
          <button onClick={deleteMember}>Delete</button>
        ): (
          <button onClick={handleSubmit}>Done</button>
        )}
        
      </div>
      <label>SADC Member ID:</label>
      <input 
        type="number" 
        value={sadc_member_id} 
        onChange={handleChange('sadc_member_id')}
      />

      <label>MLTC:</label>
      <select 
        value={mltc} 
        onChange={handleChange('mltc')}>
        <option value="">Select MLTC</option>
        {mltcOptions.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>

      <label>First Name:</label>
      <input 
        type="text"
        value={first_name} 
        onChange={handleChange('first_name')}
      />

      <label>Last Name:</label>
      <input 
        type="text" 
        value={last_name}
        onChange={handleChange('last_name')}
      />

      <label>Birth Date:</label>
      <input 
        type="date" 
        value={birth_date}
        onChange={handleChange('birth_date')}
      />

      <label>Gender:</label>
      <select 
        value={gender} 
        onChange={handleChange('gender')}>
        <option value="">Select Gender</option>
        <option value="M">Male</option>
        <option value="F">Female</option>
      </select>

      <label>Phone:</label>
      <input 
        type="number" 
        value={phone}
        onChange={handleChange('phone')}
      />

      <label>Email:</label>
      <input 
        type="email" 
        value={email}
        onChange={handleChange('email')}
      />

      <label>Medicaid:</label>
      <input 
        type="text" 
        value={medicaid}
        onChange={handleChange('medicaid')}
      />

      <label>Address:</label>
      <input 
        type="text" 
        value={address}
        onChange={handleChange('address')}
      />

      <label>Care Manager:</label>
      <input 
        type="text" 
        value={care_manager}
        onChange={handleChange('care_manager')}
      />
      
      <label>Primary Care Provider:</label>
      <input 
        type="text" 
        value={primary_care_provider}
        onChange={handleChange('primary_care_provider')}
      />
      
      <label>Pharmacy:</label>
      <input 
        type="text" 
        value={pharmacy}
        onChange={handleChange('pharmacy')}
      />
      
      <label>Spouse:</label>
      <input 
        type="text" 
        value={spouse}
        onChange={handleChange('spouse')}
      />
    </div>
  );
};

export default MemberPage;
