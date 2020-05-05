import {
    FETCH_DATA_SUCCESS,
    FETCH_DATA_FAIL,
    FETCH_DATA_PROCESS
} from "../actions/actions";

const initialState = {
    rawDataUS: {},
    rawDataStates: {},
    rawDataCounties: {},
    isLoading: false,

}


const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_DATA_PROCESS:
            return {...state,isLoading: true}
        case FETCH_DATA_FAIL: {
            return {...state,isLoading: false}
        }
        case FETCH_DATA_SUCCESS:{
             let newstate = {...state}
             //console.log(action)
             newstate["isLoading"] = false
             for(let i=0;i<action.targets.length;i++){
                 newstate[action.targets[i]] = action.payload[i]
             }
             return newstate
        }
        default:
            return state;
    }
}


export default rootReducer