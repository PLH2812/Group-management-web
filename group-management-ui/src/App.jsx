import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { DefaultLayout, LoginLayout } from "./components/Layout"
import PrivateRoutes from "./routes/PrivateRoutes"
import Register from "./pages/Register"
import Login from "./pages/Login"
import Home from "./pages/Home"
import Board from "./pages/Board"
import ForgotPassword from "./pages/ForgotPassword"
import BoardDetailLayout from "./components/Layout/BoardDetailLayout"
import BoardDetail from "./pages/BoardDetail/BoardDetail"
import { AppProvider } from "./Context/AppContext"
import { useState, useEffect } from "react"
function App() {

  const auth = { 'token': localStorage.getItem('access_token') }
  return (
    <AppProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route element={<PrivateRoutes/>}>
              <Route path="/home" element={<AppProvider><DefaultLayout><Home /></DefaultLayout></AppProvider>}></Route>
              <Route path="/board" element={<DefaultLayout><Board /></DefaultLayout>}>
              </Route>
            </Route>
            <Route path="/login" element={!auth.token ? <LoginLayout><Login /></LoginLayout> : <Navigate to="/home" />}></Route>
            <Route path="/register" element={!auth.token ? <LoginLayout><Register /></LoginLayout> : <Navigate to="/home" />}></Route>
            <Route path="/resetpassword" element={!auth.token ? <LoginLayout><ForgotPassword /></LoginLayout> : <Navigate to="/home" />}></Route>
            <Route path="/board/:boardSlug" element={<BoardDetailLayout><BoardDetail /></BoardDetailLayout>}></Route>
          </Routes>
        </div>
      </Router>
    </AppProvider>
  )

}

export default App
