import { createStore } from 'vuex';
import { essays } from './essays';

export default createStore({
    state: {
        essays: essays
    },
    mutations: {},
    actions: {},
    getters: {}
});