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
import { drag } from 'd3-drag';
import { json } from 'd3-fetch';
import { forceSimulation, forceCenter, forceCollide, forceLink, forceManyBody } from 'd3-force';
import { hierarchy } from 'd3-hierarchy';
import { event, select } from 'd3-selection';

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
      type: String,
      default: null,
    },
    userId: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      watchSensors: this.$props.source,
      network: null,
      deviceProps: null,
      updatedWidth: null,
      updatedHeight: null,
      graphNodes: null,
      graphLinks: null,
      nodeSimulation: null,
      nodeLockedMode: false,
    };
  },

  computed: {
    nodeSize() {
      return this.updatedWidth / 15;
    },
    rootNodeId() {
      if (this.$props.userId && this.$props.userId !== null) {
        return this.$props.userId;
      }
      if (this.deviceProps && this.deviceProps !== null) {
        return this.deviceProps.id;
      }
      return '1';
    },
    colors() {
      return this.$store.state.style.palette;
    },
    nodes() {
      if (this.graphNodes) {
        return select(`#device-tree-${this.rootNodeId}`)
          .append('g')
          .attr('class', 'nodes')
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
          .on('mouseover', function() {
            select(this).attr('filter', 'url(#circle-shadow-selected)');
          })
          .on('mouseout', function() {
            select(this).attr('filter', 'url(#circle-shadow)');
          })
          .call(
            drag()
              .on('start', this.dragstarted)
              .on('drag', this.dragged)
              .on('end', this.dragended),
          );
      }
      return null;
    },
    links() {
      if (this.graphLinks) {
        return select(`#device-tree-${this.rootNodeId}`)
          .append('g')
          .attr('class', 'links')
          .selectAll('path.link')
          .data(this.graphLinks, d => d.target.id)
          .enter()
          .insert('path')
          .attr('id', d => (d.target.data.id ? `link-${d.target.data.id}` : ''))
          .attr('class', this.linkClass)
          .style('stroke-width', this.linkWidth)
          .style('stroke', this.colors.lightblue)
          .style('opacity', '0.3')
          .style('fill', 'none');
        //  .exit()
        //  .remove();
      }
      return null;
    },
    images() {
      if (this.graphNodes) {
        return (
          select(`#device-tree-${this.rootNodeId}`)
            .append('g')
            .attr('class', 'images')
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
            // .attr('width', this.imageSize)
            // .attr('height', this.imageSize)
            .style('cursor', 'pointer')
            .on('click', this.mouseClick)
            // .on('mouseenter', this.mouseEnter)
            // .on('mouseleave', this.mouseLeave)
            .on('mouseover', d => {
              select(`#node-${d.data.id}`).attr('filter', 'url(#circle-shadow-selected)');
            })
            .on('mouseout', d => {
              select(`#node-${d.data.id}`).attr('filter', 'url(#circle-shadow)');
            })
            .call(
              drag()
                .on('start', this.dragstarted)
                .on('drag', this.dragged)
                .on('end', this.dragended),
            )
        );
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
    device: {
      handler(value) {
        if (value && value !== null) {
          this.deviceProps = JSON.parse(value);
          this.graphNodes = null;
          this.graphLinks = null;
          //  this.initDeviceTree();
        }
      },
      immediate: true,
    },
  },

  mounted() {
    this.initDeviceTree();
  },

  updated() {
    //  select(`#device-tree-${this.rootNodeId}`).empty();
    select(`#device-tree-${this.rootNodeId}`)
      .selectAll('*')
      .exit()
      .remove();

    if (
      this.graphNodes &&
      this.graphNodes !== null &&
      this.graphLinks &&
      this.graphLinks !== null
    ) {
      this.nodeSimulation.nodes(this.graphNodes).on('tick', this.ticked);
    }
  },

  beforeDestroy() {
    this.nodeSimulation = null;
    select(`#device-tree-${this.rootNodeId}`).empty();
  },

  methods: {
    addNode(id) {
      this.graphNodes.push({ id });
      //  update();
    },

    removeNode(id) {
      let i = 0;
      const n = this.findNode(id);
      while (i < this.graphLinks.length) {
        if (this.graphLinks[i]['source'] == n || this.graphLinks[i]['target'] == n) {
          this.graphLinks.splice(i, 1);
        } else i++;
      }
      this.graphNodes.splice(this.findNodeIndex(id), 1);
      //  update();
    },

    removeLink(source, target) {
      for (var i = 0; i < this.graphLinks.length; i++) {
        if (this.graphLinks[i].source.id == source && this.graphLinks[i].target.id == target) {
          this.graphLinks.splice(i, 1);
          break;
        }
      }
      //  update();
    },

    removeallLinks() {
      this.graphLinks.splice(0, this.graphLinks.length);
      //  update();
    },

    removeAllNodes() {
      this.graphNodes.splice(0, this.graphLinks.length);
      //  update();
    },

    addLink(source, target, value) {
      this.graphLinks.push({ source: this.findNode(source), target: this.findNode(target), value });
      //  update();
    },

    findNode(id) {
      for (let i in this.graphNodes) {
        if (this.graphNodes[i]['id'] === id) return this.graphNodes[i];
      }
    },

    findNodeIndex(id) {
      for (let i = 0; i < this.graphNodes.length; i++) {
        if (this.graphNodes[i].id == id) {
          return i;
        }
      }
    },

    async generateGraph() {
      try {
        let graph = {};
        if (this.$props.userId !== null && this.network === null) {
          graph = {
            name: 'Aloes',
            id: this.$props.userId,
            size: 0.6,
            group: 0,
            colors: ['#29abe2'],
            icons: ['/icons/aloes/iot.png', '/icons/aloes/iot-white.png'],
            children: [],
          };
          const devices = await this.$store.dispatch('device/findDeviceKV', {
            key: 'ownerId',
            value: this.$props.userId,
          });
          await devices.forEach(device => {
            device.size = 0.4;
            device.group = 1;
            device.show = false;
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
          this.network = graph;
          // this.$store.state.device.network = graph
        } else if (this.$props.userId !== null && this.network !== null) {
          graph = this.network;
        } else if (this.deviceProps && this.deviceProps !== null) {
          this.deviceProps.children = this.deviceProps.sensors;
          delete this.deviceProps.sensors;
          graph = this.deviceProps;
        } else {
          graph = await json(this.watchSensors);
        }
        return graph;
      } catch (error) {
        return error;
      }
    },

    async initDeviceTree() {
      try {
        const graph = await this.generateGraph();

        //  console.log('init tree', graph);
        const root = hierarchy(graph);
        // root.descendants().forEach((d, i) => {
        //   d.id = i;
        //   d._children = d.children;
        //   if (d.depth && d.data.name.length !== 7) d.children = null;
        // });
        this.graphNodes = root.descendants();
        this.graphLinks = root.links(this.graphNodes);
        this.nodeSimulation = forceSimulation(this.graphNodes)
          .alphaDecay(0.005)
          .alpha(0.1)
          .force(
            'link',
            forceLink(this.graphLinks)
              .id(d => d.id)
              .distance(this.linkDistance)
              .strength(0.2)
              .iterations(2),
          )
          .force('charge', forceManyBody(this.graphNodes).strength(-50))
          .force('center', forceCenter(this.updatedWidth / 2, this.updatedHeight / 2))
          .force(
            'collisionForce',
            forceCollide(2)
              .strength(-50)
              .iterations(1),
          )
          .alphaTarget(0.4);
        return graph;
      } catch (error) {
        return error;
      }
    },

    nodeClass(d) {
      if (d.data) {
        if (d.data.group === 0) return `aloes-account-${d.data.id}`;
        if (d.data.group === 1) {
          return `device-${d.data.id}`;
        }
        if (d.data.group === 2) return `sensor-${d.data.deviceId}`;
      }
      return `object-circle`;
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
      //  const maxNodeSize = 50;
      const maxNodeSize = this.nodeSize * 1.5;
      d.x = Math.max(maxNodeSize, Math.min(this.updatedWidth - (this.nodeSize || 16), d.x));
      d.y = Math.max(maxNodeSize, Math.min(this.updatedHeight - (this.nodeSize || 16), d.y));
      return `translate(${d.x},${d.y})`;
    },

    linkClass(d) {
      if (d.target.data) {
        if (d.target.data.group === 1) {
          return `link-device-${d.target.data.id}`;
        }
        if (d.target.data.group === 2) return `link-sensor-${d.target.data.deviceId}`;
      }
      return `object-link`;
    },

    linkWidth(d) {
      if (d.target.data.group === 1) return '2px';
      if (d.target.data.group === 2) return '1px';
      return '1px';
    },

    linkDistance(d) {
      let ratio = 0.5;
      if (d.target.data.group === 1) ratio = 2;
      if (d.target.data.group === 2) ratio = 1.2;
      return ratio * this.nodeSize;
    },

    imageClass(d) {
      if (d.data) {
        if (d.data.group === 0) return `aloes-account-${d.data.id}`;
        if (d.data.group === 1) {
          return `device-${d.data.id}`;
        }
        if (d.data.group === 2) return `sensor-${d.data.deviceId}`;
      }
      return `object-circle`;
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
        return `${this.$props.clientUrl}${whiteIcons[0]}`;
        // if (d.data.icons[2]) {
        //   return `${this.$props.clientUrl}${d.data.icons[2]}`;
        // }
        // if (d.data.icons[1]) {
        //   if (d.data.icons[1].startsWith('http')) {
        //     return d.data.icons[1];
        //   }
        //   return `${this.$props.clientUrl}${d.data.icons[1]}`;
        // }
        // if (d.data.icons[0].startsWith('http')) {
        //   return d.data.icons[0];
        // }

        // return `${this.$props.clientUrl}${d.data.icons[0]}`;
      }
      return '';
    },

    ticked() {
      this.links.attr('d', d => {
        //  const dX = d.target.x - d.source.x;
        //  const dY = d.target.y - d.source.y;
        //  const dR = Math.sqrt(dX * dX + dY * dY);
        //  return `M ${d.source.x}, ${d.source.y} A ${dR}, ${dR} 0 0,1 ${d.target.x}, ${d.target.y}`;
        return `M ${d.source.x}, ${d.source.y} L ${d.target.x}, ${d.target.y}`;
      });
      this.nodes.attr('transform', this.nodeTransform);
      this.images.attr('transform', this.nodeTransform);
    },

    mouseClick(d) {
      if (d.data.group === 1) {
        d.data.show = !d.data.show;
        //  console.log('node cliked', d.data.id);
        const state = d.data.show ? 'block' : 'none';
        select(`#device-tree-${this.rootNodeId}`)
          .selectAll(`path.link-sensor-${d.data.id}`)
          .style('display', state);
        select(`#device-tree-${this.rootNodeId}`)
          .selectAll(`.sensor-${d.data.id}`)
          .style('display', state);
        // select(`#device-tree-${this.rootNodeId}`)
        //   .selectAll(`image.sensor-${d.data.id}`)
        //   .style('opacity', state);
      }
      this.$emit('node-clicked', d);
    },

    mouseEnter(...args) {
      this.$emit('node-selected', ...args);
    },

    mouseLeave(...args) {
      this.$emit('node-deselected', ...args);
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
      if (!this.nodeLockedMode) if (!event.active) this.nodeSimulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    },
  },
};
</script>
