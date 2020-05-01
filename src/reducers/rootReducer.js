import {
    FETCH_DATA_SUCCESS,
    FETCH_DATA_FAIL,
    FETCH_DATA_PROCESS
} from "../actions/actions";

const initialState = {
    rawDataUS: {},
    rawDataStates: {},
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
             return {...state,[action.target]: action.payload,isLoading: false}
        }
        default:
            return state;
    }
}


export default rootReducer