import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../Context/AppContext';
import BoardCard from '../../BoardCard';
import styles from './createboarddialog.module.scss'
import { createGroup, getGroup, getProfileUser } from '../../../hooks/requests'


function CreateGruopDialog() {


    const { openDialog, setOpenDialog, setRender, render } = useContext(AppContext)


    const handleSubmit = async () => {
        let profile = await getProfileUser()
        let name = document.getElementById('name-group').value;
        let description = document.getElementById('description').value;
        let group = {
            name: name,
            description: description,
            owner: [{
                userId: profile._id,
                name: profile.name,
            }],
            members: [{
                userId: profile._id,
                name: profile.name,
            }],
        }
        createGroup(group).then(res=>setRender(!render))
    }
    return (
        <>

            {
                openDialog === 'group' &&
                (<div className={styles.wrapper} id='dialog' >
                    <header className={styles.header}>
                        <span className={styles.title}>Tạo nhóm</span>
                        <button className={styles.close} onClick={() => setOpenDialog('')}>x</button>
                    </header>
                    <hr />
                    <div className={styles.body}>
                        <input className={styles.name} id='name-group' type="text" placeholder='Nhập tên nhóm' />
                        <input className={styles.name} type="text" placeholder='Thêm thành viên' />
                        <textarea className={styles.name} id='description' rows='4' placeholder='Mô tả nhóm' />
                    </div>
                    <div className={styles.action}>
                        <button className={styles.submit} onClick={() => handleSubmit()} >Tạo mới</button>
                    </div>
                </div>)


            }
        </>


    );
}

export default CreateGruopDialog;