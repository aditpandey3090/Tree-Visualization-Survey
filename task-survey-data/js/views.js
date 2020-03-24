function createSunburstChart(data, id, classname) {
  margin = { left: 15, top: 10, right: 40, bottom: 40 };
  format = d3.format(",d");

  //   var width = 500;
  //   var height = 500;
  //   var radius = Math.min(width, height) / 2;
  //   //   var color = d3.scaleOrdinal(d3.schemeCategory20b);

  //   const svg1 = d3
  //     .select("#" + id)
  //     .append("svg")
  //     .attr("width", width)
  //     .attr("height", height)
  //     .append("g")
  //     .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  //   var partition = d3.partition().size([2 * Math.PI, radius]);

  //   // Find data root
  //   var root = d3.hierarchy(data).sum(function(d) {
  //     return d.count;
  //   });

  //   partition(root);

  //   var arc = d3
  //     .arc()
  //     .startAngle(function(d) {
  //       return d.x0;
  //     })
  //     .endAngle(function(d) {
  //       return d.x1;
  //     })
  //     .innerRadius(function(d) {
  //       return d.y0;
  //     })
  //     .outerRadius(function(d) {
  //       return d.y1;
  //     });

  //   // Put it all together
  //   svg1
  //     .selectAll("path")
  //     .data(root.descendants())
  //     .enter()
  //     .append("path")
  //     .attr("display", function(d) {
  //       return d.depth ? null : "none";
  //     })
  //     .attr("d", arc)
  //     .style("stroke", "#fff")
  //     .style("fill", function(d) {
  //       return "red";
  //     });

  var width = 500;
  var height = 800;
  var radius = Math.min(width, height) / 2;
  partition = data =>
    d3.partition().size([2 * Math.PI, radius])(
      d3
        .hierarchy(data)
        .sum(d => d.count)
        .sort((a, b) => b.count - a.count)
    );

  arc = d3
    .arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius / 2)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1 - 1);

  const root = partition(data);

  color = d3.scaleOrdinal(
    d3.quantize(d3.interpolateRainbow, data.children.length + 1)
  );

  const svg1 = d3
    .select("#" + id)
    .append("svg")
    .attr("class", classname) //ToDo:Add a more descriptive classname
    .attr("viewBox", "0 0 " + width + " " + height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  svg1
    .attr("fill-opacity", 0.6)
    .selectAll("path")
    .data(root.descendants().filter(d => d.depth))
    .enter()
    .append("path")
    .attr("fill", d => {
      while (d.depth > 1) d = d.parent;
      return color(d.data.name);
    })
    .attr("d", arc)
    .append("title")
    .text(
      d =>
        `${d
          .ancestors()
          .map(d => d.data.name)
          .reverse()
          .join("/")}\n${format(d.value)}`
    );

  svg1
    .append("g")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .attr("font-size", 10)
    .attr("font-family", "sans-serif")
    .selectAll("text")
    .data(
      root
        .descendants()
        .filter(d => d.depth && ((d.y0 + d.y1) / 2) * (d.x1 - d.x0) > 10)
    )
    .join("text")
    .attr("transform", function(d) {
      const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      const y = (d.y0 + d.y1) / 2;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    })
    .attr("dy", "0.35em")
    .text(d => d.data.name);
}