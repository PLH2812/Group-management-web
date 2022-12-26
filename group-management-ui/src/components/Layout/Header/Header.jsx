import styles from './header.module.scss'
import { IoIosArrowDown, IoIosHelpCircleOutline } from "react-icons/io";
import { FaBell } from "react-icons/fa";
import { BsBell } from "react-icons/bs";
import { useContext, useEffect, useState } from 'react';
import CreateBoardDialog from '../../Dialog/CreateBoarDialog/CreateBoardDialog';
import { AppContext } from '../../../Context/AppContext';
import { useNavigate } from 'react-router-dom';
import { logoutRequest } from '../../../hooks/requests'
function Header() {
    const { openDialog, setOpenDialog, render, setRender } = useContext(AppContext)
    const navigate = useNavigate()

    const handleLogout = async () => {

        const result = await logoutRequest()
        // console.log(result);
        const success = result.ok
        if (success) {
            localStorage.removeItem('access_token')
            navigate('/login')
        }else{
            
        }
    }
    return (
        <header className={styles.header}>
            <section>
                <div>
                    <div className={styles.left}>
                        <div>
                            <button className={styles.btnshow}>
                                <span className={styles.btntitle}>Các nhóm hoạt động</span>
                                <span className={styles.arrow}><IoIosArrowDown /></span>
                            </button>
                            <button className={styles.btnshow}>
                                <span className={styles.btntitle}>Gần đây</span>
                                <span className={styles.arrow}><IoIosArrowDown /></span>
                            </button>
                            <button className={styles.btnshow}>
                                <span className={styles.btntitle}>Đã đánh giấu sao</span>
                                <span className={styles.arrow}><IoIosArrowDown /></span>
                            </button>
                        </div>
                    </div>
                    <div className={styles.center}>
                        <div>
                            <button className={styles.create} onClick={() => setOpenDialog('board')}>
                                <span className={styles.btntitle}>Tạo mới</span>
                            </button>

                        </div>
                    </div>
                </div>
                <div className={styles.wrapperright}>

                    <div className={styles.right}>
                        <span className={styles.notifi}><BsBell size="19px" /></span>
                        <span className={styles.help}><IoIosHelpCircleOutline size="24px" /></span>
                        <span className={styles.avatar}>
                            <div className={styles.profile}>
                                <div className={styles.sepera}></div>
                                <div className={styles.logout} onClick={() => {

                                    handleLogout()
                                }}>Đăng xuất</div>
                            </div>
                        </span>

                    </div>
                </div>
            </section>
            < CreateBoardDialog />
        </header>
    );
}

export default Header;