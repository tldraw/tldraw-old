import { Utils } from '@tldraw/core'
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
	const id = context.query.id?.toString()!

	// Route to a room with that id
	context.res.setHeader('Location', `/r/${Utils.lns(id)}`)
	context.res.statusCode = 307

	return {
		props: {},
	}
}
