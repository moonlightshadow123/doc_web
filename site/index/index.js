var vis;
var tree;
var root;
var diagonal;
var duration = 1000;
var margin;
var width;
var height;
var data;
//var vars = getUrlVars();
var i = 0;

//extract file name
function extract_filename(str){
  var arr = str.split("/");
  return arr[arr.length - 1];
}

/*$(function(){
  if("json" in vars){
    $.getJSON(vars["json"], function(jsonData){
        data = jsonData;
        init(data);
        document.title = extract_filename(vars["json"]);
    });
  }
});*/

document.title = jsonData.name;
data = jsonData;
init(data);

// ************** Generate the tree diagram  *****************
function init(data){
  $("#tree").find('svg').remove();
  margin = {top: 50, right: 100, bottom: 100, left: 100};
  //var margin = {top: 10, right: 120, bottom: 10, left: 120},
      width = window.innerWidth - margin.right - margin.left;
      height = window.innerHeight - margin.top - margin.bottom;
      
  var i = 0;

  tree = d3.layout.tree()
      .size([height, width]);

  diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

  vis = d3.select("#tree").append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  root = data;
  root.x0 = height / 2;
  root.y0 = 0;

    function toggleAll(d) {
      if (d.children) {
        d.children.forEach(toggleAll);
        click(d);
      }
    }

  var pre_anim = null;

  update(root);
  toggleAll(root);  
}

// ************** Update onclick  *****************
function update(source) {
  var duration = d3.event && d3.event.altKey ? 5000 : 500;

  // compute the new height
  var levelWidth = [1];
  var childCount = function(level, n) {
    
    if(n.children && n.children.length > 0) {
      if(levelWidth.length <= level + 1) levelWidth.push(0);
      
      levelWidth[level+1] += n.children.length;
      n.children.forEach(function(d) {
        childCount(level + 1, d);
      });
    }
  };
  childCount(0, root);  
  var newHeight = d3.max(levelWidth) * 20; // 20 pixels per line  
  tree = tree.size([newHeight, width]);
    
  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse();

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes¡­
  var node = vis.selectAll("g.node")
      .attr("data-id", function(d){return d.nodeId})
      .attr("data-nodeType", function(d){ return d.nodeType})
      .attr("data-extra", function(d){if(d.hasOwnProperty("extra")) return d.extra; else return "";})
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", function(d) { click(d); update(d); });

  nodeEnter.append("svg:circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeEnter.append("svg:text")
      //.attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("x", function(d) { return 10; })
      .attr("dy", ".35em")
      //.attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .attr("text-anchor", function(d) { return "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links¡­
  var link = vis.selectAll("path.link")
      .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });

  var min_x = 3000, min_y = 3000, max_x = 0, max_y = 0;
  nodes.forEach(function(d){ 
    if(d.x < min_x) min_x = d.x;
    if(d.x > max_x) max_x = d.x;
    if(d.y < min_y) min_y = d.y;
    if(d.y > max_y) max_y = d.y;
  });

  // Viewbox Animation 
  var anim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
  anim.setAttribute("attributeName", "viewBox");
  anim.setAttribute("to", min_y.toString() + " " + min_x.toString() + " " + (max_y+300).toString()+" "+(max_x+100).toString());
  anim.setAttribute("dur", duration/1000);
  anim.setAttribute("fill", "freeze")

  $("#tree svg")[0].appendChild(anim);

  anim.beginElement();

}

function openURL(url){
    var win = window.open(url, '_blank');
    if (win) {
        //Browser has allowed it to be opened
        win.focus();
    } else {
        //Browser has blocked it
        alert('Please allow popups for this website');
    }
}


var contentUrl = "/file?nodeId=";
// Toggle children on click.
function click(d) {
    if(d.hasOwnProperty("rel")){
        //window.location.href = d["rel"];
        openURL(d["rel"]);
    }
  if(d.nodeType != "node"){
    console.log(d);
      if(d.nodeType == "extra" && d.hasOwnProperty("extraUrl")){
        openURL(d.extraUrl);
      }else{
        openURL(contentUrl+d.nodeId + "&nodeType=" + d.nodeType + "&projId=" + projId);
      }
  }
  if(d.children){
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}

// Rotation
/*
jQuery.fn.rotate = function(degrees){
    $(this).css({'transform' : 'rotate('+ degrees +'deg)'});
    return $(this);
};
var deg = 0;
$('.div').dblclick(function(){
    //alert("hello");
    deg += 90
    $(".div").rotate(deg);
});
*/