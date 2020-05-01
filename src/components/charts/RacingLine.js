import React, {useRef} from 'react';
import {useSelector} from "react-redux";
import * as d3 from "d3";
import * as d3array from "d3-array"
function RacingLine() {
    const rawDataStates = useSelector(state => state.rawDataStates)
    const refDiv = useRef(null);
    const top = 10
    const k = 10
    const duration = 50

    const barSize = 48
    var margin = {top: 10, right: 30, bottom: 30, left: 50},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    console.log(rawDataStates);


    let update = ()=>{console.log("update")};
    if (rawDataStates && rawDataStates.length > 0) {
        //prepare data

        //unique states
        //TODO use static array to imporove performance+
        const states = new Set(rawDataStates.map((d) => d.state))
        //console.log(states)

        // group by time
        const datevalues = Array.from(d3array.rollup(rawDataStates, ([d]) => d.cases, d => d.date, d => d.state))
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
        const keyframes = [];
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


        //name frames
        const nameframes = d3array.groups(keyframes.flatMap(([, data]) => data), d => d.state)
        // console.log(nameframes)


        //prev and next
        const prev = new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])))
        const next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)))



        function getStateDataArray(city){
            const stateData = []
            keyframes.map(function (d) {
                d[1].forEach(function (k) {
                    if(k.state===city)
                        stateData.push(k.value)
                })
            })
            return stateData;
        }

        const NYData = getStateDataArray("New York")

        //TODO  above code move to a data prep function
        //////////////////////////////Draw



// set the dimensions and margins of the graph
        var margin = {top: 10, right: 30, bottom: 30, left: 50},
            w = 600 - margin.left - margin.right,
            h = 600 - margin.top - margin.bottom;

        const color = (d) => {

            let str = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            let hash = 0;
            for (var i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            var colour = '#';
            for (var i = 0; i < 3; i++) {
                var value = (hash >> (i * 8)) & 0xFF;
                colour += ('00' + value.toString(16)).substr(-2);
            }
            return colour;
        }

        const svg = d3
            .select(refDiv.current)
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("id", "visualization");

        var x = d3.scaleLinear().domain([0, NYData.length]).range([0, w]);
        var y = d3.scaleLinear().domain([0, d3.max(NYData)]).range([h - 10,0]);

        var line = d3.line()
            .x(function(d,i) {return x(i);})
            .y(function(d) {return y(d);})
            .curve(d3.curveNatural)

        // data is created inside the function so it is always unique
        let repeat = () => {
            let dataArray = []
            for(let i=0;i<5;i++) {
                var data = d3.range(11).map(function () {
                    return Math.random() * 10
                })
                dataArray.push(data)
            }

            // Set a light grey class on old paths
            svg.selectAll("path").attr("class", "old");
            //console.log(state)

                let path = svg.append("path")
                    .attr("d", line(NYData))
                    .attr("stroke", color)
                    .attr("stroke-width", "2")
                    .attr("fill", "none");

                let totalLength = path.node().getTotalLength();

                path
                    .attr("stroke-dasharray", totalLength + " " + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(40000)
                    .ease(d3.easeLinear)
                    .attr("stroke-dashoffset", 0)


        };
        repeat();
    }
    return (
        <div ref={refDiv}>
            <multiselect />
        </div>
    );
}

export default RacingLine