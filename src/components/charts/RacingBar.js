import React, {useRef} from 'react';
import {useSelector} from "react-redux";
import * as d3 from "d3";
import * as d3array from "d3-array"

function RacingBar() {
    const rawData = useSelector(state => state.rawData)
    const refDiv = useRef(null);
    const top = 10
    const k = 10
    const duration = 50
    const height = 600
    const width = 600
    const barSize = 48
    const margin = ({top: 16, right: 6, bottom: 6, left: 0})
   // console.log(rawData);

    if(rawData&&rawData.length>0){
        //prepare data

        //unique states
        //TODO use static array to imporove performance+
        const states = new Set(rawData.map((d)=>d.state))
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // For drawing

        const bars = (svg) => {
            let bar = svg.append("g")
                .attr("fill-opacity", 0.6)
                .selectAll("rect");

            return ([date, data], transition) => bar = bar
                .data(data.slice(0, top), d => d.name)
                .join(
                    enter => enter.append("rect")
                        .attr("fill", color)
                        .attr("height", y.bandwidth())
                        .attr("x", x(0))
                        .attr("y", d => y((prev.get(d) || d).rank))
                        .attr("width", d => x((prev.get(d) || d).value) - x(0)),
                    update => update,
                    exit => exit.transition(transition).remove()
                        .attr("y", d => y((next.get(d) || d).rank))
                        .attr("width", d => x((next.get(d) || d).value) - x(0))
                )
                .call(bar => bar.transition(transition)
                    .attr("y", d => y(d.rank))
                    .attr("width", d => x(d.value) - x(0)));
        }


        //Label on bar end
        function labels(svg) {
            let label = svg.append("g")
                .style("font", "bold 12px var(--sans-serif)")
                .style("font-variant-numeric", "tabular-nums")
                .attr("text-anchor", "start")
                .selectAll("text");

            return ([date, data], transition) => label = label
                .data(data.slice(0, top), d => d.state)
                .join(
                    enter => enter.append("text")
                        .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
                        .attr("y", y.bandwidth() / 2)
                        .attr("x", 6)
                        .attr("dy", "-0.25em")
                        .text(d => d.state)
                        .call(text => text.append("tspan")
                            .attr("fill-opacity", 0.7)
                            .attr("font-weight", "normal")
                            .attr("x", 6)
                            .attr("dy", "1.15em")),
                    update => update,
                    exit => exit.transition(transition).remove()
                        .attr("transform", d => `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`)
                        .call(g => g.select("tspan").tween("text", d => textTween(d.value, (next.get(d) || d).value)))
                )
                .call(bar => bar.transition(transition)
                    .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
                    .call(g => g.select("tspan").tween("text", d => textTween((prev.get(d) || d).value, d.value))))
        }

        function textTween(a, b) {
            const i = d3.interpolateNumber(a, b);
            return function(t) {
                this.textContent = formatNumber(i(t));
            };
        }

        const formatNumber = d3.format(",d")


        function axis(svg) {
            const g = svg.append("g")
                .attr("transform", `translate(0,${margin.top})`);

            const axis = d3.axisTop(x)
                .ticks(width / 160)
                .tickSizeOuter(0)
                .tickSizeInner(-barSize * (top + y.padding()));

            return (_, transition) => {
                g.transition(transition).call(axis);
                g.select(".tick:first-of-type text").remove();
                g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
                g.select(".domain").remove();
            };
        }


        function ticker(svg) {
            const now = svg.append("text")
                .style("font", `bold ${barSize}px var(--sans-serif)`)
                .style("font-variant-numeric", "tabular-nums")
                .attr("text-anchor", "end")
                .attr("x", width - 6)
                .attr("y", margin.top + barSize * (top - 0.45))
                .attr("dy", "0.32em")
                .attr("id", "ticker")
                .text(formatDate(keyframes[0][0]));

            return ([date], transition) => {
                transition.end().then(() => now.text(formatDate(date)));
            };
        }
        const formatDate = d3.utcFormat("%B %d, %Y")

        const color = (d) => {
            let str = d.state
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



        const x = d3.scaleLinear([0, 1], [margin.left, width - margin.right])
        const y = d3.scaleBand()
            .domain(d3.range(top + 1))
            .rangeRound([margin.top, margin.top + barSize * (top + 1 + 0.1)])
            .padding(0.1)


        const createChart = async () =>{
            //d3.select(refDiv.current).remove()
           // console.log("draw")
            const svg = d3
                .select(refDiv.current)
                .append("svg")
                .attr("width", "600")
                .attr("height", "600")
                .attr("id", "racingbarchart");

            const visG = svg.append("g")
                .attr("id","mainchart")
                .attr("transform", "translate(0,100)")


            //title
            svg.append("text")
                .attr("transform", "translate(200,0)")
                .attr("x", 50)
                .attr("y", 50)
                .attr("font-size", "20px")
                .attr("class", "title")
                .text("COVID-19 Racing Bar")

            const updateBars = bars(visG);
            const updateAxis = axis(visG);
            const updateLabels = labels(visG);
            const updateTicker = ticker(visG);
            await visG.node();
            for (let i = 0;i<keyframes.length-1;i++) {
                let keyframe = keyframes[i]
              //  console.log("draw frame")
               // console.log(keyframe)
                const transition = visG.transition()
                    .duration(duration)
                    .ease(d3.easeLinear);

                // Extract the top bar’s value.
                x.domain([0, keyframe[1][0].value]);

                updateAxis(keyframe, transition);
                updateBars(keyframe, transition);
                updateLabels(keyframe, transition);
                updateTicker(keyframe, transition);
                //invalidation.then(() => svg.interrupt());
                await transition.end();
            }




        }
        createChart()
    }



    return (
        <div ref={refDiv}>

        </div>
    );
}

export default RacingBar;