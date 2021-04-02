import React, { ReactNode } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import styled, { createGlobalStyle } from "styled-components";

type Props = {
  children?: ReactNode
  title?: string
}


const Layout = ({ children, title = 'This is the default title' }: Props) => (
  <div>
    <GlobalStyle />
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <Header>
      <nav>
        <Link href="/frequencies">
          <a>Frequencies</a>
        </Link>
        <Link href="/keywords">
          <a>Keywords</a>
        </Link>
        <Link href="/similarity">
          <a>Similarity</a>
        </Link>
        <Link href="/tree-parser">
          <a>Tree Parser</a>
        </Link>
        <Link href="/tree-parser-with-synonyms">
          <a>Tree Parser With Synonyms</a>
        </Link>
      </nav>
    </Header>
    <Body>{children}</Body>

    <footer>

    </footer>
  </div>
)

const Header = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.5em;
  
  nav{
    width: 1000px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 2em 0em 3em 0em;
  }

  a, a:visited, a:active{
    color: #dbf6e9;
    margin-left: 1em;
    margin-right: 1em;
  }
`

const Body = styled.div`
display: flex;
justify-content: center;
align-items: center;
`

const GlobalStyle = createGlobalStyle`
body{
  background-color: #2b2e4a;
  padding-bottom: 5em;
}
`

export default Layout
