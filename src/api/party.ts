import api from './api'
import { AxiosPromise } from 'axios';


function Create(): AxiosPromise {
    return api.post("/party");
}

export default {
    Create
}