import { h, Component } from 'preact'
import { route } from 'preact-router'

import api from '../api'

interface CreatePartyModalState {
    open: boolean;
    creationInProgress: boolean;
    partyParameters: NewPartyParameters;
}

interface NewPartyParameters {
    terrain: string,
    playersCount: number;
}

export default
    class CreatePartyModal extends Component<any, CreatePartyModalState> {
    constructor() {
        super()

        this.state = {
            open: false,
            creationInProgress: false,
            partyParameters: {
                terrain: '',
                playersCount: 0
            }
        }
    }

    openModal() {
        this.state.open = true;

        this.setState(this.state);
    }

    backgroundClick(e: any) {
        if (e.target.classList.contains('modal')) {

            this.state = {
                open: false,
                creationInProgress: false,
                partyParameters: {
                    terrain: '',
                    playersCount: 0
                }
            };

            this.setState(this.state);
        }
    }

    changeTerrain(e: any) {
        this.state.partyParameters.terrain = e.target.value
        this.setState(this.state);
    }

    changePlayersCount(e: any) {
        this.state.partyParameters.playersCount = parseInt(e.target.value);
        this.setState(this.state);
    }

    formCompleted(): boolean {
        if (this.state.partyParameters.terrain === '') {
            return false;
        }

        if (this.state.partyParameters.playersCount === 0) {
            return false;
        }

        return true
    }

    createParty() {
        if (this.state.creationInProgress) {
            return
        }

        this.state.creationInProgress = true;
        this.setState(this.state, () => {

            api.party.Create()
            .then(resp => {
                
                if (resp.status === 201) { // Created
                    route('/party/' + resp.data.uuid, true)
                }

                this.state.creationInProgress = false;
                this.setState(this.state);
            })
            .catch(resp => {
                this.state.creationInProgress = false;
                this.setState(this.state);
            })

        });
    }

    render(props: any, state: CreatePartyModalState): any {

        return <div>
            <button class="create-party" onClick={this.openModal.bind(this)}>
                + Create a party
            </button>
            <div class={'modal ' + (state.open ? 'open' : '')} onClick={this.backgroundClick.bind(this)}>
                <div class="modal-body">
                    <h1>New Party!</h1>
                    <hr/>
                    <br/>

                    <label>Terrain</label> <br/>
                    <select onChange={this.changeTerrain.bind(this)} value={state.partyParameters.terrain}>
                        <option value="">Select a terrain...</option>
                        <option value="chamonix">Chamonix</option>
                    </select>

                    <br/>
                    <br/>

                    <label>Number of players</label> <br/>
                    <select onChange={this.changePlayersCount.bind(this)} value={state.partyParameters.playersCount.toString()}>
                        <option value="0">Select a number...</option>
                        <option value="1">1 (devs only)</option>
                        <option value="2">2</option>
                        <option value="4">4</option>
                        <option value="6">6</option>
                        <option value="8">8</option>
                    </select>
                    <br/>
                    <br/>
                    <br/>
                    {this.formCompleted() ? 
                        <button onClick={this.createParty.bind(this)}>
                            {state.creationInProgress ? 'Creation in progress...' : 'Create the party'}
                        </button> 
                    : null}
                </div>
            </div>
        </div>;
    }
}