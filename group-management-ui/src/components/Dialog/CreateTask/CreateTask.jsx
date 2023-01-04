import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../Context/AppContext';
import BoardCard from '../../BoardCard';
import styles from './createboarddialog.module.scss'
import { createGroup, createTask, getGroup, getProfileUser } from '../../../hooks/requests'


function CreateTask({idTable}) {


    const { openDialog, setOpenDialog, setRender , render} = useContext(AppContext)


    const handleSubmit = async () => {
        // let profile = await getProfileUser()
        let name = document.getElementById('name-task').value;
        let description = document.getElementById('description').value;
        let deadline = document.getElementById('deadline').value;
        let task = {
            name: name,
            assignedTo:{},
            description: description,
            startDate:Date.now(),
            endDate: deadline||new Date(new Date().getTime()+(7*24*60*60*1000)),
            tableId:idTable,

            
        }

        createTask(task, idTable).then(res=>setRender(!render))
        // console.log(task);
        setOpenDialog('')
    }



    return (
        <>

            {
                openDialog === 'task' &&

                (<div className={styles.wrapper}  >
                    <header className={styles.header}>
                        <span className={styles.title}>Tạo task mới</span>
                        <button className={styles.close} onClick={() => setOpenDialog('')}>x</button>
                    </header>
                    <hr />
                    <div className={styles.body}>
                        <input className={styles.name} id='name-task' type="text" placeholder='Nhập tên task' />
                        <input className={styles.name} id='deadline' type="date" placeholder='Deadline' />
                        <textarea className={styles.name} id='description' rows='4' placeholder='Nội dung task' />
                    </div>
                    <div className={styles.action}>
                        <button className={styles.submit} onClick={() => handleSubmit()} >Tạo mới</button>
                    </div>
                </div>)


            }
        </>


    );
}

export default CreateTask;