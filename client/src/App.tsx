import React, { MemoExoticComponent, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, useLocation } from 'react-router-dom';
import Cell from './components/Cell';
import Home from './pages/Home';
//import './style/app.scss';

const App = () => {

	const pages: IPage[] = [
		{ path: '/', component: Home },
	];

	return (
		<Router>
			<section className='container'>
				<Switch>

					{pages.map(page =>
						<Route key={page.path} path={page.path}>
							<Page {...page} />
						</Route >
					)}

					<Route>
						<Cell area='page'>
							<h1 className='empty-info'>404 - Not Found</h1>
						</Cell>
					</Route>

				</Switch>
			</section>
		</Router>
	);
}

export interface IPage {
	path: string;
	component: (() => JSX.Element | null) | MemoExoticComponent<() => JSX.Element | null>;
	id?: string;
	text?: string;
}

const Page = (page: IPage) => {

	const path = useLocation().pathname.slice(1) + '/';
	const id = page.id ?? path.slice(0, path.indexOf('/'));

	useEffect(() => {
		document.title = id.charAt(0).toUpperCase() + id.slice(1).toLowerCase();
	}, [id]);

	return (
		<Cell area='page' id={id}>
			<page.component />
		</Cell>
	);
}

export default App;
