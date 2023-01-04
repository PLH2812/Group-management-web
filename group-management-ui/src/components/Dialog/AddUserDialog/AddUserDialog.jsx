import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../Context/AppContext';
import BoardCard from '../../BoardCard';
import styles from './createboarddialog.module.scss'
import { addUserToGroup, addUserToTable, getUserByEmail } from '../../../hooks/requests'


function AddUserDialog({ idGroup, idTable, type }) {
    // console.log(idGroup);

    const { openDialog, setOpenDialog, setRender, render } = useContext(AppContext)
    const [user, setUser] = useState({})

    const handleSubmit = async () => {
        // let profile = await getProfileUser()
        // let name = document.getElementById('name-task').value;
        // let description = document.getElementById('description').value;
        // let task = {
        //     name: name,
        //     assignedTo:{},
        //     description: description,
        //     startDate:Date.now(),
        //     endDate:Date.now(),
        //     tableId:idTable,


        // }

        // createTask(task, idTable).then(res=>setRender(!render))

        // setOpenDialog('')
        console.log(type);
        if (type === 'toTable') {
            addUserToTable(user._id, idTable, idGroup, type).then(() => setRender(!render))
        } else if (type = 'toGroup') {
            addUserToGroup(user._id, idGroup, type).then(() => setRender(!render))
        }

    }

    const handleChangeUser = (value) => {
        if (value !== '') {
            console.log(value);
            document.getElementById('list-user').style.display = 'block'
            getUserByEmail(value).then(data => setUser({ ...data }))
        } else {
            document.getElementById('list-user').style.display = 'none'
        }
    }

    return (
        <>

            {
                openDialog === 'adduser' &&

                (<div className={styles.wrapper}  >
                    <header className={styles.header}>
                        <span className={styles.title}>Mời thành viên vào nhóm</span>
                        <button className={styles.close} onClick={() => setOpenDialog('')}>x</button>
                    </header>
                    <hr />
                    <div className={styles.body}>
                        <input className={styles.name} id='user' type="text" placeholder='Nhập email để tìm kiếm' onChange={(e) => handleChangeUser(e.target.value)} />
                        <div className={styles.list_user} id='list-user'>{user?.name}</div>
                    </div>
                    <div className={styles.action}>
                        <button className={styles.submit} onClick={() => handleSubmit()} >Gửi lời mời</button>
                    </div>
                </div>)


            }
        </>


    );
}

export default AddUserDialog;