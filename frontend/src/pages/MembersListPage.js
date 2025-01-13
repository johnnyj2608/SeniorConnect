import React, {useState, useEffect} from 'react'
import ListItem from '../components/ListItem'

const MembersListPage = () => {

    let [members, setMembers] = useState([])

    let getMembers = async () => {
        let response = await fetch('/core/members/')
        let data = await response.json()
        setMembers(data)
    }

    useEffect(() => {
        getMembers()
    }, [])

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
