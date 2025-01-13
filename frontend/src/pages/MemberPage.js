import React, {useState, useEffect} from 'react';
import { useParams, Link } from 'react-router-dom';
import { ReactComponent as Arrowleft } from '../assets/arrow-left.svg'

const MemberPage = () => {
    const { id } = useParams();
    let [member, setMember] = useState(null)

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

  return (
    <div className="member">
      <div className="member-header">
        <h3>
          <Link to="/">
            <Arrowleft />
          </Link>
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
