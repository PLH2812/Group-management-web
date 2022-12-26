import { Link, useParams } from 'react-router-dom';
import styles from './sidebar.module.scss'
import clsx from 'clsx';
import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../../../Context/AppContext';
function SideBar() {
    const { boardSlug } = useParams()
    const { table, boardDetail, listWork } = useContext(AppContext)
    const [list, setList] = useState({})
    const stateWork = listWork.length > 0
    const stateTable = table.length > 0
    if (!stateWork || !stateTable) {
        return
    }

    const work1 = table.find(work => work.url === boardSlug)
    const work2 = listWork.find(work => work._id === work1.groupId)

    return (
        <>
            {
                <div className={styles.wrapper}>
                    <div className={styles.header}>
                        <span className={styles.icon}>{work2.name.charAt(0)}</span>
                        <span className={styles.title}>{work2.name}</span>
                    </div>
                    <hr />
                    <div className={styles.body}>
                        <div className={styles.first}>
                            <div className={styles.top}>
                                <span className={styles.title}>Các bảng của bạn</span>
                            </div>
                            <div className={styles.bottom}>
                                <ul>
                                    {
                                        table.map(board => {
                                            if(board.groupId === work2._id)
                                            {
                                                return (
                                                    <li className={boardSlug === board.url && styles.active}>
                                                        <Link to={`/board/${board.url}`} className={clsx(styles.link)}>
                                                            <span className={styles.icon}></span>
                                                            <span className={styles.title}>{board.name}</span>
                                                        </Link>
                                                    </li>
                                                )
                                            }

                                        })
                                    }
                                </ul>

                            </div>

                        </div>
                    </div>
                </div>
            }</>
    )




}

export default SideBar;