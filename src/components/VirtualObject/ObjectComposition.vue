<template lang="html">
  <svg
    :id="`object-composition-${virtualObjectId}`"
    :viewBox="`0 0 ${width} ${height}`"
    pointer-events="all"
    preserveAspectRatio="xMinYMin meet"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <defs>
      <filter id="circle-shadow-selected" y="-10" x="-10" height="40" width="150">
        <feOffset in="SourceAlpha" dx="1" dy="1" result="offset1" />
        <feGaussianBlur in="offset2" stdDeviation="1" result="blur1" />
        <feMerge>
          <feMergeNode in="blur2" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="circle-shadow" y="-10" x="-10" height="40" width="150">
        <feOffset in="SourceAlpha" dx="2" dy="2" result="offset2" />
        <feGaussianBlur in="offset2" stdDeviation="2" result="blur2" />
        <feMerge>
          <feMergeNode in="blur2" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g :id="objectCompositionLinks" />
    <g :id="objectCompositionNodes" />
  </svg>
</template>

<script type="text/javascript">
import { drag } from 'd3-drag';
import { json } from 'd3-fetch';
import { forceSimulation, forceCenter, forceLink, forceManyBody, forceRadial } from 'd3-force';
import { hierarchy } from 'd3-hierarchy';
import { event, select } from 'd3-selection';
//  import {active, transition} from "d3-transition";

