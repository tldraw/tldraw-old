import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import * as React from 'react'

export default function RandomRoomPage() {
  return (
    <>
      <Head>
        <title>tldraw</title>
      </Head>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Route to a room with that id
  context.res.setHeader('Location', `/`)
  context.res.statusCode = 307

  return {
    props: {},
  }
}
