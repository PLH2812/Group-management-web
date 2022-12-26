import { Fragment } from "react";
import { Link } from "react-router-dom";
import styles from './forgotpassword.module.scss'
const ForgotPassword = () => {
    return ( 
        <Fragment>
            <h1 className="title">Quên Mật Khẩu</h1>
            <div className={styles.wrapper}>
                <div className={styles.form}>
                    <input type="text" className={styles.email} placeholder="Nhập email" onChange={(e) => email = e.target.value} />
                    <input type="button" className={styles.submit}  value='Tiếp tục'>
                    </input>
                    <hr></hr>
                    <ul className={styles.link}>
                        <li className={styles.forgotpassword}>
                            <Link to="/login"> Đăng nhập </Link>
                        </li>
                        <li>
                            <Link to="/register"> Đăng ký </Link>
                        </li>

                    </ul>
                </div>
            </div>
        </Fragment>
     );
}
 
export default ForgotPassword;