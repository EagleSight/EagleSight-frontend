import { h, render } from 'preact';
import { Router } from 'preact-router';
import createHashHistory from 'history/createHashHistory';

import Login from "./components/login";
import Lobby from "./components/lobby";

const Main = () => (
<div>
  <Router history={createHashHistory()}>
    <Lobby path="/lobby" />
    <Login default/>
  </Router>
</div>
)

render(<Main/>, document.body);
