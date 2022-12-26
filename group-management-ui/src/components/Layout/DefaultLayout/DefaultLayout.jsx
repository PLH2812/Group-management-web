import Header from "../Header";
import Sidebar from "./Sidebar";
import styles from "./defaultlayout.module.scss"
import CreateBoarDialog from "../../Dialog/CreateBoarDialog";

function DefaultLayout({children}) {
    return ( 
        <div>
            <Header></Header>
            <div className={styles.wrapper}>
                <Sidebar></Sidebar>
                <div className={styles.content}>{children}</div>
                {/* <CreateBoarDialog></CreateBoarDialog> */}
            </div>
        </div>
     )
}

export default DefaultLayout;