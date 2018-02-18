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
        this.ws = new WebSocket('ws://' + window.location.host + '/ws/lobby')

        this.ws.onmessage = (e) => {
            this.state.parties = JSON.parse(e.data);

            this.setState(this.state);
        }
    }

    displayParties() {
        if (this.state.parties === null) { // Loading
            return <div class="loading"></div>
        }

        if (this.state.parties instanceof Array && this.state.parties.length === 0) {
            return <span class="white">There are no open parties for the moment</span>
        }

        return this.state.parties.sort((a, b) => 
            1
        ).reverse().map(v => {
            return <div class="party-entry" onClick={this.goToWaitingRoom.bind(this, v.id)}>
                {v.terrain} ({v.seats})
                <br/>
                <br/>
                <div>
                    <div class="blue">{v.A}</div>
                    <div class="no-team">{v.noteam}</div>
                    <div class="red">{v.B}</div>
                </div>
            </div>
        });
    }

    goToWaitingRoom(id: string) {
        console.log(id);
        route('/party/' + id, true);
    }

    render(): any {

        return <div class="lobby">
           <h3 class="title">All open parties</h3>
           <div class="parties-grid">
           {this.displayParties()}
           </div>
           <CreatePartyModal/>
        </div>;
    }
}