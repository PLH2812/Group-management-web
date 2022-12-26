import React, { useContext } from 'react';
import styles from './boardcard.module.scss'
import { Link } from 'react-router-dom';
import { AppContext } from '../../Context/AppContext';
const BoardCard = ({ board }) => {
    const {getIdBoard} = useContext(AppContext)
    return (
        <Link to={`/board/${board.url}`} className={styles.card} onClick={()=>getIdBoard(board)}>
            <span>{board.name}</span>
            {/* <span className={styles.star}><FaRegStar/></span> */}
        </Link>
    );
}

export default BoardCard;