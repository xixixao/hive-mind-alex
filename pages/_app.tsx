import '../styles/globals.css'
import type { AppProps } from 'next/app'

import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithAuth0 } from 'convex/react-auth0'
import convexConfig from '../convex.json'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main>
      <h1>Hive Mind</h1>
      <p>
        Like{' '}
        <a href="https://www.nytimes.com/puzzles/spelling-bee">spelling bee</a>,
        but with friends!
      </p>
      <ConvexProviderWithAuth0
        client={convex}
        authInfo={convexConfig.authInfo[0]}
      >
        <Component {...pageProps} />
      </ConvexProviderWithAuth0>
    </main>
  )
}

export default MyApp
