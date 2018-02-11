import api from './api'
import { AxiosPromise } from 'axios';


function Create(body: any): AxiosPromise {
    return api.post("/party", body);
}

export default {
    Create
}