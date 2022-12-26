import styles from "./sidebar.module.scss"
import { ImTable, ImHome } from 'react-icons/im';
import { IoIosArrowDown, IoIosArrowUp, IoIosPeople } from 'react-icons/io';
import { Link, NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import { AppContext } from "../../../../Context/AppContext";
import CreateGruopDialog from "../../../Dialog/CreateGroupDialog/CreateGruopDialog";
const data = [
    {
        name: 'Bảng',
        url: '/board',
        icon: <ImTable />

    },
    {
        name: 'Trang chủ',
        url: '/home',
        icon: <ImHome />
    }
]

const dataWorkItem = [
    {
        name: 'Bảng',
        icon: <ImTable />

    },
    {
        name: 'Thành viên',
        icon: <IoIosPeople />
    }
]

function Sidebar() {
    const [active, setActive] = useState(0)
    const url = window.location.pathname
    const { listWork, openDialog, setOpenDialog } = useContext(AppContext)

    const handleActive = (workId) => {
        if (active == workId) {
            setActive(0)
        } else {
            setActive(workId)
        }
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.main}>
                <ul className={styles.mainwrapper}>
                    {
                        data.map((item, index) => {
                            return (
                                <li >
                                    <NavLink key={item.url} className={url === item.url ? styles.active : ''} to={item.url}>
                                        <span className={styles.icon}>{item.icon}</span>
                                        <span className={styles.title}>{item.name}</span>
                                    </NavLink>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
            <hr />
            <div className={styles.work}>
                <div>
                    <div className={styles.addwork}>
                        <span>Các nhóm hoạt động</span>
                        <button onClick={() => setOpenDialog('group')}>+</button>
                        < CreateGruopDialog />

                    </div>
                    {
                        listWork?.map(work => (
                            <div className={styles.wrapperwork}>
                                <div className={styles.workitem} onClick={() => handleActive(work._id)}>
                                        <span className={styles.icon}>T</span>
                                        <span className={styles.title}> {work.name}</span>

                                    <span className={styles.arrow}>{active == work._id ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
                                </div>

                                {
                                    active == work._id ? <ul>{
                                        dataWorkItem.map((work, index) => (
                                            <li>
                                                <Link key={index} to='/board'>
                                                    <span className={styles.icon}>{work.icon}</span>
                                                    <span className={styles.title}>{work.name}</span>
                                                </Link>
                                            </li>
                                        ))
                                    }

                                    </ul> : <></>
                                }

                            </div>
                        ))
                    }
                </div>

            </div>
        </div >
    );
}

export default Sidebar;