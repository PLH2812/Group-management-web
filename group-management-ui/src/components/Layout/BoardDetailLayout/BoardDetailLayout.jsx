import Header from "../Header";
import SideBar from "./SideBar/SideBar";
import styles from "./boarddetaillayout.module.scss"
function BoardDetailLayout({children}) {
    return ( 
        <div className={styles.wrapper}>
            <Header/>
            <div className={styles.body}>
                <SideBar/>
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>
     );
}

export default BoardDetailLayout;