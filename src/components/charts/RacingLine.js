import React, {useRef} from 'react';
import {useSelector} from "react-redux";
import * as d3 from "d3";
import * as d3array from "d3-array"
function RacingLine() {
    const rawDataStates = useSelector(state => state.rawDataStates)
    const rawDataUS = useSelector(state => state.rawDataUS)
    const refDiv = useRef(null);
    const top = 10
    const k = 10
    const duration = 50

    const barSize = 48

    console.log(rawDataStates);


    let update = ()=>{console.log("update")};
    if (rawDataUS && rawDataUS.length > 0) {
        //////////////////////////////Draw
        const data = rawDataUS.map((d)=>{
            return { date : d3.timeParse("%Y-%m-%d")(d.date), cases : d.cases,deaths:d.deaths }
        })

        var margin = {top: 10, right: 30, bottom: 50, left: 60},
            width = 1000 - margin.left - margin.right,
            height = 200 - margin.top - margin.bottom;

       // append the svg object to the body of the page
        const svg = d3
                    .select(refDiv.current)
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

        //title
        svg.append("text")
            .attr("transform", "translate(300,-40)")
            .attr("x", 50)
            .attr("y", 50)
            .attr("font-size", "20px")
            .attr("class", "title")
            .text("COVID-19 Total")


        // Add Y axis
        let y = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return +d.cases; })])
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y))

        // X axis
        let x = d3.scaleTime()
            .domain(d3.extent(data, function(d) { return d.date; }))
            .range([ 0, width ]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");

        // Add  lines
        const pathCase = svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function(d) { return x(d.date) })
                .y(function(d) { return y(d.cases) })
            )

        let totalLength = pathCase.node().getTotalLength();
        pathCase
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(80000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0)


    }
    return (
        <div ref={refDiv}>
            <multiselect />
        </div>
    );
}

export default RacingLine