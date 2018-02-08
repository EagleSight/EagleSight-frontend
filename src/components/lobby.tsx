import {h, Component} from 'preact'
import {route} from 'preact-router'

import CreatePartyModal from './createPartyModal'

interface LobbyState {
    parties?: Array<any>
}

export default
class Lobby extends Component<any, LobbyState> {
    
    private ws : WebSocket;

    constructor() {
        super();

        this.state = {
            parties: null
        }
    }
    
    componentWillMount() {
        this.ws = new WebSocket('ws://' + window.location.hostname + ':1323/lobby/ws')

        this.ws.onmessage = (e) => {
            this.state.parties = JSON.parse(e.data);

            this.setState(this.state);
        }
    }

    displayParties() {
        if (this.state.parties === null) { // Loading
            return <div class="loading"></div>
        }

        console.log(this.state.parties);
        console.log(this.state.parties == []);

        if (this.state.parties instanceof Array && this.state.parties.length === 0) {
            return <span class="white">There are no open parties for the moment</span>
        }

        return <span class="white">{JSON.stringify(this.state.parties)}</span>
    }

    render(): any {

        const options = this.displayParties()

        return <div class="lobby">
           <h3 class="title">All open parties</h3>
           <div class="parties-grid">
           {options}
           </div>
           <CreatePartyModal/>
        </div>;
    }
}