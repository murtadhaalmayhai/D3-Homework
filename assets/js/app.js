// @TODO: YOUR CODE HERE!
const svgWidth = 960;
const svgHeight = 500;

const margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
const svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);



// Append an SVG group
const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);



// Initial Params
let chosenXAxis = "poverty";



// function used for updating x-scale const upon click on axis label
function xScale(xData, chosenXAxis) {
  // create scales
  const xLinearScale = d3.scaleLinear()
    .domain([d3.min(xData, d => d[chosenXAxis]) * 0.8,
      d3.max(xData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis const upon click on axis label
function renderAxes(newXScale, xAxis) {
  const bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1500)
    .call(bottomAxis);

  return xAxis;
}


// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1500)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used to update the state labels for the circles
function renderXLabels(circlesText, newXScale, chosenXAxis) {
  circlesText.transition()
      .duration(1500)
      .attr("x", d => newXScale(d[chosenXAxis]))

  return circlesText
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
    let label  = "";
    if (chosenXAxis === "poverty") {
        label = "Poverty:";
    }
    else {
        label = "income:";
    }

    const toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([0, 0])
      .html(function(d) {
        return (`<strong>${d.state}</strong>
        <br>
        <br> ${label} ${d[chosenXAxis]}`);
      });

    // add tooltip to circlesGroup
    circlesGroup.call(toolTip);

    // on mouseon event
    circlesGroup.on("mouseover", function(d) {
        toolTip.show(d, this);
    })
    // on mouseout event
    .on("mouseout", function(d, index) {
        toolTip.hide(d, this);
    });

  return circlesGroup;
}

// read csv data and store on a variable
(async function(){
  const xData = await d3.csv("/assets/data/data.csv");
    
  xData.forEach(function(data) {
    data.obesity = +data.obesity;
    data.income = +data.income;
    data.poverty = +data.poverty;
  });


  // xscale function
  let xLinearScale = xScale(xData, chosenXAxis);

  // yscale function
  let yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(xData, d => d.obesity)*1.2])
      .range([height, 0]);

  // axes
  let bottomAxis = d3.axisBottom(xLinearScale);
  let leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  let xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .style("font-size", "18px")
      .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
      .style("font-size", "18px")
      .call(leftAxis);

  // append circles to svg
  let circlesGroup = chartGroup.selectAll("circle")
      .data(xData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d.obesity))
      .attr("r", 15)
      .attr("fill", "yellow")
      .attr("opacity", ".5");

  // add abbr to circles
  let circlesText = chartGroup.selectAll("text.text-circles")
      .data(xData)
      .enter()
      .append("text")
      .classed("text-circles",true)
      .text(d => d.abbr)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d.obesity))
      .attr("dy",5)
      .attr("text-anchor","middle")
      .attr("font-size","10px");


  // Create group for  2 x- axis labels
  let labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

  let povertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 30)
      .attr("value","poverty") // value to grab for event listener
      .classed("active", true)
      .text("Poverty");

  let incomeLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 50)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Income");



    // y axis text
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 5 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("aText", true)
      .text("Obesity");

    
      // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);


   // x axis labels event listener
   labelsGroup.selectAll("text")
   .on("click", function() {
   // get value of selection
   const value = d3.select(this).attr("value");
   if (value !== chosenXAxis) {

       // replaces chosenXAxis with value
       chosenXAxis = value;

      //  console.log(chosenXAxis)

       // functions here found above csv import
       // updates x scale for new data
       xLinearScale = xScale(xData, chosenXAxis);

       // updates x axis with transition
       xAxis = renderAxes(xLinearScale, xAxis);

       // updates circles with new x values
       circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);


      // update lables with new x values
      circlesText = renderXLabels(circlesText, xLinearScale, chosenXAxis)

       // updates tooltips with new info
       circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

       // changes classes to change bold text
       if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
       }
       else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
       }
   }
});

})()