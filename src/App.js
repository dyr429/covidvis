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
    const dataURLStates = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv"
    const dataURLUS = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv"

    const URLs = [{target:"rawDataStates",URL:dataURLStates},{target:"rawDataUS",URL:dataURLUS}]
    const dispatch = useDispatch()
    //new patern in D3V5. now use fetch and promise
    async function getAllUrls(urls) {
        let dataMap = {};
        try {
            let data = await Promise.all(
                urls.map(
                    record =>
                        d3.csv(record.dataURLUS)
                        .then((d)=>{
                            console.log(d)
                            return d
                        })));

            return (data)
        } catch (error) {
            console.log(error)
            throw (error)
        }
    }

    async function retrieveData(URLs){
        const rawdata =await getAllUrls(URLs)
        console.log(rawdata)

    }

    retrieveData(URLs)
    // const fetchData = async () => {
    //     try {
    //         const results = await Promise.all([
    //             d3.csv(dataURLUS),
    //             d3.csv(dataURLStates)
    //         ]);
    //
    //     } catch (err) {
    //         console.log(err);
    //     }
    //     // let p1 = d3.csv(dataURLUS)
    //     //     .then((data)=>{
    //     //         console.log(data)
    //     //         dispatch(fetchDataSuccessAC(data,"rawDataUS"))
    //     //     })
    //     // let p2 = d3.csv(dataURLStates)
    //     //     .then((data)=>{
    //     //         console.log(data)
    //     //         dispatch(fetchDataSuccessAC(data,"rawDataStates"))
    //     //     })
    // }

    //dispatch(fetchDataProcessAC())
    //fetchData()
  return (
    <div className="App">
        <Header ></Header>
        <Main ></Main>
        <Footer></Footer>

    </div>
  );
}

export default App;
