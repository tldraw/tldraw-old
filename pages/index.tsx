import dynamic from 'next/dynamic'
import Head from 'next/head'

const Editor = dynamic(() => import('~components/Editor'), {
	ssr: false,
}) as any

const Home = () => {
	return (
		<>
			<Head>
				<title>tldraw</title>
			</Head>
			<Editor id="home" />
		</>
	)
}

export default Home
