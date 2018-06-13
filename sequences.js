$(document).ready(function(){
  var margin = {top: 20, right: 80, bottom: 30, left: 50},
      width = 1000 - margin.left - margin.right,
      height = 650 - margin.top - margin.bottom;
      maxRadius = (Math.min(width, height) / 2) - 5;

        var formatNumber = d3.format(',d');

        var x = d3.scaleLinear()
            .range([0, 2 * Math.PI])
            .clamp(true);

        var y = d3.scaleSqrt()
            .range([maxRadius*.1, maxRadius]);

        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var partition = d3.partition();

        var arc = d3.arc()
            .startAngle(d => x(d.x0))
            .endAngle(d => x(d.x1))
            .innerRadius(d => Math.max(0, y(d.y0)))
            .outerRadius(d => Math.max(0, y(d.y1)));

        var middleArcLine = d => {
            var halfPi = Math.PI/2;
            var angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
            var r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);

            var middleAngle = (angles[1] + angles[0]) / 2;
            var invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
            if (invertDirection) { angles.reverse(); }

            var path = d3.path();
            path.arc(0, 0, r, angles[0], angles[1], invertDirection);
            return path.toString();
        };

        var textFits = d => {
            var CHAR_SPACE = 6;

            var deltaAngle = x(d.x1) - x(d.x0);
            var r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
            var perimeter = r * deltaAngle;

            return d.data.name.length * CHAR_SPACE < perimeter;
        };

        var svg = d3.select('.chart').append('svg')
            .style('width', '100vw')
            .style('height', '100vh')
            .append("g")
            .attr("transform", "translate(" + (margin.left*8) + "," + (margin.top*16) + ")")
            .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
            ; // Reset zoom on canvas click

        d3.json('sunburst.json', (error, root) => {
            if (error) throw error;

            root = d3.hierarchy(root);
            root.sum(d => d.size);

            var slice = svg.selectAll('g.slice')
                .data(partition(root).descendants());

            slice.exit().remove();
            var clicked = ""
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
                .style('fill', d => color((d.children ? d : d.parent).data.name))
                .attr('d', arc);

            newSlice.append('path')
                .attr('class', 'hidden-arc')
                .attr('id', (_, i) => `hiddenArc${i}`)
                .attr('d', middleArcLine);

            var text = newSlice.append('text')
                .attr('display', d => textFits(d) ? null : 'none');

            // Add white contour
            text.append('textPath')
                .attr('startOffset','50%')
                .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
                .text(d => d.data.name)
                .style('fill', 'none')
                .style('stroke', '#fff')
                .style('stroke-width', 5)
                .style('stroke-linejoin', 'round');

            text.append('textPath')
                .attr('startOffset','50%')
                .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
                .text(d => d.data.name);
        });

        function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
            // Reset to top-level if no data point specified

            var transition = svg.transition()
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
                svg.selectAll('.slice').filter(d => d === elD)
                    .each(function(d) {
                        this.parentNode.appendChild(this);
                        if (d.parent) { moveStackToFront(d.parent); }
                    })
            }
        }
});
