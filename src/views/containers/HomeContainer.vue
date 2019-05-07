<template lang="html">
  <b-container class="home-container" fluid>
    <p class="info-title">
      What if your sensors could speak a common language ?
    </p>
    <b-row align-v="center" align-h="center" no-gutters>
      <b-col cols="12" sm="6" md="6" lg="5" xl="5" offset-lg="1" offset-xl="1">
        <svg
          :viewBox="`0 0 ${svgSettings.width} ${svgSettings.height}`"
          pointer-events="all"
          preserveAspectRatio="xMinYMin meet"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          class="info-layer"
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
          <g transform="translate(200,200)">
            <circle cx="80" cy="0" r="80" class="device-circle twin" />
            <image
              x="40"
              y="-40"
              height="80"
              width="80"
              v-bind="{ 'xlink:href': $store.state.style.pictures.nodeOff }"
              class="sensor-icon"
              @click="deviceTwinSelected = !deviceTwinSelected"
            />
            <circle cx="0" cy="0" r="80" class="device-circle" />
            <image
              x="-40"
              y="-40"
              height="80"
              width="80"
              v-bind="{ 'xlink:href': $store.state.style.pictures.node }"
              class="sensor-icon"
              @click="deviceTwinSelected = !deviceTwinSelected"
            />
          </g>
        </svg>
      </b-col>
      <b-col cols="12" sm="6" md="6" lg="4" xl="3">
        <transition name="fade" mode="out-in">
          <div v-if="!deviceTwinSelected" key="text">
            <p class="info-subtitle">
              Easily register your devices
            </p>
            <p class="info-description">
              Powered by
              <a href="https://framagit.org/aloes/aloes-handlers" target="_blank">aloes-handlers</a>
              to encode/decode MQTT stream, and
              <a href="https://framagit.org/aloes/device-manager" target="_blank">device-manager</a>
              to transport and persist data .
            </p>
          </div>
          <div v-else-if="deviceTwinSelected" class="info-video" key="video">
            <video ref="videoPlayer" muted autoplay loop>
              <source :src="$store.state.style.videos.createDeviceWebm" type="video/webm" />
              <source :src="$store.state.style.videos.createDeviceMp4" type="video/mp4" />
              <source :src="$store.state.style.videos.createDeviceOgv" type="video/ogg" />
            </video>
          </div>
        </transition>
      </b-col>
    </b-row>
    <b-row align-v="center" align-h="center">
      <b-col cols="12" sm="12" md="6" lg="6" xl="5" order-md="12" order-lg="12" order-xl="12">
        <device-tree
          v-if="deviceTreeLoaded"
          ref="deviceTree"
          :source="`/data/device-tree.json`"
          :client-url="$store.state.clientUrl"
          :width="300"
          :height="250"
          @node-selected="onNodeSelected"
          @node-deselected="onNodeDeselected"
          @node-clicked="onNodeClicked"
        />
      </b-col>
      <b-col
        cols="12"
        sm="12"
        md="6"
        lg="5"
        xl="5"
        order-md="1"
        order-lg="1"
        order-xl="1"
        offset-xl="1"
      >
        <transition name="fade" mode="out-in">
          <div v-if="sensor === null && device === null" key="text">
            <p class="info-subtitle">
              Collect and visualize attached sensors
            </p>
            <p class="info-description">
              Displayed with
              <a href="https://framagit.org/aloes/aloes-client" target="_blank">aloes-client</a>
              &
              <a href="https://framagit.org/aloes/sensor-snap" target="_blank">sensor-snap</a>
              VueJS libraries
            </p>
          </div>
          <sensor-snap
            v-if="vueElem && sensor !== null"
            :ref="`sensorSnap-${sensor.id}`"
            :id="sensor.id.toString()"
            :device-id="sensor.deviceId"
            :dev-eui="sensor.devEui"
            :dev-addr="sensor.devAddr"
            :name="sensor.name"
            :type="sensor.type"
            :value="JSON.stringify(sensor.value)"
            :frame-counter="sensor.frameCounter"
            :resources="JSON.stringify(sensor.resources)"
            :resource="sensor.resource"
            :icons="sensor.icons.toString()"
            :colors="JSON.stringify(sensor.colors)"
            :transport-protocol="sensor.transportProtocol"
            :transport-protocol-version="sensor.transportProtocolVersion"
            :message-protocol="sensor.messageProtocol"
            :message-protocol-version="sensor.messageProtocolVersion"
            :input-path="sensor.inputPath || null"
            :output-path="sensor.outputPath || null"
            :in-prefix="sensor.inPrefix"
            :out-prefix="sensor.outPrefix"
            :native-type="sensor.nativeType"
            :native-resource="sensor.nativeResource"
            :native-sensor-id="sensor.nativeSensorId"
            :native-node-id="sensor.nativeNodeId || null"
            :height="320"
            :width="300"
            key="sensor"
            @update-sensor="onUpdateSensor"
            @delete-sensor="onDeleteSensor"
          />
          <device-card v-else-if="device !== null" :device="device" ref="deviceCard" key="device" />
        </transition>
      </b-col>
    </b-row>
    <b-row align-v="center" align-h="center">
      <b-col cols="12" sm="6" lg="6" xl="6">
        <object-composition
          :source="`${$store.state.clientUrl}/data/virtual-object-composition.json`"
          :client-url="$store.state.clientUrl"
          @node-selected="onNodeSelected"
          @node-deselected="onNodeDeselected"
          @node-clicked="onNodeClicked"
        />
      </b-col>
      <b-col cols="12" sm="6" lg="4" xl="4">
        <p class="info-subtitle">
          Compose custom device
        </p>
        <p class="info-description">
          Easily create new device on any Linux machine
          <a href="https://framagit.org/aloes/node-red-device" target="_blank">node-red-device</a>
          or any Arduino compatible Wifi device.
          <a href="https://framagit.org/aloes/arduino-device" target="_blank">arduino-device</a>
        </p>
      </b-col>
    </b-row>
    <b-row align-v="center" align-h="center">
      <b-col cols="12" sm="6" lg="4" xl="4">
        <p class="info-subtitle">
          Compose devices stories
        </p>
        <p class="info-description">
          Create custom scenarios where you can set the rules of interaction inside your network.
          <a href="https://framagit.org/aloes/node-red-bridge" target="_blank">node-red-bridge</a>
        </p>
      </b-col>
      <b-col cols="12" sm="6" lg="6" xl="6"> </b-col>
    </b-row>
  </b-container>
