import { h, Component } from 'preact'
import { route } from 'preact-router'
import * as THREE from 'three';

import Game from '../game'


export default
    class GameView extends Component<any, any> {

    constructor() {
        super();
    }

    componentDidMount() {        
        var game = new Game(this.props.uuid);

        game.Start()
    }

    render(): any {

        return;
    }
}