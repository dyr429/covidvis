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
    const height = 400
    const width = 400
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

        //unique states
        //TODO use static array to imporove performance+
        const states = new Set(rawData.map((d) => d.state))
        //console.log(states)

        // group by time
        const datevalues = Array.from(d3array.rollup(rawData, ([d]) => d.cases, d => d.date, d => d.state))
            .map(([date, data]) => [new Date(date), data])
            .sort(([a], [b]) => d3.ascending(a, b))

        //console.log(datevalues)

        //rank function
        const rank = (value) => {
            const data = Array.from(states, state => ({state, value: value(state)}));
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
        const nameframes = d3array.groups(keyframes.flatMap(([, data]) => data), d => d.state)
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
                  title={"COVID-19 By County"}
       />
    )
}

export default RacingBarCountiesVIS;