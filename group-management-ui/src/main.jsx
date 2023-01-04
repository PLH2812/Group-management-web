import React from 'react'
import { CookiesProvider } from 'react-cookie'
import ReactDOM from 'react-dom/client'
import App from './App'
import GlobalStyles from "./components/GlobalStyles"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CookiesProvider>
      <GlobalStyles>
        <App />
      </GlobalStyles>
    </CookiesProvider>
  </React.StrictMode>
)
