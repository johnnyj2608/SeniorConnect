import React, {useState, useEffect} from 'react'
import ListItem from '../components/ListItem'

const MembersListPage = () => {

    let [members, setMembers] = useState([])

    useEffect(() => {
        getMembers()
    }, [])

    let getMembers = async () => {
        let response = await fetch('http://127.0.0.1:8000/core/members/')
        let data = await response.json()
        setMembers(data)
    }

  return (
    <div>
      <div className="members-list">
        {members.map((member, index) => (
            <ListItem key={index} member={member}/>
        ))}
      </div>
    </div>
  )
}

export default MembersListPage
