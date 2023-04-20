class Barchart {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data, _map, _width) {
      // Configuration object with defaults
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || _width,
        containerHeight: _config.containerHeight || 466,
        margin: _config.margin || {top: 10, right: 10, bottom: 85, left: 40},
        reverseOrder: _config.reverseOrder || false,
        tooltipPadding: _config.tooltipPadding || 15,
        xAxisTitle: _config.xAxisTitle
        // yAxisTitle: _config.yAxisTitle || ' ',
      }
      this.data = _data;
      this.num_map = _map;
      this.initVis();
    }
    
    /**
     * Initialize scales/axes and append static elements, such as axis titles
     */
    initVis() {
      let vis = this;
  
      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  
      // Initialize scales and axes
      
      // Important: we flip array elements in the y output range to position the rectangles correctly
      vis.yScale = d3.scaleLinear()
          .range([vis.height, 0]); 
  
      vis.xScale = d3.scaleBand()
          .range([0, vis.width])
          .paddingInner(0.2);
  
      vis.xAxis = d3.axisBottom(vis.xScale)
          .ticks(data)
          .tickSizeOuter(0);
  
      vis.yAxis = d3.axisLeft(vis.yScale)
          .ticks(5)
          .tickSizeOuter(0)
  
      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);
  
      // SVG Group containing the actual chart; D3 margin convention
      vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
          
  
      // Append empty x-axis group and move it to the bottom of the chart
      vis.xAxisG = vis.chart.append('g')
          .attr('class', 'axis x-axis')
          .attr('transform', `translate(0,${vis.height})`);
  
      // Append y-axis group 
      vis.yAxisG = vis.chart.append('g')
          .attr('class', 'axis y-axis');
  
      // Append axis title
      vis.chart.append('text')
          .attr('class', 'axis-title')
          .attr('x', -10)
          .attr('y', -10)
          .attr('dy', '.71em')
          .text(vis.config.yAxisTitle);

      // Color scale for month/day
      vis.colorScaleEp = d3.scaleOrdinal().range(d3.schemeCategory10)
      .domain(["1","2","3","4"]);

      vis.colorScaleCh = d3.scaleOrdinal().range(["#6929c4", "#1192e8", "#808080", "#9f1853", "#198038", "#570408", "#002d9c", "#b28600", "#fa4d56", "#CC8B86", "#009d9a","#a56eff", "#FFA630"])
      .domain(["Eleanor", "Chidi", "Tahani", "Jason", "Michael", "Janet", "Shawn", "Trevor", "Simone", "Derek", "Mindy", "Doug", "Judge"]);
  
      // vis.chart.append('text') //x-axis = radius [dist]
      // .attr('class', 'axis-title')
      // .attr('y', vis.height + 25)
      // .attr('x', vis.width + 5)
      // .attr('dy', '.71em')
      // .style('text-anchor', 'end')
      // .text(vis.config.xAxisTitle);
    }
  
    /**
     * Prepare data and scales before we render it
     */
    updateVis() {
      let vis = this;
  
      if (vis.config.reverseOrder) {
        vis.data.reverse();
      }
  
      // Prepare data: count number of trails in each difficulty category
      // i.e. [{ key: 'easy', count: 10 }, {key: 'intermediate', ...
      //const aggregatedDataMap = d3.rollups(vis.data, v => v.length, d => d.sy_snum);
      vis.aggregatedData = Array.from(vis.num_map, ([key, count]) => ({ key, count }));
  
      /*const orderedKeys = ['0','1','2','3', '4'];
      vis.aggregatedData = vis.aggregatedData.sort((a,b) => {
        return orderedKeys.indexOf(a.key) - orderedKeys.indexOf(b.key);
      });*/
  
      // Specificy accessor functions
      vis.xValue = d => d.key;
      vis.yValue = d => d.count;
  
      // Set the scale input domains
      vis.xScale.domain(vis.aggregatedData.map(vis.xValue));
      vis.yScale.domain([0, d3.max(vis.aggregatedData, vis.yValue)]);

      vis.colorValueEp = d => d.key < 14 ? "1" : d.key < 27 ? "2" : d.key < 40 ? "3" : "4";
      vis.colorValueCh = d => d.key.includes(" ") ? d.key.substring(0, d.key.indexOf(' ')) : d.key;
  
      vis.renderVis();
    }
  
    /**
     * Bind data to visual elements
     */
    renderVis() {
      let vis = this;

      // create tooltip element  
      const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("padding", "2px 8px")
        .style("background", "#fff")
        .style("border", "1px solid #ddd")
        .style("width", "150px")
        .style("box-shadow", "2px 2px 3px 0px rgb(92 92 92 / 0.5)")
        .style("font-size", "12px")
        .style("font-weight", "600");
  
      // Add rectangles
      vis.bars = vis.chart.selectAll('.bar')
          .data(vis.aggregatedData, vis.xValue)
        .join('rect')
          .attr('class',  d => (episodeFilter.find(e => e === d.key) || characterFilter.find(e => e === d.key) ? 'bar active' : "bar"))
          .attr('x', d => vis.xScale(vis.xValue(d)))
          .attr('width', vis.xScale.bandwidth())
          .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
          .attr('y', d => vis.yScale(vis.yValue(d)))
          // .attr('fill', '#2962dd')
          .attr('fill', vis.config.xAxisTitle == "Characters" ? d => vis.colorScaleCh(vis.colorValueCh(d)) : d => vis.colorScaleEp(vis.colorValueEp(d)))
  
      vis.bars
        .on('mouseover', (event,d) => {
          if(vis.config.xAxisTitle == "Episodes") {
            var season = d.key < 14 ? 1 : d.key < 27 ? 2 : d.key < 40 ? 3 : 4;
            var episode = season == 1 ? d.key : season == 2 ? d.key - 13 : season == 3 ? d.key - 26 : d.key - 39
            tooltip.html(`
            <div class="tooltip-title">Season: ${season}</div>
            <div class="tooltip-title">Episode: ${episode}</div>
            <div class="tooltip-label">Number of lines: ${d.count}</div>
          `).style("visibility", "visible");
          }
          else if(vis.config.xAxisTitle == "Characters") {
            tooltip.html(`
                <div class="tooltip-title">Character: ${d.key}</div>
                <div class="tooltip-label">Number of lines: ${d.count}</div>
              `).style("visibility", "visible");
          }
        })
        .on("mousemove", function(){
          tooltip
            .style("top", (event.pageY-10)+"px")
            .style("left",(event.pageX+10)+"px");
        })
        .on('mouseleave', () => {
          // d3.select('#tooltip').style('display', 'none');
          tooltip.html(``).style("visibility", "hidden");
        });

        vis.bars.on('click', function(event, d) {
          if(vis.config.xAxisTitle == "Episodes") {
            tooltip.html(``).style("visibility", "hidden");
            var isActive = false
            isActive = episodeFilter.find(e => e === d.key) // Check if selected episode is already applied

            if (isActive) {
              d3.select(this).attr("class", "bar");
              // Remove from filter
              episodeFilter = episodeFilter.filter(f => f !== isActive);
            } else {
              d3.select(this).attr("class", "bar active");
              // Add to filter
              episodeFilter.push(d.key)
            }
            filterData(); // Call global function to update charts
          }
          else if(vis.config.xAxisTitle == "Characters")  {
            tooltip.html(``).style("visibility", "hidden");
            var isActive = false
            isActive = characterFilter.find(e => e === d.key) // Check selected character is already applied

            if (isActive) {
              d3.select(this).attr("class", "bar");
              // Remove from filter
              characterFilter = characterFilter.filter(f => f !== isActive);
            } else {
              d3.select(this).attr("class", "bar active");
              // Add to filter
              characterFilter.push(d.key)
            }
            filterData(); // Call global function to update charts
          }
        });

      console.log(vis.config.xAxisTitle)
      if(vis.config.xAxisTitle == "Characters") {
        vis.xAxisG.call(vis.xAxis).selectAll("text")  
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)");
      }
      else {
        vis.xAxisG.call(vis.xAxis)
      }

      vis.yAxisG.call(vis.yAxis);
    }
  }