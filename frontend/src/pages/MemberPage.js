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
        let response = await fetch(`/core/members/${id}`)
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

    let updateMember = async () => {
      fetch(`/core/members/${id}/update`, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            first_name: member.first_name,
            last_name: member.last_name,
          }),
      })
    }

    let handleSubmit = () => {
      updateMember()
      navigate('/')
    }

  return (
    <div className="member">
      <div className="member-header">
        <h3>
          <Arrowleft onClick={handleSubmit} />
        </h3>
      </div>
      <input 
        type="text" 
        value={member?.first_name} 
        onChange={handleChange('first_name')}
      />
      <input 
        type="text" 
        value={member?.last_name}
        onChange={handleChange('last_name')}
      />
    </div>
  );
};

export default MemberPage;
