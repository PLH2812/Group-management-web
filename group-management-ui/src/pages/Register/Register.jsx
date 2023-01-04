import { Fragment } from "react";
import { registerRequest } from "../../hooks/requests"
import { Link, useNavigate } from "react-router-dom";
import styles from './register.module.scss'
function Register() {
    const navigate = useNavigate()
    let name = ''
    let email = ''
    let password = ''
    let repassword = ''
    const register = async () => {
        let account = {
            name,
            email,
            password
        }
        if (password === repassword) {

            const result = await registerRequest(account).then(response => response.json())
                .then(data => data)
                console.log(result);
            const success = result
            if (success) {
                alert('Đăng ký thành công!')
                navigate('/login')
            } else {
                alert('Đăng kí không thành công')
            }
        }
    }
    return (
        <Fragment>
            <h1 className="title">Đăng Ký</h1>
            <div className={styles.wrapper}>
                <div className={styles.form}>
                    <input type="text" className={styles.displayname} placeholder="Tên hiển thị" onChange={(e) => name = e.target.value} />
                    <input type="text" className={styles.email} placeholder="Nhập email" onChange={(e) => email = e.target.value} />
                    <input type="password" className={styles.password} placeholder="Nhập mật khẩu" onChange={(e) => password = e.target.value} />
                    <input type="password" className={styles.repassword} placeholder="Nhập lại mật khẩu" onChange={(e) => repassword = e.target.value} />
                    <input type="button" className={styles.submit} onClick={register} value='Tiếp tục'>
                    </input>
                    <hr></hr>
                    <ul className={styles.link}>
                        <li className={styles.forgotpassword}>
                            <Link to="/resetpassword"> Quên mật khẩu </Link>
                        </li>
                        <li>
                            <Link to="/login"> Đăng nhập </Link>
                        </li>

                    </ul>
                </div>
            </div>
        </Fragment>

    );
}

export default Register;