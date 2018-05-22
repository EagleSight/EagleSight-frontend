import { h, render } from 'preact';
import { Router } from 'preact-router';
import createHashHistory from 'history/createHashHistory';

import Login from "./components/login";
import Lobby from "./components/lobby";
import Party from "./components/party";
import GameView from "./components/game"


const Main = () => (
<div>
  <Router history={createHashHistory()}>
    <GameView path="/game/:id/:uuid"/>
    <Party path="/party/:id"/>
    <Lobby path="/lobby" />
    <Login default/>
  </Router>
</div>
)

render(<Main/>, document.body);
