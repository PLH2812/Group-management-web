import './main.scss'

function LoginLayout({ children }) {
    
    return (
        <div className="wrapper">
            <div className="container">
                <div className="left">
                    {/* <img src="https://haycafe.vn/wp-content/uploads/2022/03/anh-lam-viec-nhom-1.jpg" alt="" /> */}
                    <div className='image'></div>
                </div>
                <div className="right">
                    {
                        children
                    }
                </div>
            </div>
            {/* <Footer /> */}
        </div>
    );
}

export default LoginLayout;