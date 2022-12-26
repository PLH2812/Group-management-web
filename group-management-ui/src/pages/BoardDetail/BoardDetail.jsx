import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './board-detail.module.scss'
import { AiOutlinePlus } from 'react-icons/ai';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
// import { List } from '@mui/icons-material';
import { AppContext } from '../../Context/AppContext';
import { submitTaskRequest, pickTaskRequest } from '../../hooks/requests';
import CreateTask from '../../components/Dialog/CreateTask';
import clsx from 'clsx'
import AddUserDialog from '../../components/Dialog/AddUserDialog';
import MoreVertIcon from '@mui/icons-material/MoreVert';

function BoardDetail() {
    const { boardSlug } = useParams()
    const { table, listWork, setOpenDialog, task, profile, getTableId, setRender, render } = useContext(AppContext)
    // const [task, setTask] = useState({})
    // console.log(table);
    const stateWork = listWork.length > 0
    const stateTable = table.length > 0
    // console.log(ta   sk);
    // useEffect(() => {
    //     return async () => {
    //         setTask(await getTask(work1._id))
    //     }
    // }, []);

    // if(task.loading){
    //     return <>helo</>
    // }
    if (!stateTable) {
        return
    }
    const work1 = table.find(element => element.url === boardSlug)
    getTableId(work1._id)
    // console.log(work1);

    if (!stateWork) {
        return
    }
    // const work1 = table.find(element => element.url === boardSlug)
    const work2 = listWork.find(work => work._id === work1.groupId)

    // console.log(task);
    // console.log(work2.members);
    // console.log(work1);
    // setSlug(boardSlug)
    // console.log(table.find(element=>element.url === boardSlug));
    // const workBySlug = () => {
    //     if (stateWork && stateTable) {
    //         const work1 = table.find(element => element.url === boardSlug)
    //         if (work1) {
    //             const work2 = listWork.find(work => work._id === work1.groupId)
    //             console.log(work2);
    //             return work2
    //         }
    //     }

    // }
    // useEffect(() => {

    //     const work1 = table.find(element => element.url === boardSlug)
    //     const work2 = listWork.find(work => work._id === work1.groupId)

    //     setData(work2)

    // }, [])
    // console.log(workBySlug()._id);

    // if (data.loading === false) {
    //     // setData({ loading: true })
    // const work1 = table.find(element => element.url === boardSlug)
    // const work2 = listWork.find(work => work._id === work1.groupId)
    // console.log(work1);
    // setData({
    //     loading: true,
    //     data: work2
    // })

    // }
    // console.log(work);
    // console.log(data);

    // const [listWork, setListWork] = useState([])
    // console.log(listWork);
    // useEffect(() => {
    //     return async () => {
    //         setListWork(await getGroup())
    //     }
    // }, []);

    const getID = async (taskID, tableID) => {
        // taskList = taskList.filter(task => task.taskID !== taskID)
        // console.log(taskList);
        // let profile = await getProfileUser()
        // console.log(profile);
        // setDisplayTask(taskID, taskList)
        // let gmail = localStorage.getItem('gmail');
        // for (let i = 0; i < data.length; i++) {
        //     if (profile.email === gmail) {
        //         let index = taskList.findIndex((obj => obj.taskID == taskID))
        //         if (data[i].task.includes(taskList[index])) {
        //             data[i].task = data[i].task.filter(task => (task.taskID === taskID))
        //         } else {
        //             data[i].task.push(taskList[index])
        //         }
        //     }
        // }
        pickTaskRequest(taskID, tableID).then(res => setRender(!render))

    }
    const completeTask = (taskId) => {
        submitTaskRequest(taskId).then(res => setRender(!render))
    }

    const cancelTask = (taskID) => {
        console.log(taskID);
        setDisplayTask(taskID, taskList)
        // setTask(1)
    }
    // const setDisplayTask = (taskID, arr) => {
    //     setTask([...task, taskID])
    //     let indexObj = arr.findIndex((obj => obj.taskID == taskID))
    //     arr[indexObj].isDisplay = !arr[indexObj].isDisplay
    // }

    return (
        // <></>
        <div className={styles.wrapper}>
            <div className={styles.board_header}>
                <div className={styles.board_title}>{work1.name}</div>
                {work2.owner[0].userId === profile._id &&
                    <div className={styles.wrapper_btn} onClick={() => setOpenDialog('adduser')}>
                        <span className={styles.btn_add_user}>
                            ({work1.members.length}) Thêm thành viên
                        </span>
                    </div>
                }
            </div>
            <div className={styles.board_body}>
                <div className={styles.wrapper_card}>
                    <div className={styles.card}>
                        <div>
                            <div className={styles.card_title}> Danh sách task </div>
                            <div className={styles.card_list_work}>

                                {
                                    task?.task?.map(task => {
                                        if (task.tableId === work1._id && !task.assignedTo) {
                                            return (
                                                <div className={styles.work}>
                                                    <span className={styles.title}>{task.name}</span>
                                                    <button className={styles.button_pick} title='Chọn task' onClick={() => getID(task._id, task.tableId)}>
                                                        <MoreVertIcon />

                                                    </button>
                                                    
                                                </div>
                                            )
                                        }
                                    })
                                }
                            </div>

                        </div>

                        <div >
                            <div className={styles.action_add} onClick={() => setOpenDialog('task')}>
                                <span className={styles.icon}> <AiOutlinePlus /></span>
                                <span className={styles.title} >Thêm thẻ</span>

                            </div>
                        </div>
                    </div>
                </div>
                {
                    stateTable ? work1.members.map((column, index) => (
                        <div className={styles.wrapper_card}>
                            <div className={styles.card}>
                                <div className={styles.card_title}>
                                    <span > {column.name}</span>
                                </div>
                                <div className={styles.card_list_work}>
                                    {

                                        task?.task?.map(task => {
                                            if (task?.assignedTo?.userId === column.userId && task.tableId === work1._id) {

                                                // let indexTask = taskList.findIndex(obj => obj.taskID === task.taskID)
                                                // if (!taskList[indexTask].isDisplay)
                                                {

                                                    return (
                                                        <div className={clsx(styles.card_body)}>
                                                            <div className={clsx(styles.work, task.status === 'SUBMITTED' && styles.done_task)}>
                                                                <span className={styles.title}>{task.name}</span>
                                                                <button className={styles.button_done} title='Hoàn thành' onClick={() => completeTask(task._id)}><CheckIcon /> </button>
                                                                <button className={styles.button_cancel} title='Hủy task' onClick={() => cancelTask(task.taskID)}><CloseIcon /> </button>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            }
                                        }
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    )) : <></>
                }
            </div>
            <CreateTask idTable={work1._id} setRender={() => setRender} />
            <AddUserDialog idGroup={work1.groupId} idTable={work1._id} type='toTable' />
        </div>
    );
}

export default BoardDetail;