export default {
  name: 'ObjectComposition',

  props: {
    width: {
      type: Number,
      required: false,
      default: 500,
    },
    height: {
      type: Number,
      required: false,
      default: 500,
    },
    clientUrl: {
      type: String,
      required: false,
      default: 'http://localhost:8080',
    },
    source: {
      type: String,
      required: false,
      default: 'data/virtual-object-composition.json',
    },
    'virtual-object': {
      type: String,
      required: false,
      default: null,
    },
  },

  data() {
    return {
      objectComposition: this.$props.source,
      objectCompositionGraph: null,
      objectCompositionSimulation: null,
    };
  },

  mounted() {
    this.initObjectComposition();
  },

  updated() {
    if (
      this.objectCompositionGraph &&
      this.objectCompositionGraph.nodes &&
      this.objectCompositionGraph.links
    ) {
      this.objectCompositionSimulation
        .nodes(this.objectCompositionGraph.nodes)
        .on('tick', this.objectCompositionTicked);
    }
  },

  beforeDestroy() {
    // select(`#object-composition-${this.virtualObjectId}`).empty();
    select(`#object-composition-${this.virtualObjectId}`)
      .selectAll('*')
      .remove();
  },

  computed: {
    virtualObjectProps() {
      if (this.$props.virtualObject !== null) {
        return JSON.parse(this.$props.virtualObject);
      }
      return null;
    },
    virtualObjectId() {
      if (this.virtualObjectProps !== null) {
        return this.virtualObjectProps.id;
      }
      return 1;
    },
    colors() {
      return this.$store.state.style.palette;
    },
    objectCompositionNodes() {
      const self = this;
      if (this.objectCompositionGraph) {
        return select(`#object-composition-${this.virtualObjectId}`)
          .append('g')
          .attr('class', 'nodes')
          .selectAll('circle')
          .data(self.objectCompositionGraph.nodes, d => d.data.id)
          .enter()
          .append('circle')
          .attr('class', 'object-cirle')
          .attr('r', d => d.data.size || 4.5)
          .attr('filter', 'url(#circle-shadow)')
          .style('fill', this.nodeFill)
          .on('mouseenter', function() {
            select(this).attr('filter', 'url(#circle-shadow-selected)');
          })
          .on('mouseleave', function() {
            select(this).attr('filter', 'url(#circle-shadow)');
          })
          .on('click', this.mouseClick)
          .call(
            drag()
              .on('start', this.dragstarted)
              .on('drag', this.dragged)
              .on('end', this.dragended),
          );
      }
      return null;
    },
    objectCompositionLinks() {
      const self = this;
      if (this.objectCompositionGraph) {
        return select(`#object-composition-${this.virtualObjectId}`)
          .append('g')
          .attr('class', 'links')
          .selectAll('path.link')
          .data(self.objectCompositionGraph.links, d => d.target.id)
          .enter()
          .insert('path')
          .style(
            'stroke-width',
            d => ((d.source.data.size / d.source.data.group) * 0.05).toString() + 'px',
          )
          .style('stroke', 'black')
          .style('fill', 'none');
      }
      return null;
    },
    objectCompositionImages() {
      const self = this;
      if (self.objectCompositionGraph) {
        return select(`#object-composition-${this.virtualObjectId}`)
          .append('g')
          .attr('class', 'images')
          .selectAll('image')
          .data(self.objectCompositionGraph.nodes, d => d.data.id)
          .enter()
          .append('image')
          .attr('xlink:href', d => `${d.data.icons[1]}`)
          .attr('crossOrigin', 'anonymous')
          .attr('x', d => (-1 * d.data.size) / 2)
          .attr('y', d => (-1 * d.data.size) / 2)
          .attr('height', d => d.data.size)
          .attr('width', d => d.data.size)
          .style('cursor', 'pointer')
          .on('click', this.mouseClick);
        // .on("mouseenter", this.mouseEnter)
        // .on("mouseleave", this.mouseLeave)
      }
      return null;
    },
  },

  methods: {
    async initObjectComposition() {
      let graph = {};
      if (this.virtualObjectProps) {
        // replace sensors key by children
        graph = this.virtualObjectProps;
        graph.children = graph.sensors;
        delete graph.sensors;
      } else {
        graph = await json(this.objectComposition);
      }
      const root = hierarchy(graph);
      const nodes = root.descendants();
      const links = root.links(nodes);
      this.objectCompositionGraph = {
        nodes: nodes,
        links: links,
      };
      this.objectCompositionSimulation = forceSimulation(this.objectCompositionGraph.nodes)
        .alphaDecay(0.005)
        .alpha(0.2)
        .force(
          'link',
          forceLink(this.objectCompositionGraph.links)
            .id(d => d.id)
            .distance(d => d.source.data.size / 1.5)
            .strength(0.7)
            .iterations(2),
        )
        .force('charge', forceManyBody(this.objectCompositionGraph.nodes).strength(-800))
        .force('center', forceCenter(this.$props.width / 2, this.$props.height / 2))
        .force('radial', forceRadial(this.$props.width / 10))
        .alphaTarget(0.4);
    },

    nodeTransform(d) {
      const maxNodeSize = 50;
      d.x = Math.max(maxNodeSize, Math.min(this.$props.width - (d.data.size || 16), d.x));
      d.y = Math.max(maxNodeSize, Math.min(this.$props.height - (d.data.size || 16), d.y));
      return 'translate(' + d.x + ',' + d.y + ')';
    },

    nodeFill(d) {
      if (d.data) {
        if (d.data.group === 0) return this.colors.blue;
        if (d.data.group === 1) {
          if (d.data.status) {
            return this.colors.green;
          }
          return this.colors.yellow;
        }
        if (d.data.group === 2) return this.colors.lightblue;
      }
      return this.colors.lightgreen;
    },

    objectCompositionTicked() {
      this.objectCompositionLinks.attr('d', d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        return (
          'M' +
          d.source.x +
          ',' +
          d.source.y +
          'A' +
          dr +
          ',' +
          dr +
          ' 0 0,1 ' +
          d.target.x +
          ',' +
          d.target.y
        );
      });
      this.objectCompositionNodes.attr('transform', this.nodeTransform);
      this.objectCompositionImages.attr('transform', this.nodeTransform);
    },

    mouseClick(...args) {
      this.$emit('node-clicked', ...args);
    },

    mouseEnter(...args) {
      this.$emit('node-selected', ...args);
    },

    mouseLeave(...args) {
      this.$emit('node-deselected', ...args);
    },

    dragstarted(d) {
      if (!event.active) this.objectCompositionSimulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    },

    dragged(d) {
      d.fx = event.x;
      d.fy = event.y;
      //EventBus.$emit('mqtt-tx', "getlarge/nodes-position", d.fx + "-" + d.fy)
    },

    dragended(d) {
      if (!event.active) this.objectCompositionSimulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    },
  },
};
</script>

<style lang="scss">
@import '../../style/home.scss';
</style>
