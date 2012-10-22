$(function() {
  $('.dial').knob();

  // X scale will fit values from 0-10 within pixels 0-100
  var x = d3.scale.linear().domain([0, 5]).range([0, 75]);
  // starting point is -5 so the first value doesn't show and slides off the edge as part of the transition

  var y = d3.scale.linear().domain([19000, 0]).range([0, 20]);


  var socket = io.connect('http://localhost');

  socket.on('tpad::config', function(config) {
    for (var i=0, l=config.pads; i<l; i++) {
      var clone = $('.button.template').clone();
      clone.removeClass('template').removeClass('hide');
      $('.buttonContainer').append(clone);
    }

    // turn it into a grid
    // TODO: it would be better if the device knew about its orientation
    //       and maybe dimensions?
    $('.buttonContainer').css({
      width : Math.sqrt(config.pads)*155,
      height : Math.sqrt(config.pads)*155
    });

    $('.graph').each(function() {
      var el = this;
      el.graph = d3.select(el).append("svg:svg").attr("width", "100%").attr("height", "100%");
      el.graph.values = [];
      el.graph.line = d3.svg.line()
        .x(function(d, i) { return x(i); })
        .y(function(d) { return y(d); })
        .interpolate("basis");

      el.graph.append("svg:path").attr("d", el.graph.line(el.graph.values));
      el.graph.path = this.graph.selectAll("path");
    });
  });

  var pads = {};

  socket.on('tpad::pressure', function(data) {

    var parts = data.split(','), button = parts[0], value = parseInt(parts[1], 10);

    if (typeof pads[button] !== 'undefined' && pads[button] === value) { return; }
    pads[button] = value;
    $('.button:not(.template) .dial:nth(' + button + ')').val(value);
    /*$('.button:not(.template) .dial:nth(' + button + ')').change();
*/

    // redraw graph
    var graphEl = $('.button:not(.template):nth(' + button + ') .graph');
    if (graphEl.length > 0) {
      graphEl[0].graph.values.unshift(value);
      graphEl[0].graph.values = graphEl[0].graph.values.slice(0, 5);
    }
  });

  setTimeout(function render() {
    $('.graph').each(function() {

      if (this.graph) {
        if (this.graph.values.length > 0) {
          this.graph.values.unshift(this.graph.values[0]);
          this.graph.values = this.graph.values.slice(0, 5);
          this.graph.path.data([this.graph.values]).attr('d', this.graph.line);
        }
      }
    });
    setTimeout(render, 1000/20);
  }, 200);
});