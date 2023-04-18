/* 
Note that the "group" property of each node represents a category to which the character belongs. The categories are as follows:
Group 1: Main characters
Group 2: Non-human entities
Group 3: Afterlife administrators 
The "value" property of each link represents the strength of the relationship between the characters, with a higher value indicating a stronger relationship.
*/

class ForceDirectedGraph {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data, _chartname) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: 800,
        containerHeight: 500,
        margin: {top: 5, right: 5, bottom: 5, left: 5}
      }
      this.data = _data;
      this.chartname = _chartname;
      this.initVis();
    }
    
    /**
     * We initialize scales/axes and append static elements, such as axis titles.
     */
    initVis() {
      let vis = this;
  
      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.config.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  
      // Initialize scales
      vis.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  
      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement).append('svg')
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);
  
      // Append group element that will contain our actual chart 
      // and position it according to the given margin config
      vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top+5})`);
  
      // Initialize force simulation
      vis.simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id))
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(vis.config.width / 2, vis.config.height / 2));
  
      vis.updateVis();
    }
  
    /**
     * Prepare the data and scales before we render it.
     */
    updateVis() {
      let vis = this;
  
      // Add node-link data to simulation
      vis.simulation.nodes(vis.data.nodes);
      vis.simulation.force('link').links(vis.data.links);
  
      vis.colorScale.domain(vis.data.nodes.map(d => d.group));
      
      vis.renderVis();
    }
  
    /**
     * Bind data to visual elements.
     */
    renderVis() {
      let vis = this;
  
      // Add links
      const links = vis.chart.selectAll('line')
          .data(vis.data.links, d => [d.source, d.target])
          .join('line')
          .attr('stroke', '#545454'); // Change this to a color scale to show how many scenes they share
  
      // Add nodes
      const nodes = vis.chart.selectAll('circle')
          .data(vis.data.nodes, d => d.id)
        .join('circle')
          .attr('r', 5)
          .attr('fill', d => vis.colorScale(d.id));
      
      nodes
      .call(d3.drag()
            .on("start", function(event, d) {
                // heat the simulation:
                if (!event.active) vis.simulation.alphaTarget(0.2).restart()
                // set fixed x and y coordinates:	
                d.fx = d.x
                d.fy = d.y
            })
            .on("drag", function(event, d) {
                // by fixing its position, this disables the forces acting on the node:
                d.fx = event.x
                d.fy = event.y
            })
            .on("end", function(event, d) {
                // stop simulation:
                if (!event.active) vis.simulation.alphaTarget(0)
                // reactivate the force on the node:
                d.fx = null
                d.fy = null
            })
  	    );

     // tooltip div:
  const tooltip = d3.select(this.chartname).append("div")
    .classed("tooltip", true)
    .style("opacity", 0) // start invisible

    nodes
        .on("mouseover", function(event, d) {
        tooltip.transition()
            .duration(300)
            .style("opacity", 1) // show the tooltip
        tooltip.html(d.id + ", " + d.group)
            .style("left", (event.pageX - d3.select('.tooltip').node().offsetWidth - 5) + "px")
            .style("top", (event.pageY - d3.select('.tooltip').node().offsetHeight) + "px");
    })
    .on("mouseleave", function(d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", 0)
    })
  
      // Update positions
      vis.simulation.on('tick', () => {
        //nodes.attr("transform", d => "translate(" + getNodeXCoordinate(d.x) + "," + getNodeYCoordinate(d.y) + ")")
        links
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
  
        nodes
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
      });
      
    }
  }