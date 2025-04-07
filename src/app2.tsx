import LogtoClient from '@logto/browser';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { useEffect } from 'react';

const authBaseUrl = 'http://localhost:3001';
const apiBaseUrl = 'http://localhost:8080';

const logtoClient = new LogtoClient({
  endpoint: authBaseUrl,
  appId: 'rfb5daimf4vpg3ntvwt8y',
  scopes: ['book:read'],
  resources: [apiBaseUrl]
});

function App() {

  const signIn = async () => {
    await logtoClient.handleSignInCallback(window.location.href)
    window.location.href = '/';
    getInfo();
  }
  const getInfo = async () => {
    const userInfo = await logtoClient.getIdTokenClaims();
    const token = await logtoClient.getAccessToken(apiBaseUrl)

    const jwks = createRemoteJWKSet(new URL(`${authBaseUrl}/oidc/jwks`));
    const { payload } = await jwtVerify(token, jwks)
  
    console.log(userInfo, token, payload)
  }

  const logout = () => {
    logtoClient.signOut(window.location.href)
  }

  useEffect(() => {
    if (window.location.pathname === '/callback') {
      signIn()
    } else {
      logtoClient.isAuthenticated().then(isAuth => {
        if (isAuth) {
          getInfo()
        } else {
          logtoClient.signIn('http://localhost:5173/callback');
        }
      })
    }
  }, [])

  return (
    <div>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

export default App
