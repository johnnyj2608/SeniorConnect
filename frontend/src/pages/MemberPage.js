import React, {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactComponent as Arrowleft } from '../assets/arrow-left.svg'

const MemberPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    let [member, setMember] = useState({
      first_name: '',
      last_name: ''
    });

    let getMember = async () => {
      if (id === 'new') return

      let response = await fetch(`/core/members/${id}/`)
      let data = await response.json()
      setMember(data)
    }

    useEffect(() => {
      getMember()
      // eslint-disable-next-line
    }, [id])

    const handleChange = (field) => (event) => {
      const { value } = event.target;
      setMember((prevMember) => ({
        ...prevMember,
        [field]: value,
      }));
    };

    let createMember = async () => {
      await fetch(`/core/members/`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: member.first_name,
          last_name: member.last_name,
        }),
      });
    };

    let updateMember = async () => {
      await fetch(`/core/members/${id}/`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: member.first_name,
          last_name: member.last_name,
        }),
      });
    };

    let deleteMember = async () => {
      await fetch(`/core/members/${id}/`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      navigate('/')
    };

    let handleSubmit = async () => {
      const firstNameFilled = member.first_name.trim() !== ''
      const lastNameFilled = member.last_name.trim() !== ''

      if (firstNameFilled && lastNameFilled) {
        if (id !== 'new') {
          await updateMember()
        } else {
          await createMember()
        }
        navigate('/')
      } else if (firstNameFilled || lastNameFilled) {
        alert('Please fill in all required fields')
      } else {
        await deleteMember()
      }
    }

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
      <label>First Name:</label>
      <input 
        type="text" 
        value={member?.first_name} 
        onChange={handleChange('first_name')}
      />
      <label>Last Name:</label>
      <input 
        type="text" 
        value={member?.last_name}
        onChange={handleChange('last_name')}
      />
    </div>
  );
};

export default MemberPage;
