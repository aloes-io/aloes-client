<template lang="html">
  <svg
    :id="`device-tree-${rootNodeId}`"
    :viewBox="`0 0 ${updatedWidth} ${updatedHeight}`"
    pointer-events="all"
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
    <g :id="links"></g>
    <g :id="nodes"></g>
  </svg>
</template>

<script type="text/javascript">
/* eslint-disable no-unused-vars */
import { drag } from 'd3-drag';
import { json } from 'd3-fetch';
import { forceSimulation, forceCenter, forceCollide, forceLink, forceManyBody } from 'd3-force';
import { hierarchy } from 'd3-hierarchy';
import { interpolate } from 'd3-interpolate';
import { event, select } from 'd3-selection';
import { transition } from 'd3-transition';

export default {
  name: 'DeviceTree',

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
      default: '/data/device-tree.json',
    },
    device: {
      type: Object,
      default: null,
    },
    devices: {
      type: Array,
      default: null,
    },
    nodesRadius: {
      type: Number,
      default: 15,
    },
    linksLength: {
      type: Number,
      default: 1,
    },
  },

  data() {
    return {
      watchSensors: this.$props.source,
      graph: null,
      updatedWidth: null,
      updatedHeight: null,
      updatedNodesRadius: null,
      updatedLinksLengt: null,
      graphNodes: null,
      graphLinks: null,
      nodeSimulation: null,
      nodeLockedMode: false,
      showSensors: false,
      showDescriptions: false,
    };
  },

  computed: {
    colors() {
      return this.$store.state.style.palette;
    },
    fonts() {
      return this.$store.state.style.fonts;
    },
    nodeSize() {
      return this.updatedWidth / this.updatedNodesRadius;
    },
    rootNodeId() {
      if (this.$props.userId && this.$props.userId !== null) {
        return this.$props.userId;
      }
      if (this.device && this.device !== null) {
        return this.device.id;
      }
      return '1';
    },
    svg() {
      return select(`#device-tree-${this.rootNodeId}`);
    },
    nodes() {
      if (this.graphNodes) {
        return this.svg
          .append('g')
          .attr('class', 'nodes-group')
          .selectAll('circle')
          .data(this.graphNodes, d => d.data.id)
          .enter()
          .append('circle')
          .attr('id', d => (d.data.id ? `node-${d.data.id}` : ''))
          .attr('class', this.nodeClass)
          .attr('r', this.nodeRadius)
          .attr('filter', 'url(#circle-shadow)')
          .style('fill', this.nodeFill)
          .style('cursor', 'pointer')
          .on('click', this.mouseClick)
          .on('mouseover', function() {
            select(this).attr('filter', 'url(#circle-shadow-selected)');
          })
          .on('mouseout', function() {
            select(this).attr('filter', 'url(#circle-shadow)');
          })
          .call(
            drag()
              .on('start', this.dragStarted)
              .on('drag', this.dragged)
              .on('end', this.dragEnded),
          );
      }
      return null;
    },
    links() {
      if (this.graphLinks) {
        return this.svg
          .append('g')
          .attr('class', 'links-group')
          .selectAll('path.link')
          .data(this.graphLinks, d => d.target.data.id)
          .enter()
          .insert('path')
          .attr('id', d => (d.target.data.id ? `link-${d.target.data.id}` : ''))
          .attr('class', this.linkClass)
          .style('stroke-width', this.linkWidth)
          .style('stroke', this.colors.lightblue)
          .style('opacity', '0.4')
          .style('fill', 'none');
      }
      return null;
    },
    images() {
      if (this.graphNodes) {
        return this.svg
          .append('g')
          .attr('class', 'images-group')
          .selectAll('image')
          .data(this.graphNodes, d => d.data.id)
          .enter()
          .append('image')
          .attr('class', this.imageClass)
          .attr('xlink:href', this.imageUrl)
          .attr('crossOrigin', 'anonymous')
          .attr('x', d => `${(-1 * this.nodeRadius(d)) / 2}`)
          .attr('y', d => `${(-1 * this.nodeRadius(d)) / 2}`)
          .attr('width', d => `${this.nodeRadius(d)}px`)
          .attr('height', d => `${this.nodeRadius(d)}px`)
          .style('cursor', 'pointer')
          .on('click', this.mouseClick)
          .on('mouseenter', this.mouseEnter)
          .on('mouseleave', this.mouseLeave)
          .on('mouseover', d => {
            select(`#node-${d.data.id}`).attr('filter', 'url(#circle-shadow-selected)');
          })
          .on('mouseout', d => {
            select(`#node-${d.data.id}`).attr('filter', 'url(#circle-shadow)');
          });
      }
      //       .style('display', d =>
      //   d.data.group === 2 ? (this.showSensors ? 'block' : 'none') : 'block',
      // )
      return null;
    },
    descriptions() {
      if (this.graphLinks) {
        return this.svg
          .append('g')
          .attr('class', 'descriptions-group')
          .style('display', 'none')
          .selectAll('text')
          .data(this.graphLinks, d => d.target.data.id)
          .enter()
          .insert('text')
          .attr('id', d => (d.target.data.id ? `description-${d.target.data.id}` : ''))
          .attr('class', this.textClass)
          .attr('font-family', this.fonts.text)
          .attr('fill', this.colors.lightblue)
          .append('textPath')
          .attr('xlink:href', d => `#link-${d.target.data.id}`)
          .attr('text-anchor', 'start')
          .attr('startOffset', '25%')
          .style('font-size', '10px')
          .text(this.textValue);
      }
      //          .style('display', d => (this.showDescriptions ? 'block' : 'none'))
      return null;
    },
    tooltip() {
      if (this.graphNodes) {
        return this.svg
          .append('g')
          .attr('class', 'tooltip-group')
          .style('display', 'none')
          .style('cursor', 'pointer')
          .on('mouseleave', this.hideTooltip)
          .on('click', this.hideTooltip);
      }
      return null;
    },
  },

  watch: {
    width: {
      handler(width) {
        if (width && width !== null) {
          this.updatedWidth = width;
        }
      },
      immediate: true,
    },
    height: {
      handler(height) {
        if (height && height !== null) {
          this.updatedHeight = height;
        }
      },
      immediate: true,
    },
    nodesRadius: {
      handler(value) {
        if (value && value !== null) {
          this.updatedNodesRadius = value;
          this.fullUpdateDeviceTree();
        }
      },
      immediate: true,
    },
    linksLength: {
      handler(value) {
        if (value && value !== null) {
          this.updatedLinksLength = value;
          this.fullUpdateDeviceTree();
        }
      },
      immediate: true,
    },
    device: {
      handler(value) {
        if (value && value !== null) {
          //  this.initDeviceTree();
        }
      },
      immediate: true,
    },
    devices: {
      handler(value) {
        if (value && value !== null) {
          //  this.initDeviceTree();
        }
      },
      immediate: true,
    },
  },

  mounted() {
    // if (this.zoomable) {
    //   g = svg.append('g');
    //   zoom = d3
    //     .zoom()
    //     .scaleExtent([0.9, 8])
    //     .on('zoom', this.zoomed(g));
    //   svg.call(zoom).on('wheel', () => d3.event.preventDefault());
    //   svg.call(zoom.transform, d3.zoomIdentity);
    // } else {
    //   g = this.transformSvg(svg.append('g'), size);
    // }

    this.init();
  },

  updated() {
    if (this.deviceTreeState) {
      //  this.updateDeviceTree();
    }
  },

  beforeDestroy() {
    this.nodeSimulation = null;
    this.svg.empty();
  },

  methods: {
    async generateGraph() {
      try {
        let graph = {};
        if (this.$props.devices !== null) {
          graph = {
            name: 'Aloes',
            id: this.$props.devices[0].ownerId,
            size: 0.6,
            group: 0,
            colors: ['#29abe2'],
            icons: ['/icons/aloes/iot.png', '/icons/aloes/iot-white.png'],
            children: [],
          };
          const devices = this.$props.devices;

          devices.forEach(device => {
            device.size = 0.4;
            device.group = 1;
            device.show = true;

            // device.children = this.$props.sensors.filter(sensor => {sensor.deviceId.toString() === device.id.toString()})
            if (device.sensors) {
              device.sensors.forEach(sensor => {
                sensor.size = 0.2;
                sensor.group = 2;
              });
              device.children = device.sensors;
              delete device.sensors;
            }
          });
          graph.children = devices;
          // this.$store.state.device.graph = graph
        } else if (this.$props.device && this.$props.device !== null) {
          let device = { ...this.$props.device };
          if (device.sensors) {
            device.children = device.sensors;
            delete device.sensors;
          }
          graph = device;
        } else {
          graph = await json(this.watchSensors);
        }
        this.graph = graph;
        return graph;
      } catch (error) {
        return error;
      }
    },

    generateTree(graph) {
      try {
        const root = hierarchy(graph);
        const tree = {};
        tree.nodes = root.descendants();
        tree.links = root.links(tree.nodes);
        // this.initNodes();
        // this.initLinks();
        return tree;
      } catch (error) {
        return error;
      }
    },

    applyForce(nodes, links) {
      try {
        this.nodeSimulation = forceSimulation(nodes)
          .alphaDecay(0.005)
          .alpha(0.1)
          .force(
            'link',
            forceLink(links)
              .id(d => d.id)
              .distance(this.linkDistance)
              .strength(0.4)
              .iterations(2),
          )
          .force('charge', forceManyBody(nodes).strength(-30))
          .force('center', forceCenter(this.updatedWidth / 2, this.updatedHeight / 2))
          .force(
            'collisionForce',
            forceCollide(2)
              .strength(-50)
              .iterations(1),
          )
          .alphaTarget(0.2);
        //  console.log('links', this.graphLinks);
        this.nodeSimulation.nodes(nodes).on('tick', this.ticked);
        return this.nodeSimulation;
      } catch (error) {
        return error;
      }
    },

    deviceTreeState() {
      if (
        this.graph &&
        this.graph !== null &&
        this.graphNodes &&
        this.graphNodes !== null &&
        this.graphLinks &&
        this.graphLinks !== null
      ) {
        return true;
      }
      return false;
    },

    removeDeviceTree() {
      this.removeNodes();
      this.removeLinks();
      this.removeImages();
      this.removeTexts();
      this.removeTooltip();
    },

    fullUpdateDeviceTree() {
      if (this.deviceTreeState()) {
        // size = size || this.getSize();
        this.removeDeviceTree();
        const tree = this.generateTree(this.graph);
        this.graphNodes = tree.nodes;
        this.graphLinks = tree.links;
        this.applyForce(tree.nodes, tree.links);
      }
    },

    updateDeviceTree() {
      if (this.deviceTreeState()) {
        this.removeDeviceTree();
        this.nodeSimulation.alphaTarget(0.3).restart();
        this.nodeSimulation.nodes(this.graphNodes).on('tick', this.ticked);
      }
    },

    async init() {
      try {
        let graph;
        if (this.graph !== null) {
          graph = this.graph;
        } else {
          graph = await this.generateGraph();
        }
        //  this.removeDeviceTree();
        const tree = this.generateTree(graph);
        this.graphNodes = tree.nodes;
        this.graphLinks = tree.links;
        //  console.log('graph', graph, this.graphNodes, this.graphLinks);

        this.applyForce(tree.nodes, tree.links);
        return tree;
      } catch (error) {
        return error;
      }
    },

    calcXCoordinate(maxNodeSize, x) {
      return Math.max(maxNodeSize, Math.min(this.updatedWidth - this.nodeSize, x));
    },

    calcYCoordinate(maxNodeSize, y) {
      return Math.max(maxNodeSize, Math.min(this.updatedHeight - this.nodeSize, y));
    },

    removeNodes() {
      // this.svg.selectAll(`.nodes`).exit().remove();
      [...this.$el.getElementsByClassName('nodes-group')].map(n => n && n.remove());
    },

    nodeClass(d) {
      if (d.data) {
        if (d.data.group === 0) return `nodes aloes-account-${d.data.id}`;
        if (d.data.group === 1) {
          return `nodes device-${d.data.id}`;
        }
        if (d.data.group === 2) return `nodes sensor-${d.data.deviceId}`;
      }
      return `nodes`;
    },

    nodeRadius(d) {
      if (d.data.size) {
        return this.nodeSize * d.data.size;
      }
      return this.nodeSize;
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

    nodeTransform(d) {
      const maxNodeSize = this.nodeSize * 1.5;
      d.x = this.calcXCoordinate(maxNodeSize, d.x);
      d.y = this.calcYCoordinate(maxNodeSize, d.y);
      return `translate(${d.x},${d.y})`;
    },

    // keepNodesOnTop() {
    //   const nodes = select(`#device-tree-${this.rootNodeId}`).selectAll('.node-circle');
    //   nodes.each(function(index) {
    //     const gnode = this.parentNode;
    //     gnode.parentNode.appendChild(gnode);
    //   });
    // },

    removeLinks() {
      [...this.$el.getElementsByClassName('links-group')].map(n => n && n.remove());
    },

    linkClass(d) {
      if (d.target.data) {
        if (d.target.data.group === 1) {
          return `links link-device-${d.target.data.id}`;
        }
        if (d.target.data.group === 2) return `links link-sensor-${d.target.data.deviceId}`;
      }
      return `links`;
    },

    linkWidth(d) {
      if (d.target.data.group === 1) return '2px';
      if (d.target.data.group === 2) return '1px';
      return '1px';
    },

    linkDistance(d) {
      let ratio = this.updatedLinksLength;
      if (d.target.data.group === 1) ratio = ratio * 2;
      if (d.target.data.group === 2) ratio *= 1.2;
      return ratio * this.nodeSize;
    },

    linkTransform(d) {
      const maxNodeSize = this.nodeSize * 1.5;
      d.source.x = this.calcXCoordinate(maxNodeSize, d.source.x);
      d.source.y = this.calcYCoordinate(maxNodeSize, d.source.y);
      d.target.x = this.calcXCoordinate(maxNodeSize, d.target.x);
      d.target.y = this.calcYCoordinate(maxNodeSize, d.target.y);
      //  const dX = d.target.x - d.source.x;
      //  const dY = d.target.y - d.source.y;
      //  const dR = Math.sqrt(dX * dX + dY * dY);
      //  return `M ${d.source.x}, ${d.source.y} A ${dR}, ${dR} 0 0,1 ${d.target.x}, ${d.target.y}`;
      return `M ${d.source.x}, ${d.source.y} L ${d.target.x}, ${d.target.y}`;
    },

    linkBlink(id, wait, dur) {
      const nodeLink = select(`#link-${id}`);
      nodeLink
        .transition()
        .delay(wait)
        .duration(dur)
        .styleTween('stroke', () => interpolate(this.colors.yellow, this.colors.lightblue))
        .styleTween('opacity', () => interpolate(1, 0.4));
    },

    removeImages() {
      [...this.$el.getElementsByClassName('images-group')].map(n => n && n.remove());
    },

    imageClass(d) {
      if (d.data) {
        if (d.data.group === 0) return `images aloes-account-${d.data.id}`;
        if (d.data.group === 1) {
          return `images device-${d.data.id}`;
        }
        if (d.data.group === 2) return `images sensor-${d.data.deviceId}`;
      }
      return `images`;
    },

    imageSize(d) {
      if (d.data) {
        if (d.data.group === 0) return `10%`;
        if (d.data.group === 1) {
          return `8%`;
        }
        if (d.data.group === 2) return `6%`;
      }
      return `8%`;
    },

    imageUrl(d) {
      if (d.data && d.data.icons) {
        const whiteIcons = d.data.icons.filter(icon => icon.endsWith('white.png'));
        if (!whiteIcons || whiteIcons === null) {
          return d.data.icons[0];
        }
        //  console.log('whiteicon', whiteIcons);
        if (whiteIcons[0].startsWith('http')) {
          return whiteIcons[0];
        }
        return `${whiteIcons[0]}`;
      }
      return '';
    },

    removeTexts() {
      [...this.$el.getElementsByClassName('descriptions-group')].map(n => n && n.remove());
    },

    textClass(d) {
      if (d.target.data) {
        if (d.target.data.group === 1) {
          return `descriptions description-device-${d.target.data.id}`;
        }
        if (d.target.data.group === 2)
          return `descriptions description-sensor-${d.target.data.deviceId}`;
      }
      return `descriptions`;
    },

    textValue(d) {
      if (d.target.data) {
        if (d.target.data.deviceId) {
          return `${d.target.data.type}-${d.target.data.nativeSensorId}`;
        }
        return d.target.data.name;
      }
      return '';
    },

    textTransform(d) {
      return `translate(${d.target.y}, ${d.target.x})`;
    },

    textBlink(id, wait, dur) {
      const nodeLabel = select(`#description-${id}`);
      nodeLabel
        .transition()
        .delay(wait)
        .duration(dur)
        .styleTween('fill', () => interpolate(this.colors.yellow, this.colors.lightblue));
    },

    showTooltip(d) {
      [...this.$el.getElementsByClassName('tooltip-class')].map(n => n && n.remove());
      // const tootltip = this.svg.selectAll('.tooltip-group');
      // tootltip.each(function(index) {
      //   const gnode = this.parentNode;
      //   gnode.parentNode.appendChild(gnode);
      // });

      const text = d.data.name;
      this.tooltip
        .style('display', 'block')
        .append('rect')
        .attr('class', 'tooltip-class')
        .attr('x', d.x + 20)
        .attr('y', d.y - 20)
        .attr('width', '140')
        .attr('height', '40')
        .attr('fill', '#F2F2F2')
        .style('opacity', '0.4');

      this.tooltip
        .insert('text')
        .attr('x', d.x + 30)
        .attr('y', d.y)
        .attr('class', 'tooltip-class')
        .attr('font-family', this.fonts.text)
        .attr('fill', this.colors.blue)
        .style('font-size', '12px')
        .text(text);
    },

    hideTooltip(d) {
      this.tooltip.style('display', 'none');
      [...this.$el.getElementsByClassName('tooltip-class')].map(n => n && n.remove());
    },

    removeTooltip() {
      [...this.$el.getElementsByClassName('tooltip-group')].map(n => n && n.remove());
    },

    ticked() {
      this.links.attr('d', this.linkTransform);
      this.descriptions.attr('transform', this.textTransform);
      this.nodes.attr('transform', this.nodeTransform);
      this.images.attr('transform', this.nodeTransform);
    },

    toggleDeviceSensors(device, state) {
      device.show = state;
      const display = state ? 'block' : 'none';
      this.svg.selectAll(`path.link-sensor-${device.id}`).style('display', display);
      this.svg.selectAll(`.sensor-${device.id}`).style('display', display);
      this.svg.selectAll(`.description-sensor-${device.id}`).style('display', display);
    },

    toggleDescriptions(state) {
      // this.removeTexts();
      // this.showDescriptions = state;
      const display = state ? 'block' : 'none';
      this.svg.selectAll(`.descriptions-group`).style('display', display);
    },

    mouseClick(d) {
      this.$emit('node-clicked', d);
    },

    mouseEnter(d) {
      //  console.log('mouseEnter', d);
      this.showTooltip(d);
      this.$emit('node-selected', d);
    },

    mouseLeave(d) {
      //  this.hideTooltip(d);
      this.$emit('node-deselected', d);
    },

    dragStarted(d) {
      if (!event.active) this.nodeSimulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    },

    dragged(d) {
      d.fx = event.x;
      d.fy = event.y;
    },

    dragEnded(d) {
      if (!this.nodeLockedMode) {
        if (!event.active) this.nodeSimulation.alphaTarget(0);
        // d.fx = null;
        // d.fy = null;
        delete d.fx;
        delete d.fy;
      }
    },

    // getSize() {
    //   const width = this.$el.clientWidth;
    //   const height = this.$el.clientHeight;
    //   return { width, height };
    // },

    // zoomed(g) {
    //   return () => {
    //     const transform = event.transform;
    //     const size = this.getSize();
    //     const transformToApply = this.updateTransform(transform, size);
    //     this.currentTransform = transform;
    //     this.$emit('zoom', { transform });
    //     g.attr('transform', transformToApply);
    //   };
    // },

    findGraphNode(id) {
      for (let i in this.graphNodes) {
        if (this.graphNodes[i].data.id === id) return this.graphNodes[i];
      }
    },

    findGraphNodeIndex(id) {
      for (let i = 0; i < this.graphNodes.length; i++) {
        if (this.graphNodes[i].data.id === id) {
          return i;
        }
      }
    },

    addGraphNode(node) {
      this.graphNodes.push(node);
    },

    updateGraphNode(node) {
      const index = this.findGraphNodeIndex(node.id);
      if (index !== -1) {
        this.graphNodes[index].data = node;
      }
      return this.graphNodes[index];
    },

    removeGraphNode(id) {
      let i = 0;
      const node = this.findGraphNode(id);
      while (i < this.graphLinks.length) {
        if (
          this.graphLinks[i].source.data.id === node.data.id ||
          this.graphLinks[i].target.data.id === node.data.id
        ) {
          this.graphLinks.splice(i, 1);
        } else i++;
      }
      this.graphNodes.splice(this.findGraphNodeIndex(id), 1);
    },

    removeGraphLink(source, target) {
      for (var i = 0; i < this.graphLinks.length; i++) {
        if (this.graphLinks[i].source.id == source && this.graphLinks[i].target.id == target) {
          this.graphLinks.splice(i, 1);
          break;
        }
      }
    },

    removeGraphLinks() {
      this.graphLinks.splice(0, this.graphLinks.length);
    },

    removeGraphNodes() {
      this.graphNodes.splice(0, this.graphLinks.length);
    },

    addGraphLink(source, target, value) {
      this.graphLinks.push({
        source: this.findGraphNode(source),
        target: this.findGraphNode(target),
        ...value,
      });
    },

    onNodeCreated(node) {
      if (node.deviceId) {
        node.size = 0.2;
        node.group = 2;
        const graphNode = hierarchy(node);
        graphNode.parent = this.findGraphNode(node.deviceId);
        graphNode.index = this.graphNodes.length + 1;
        this.addGraphNode(graphNode);
        //  console.log('onNodeCreated:links:res', this.graphLinks[0]);
        this.addGraphLink(node.deviceId, node.id, { index: this.graphLinks.length + 1 });
        this.updateDeviceTree();
      } else if (node.ownerId) {
        node.size = 0.4;
        node.group = 1;
        node.show = true;
        const graphNode = hierarchy(node);
        graphNode.parent = this.findGraphNode(node.ownerId);
        graphNode.index = this.graphNodes.length + 1;
        //  console.log('onNodeCreated:node:res', graphNode);
        this.addGraphNode(graphNode);
        this.addGraphLink(node.ownerId, node.id, { index: this.graphLinks.length + 1 });
        this.updateDeviceTree();
      }

      //  this.keepNodesOnTop();
    },

    onNodeUpdated(node) {
      try {
        if (node.deviceId) {
          node.size = 0.2;
          node.group = 2;
          const duration = 300;
          this.linkBlink(node.deviceId, 0, duration);
          this.linkBlink(node.id, 0, duration);
          this.textBlink(node.deviceId, 0, duration);
          this.textBlink(node.id, 0, duration);
          return setTimeout(() => {
            this.updateGraphNode(node);
            this.updateDeviceTree();
          }, duration);
        } else if (node.ownerId) {
          node.size = 0.4;
          node.group = 1;
          node.show = true;
          const duration = 300;
          this.linkBlink(node.id, 0, duration);
          this.textBlink(node.id, 0, duration);
          return setTimeout(() => {
            this.updateGraphNode(node);
            this.updateDeviceTree();
          }, duration);
        }
        return null;
      } catch (error) {
        return error;
      }
    },

    onNodeDeleted(node) {
      this.removeGraphNode(node.id);
      this.updateDeviceTree();
      //  this.keepNodesOnTop();
    },
  },
};
</script>