</template>

<script type="text/javascript">
import { updateAloesSensors } from 'aloes-handlers';
//  import SensorSnap from 'sensor-snap';
import logger from '@/services/logger';

export default {
  name: 'HomeContainer',

  components: {
    'device-card': () => import('@/components/Device/DeviceCard.vue'),
    'device-tree': () => import('@/components/Device/DeviceTree.vue'),
    'object-composition': () => import('@/components/VirtualObject/ObjectComposition.vue'),
    'sensor-snap': () => import('sensor-snap'),
  },

  data() {
    return {
      deviceTreeLoaded: true,
      deviceTwinSelected: false,
      svgSettings: {
        width: 500,
        height: 400,
      },
      vueElem: false,
      device: null,
      sensor: null,
      randomPics: [
        '/icons/aloes/dither.png',
        '/icons/aloes/camera.png',
        '/icons/aloes/electrons.png',
        '/icons/aloes/clock.png',
        '/icons/aloes/pattern.png',
        '/icons/aloes/arduino.png',
      ],
    };
  },

  // created() {
  //   let aloesWebcomponents = document.createElement("script");
  //   aloesWebcomponents.setAttribute("src", "/aloes-webcomponents/aloes.js");
  //   //  aloesWebcomponents.setAttribute("async", true);
  //   aloesWebcomponents.onload = () => (this.deviceTreeLoaded = true);
  //   document.body.appendChild(aloesWebcomponents);
  // },

  mounted() {
    //  console.log('sensor-snap', SensorSnap);
    this.deviceTwinSelected = false;
    this.sensor = null;
    this.device = null;
    this.vueElem = true;
  },

  beforeDestroy() {
    this.sensor = null;
    this.device = null;
    this.deviceTwinSelected = false;
  },

  methods: {
    async onUpdateSensor(...args) {
      if (!args || !args[0].id) return null;
      let sensor = args[0];
      logger.publish(4, 'device', 'onUpdateSensor:req', sensor);
      if (sensor.type === 3349 && args[1] === 5911) {
        const result = await this.cameraTest(2);
        args[1] = 5910;
        args[2] = result;
      }
      // if (this.$refs[`sensorSnap-${this.sensor.id}`].componentsType === "gauge") {
      //   this.measurementTest();
      // }
      sensor = await updateAloesSensors(sensor, args[1], args[2]);
      this.sensor = sensor;
    },

    onDeleteSensor(sensor) {
      //  this.refs.deviceTree.removeNode(sensor.id);
      logger.publish(4, 'device', 'onDeleteSensor:req', sensor);
    },

    onNodeSelected(node) {
      logger.publish(4, 'device', 'onNodeSelected:req', node.data);
    },

    onNodeDeselected() {
      logger.publish(4, 'device', 'onNodeDeselected:req');
    },

    onNodeClicked(node) {
      logger.publish(4, 'device', 'onNodeClicked:req', node.data);
      if (node.data && node.data.group === 1) {
        const device = { ...node.data };
        if (device.children) {
          // device.children.forEach(sensor => {
          //   delete sensor.group;
          //   delete sensor.size;
          // });
          // this.$store.commit('device/setStateKV', { key: 'sensors', value: device.children });
          delete device.children;
        }
        delete device.group;
        delete device.size;
        delete device.show;
        this.device = device;
        this.sensor = null;
        //  this.$store.commit('device/setModel', device);
      } else if (node.data && node.data.group === 2) {
        const sensor = { ...node.data };
        //  delete sensor.group;
        //  delete sensor.size;
        this.sensor = sensor;
        this.device = null;
      }
    },

    measurementTest() {
      setInterval(() => {
        const resource = this.sensor.resource.toString();
        const sensor = JSON.parse(JSON.stringify(this.sensor));
        sensor.value = this.sensor.resources[resource] + Math.floor(Math.random() + 10);
        sensor.resources[resource] = sensor.value;
        this.sensor = sensor;
      }, 1000);
    },

    arrayBufferToBase64(buffer) {
      let binary = '';
      const bytes = [].slice.call(new Uint8Array(buffer));
      bytes.forEach(b => (binary += String.fromCharCode(b)));
      return window.btoa(binary);
    },

    async cameraTest(testNumber) {
      const randomPic = this.randomPics[Math.floor(Math.random() * this.randomPics.length)];
      const result = await fetch(`${randomPic}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('HTTP error, status = ' + response.status);
          }
          return response.arrayBuffer();
        })
        .then(buffer => {
          if (testNumber === 1) {
            return Buffer.from(buffer);
          } else if (testNumber === 2) {
            return this.arrayBufferToBase64(buffer);
          }
          return buffer;
        });
      return result;
    },
  },
};
</script>

<style lang="scss">
@import '../../style/home-container.scss';
</style>
