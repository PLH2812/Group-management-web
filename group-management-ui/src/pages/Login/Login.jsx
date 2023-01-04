import { Fragment, useContext } from "react";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import {loginRequest} from "../../hooks/requests"
import { Link, useNavigate} from "react-router-dom";
import styles from './login.module.scss'
import { AppContext } from "../../Context/AppContext";
import { useCookies } from "react-cookie";

function Login() {
    const navigate = useNavigate()
    const {setRender, render} = useContext(AppContext)
    let email = ''
    let password = ''
    const login = async () => {
        let account = {
            email,
            password
        }
        const result = await loginRequest(account).then(response => response.json())
        const success = result.message
        if(success){
            localStorage.setItem('access_token', result.token)
            // localStorage.setItem('gmail', result.email)
            navigate('/home')
            setRender(!render)
        }else{
            alert(result.error)
        }
    }
    return (
        <Fragment>
            <h1 className="title">Đăng Nhập</h1>
            <div className={styles.wrapper}>
                <div className={styles.form}>
                    <input type="text" className={styles.email} placeholder="Nhập email" onChange={(e) => email = e.target.value} />
                    <input type="password" className={styles.password} placeholder="Nhập mật khẩu" onChange={(e) => password = e.target.value} />
                    <input type="button" className={styles.submit} onClick={login} value='Tiếp tục'>
                    </input>
                    <div className={styles.methodlogin}>
                        <div className={styles.separator}> HOẶC </div>
                        <div className={styles.oauth}>
                            <div className={styles.oauthfacebook}>
                                <span className={styles.icon}>
                                    <FaFacebook />
                                </span>
                                <> </>
                                <span> Tiếp tục với Facebook</span>
                            </div>
                            <div className={styles.oauthgoogle}>
                                <span className={styles.icon}>
                                    <FaGoogle />
                                </span>
                                <> </>
                                <span> Tiếp tục với Facebook</span>
                            </div>
                        </div>
                        <hr></hr>
                        <ul className={styles.link}>
                            <li className={styles.forgotpassword}>
                                <Link to="/resetpassword"> Quên mật khẩu </Link>
                            </li>
                            <li>
                                <Link to="/register"> Đăng kí tài khoản </Link>
                            </li>

                        </ul>
                    </div>
                </div>
            </div>
        </Fragment>

    );
}

export default Login;