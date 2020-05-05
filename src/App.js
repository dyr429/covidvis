import React, {useEffect} from 'react';
import './App.css';
import { useSelector,useDispatch } from 'react-redux'
import * as d3 from 'd3';
import LoadingOverlay from 'react-loading-overlay';
import {fetchDataFailAC,fetchDataProcessAC,fetchDataSuccessAC} from "./actions/actions";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Main from "./components/Main";
import Col from "react-bootstrap/Col";

function App() {
    const dataURLStates = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv"
    const dataURLUS = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv"
    const dataURLCounties = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv"
    const URLs = [dataURLUS,dataURLStates,dataURLCounties]
    const targets = ["rawDataUS","rawDataStates","rawDataCounties"]
    const dispatch = useDispatch()
    //new patern in D3V5. now use fetch and promise
    async function getAllUrls(urls) {
        try {
            let data = await Promise.all(
                urls.map(
                    url =>
                        d3.csv(url)
                        .then((d)=>{
                            //console.log(d)
                            return d
                        })));
            return data
        } catch (error) {
            console.log(error)
            dispatch(fetchDataFailAC())
        }
    }

    async function retrieveData(URLs){
        const rawdata =await getAllUrls(URLs)
       console.log(rawdata)
        dispatch(fetchDataSuccessAC(rawdata,targets))

    }

    retrieveData(URLs)
  return (
    <div className="App">
        <Header ></Header>
        <Main ></Main>
        <Footer></Footer>


    </div>
  );
}

export default App;
