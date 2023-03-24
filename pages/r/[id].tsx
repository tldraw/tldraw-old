import { createClient } from '@supabase/supabase-js'
import { TDDocument } from '@tldraw/tldraw'
import type { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import * as React from 'react'
import { LoadingScreen } from '~components/LoadingScreen'

const ReadOnlyMultiplayerEditor = dynamic(
	() => import('~components/ReadOnlyMultiplayerEditor'),
	{
		ssr: false,
	}
)

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_KEY!
)

interface RoomProps {
	id: string
	document: TDDocument | null
	error: boolean
}

export default function Room({ id, document, error }: RoomProps) {
	if (error || document === null) {
		return (
			<LoadingScreen>
				Error: Could not load data for room with id: {id}.
			</LoadingScreen>
		)
	}

	return (
		<>
			<Head>
				<title>tldraw - {id}</title>
			</Head>
			<ReadOnlyMultiplayerEditor roomId={id} document={document} />
		</>
	)
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const id = context.query.id?.toString()!

	const existingRoom = (await supabase
		.from(process.env.SUPABASE_TABLE!)
		.select('*')
		.eq('id', id)
		.maybeSingle()) as any

	if (existingRoom.error) {
		console.error(existingRoom.error)
		return { props: { error: true, room: null, roomId: id } }
	}

	const { data } = existingRoom.data.storage

	const document: TDDocument = {
		id,
		name: 'New Document',
		version: data.version,
		pages: {
			page: {
				id: 'page',
				name: 'Page 1',
				childIndex: 1,
				shapes: data.shapes.data,
				bindings: data.bindings.data,
			},
		},
		pageStates: {
			page: {
				id: 'page',
				selectedIds: [],
				camera: {
					point: [0, 0],
					zoom: 1,
				},
			},
		},
		assets: data.assets.data,
	}

	return { props: { error: false, document, id } }
}
