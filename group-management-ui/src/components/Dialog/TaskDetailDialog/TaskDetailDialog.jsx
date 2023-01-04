import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../Context/AppContext';
import BoardCard from '../../BoardCard';
import styles from './createboarddialog.module.scss'
import { pickTaskRequest } from '../../../hooks/requests'
import moment from 'moment';


function TaskDetail({ task }) {


    const { openDialog, setOpenDialog, setRender, render } = useContext(AppContext)

    const pickTask = (taskID, tableID) => {
        pickTaskRequest(taskID, tableID).then(res => {
            setRender(!render)
            setOpenDialog('')
        }
        )
    }



    return (
        <>

            {
                openDialog === 'taskdetail' &&

                (<div className={styles.wrapper}  >
                    <header className={styles.header}>
                        <span className={styles.title}>Tạo task mới</span>
                        <button className={styles.close} onClick={() => setOpenDialog('')}>x</button>
                    </header>
                    <hr />
                    <div className={styles.body}>
                        <input className={styles.name} id='name-task' type="text" placeholder='Nhập tên task' value={task.name} />
                        <textarea className={styles.name} id='description' rows='4' placeholder='Nội dung task' value={task.description} />
                        <input className={styles.name} id='deadline' type="text" placeholder='Nhập tên task' value={'Thời gian làm: ' + moment(task.endDate).fromNow()} />
                    </div>
                    <div className={styles.action}>
                        <button className={styles.submit} onClick={() => pickTask(task._id, task.tableId)} >Nhận task</button>
                    </div>
                </div>)


            }
        </>


    );
}

export default TaskDetail;