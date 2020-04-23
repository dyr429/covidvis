import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import { useSelector,useDispatch } from 'react-redux'
import * as d3 from 'd3';
import LoadingOverlay from 'react-loading-overlay';
import {fetchDataFailAC,fetchDataProcessAC,fetchDataSuccessAC} from "./actions/actions";

function App() {
    const dataURL = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv"
    const isLoading = useSelector(state => state.isLoading)
    const dispatch = useDispatch()
    useEffect(() =>{
        dispatch(fetchDataProcessAC())
        fetchData()
    }
    );

    const fetchData = () => {
        d3.csv(dataURL,(data)=>{
            console.log(data)
            dispatch(fetchDataSuccessAC(data))
        })
    }
  return (
    <div className="App">
        <header className={"App-header"}>
            ff
        </header>
        <div className={"container"}>
                <img src={logo} className="App-logo" alt="logo" />

        </div>

    </div>
  );
}

export default App;
