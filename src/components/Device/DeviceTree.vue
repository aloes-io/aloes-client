<template lang="html">
  <svg
    :id="`device-tree-${deviceId}`"
    :viewBox="`0 0 ${updatedWidth} ${updatedHeight}`"
    pointer-events="all"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <defs>
      <filter
        id="circle-shadow-selected"
        y="-10"
        x="-10"
        height="40"
        width="150"
      >
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
    <g :id="links"></g>
    <g :id="nodes"></g>
  </svg>
</template>

<script type="text/javascript">
import { drag } from "d3-drag";
import { json } from "d3-fetch";
import {
  forceSimulation,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody
} from "d3-force";
import { hierarchy } from "d3-hierarchy";
import { event, select } from "d3-selection";

export default {
  name: "DeviceTree",

  props: {
    width: {
      type: Number,
      required: false,
      default: 500
    },
    height: {
      type: Number,
      required: false,
      default: 500
    },
    clientUrl: {
      type: String,
      required: false,
      default: "http://localhost:8080"
    },
    source: {
      type: String,
      required: false,
      default: "/data/device-tree.json"
    },
    device: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      watchSensors: this.$props.source,
      deviceProps: null,
      updatedWidth: null,
      updatedHeight: null,
      graphNodes: null,
      graphLinks: null,
      nodeSimulation: null
    };
  },

  computed: {
    nodeSize() {
      return this.updatedWidth / 15;
    },
    deviceId() {
      if (this.deviceProps !== null) {
        return this.deviceProps.id;
      }
      return 1;
    },
    colors() {
      return this.$store.state.style.palette;
    },
    nodes() {
      if (this.graphNodes) {
        return select(`#device-tree-${this.deviceId}`)
          .append("g")
          .attr("class", "nodes")
          .selectAll("circle")
          .data(this.graphNodes, d => d.data.id)
          .enter()
          .append("circle")
          .attr("class", "object-cirle")
          .attr("r", d => (d.data.appKey ? this.nodeSize * 1.3 : this.nodeSize))
          .attr("filter", "url(#circle-shadow)")
          .style("fill", d =>
            d.data.appKey ? this.colors.blue : this.colors.green
          )
          .on("mouseover", function() {
            select(this).attr("filter", "url(#circle-shadow-selected)");
          })
          .on("mouseout", function() {
            select(this).attr("filter", "url(#circle-shadow)");
          })
          .call(
            drag()
              .on("start", this.dragstarted)
              .on("drag", this.dragged)
              .on("end", this.dragended)
          );
        //  .exit()
        //  .remove();
      }
      return null;
    },
    links() {
      if (this.graphLinks) {
        return select(`#device-tree-${this.deviceId}`)
          .append("g")
          .attr("class", "links")
          .selectAll("path.link")
          .data(this.graphLinks, d => d.target.id)
          .enter()
          .insert("path")
          .style("stroke-width", () => (4).toString() + "px")
          .style("stroke", "#f2f2f2")
          .style("fill", "none");
        //  .exit()
        //  .remove();
      }
      return null;
    },
    images() {
      if (this.graphNodes) {
        return select(`#device-tree-${this.deviceId}`)
          .append("g")
          .attr("class", "images")
          .selectAll("image")
          .data(this.graphNodes, d => d.data.id)
          .enter()
          .append("image")
          .attr("xlink:href", d => `${this.$props.clientUrl}${d.data.icons[0]}`)
          .attr("crossOrigin", "anonymous")
          .attr("x", d =>
            d.data.appKey
              ? `${(-1 * this.nodeSize * 1.2) / 2}`
              : `${(-1 * this.nodeSize) / 2}`
          )
          .attr("y", d =>
            d.data.appKey
              ? `${(-1 * this.nodeSize * 1.2) / 2}`
              : `${(-1 * this.nodeSize) / 2}`
          )
          .attr("width", d =>
            d.data.appKey ? this.nodeSize * 1.3 : this.nodeSize
          )
          .attr("height", d =>
            d.data.appKey ? this.nodeSize * 1.3 : this.nodeSize
          )
          .style("cursor", "pointer")
          .on("click", this.mouseClick)
          .on("mouseenter", this.mouseEnter)
          .on("mouseleave", this.mouseLeave);
        //  .exit()
        //  .remove();
      }
      return null;
    }
  },

  watch: {
    width: {
      handler(width) {
        if (width && width !== null) {
          this.updatedWidth = width;
        }
      },
      immediate: true
    },
    height: {
      handler(height) {
        if (height && height !== null) {
          this.updatedHeight = height;
        }
      },
      immediate: true
    },
    device: {
      handler(value) {
        if (value && value !== null) {
          this.deviceProps = JSON.parse(value);
          this.graphNodes = null;
          this.graphLinks = null;
          //  this.initDeviceTree();
        }
      },
      immediate: true
    }
  },

  mounted() {
    this.initDeviceTree();
  },

  updated() {
    //  select(`#device-tree-${this.deviceId}`).empty();
    select(`#device-tree-${this.deviceId}`)
      .selectAll("*")
      .exit()
      .remove();

    if (this.graphNodes !== null && this.graphLinks !== null) {
      this.nodeSimulation.nodes(this.graphNodes).on("tick", this.ticked);
    }
    // if (this.graphNodes && this.graphLinks) {
    //   this.nodeSimulation.nodes(this.graphNodes).on("tick", this.ticked);
    // }
  },

  beforeDestroy() {
    this.nodeSimulation = null;
    select(`#device-tree-${this.deviceId}`).empty();
  },

  methods: {
    async initDeviceTree() {
      // select(`#device-tree-${this.deviceId}`)
      //   .exit()
      //   .remove();
      let graph = {};
      if (this.deviceProps && this.deviceProps !== null) {
        this.deviceProps.children = this.deviceProps.sensors;
        delete this.deviceProps.sensors;
        graph = this.deviceProps;
      } else {
        graph = await json(this.watchSensors);
      }
      const root = hierarchy(graph);
      this.graphNodes = root.descendants();
      this.graphLinks = root.links(this.graphNodes);
      this.nodeSimulation = forceSimulation(this.graphNodes)
        .alphaDecay(0.005)
        .alpha(0.2)
        .force(
          "link",
          forceLink(this.graphLinks)
            .id(d => d.id)
            .distance(this.nodeSize * 3)
            .strength(0.2)
            .iterations(2)
        )
        .force("charge", forceManyBody(this.graphNodes).strength(-100))
        .force(
          "center",
          forceCenter(this.updatedWidth / 2, this.updatedHeight / 2)
        )
        .force(
          "collisionForce",
          forceCollide(5)
            .strength(-50)
            .iterations(1)
        )
        .alphaTarget(0.4);
      return graph;
    },

    nodeTransform(d) {
      const maxNodeSize = 50;
      d.x = Math.max(
        maxNodeSize,
        Math.min(this.updatedWidth - (this.nodeSize || 16), d.x)
      );
      d.y = Math.max(
        maxNodeSize,
        Math.min(this.updatedHeight - (this.nodeSize || 16), d.y)
      );
      return `translate(${d.x},${d.y})`;
    },

    async ticked() {
      await this.links.attr("d", d => {
        const dX = d.target.x - d.source.x;
        const dY = d.target.y - d.source.y;
        const dR = Math.sqrt(dX * dX + dY * dY);
        return `M ${d.source.x}, ${d.source.y} A ${dR}, ${dR} 0 0,1 ${
          d.target.x
        }, ${d.target.y}`;
      });
      await this.nodes.attr("transform", this.nodeTransform);
      return this.images.attr("transform", this.nodeTransform);
    },

    mouseClick(...args) {
      this.$emit("node-clicked", ...args);
    },

    mouseEnter(...args) {
      this.$emit("node-selected", ...args);
    },

    mouseLeave(...args) {
      this.$emit("node-deselected", ...args);
    },

    dragstarted(d) {
      if (!event.active) this.nodeSimulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    },

    dragged(d) {
      d.fx = event.x;
      d.fy = event.y;
    },

    dragended(d) {
      if (!event.active) this.nodeSimulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }
};
</script>
