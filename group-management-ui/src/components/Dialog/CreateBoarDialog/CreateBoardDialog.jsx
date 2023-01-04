import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../Context/AppContext';
import BoardCard from '../../BoardCard';
import styles from './createboarddialog.module.scss'



function CreateBoardDialog() {
    const { openDialog, setOpenDialog, handleSubmit, listWork } = useContext(AppContext)
    let name = '';
    let id = '';
    return (
        <>
            {openDialog === 'board' && (
                (<div className={styles.wrapper} id='dialog' >
                    <header className={styles.header}>
                        <span className={styles.title}>Tạo Bảng</span>
                        <button className={styles.close} onClick={() => setOpenDialog('')}>x</button>
                    </header>
                    <hr />
                    <div className={styles.body}>

                        <>
                            <input className={styles.name} id='name-board' type="text" placeholder='Nhập tên bảng' onChange={(e) => name = e.target.value} />
                            <select className={styles.name} onChange={(e) => id = e.target.value}>
                                <option value="0">Chọn không gian làm việc</option>
                                {
                                    listWork.map(work => {
                                        return <option value={work._id}>{work.name}</option>
                                    }
                                    )
                                }
                            </select>
                        </>

                    </div>
                    <div className={styles.action}>
                        <button className={styles.submit} onClick={() => (handleSubmit(name, id))} >Tạo mới</button>
                    </div>
                </div>)


            )}

        </>


    );
}

export default CreateBoardDialog;