import '../styles/globals.css'
import type { AppProps } from 'next/app'

import { Authenticated, ConvexReactClient, Unauthenticated } from 'convex/react'
import { ConvexProviderWithAuth0 } from 'convex/react-auth0'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'

function LoginButton() {
  const { loginWithRedirect } = useAuth0()
  return (
    <button
      onClick={() => {
        loginWithRedirect()
      }}
    >
      Log in
    </button>
  )
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
  verbose: true,
})

const Unauthenticated2 = Unauthenticated as any
const Authenticated2 = Authenticated as any

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main>
      <h1>Hive Mind</h1>
      <p>
        Like{' '}
        <a href="https://www.nytimes.com/puzzles/spelling-bee">spelling bee</a>,
        but with friends!
      </p>
      <Auth0Provider
        domain="dev-n0ixyn7ordl7a0bi.us.auth0.com"
        clientId="mJOXmS1kjcMZ0QGyttvkUxEY4lovikRZ"
        authorizationParams={{
          redirect_uri:
            global.window !== undefined
              ? global.window.location.origin
              : (null as any),
        }}
      >
        <ConvexProviderWithAuth0 client={convex}>
          <Unauthenticated2>
            <LoginButton />
          </Unauthenticated2>
          <Authenticated2>
            <Component {...pageProps} />
          </Authenticated2>
        </ConvexProviderWithAuth0>
      </Auth0Provider>
    </main>
  )
}

export default MyApp
