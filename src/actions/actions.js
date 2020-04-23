export const FETCH_DATA_SUCCESS = 'FETCH_DATA_SUCCESS'
export const FETCH_DATA_FAIL = 'FETCH_DATA_FAIL'
export const FETCH_DATA_PROCESS = 'FETCH_DATA_PROCESS'
/*
 * action creators
 */
export function fetchDataSuccessAC(payload){
    return {
        type: FETCH_DATA_SUCCESS,
        payload
    }
}

export function fetchDataFailAC(){
    return {
        type: FETCH_DATA_FAIL,
    }
}


export function fetchDataProcessAC(){
    return {
        type: FETCH_DATA_SUCCESS,
    }
}


