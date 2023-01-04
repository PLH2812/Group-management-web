import { get } from 'lodash';
import React, { useContext, useEffect, useState } from 'react';
import BoardCard from '../../components/BoardCard';
import AddUserDialog from '../../components/Dialog/AddUserDialog';
import CreateBoardDialog from '../../components/Dialog/CreateBoarDialog/CreateBoardDialog';
import { AppContext } from '../../Context/AppContext';
import { getTableInGroupById } from '../../hooks/requests';
import styles from './board.module.scss'

function Board() {
    const { openDialog, setOpenDialog, listWork, table, profile } = useContext(AppContext)
    // const [board, setBoard] = useState([])
    
    const [idGroup, setIdGroup] = useState('')
    const stateTable = table.length > 0

    if (!stateTable) {
        return
    }

    // console.log(listWork);
    const testFunction =  (id) => {
        let board = []
        let result =  getTableInGroupById(id)
        console.log(result);
    }
    // listWork.map(work=>(
    //     console.log(getTableInGroupById(work._id))
    // ))

    return (
        <>
            {listWork.map((work, index) => {
                return (
                    <div className={styles.wrapper}>
                        <div className={styles.wrapper_top}>
                            <h3 className={styles.title}> {work.name} </h3>
                            <div>
                                {
                                    work.owner[0].userId === profile._id && <>
                                        <div className={styles.wrapper_btn} onClick={() => { setOpenDialog('adduser'), setIdGroup(work._id) }}>
                                            <span className={styles.btn_add_user}>
                                                ({work.members.length}) Thêm thành viên
                                            </span>
                                        </div>
                                    </>
                                }

                            </div>
                        </div>
                        <div className={styles.body}>
                            {
                                
                                stateTable && table.map(board => {
                                    if (work._id == board.groupId) {
                                        return <BoardCard board={board} />
                                    }
                                })
                            }
                            {
                                work.owner[0].userId === profile._id &&
                                (<div className={styles.createcard} onClick={() => setOpenDialog('board')}>
                                    Tạo bảng mới
                                </div>)
                            }
                            <CreateBoardDialog />
                            <AddUserDialog idGroup={idGroup} type='toGroup' />
                        </div>
                    </div>
                )
            }

            )}

        </>

    );
}

export default Board;