import {h, Component} from 'preact'
import {route} from 'preact-router'

export default
class Login extends Component<any, any> {
    login = () => {
        route('/lobby', true);
    }
    render(): any {        
        return <div>
            <div class="login-box">
            <h1 class="title">Eagle Sight</h1>
                <input type="text" placeholder="username"/>
                <input type="password" placeholder="password"/>
                <br/>
                <br/>
                <br/>
                <button class="login" onClick={this.login}>Login</button>
            </div>
        </div>;
    }
}