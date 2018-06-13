
$(document).ready(function(){
  var margin = {top: 20, right: 80, bottom: 30, left: 50},
      width = 600 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
  

  var parseTime= d3.timeParse("%Y")

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
    
  var svg = d3.select(".graph").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tooltip = d3.select(".graph").append("div")
                      .attr("class", "tooltip")
                      .style("opacity", 0);

  d3.csv('WineDataSet.csv', function(error, data){
      data.forEach(function(d){
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
    
    svg.append('g')
      .attr('transform', 'translate(-3,' + (height+5) + ')')
      .attr('class', 'x axis')
      .call(xAxis);

    svg.append('g')
      .attr('transform', 'translate(-7,0)')
      .attr('class', 'y axis')
      .call(yAxis);

      svg.append('text')
          .attr('x', 10)
          .attr('y', 10)
          .attr('class', 'label')
          .text('Vintage Year');

      svg.append('text')
          .attr('x', width)
          .attr('y', height - 10)
          .attr('text-anchor', 'end')
          .attr('class', 'label')
          .text('Taste Rating');
      
    // we use the ordinal scale symbols to generate symbols
    // such as d3.symbolCross, etc..
    // -> symbol.type(d3.symbolCross)()
      var circles = svg.selectAll(".dot")
          .data(data)
          .enter().append("circle")
          .attr("class", "dot")
          .attr("r", function(d) { return 5; })
          .attr("cx", function(d) {return x(d.points);})
          .attr("cy", function(d) {return y(d.year);})
          .style("fill", function (d) { return color(d.primary); })
          .on("mouseover", function(d) {
              tooltip.transition()
              .duration(200)
              .style("opacity", 1);
              tooltip.html( d.title + 
                  "<br/>" + "Vintage Year:" + d.year1 + 
                  "<br/>" + "Price(USD): $" + d.price + 
                  "<br/>" + "Variety: " + d.variety + 
                  "<br/>" + "Place of Origin: " + d.country + " ("+d.province + ") "+  
                  "<br/> " + "Expert Grade(out of 100pts): " + d.points + "")
              .style("left", (d3.event.pageX -120) + "px")
              .style("top", (d3.event.pageY-30) + "px");
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

  var margin1 = {top: 20, right: 80, bottom: 30, left: 50},
      width1 = 1000 - margin1.left - margin1.right,
      height1 = 650 - margin1.top - margin1.bottom;
      maxRadius = (Math.min(width1, height1) / 2) - 5;

        var formatNumber = d3.format(',d');

        var xscale = d3.scaleLinear()
            .range([0, 2 * Math.PI])
            .clamp(true);

        var yscale = d3.scaleSqrt()
            .range([maxRadius*.1, maxRadius]);

        var color1 = d3.scaleOrdinal(d3.schemeCategory20);

        var partition = d3.partition()
          ;

        var arc = d3.arc()
            .startAngle(d => xscale(d.x0))
            .endAngle(d => xscale(d.x1))
            .innerRadius(d => Math.max(0, yscale(d.y0)))
            .outerRadius(d => Math.max(0, yscale(d.y1)));

        var middleArcLine = d => {
            var halfPi = Math.PI/2;
            var angles = [xscale(d.x0) - halfPi, xscale(d.x1) - halfPi];
            var r = Math.max(0, (yscale(d.y0) + yscale(d.y1)) / 2);

            var middleAngle = (angles[1] + angles[0]) / 2;
            var invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
            if (invertDirection) { angles.reverse(); }

            var path = d3.path();
            path.arc(0, 0, r, angles[0], angles[1], invertDirection);
            return path.toString();
        };

        var textFits = d => {
            var CHAR_SPACE = 6;

            var deltaAngle = xscale(d.x1) - xscale(d.x0);
            var r = Math.max(0, (yscale(d.y0) + yscale(d.y1)) / 2);
            var perimeter = r * deltaAngle;

            return d.data.name.length * CHAR_SPACE < perimeter;
        };

        var svg1 = d3.select('.chart').append('svg')
            .style('width', '100vw')
            .style('height', '100vh')
            .append("g")
            .attr("transform", "translate(" + (margin1.left*8) + "," + (margin1.top*16) + ")")
            .attr('viewBox', `${-width1 / 2} ${-height1 / 2} ${width1} ${height1}`)
            ; // Reset zoom on canvas click

        d3.json('sunburst.json', (error, root) => {
            if (error) throw error;

            root = d3.hierarchy(root);
            root.sum(d => d.size);

            var slice = svg1.selectAll('g.slice')
                .data(partition(root).descendants());

            slice.exit().remove();
            clicked = ""
            var newSlice = slice.enter()
                .append('g').attr('class', 'slice')
                .on("click",function(d){
                   d3.selectAll(".symbol").style("opacity",1)
                   
                   if (clicked !== d){
                     d3.selectAll(".symbol")
                       .filter(function(e){
                       return e.primary !== d;
                     })
                       .style("opacity",0.1)
                     clicked = d
                   }
                    else{
                      clicked = ""
                    }
                });

            newSlice.append('title')
                .text(d => d.data.name + '\n' + formatNumber(d.value));

            newSlice.append('path')
                .attr('class', 'main-arc')
                .style('fill', d => color1((d.children ? d : d.parent).data.name))
                .attr('d', arc);

            newSlice.append('path')
                .attr('class', 'hidden-arc')
                .attr('id', (_, i) => `hiddenArc${i}`)
                .attr('d', middleArcLine);

            var text = newSlice.append('text')
                .style('fill', '#fff')
                .attr('display', d => textFits(d) ? null : 'none');

            // Add white contour
            text.append('textPath')
                .attr('startOffset','50%')
                .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
                .text(d => d.data.name)
                .style('fill', 'none')
                .style('stroke', '#000')
                .style('stroke-width', .8)
                .style('stroke-linejoin', 'round');

            text.append('textPath')
                .attr('startOffset','50%')
                .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
                .text(d => d.data.name);
        });

        function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
            // Reset to top-level if no data point specified

            var transition = svg1.transition()
                .duration(750)
                .tween('scale', () => {
                    var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                        yd = d3.interpolate(y.domain(), [d.y0, 1]);
                    return t => { x.domain(xd(t)); y.domain(yd(t)); };
                });

            transition.selectAll('path.main-arc')
                .attrTween('d', d => () => arc(d));

            transition.selectAll('path.hidden-arc')
                .attrTween('d', d => () => middleArcLine(d));

            transition.selectAll('text')
                .attrTween('display', d => () => textFits(d) ? null : 'none');

            moveStackToFront(d);

            //

            function moveStackToFront(elD) {
                svg1.selectAll('.slice').filter(d => d === elD)
                    .each(function(d) {
                        this.parentNode.appendChild(this);
                        if (d.parent) { moveStackToFront(d.parent); }
                    })
            }
        }

});