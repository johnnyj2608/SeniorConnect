import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';

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

  return (
    <div>
      <p>{member?.first_name} {member?.last_name}</p>
    </div>
  );
};

export default MemberPage;
