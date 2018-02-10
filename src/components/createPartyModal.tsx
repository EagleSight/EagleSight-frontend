import { h, Component } from 'preact'
import { route } from 'preact-router'

interface CreatePartyModalState {
    open: boolean;
}

export default
    class CreatePartyModal extends Component<any, CreatePartyModalState> {
    constructor() {
        super()

        this.state = {
            open: false
        }
    }

    openModal() {
        this.state.open = true;

        this.setState(this.state);
    }

    backgroundClick(e: any) {
        if (e.target.classList.contains('modal')) {
            this.state.open = false;

            this.setState(this.state);
        }
    }

    createParty() {
        fetch('/api/party', {
            method: 'POST'
        }).then(resp => resp.json()).then(json => {
            route('/party/' + json.uuid)
        })
    }

    render(props: any, state: CreatePartyModalState): any {

        return <div>
            <button class="create-party" onClick={this.openModal.bind(this)}>
                + Create a party
            </button>
            <div class={'modal ' + (state.open ? 'open' : '')} onClick={this.backgroundClick.bind(this)}>
                <div class="modal-body">
                    <h1>New Party!</h1>
                    <button onClick={this.createParty}>Create the party</button>
                </div>
            </div>
        </div>;
    }
}