import { Outlet, Navigate } from "react-router-dom";

const PrivateRoutes = () => {
    const auth = { 'token': localStorage.getItem('access_token') }
    return (
        !auth.token ? <Navigate to='/login'/>: <Outlet />
    )
}

export default PrivateRoutes