import React, {useEffect, useRef, useState} from 'react';
import {useSelector} from "react-redux";
import * as d3 from "d3";
import * as d3array from "d3-array"
import RacingBar from "../charts/RacingBar";

function RacingBarCountiesVIS({stateName}) {
    const rawData = useSelector(state => state.rawDataCounties)
    const top = 10
    const k = 10
    const duration = 50
    const height = 430
    const width = 500
    const barSize = 35
    const margin = ({top: 16, right: 6, bottom: 6, left: 0})
    // const keyframes = [];

    const [prev, setPrev] = useState(0);
    const [next, setNext] = useState(0);
    const [keyframes, setKeyframes] = useState([]);

    /////////////////////////////Data Prep///////////////////////////////
    useEffect(()=>{


    if(rawData&&rawData.length>0) {
        //prepare data
        const MAData = rawData.filter((d)=>{
            return d.state === 'Massachusetts'
        })
        //add missing data
        let startDate = new Date("01/21/2020")
        let endDate = new Date ("01/31/2020")
        for (let day = startDate; day <= endDate; day.setDate(day.getDate() + 1)) {
            let dateStr = "" + day.getMonth()+1+"/"+day.getDate()+"/"+day.getFullYear()
            MAData.unshift({date:dateStr, county: "Suffolk", state: "Massachusetts",fips:"25025",cases:"0"})

        }


        console.log(MAData)
        //unique states
        //TODO use static array to imporove performance+
        const counties = new Set(MAData.map((d) => d.county))
        //console.log(states)

        // group by time
        const datevalues = Array.from(d3array.rollup(MAData, ([d]) => d.cases, d => d.date, d => d.county))
            .map(([date, data]) => [new Date(date), data])
            .sort(([a], [b]) => d3.ascending(a, b))

        //console.log(datevalues)

        //rank function
        const rank = (value) => {
            const data = Array.from(counties, county => ({county, value: value(county)}));
            data.sort((a, b) => d3.descending(a.value, b.value));
            for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(top, i);
            return data;
        }


        //keyframes
        // Since our rank helper above takes a function,
        // so we can use it to interpolate values linearly.
        // If aa is the starting value and bb is the ending value,
        // then we vary the parameter t \in [0,1]t∈[0,1] to compute the interpolated value a(1 - t) + bta(1−t)+bt.
        // For any missing data—remember, turnover—we treat the value as zero.

        let ka, a, kb, b;
        for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
            for (let i = 0; i < k; ++i) {
                const t = i / k;
                keyframes.push([
                    new Date(ka * (1 - t) + kb * t),
                    rank(name => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t)
                ]);
            }
        }
        keyframes.push([new Date(kb),
            rank(name => b.get(name) || 0)]);
        //console.log(keyframes)
        setKeyframes(keyframes)
        //name frames
        const nameframes = d3array.groups(keyframes.flatMap(([, data]) => data), d => d.county)
        // console.log(nameframes)


        //prev and next
        setPrev(new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a]))));
        const next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)))
          setNext(next);
    }
    },[rawData.length])


    return(
       <RacingBar prev={prev}
                  next={next}
                  keyframes={keyframes}
                  top={top}
                  height={height}
                  width={width}
                  barSize={barSize}
                  margin={margin}
                  duration={duration}
                  title={"COVID-19 By County in MA"}
                  fieldName={"county"}
       />
    )
}

export default RacingBarCountiesVIS;