import type { AppProps } from "next/app"
import { Global } from "@emotion/react"
import { GlobalStyles } from "twin.macro"
import { MDXProvider } from "@mdx-js/react"

import { ThemeProvider } from "../components/Theme"
import baseStyles from "./../components/baseStyles"

const components = {}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <ThemeProvider>
        <GlobalStyles />
        <Global styles={baseStyles} />
        <MDXProvider components={components}>
          <Component {...pageProps} />
        </MDXProvider>
      </ThemeProvider>
    </>
  )
}

export default MyApp
