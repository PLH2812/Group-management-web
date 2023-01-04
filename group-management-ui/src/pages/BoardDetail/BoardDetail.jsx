import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './board-detail.module.scss'
import { AiOutlinePlus } from 'react-icons/ai';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
// import { List } from '@mui/icons-material';
import { AppContext } from '../../Context/AppContext';
import { submitTaskRequest, pickTaskRequest, removeUser } from '../../hooks/requests';
import CreateTask from '../../components/Dialog/CreateTask';
import clsx from 'clsx'
import AddUserDialog from '../../components/Dialog/AddUserDialog';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import moment from 'moment';
import TaskDetailDialog from '../../components/Dialog/TaskDetailDialog';

function BoardDetail() {
    const { boardSlug } = useParams()
    const { table, listWork, setOpenDialog, task, profile, getTableId, setRender, render } = useContext(AppContext)
    
    const stateWork = listWork.length > 0
    const stateTable = table.length > 0
    
    if (!stateTable) {
        return
    }
    const work1 = table.find(element => element.url === boardSlug)
    console.log(work1._id);
    getTableId(work1._id)
    const [taskDetail, setTaskDetail] = useState()

    if (!stateWork) {
        return
    }
    const work2 = listWork.find(work => work._id === work1.groupId)



    
    const completeTask = (taskId) => {
        submitTaskRequest(taskId).then(res => setRender(!render))
    }

    const cancelTask = (taskID) => {
        console.log(taskID);
        setDisplayTask(taskID, taskList)
  
    }


    const deleteUser = (userId, groupId) => {
        console.log(userId, groupId);
        removeUser(userId, groupId).then(() => setRender(!render))
    }

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
                                                    <span className={styles.button_pick} title='Chọn task' onClick={() => {

                                                        setOpenDialog('taskdetail')
                                                        setTaskDetail(task)
                                                    }
                                                    }>
                                                        <MoreVertIcon />
                                                    </span>
                                                    <TaskDetailDialog task={taskDetail} />
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
                                <span className={styles.title}>Thêm thẻ</span>

                            </div>
                        </div>
                    </div>
                </div>
                {
                    stateTable ? work1.members.map((column, index) => (
                        <div className={styles.wrapper_card}>
                            <div className={styles.card}>
                                <div className={styles.card_title}>
                                    <span> {column.name}</span>
                                    <span className={styles.select_option}>
                                        <MoreVertIcon />
                                        <div className={styles.option}>
                                            <div className={styles.separa}></div>
                                            <div className={styles.option_item} onClick={() => deleteUser(column.userId, work1.groupId)}>Xóa thành viên</div>
                                            <div className={styles.option_item}>Xem thông tin</div>
                                        </div>
                                    </span>

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
        </div >
    );
}

export default BoardDetail;