// CHART CODE HERE
$(document).ready(function(){
  var margin = {top: 20, right: 80, bottom: 30, left: 50},
      width = 600 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;
  

  var parseTime= d3.timeParse("%Y")

  var circles;

  var x = d3.scaleLinear()
      .range([0, width]);

  var y = d3.scaleTime().range([0, height])

  var r = d3.scaleSqrt()
          .range([2,10]);
    
  var xAxis = d3.axisBottom()
          .scale(x);

  var yAxis = d3.axisLeft()
          .scale(y);
    
  var color = d3.scaleOrdinal(d3.schemeCategory20);
  var symbols = d3.scaleOrdinal(d3.symbols);

  // creates a generator for symbols
  var symbol = d3.symbol().size(100);  
    
  var chartsvg = d3.select(".graph").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tooltip = d3.select(".graph").append("div")
                      .attr("class", "tooltip")
                      .style("opacity", 0);

  d3.csv('WineDataSet.csv', function(error, data){
      data.forEach(function(d){
      d.title = d.title;
      d.points = +d.points;
      d.year1  = d.year;
      d.price  = d.price;
      d.year  = parseTime(d.year);
      });

      x.domain(d3.extent(data, function(d){
          return d.points;
      })).nice();

      y.domain(d3.extent(data, function(d){
          return d.year;
      }));

      r.domain(d3.extent(data, function(d){
          return d.year;
      })).nice();
    
    chartsvg.append('g')
      .attr('transform', 'translate(-1,' + (height-45) + ')')
      .attr('class', 'x axis')
      .call(xAxis);

    chartsvg.append('g')
      .attr('transform', 'translate(-7,0)')
      .attr('class', 'y axis')
      .call(yAxis);

    chartsvg.append('text')
          .attr('x', 10)
          .attr('y', 10)
          .attr('class', 'label')
          .text('Vintage Year');

    chartsvg.append('text')
          .attr('x', width)
          .attr('y', height - 10)
          .attr('text-anchor', 'end')
          .attr('class', 'label')
          .text('Taste Rating');
      
    // we use the ordinal scale symbols to generate symbols
    // such as d3.symbolCross, etc..
    // -> symbol.type(d3.symbolCross)()
    circles = chartsvg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", function(d) { return 7; })
        .attr("cx", function(d) {return x(d.points);})
        .attr("cy", function(d) {return y(d.year);})
        .style("fill", function (d) { return color(d.primary); })
        .on("mouseover", function(d) {
            tooltip.transition()
            .duration(200)
            .style("opacity", .9);
            tooltip.html(d.title.bold() + 
    	      	  "<hr><b>Vintage Year:</b> " + d.year1 + 
                  "<br/><b>Price:</b> $" + d.price + 
                  "<br/><b>Variety:</b> " + d.variety + 
                  "<br/><b>Origin: </b>" + d.country + " ("+d.province + ") "+  
                  "<br/><b>Rating (80-100):</b> " + d.points + "")
              .style("left", (d3.event.pageX - 240) + "px")
              .style("top", (d3.event.pageY) + "px");
          })
          .on("mouseout", function(d) {
              tooltip.transition()
              .duration(200)
              .style("opacity", 0);
          });  

          var tooltip = d3.select("body").append("div")
              .attr("class",  "tooltip") 
              .style("opacity", 0); 
    var clicked = ""

  });


// SUNBURST CODE HERE

// Variables
var allNodes;
var width = 700;
var height = 600;
var radius = Math.min(width, height) / 2;
var color = d3.scaleOrdinal(d3.schemeCategory20b);
var color2 = d3.scaleOrdinal(d3.schemeCategory20b);
d3.selectAll('button').style("background-color",
    color2()
);
// Size our <svg> element, add a <g> element, and move translate 0,0 to the center of the element.
var g = d3.select('.chart')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
// Create our sunburst data structure and size it.
var partition = d3.partition()
    .size([2 * Math.PI, radius]);
// Get the data from our JSON file
d3.json("sunburst.json", function(error, nodeData) {
    if (error) throw error;
    allNodes = nodeData;
    var showNodes = JSON.parse(JSON.stringify(nodeData));
    drawSunburst(allNodes);
});
function drawSunburst(data) {
    // Find the root node, calculate the node.value, and sort our nodes by node.value
    root = d3.hierarchy(data)
        .sum(function(d) { return d.size; })
        .sort(function(a, b) { return b.value - a.value; });
    // Calculate the size of each arc; save the initial angles for tweening.
    partition(root);
    arc = d3.arc()
        .startAngle(function(d) { d.x0s = d.x0; return d.x0; })
        .endAngle(function(d) { d.x1s = d.x1; return d.x1; })
        .innerRadius(function(d) { return d.y0; })
        .outerRadius(function(d) { return d.y1; });
    // Add a <g> element for each node; create the slice variable since we'll refer to this selection many times
    slice = g.selectAll('g.node').data(root.descendants(), function(d) { return d.data.name; }); // .enter().append('g').attr("class", "node");
    newSlice = slice.enter().append('g').attr("class", "node").merge(slice);
    slice.exit().remove();
    // TRY 1: ID selection that's has been drawn previously... (requires us to set "drawn" down below)
    //newSlice.filter ( function(d) { return !d.drawn; }).append('path')
    //    .attr("display", function (d) { return d.depth ? null : "none"; }).style('stroke', '#fff');
    // TRY 2: Only create paths on "first run"
    //if (firstRun) {
    //    newSlice.append('path').attr("display", function (d) { return d.depth ? null : "none"; }).style('stroke', '#fff');
    //}
    // TRY 1&2: Set path-d and color always. But this isn't using new arc...?
    //newSlice.selectAll('path').attr("d", arc).style("fill", function (d) { return color((d.children ? d : d.parent).data.name); });
    // Append <path> elements and draw lines based on the arc calculations. Last, color the lines and the slices.
    slice.selectAll('path').remove();
    newSlice.append('path').attr("display", function(d) { return d.depth ? null : "none"; })
        .attr("d", arc)
        .style('stroke', '#fff')
        .style("fill", function(d) { return color((d.children ? d : d.parent).data.name); });
    // Populate the <text> elements with our data-driven titles.
    slice.selectAll('text').remove();
    newSlice.append("text")
        .attr("transform", function(d) {
            return "translate(" + arc.centroid(d) + ")rotate(" + computeTextRotation(d) + ")";
        })
        .attr("dx", "-30")
        .attr("dy", ".4em")
        .style("font-size", "13px")
        .text(function(d) { return d.parent ? d.data.name : "" });
    newSlice.on("click", highlightSelectedSlice);
    root.count();
    root.sort(function(a, b) { return b.value - a.value; });
    partition(root);
    newSlice.selectAll("path").transition().duration(750).attrTween("d", arcTweenPath);
    newSlice.selectAll("text").transition().duration(750).attrTween("transform", arcTweenText);
};
// d3.selectAll(".showSelect").on("click", showTopTopics);
// d3.selectAll(".sizeSelect").on("click", sliceSizer);
// Redraw the Sunburst Based on User Input
function highlightSelectedSlice(c, i) {
    clicked = c;
    console.log(clicked)
    var rootPath = clicked.path(root).reverse();
    rootPath.shift(); // remove root node from the array
    newSlice.style("opacity", 0.4);
    circles.style("opacity", .04);
    // console.log(rootPath)
    newSlice.filter(function(d) {
            if (d == clicked && d.prevClicked) {
                d.prevClicked = false;
                newSlice.style("opacity", 1);
                circles.style("opacity", 1);
                return true;
            } else if (d == clicked) {
                d.prevClicked = true;
                // THIS IS WHERE WE FILTER INDIVIDUAL DOTS

                // HERE
                return true;
            } else {
                d.prevClicked = false;
                return (rootPath.indexOf(d) >= 0);
            }
        })
        .style("opacity", 1);
    //d3.select("#sidebar").text("another!");
};
// Redraw the Sunburst Based on User Input
function sliceSizer(r, i) {
    // Determine how to size the slices.
    if (this.value === "size") {
        // root.sum(function(d) { return d.size; });
        console.log("one")
    } else {
        root.count();
        console.log("two")
    }
    
    root.sort(function(a, b) { return b.value - a.value; });
    partition(root);
    newSlice.selectAll("path").transition().duration(750).attrTween("d", arcTweenPath);
    newSlice.selectAll("text").transition().duration(750).attrTween("transform", arcTweenText);
};
// Redraw the Sunburst Based on User Input
function showTopTopics(r, i) {
    //alert(this.value);
    var showCount;
    // Determine how to size the slices.
    if (this.value === "top3") {
        showCount = 3;
    } else if (this.value === "top6") {
        showCount = 6;
    } else {
        showCount = 100;
    }
    var showNodes = JSON.parse(JSON.stringify(allNodes));
    showNodes.children.splice(showCount, (showNodes.children.length - showCount));
    drawSunburst(showNodes);
};
/**
 * When switching data: interpolate the arcs in data space.
 * @param {Node} a
 * @param {Number} i
 * @return {Number}
 */
function arcTweenPath(a, i) {
    var oi = d3.interpolate({ x0: a.x0s, x1: a.x1s }, a);
    function tween(t) {
        var b = oi(t);
        a.x0s = b.x0;
        a.x1s = b.x1;
        return arc(b);
    }
    return tween;
}
/**
 * When switching data: interpolate the text centroids and rotation.
 * @param {Node} a
 * @param {Number} i
 * @return {Number}
 */
function arcTweenText(a, i) {
    var oi = d3.interpolate({ x0: a.x0s, x1: a.x1s }, a);
    function tween(t) {
        var b = oi(t);
        return "translate(" + arc.centroid(b) + ")rotate(" + computeTextRotation(b) + ")";
    }
    return tween;
}
/**
 * Calculate the correct distance to rotate each label based on its location in the sunburst.
 * @param {Node} d
 * @return {Number}
 */
function computeTextRotation(d) {
    var angle = (d.x0 + d.x1) / Math.PI * 90;
    // Avoid upside-down labels
    (angle < 120 || angle > 270) ? angle : angle + 180; 
    return angle + 90// labels as rims
    //return (angle < 180) ? angle - 90 : angle + 90;  // labels as spokes
}

});