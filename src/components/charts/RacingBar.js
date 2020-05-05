import React, {useRef} from 'react';
import {useSelector} from "react-redux";
import * as d3 from "d3";
import * as d3array from "d3-array"

function RacingBar({prev,next,keyframes,margin,barSize,width,height,duration,top,title}) {
  //  const rawData = useSelector(state => state.rawDataStates)
    const refDiv = useRef(null);
    if(prev && prev !== 0){

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
                .attr("height", "450")
                .attr("id", "racingbarchart");

            const visG = svg.append("g")
                .attr("id","mainchart")
                .attr("transform", "translate(0,55)")


            //title
            svg.append("text")
                .attr("transform", "translate(100,0)")
                .attr("x", 50)
                .attr("y", 50)
                .attr("font-size", "20px")
                .attr("class", "title")
                .text(title)

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