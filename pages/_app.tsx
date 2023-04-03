import '../styles/globals.css'
import type { AppProps } from 'next/app'

import {
  Authenticated,
  ConvexProviderWithAuth,
  ConvexReactClient,
  Unauthenticated,
  useConvexAuth,
} from 'convex/react'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import { ReactNode, useCallback, useEffect, useMemo } from 'react'

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
        domain="dev-8w162wmqtqxiwfe2.us.auth0.com"
        clientId="vyEEzrNW8FZCA7NnVPfVnV192gZcXpt8"
        redirectUri={
          global.window !== undefined
            ? global.window.location.origin
            : (null as any)
        }
        cacheLocation="localstorage"
      >
        <ConvexProviderWithAuth0 client={convex}>
          <Informer />
          <Unauthenticated2>
            <LoginButton />
          </Unauthenticated2>
          <Authenticated2>
            <Component {...pageProps} />
          </Authenticated2>
          <LogoutButton />
        </ConvexProviderWithAuth0>
      </Auth0Provider>
    </main>
  )
}

function Informer() {
  console.log(useAuth0())
  // const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0()
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     getAccessTokenSilently({
  //       detailedResponse: true,
  //       cacheMode: 'off',
  //     }).then((x) => console.log('Made it!', x))
  //   }
  // }, [isLoading, isAuthenticated, getAccessTokenSilently])
  console.log('wut', useConvexAuth())
  return <>Hello da</>
}

function LogoutButton() {
  const { logout } = useAuth0()
  return (
    <button
      onClick={() => {
        logout({ returnTo: global.window.location.origin } as any)
      }}
    >
      Log out
    </button>
  )
}

export default MyApp

/**
 * A wrapper React component which provides a {@link react.ConvexReactClient}
 * authenticated with Auth0.
 *
 * It must be wrapped by a configured `Auth0Provider` from `@auth0/auth0-react`.
 *
 * See [Convex Auth0](https://docs.convex.dev/auth/auth0) on how to set up
 * Convex with Auth0.
 *
 * @public
 */
export function ConvexProviderWithAuth0({
  children,
  client,
}: {
  children: ReactNode
  client: any
}) {
  return (
    <ConvexProviderWithAuth client={client} useAuth={useAuthFromAuth0}>
      {children}
    </ConvexProviderWithAuth>
  )
}

function useAuthFromAuth0() {
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0()
  const fetchAccessToken = useCallback(async () => {
    try {
      console.log('Fetching access token')
      try {
        const response = await getAccessTokenSilently({
          detailedResponse: true,
        })
        console.log('Got access token', response)
        if (!response) {
          return response
        }
        // console.log(hashCode(response.id_token))
        return response.id_token as string
      } catch (e) {
        console.error('Failed to fetch', e)
      }
      return null
    } catch (_error) {
      return null
    }
  }, [getAccessTokenSilently])
  return useMemo(
    () => ({ isLoading, isAuthenticated, fetchAccessToken }),
    [isLoading, isAuthenticated, fetchAccessToken]
  )
}

function hashCode(s: string) {
  for (var h = 0, i = 0; i < s.length; h &= h) h = 31 * h + s.charCodeAt(i++)
  return h
}
