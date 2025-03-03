import React, {useState, useEffect} from 'react'
import ListItem from '../components/ListItem'
import AddButton from '../components/AddButton'

const MembersListPage = () => {

    let [members, setMembers] = useState([])

    let getMembers = async () => {
        let response = await fetch('/core/members')
        let data = await response.json()
        setMembers(data)
    }

    useEffect(() => {
        getMembers()
    }, [])

  return (
    <div className="members">
      <div className="members-header">
        <h2 className="members-title">&#9782; Members</h2>
        <p className="members-count">{members.length}</p>
      </div>
      <div className="members-list">
        {members.map((member) => (
            <ListItem key={member.id} member={member}/>
        ))}
      </div>
      <AddButton />
    </div>
  )
}

export default MembersListPage
