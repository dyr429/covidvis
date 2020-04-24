import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import { useSelector,useDispatch } from 'react-redux'
import * as d3 from 'd3';
import LoadingOverlay from 'react-loading-overlay';
import {fetchDataFailAC,fetchDataProcessAC,fetchDataSuccessAC} from "./actions/actions";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Main from "./components/Main";

function App() {
    const dataURL = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv"
    const isLoading = useSelector(state => state.isLoading)
    const dispatch = useDispatch()
    useEffect(() =>{
        dispatch(fetchDataProcessAC())
        fetchData()
    }
    );


    //new patern in D3V5. now use fetch and promise
    const fetchData = () => {
        d3.csv(dataURL)
            .then((data)=>{
                //console.log(data)
                dispatch(fetchDataSuccessAC(data))
            })

    }
  return (
    <div className="App">
        <Header ></Header>
        <Main ></Main>

        <Footer></Footer>

    </div>
  );
}

export default App;
