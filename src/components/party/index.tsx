import {h, Component} from 'preact'
import {route} from 'preact-router'

import WaitingRoom from './waitingRoom';

const PARTY_STATUS = {
    loading: 0,
    waitingRoom: 1,
    preparing: 2,
    game: 3,
    finished: 4
}

interface PartyState {
    status: number;
}

export default
class Party extends Component<any, PartyState> {
    
    constructor() {
        super();

        this.state = {
            status: 0
        }
    }
    
    render(props: any, state: PartyState): any {

        if (state.status === PARTY_STATUS.loading) {
            return <div style="text-align: center;padding: 50px;">
                <div class="loading"></div>
                <br/>
                <br/>
                Loading the party...
            </div>
        }
        
        if (state.status === PARTY_STATUS.waitingRoom) {
            return <WaitingRoom/>
        }

        if (state.status === PARTY_STATUS.finished) {
            return <div>This party is finished.</div>
        }

        return <div>Oops. Something went wrong...</div>
    }
}