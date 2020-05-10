<!-- Copyright 2019 Edouard Maleix, read LICENSE -->

<template lang="html">
  <b-container class="home-container" fluid>
    <p class="info-title">
      What if your sensors could speak a common language?
    </p>
    <b-row align-v="center" align-h="center" no-gutters>
      <b-col cols="12" sm="6" md="6" lg="5" xl="5">
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
              v-bind="{ 'xlink:href': $store.state.style.pictures.deviceAlt }"
              class="sensor-icon"
              @click="deviceTwinSelected = !deviceTwinSelected"
            />
            <circle cx="0" cy="0" r="80" class="device-circle" />
            <image
              x="-40"
              y="-40"
              height="80"
              width="80"
              v-bind="{ 'xlink:href': $store.state.style.pictures.device }"
              class="sensor-icon"
              @click="deviceTwinSelected = !deviceTwinSelected"
            />
          </g>
        </svg>
      </b-col>
      <transition name="fade" mode="out-in">
        <b-col
          v-if="!deviceTwinSelected"
          key="deviceTwinNotSelected"
          cols="12"
          sm="6"
          md="6"
          lg="4"
          xl="4"
          offset-lg="1"
          offset-xl="1"
        >
          <p class="info-subtitle">
            Register your devices easily
          </p>
          <p class="info-description">
            Add context to raw devices data.
            <br />
            Powered by
            <a :href="`${$store.state.repoUrl}/aloes-handlers`" target="_blank">aloes-handlers</a>
            to encode/decode MQTT stream and
            <a :href="`${$store.state.repoUrl}/device-manager`" target="_blank">device-manager</a>
            to transport and persist data.
          </p>
        </b-col>
        <b-col
          v-else-if="deviceTwinSelected"
          class="info-video"
          key="deviceTwinSelected"
          cols="12"
          sm="6"
          md="6"
          lg="5"
          xl="5"
        >
          <video ref="videoPlayer" muted autoplay loop>
            <source :src="$store.state.style.videos.createDeviceMp4" type="video/mp4" />
            <!-- <source :src="$store.state.style.videos.createDeviceWebm" type="video/webm" />
            <source :src="$store.state.style.videos.createDeviceOgv" type="video/ogg" /> -->
          </video>
        </b-col>
      </transition>
    </b-row>
    <b-row align-v="center" align-h="center">
      <b-col
        cols="12"
        sm="6"
        md="6"
        lg="6"
        xl="6"
        order-sm="12"
        order-md="12"
        order-lg="12"
        order-xl="12"
      >
        <device-tree
          key="device-tree"
          v-if="deviceTreeLoaded"
          ref="deviceTree"
          :source="$store.state.deviceNetwork"
          :height="400"
          :width="600"
          :nodes-radius="10"
          :links-length="1.5"
          @node-clicked="onNodeClicked"
        />
      </b-col>
      <transition name="fade" mode="out-in">
        <b-col
          v-if="vueElem && sensor && sensor.id && showSensor"
          key="sensorSelected"
          cols="12"
          sm="6"
          md="6"
          lg="5"
          xl="5"
          order-md="1"
          order-lg="1"
          order-xl="1"
        >
          <sensor-snap
            :ref="`sensorSnap-${sensor.id}`"
            :id="sensor.id.toString()"
            :owner-id="sensor.ownerId"
            :device-id="sensor.deviceId"
            :dev-eui="sensor.devEui"
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
            @update-sensor="onUpdateSensor"
            @update-setting="onUpdateSetting"
            @delete-sensor="onDeleteSensor"
          />
        </b-col>
        <b-col
          v-else-if="device && device.id && showDevice"
          key="deviceSelected"
          cols="12"
          sm="6"
          md="6"
          lg="5"
          xl="5"
          order-md="1"
          order-lg="1"
          order-xl="1"
        >
          <device-card :device="device" ref="deviceCard" />
        </b-col>
        <!--         v-if="sensor === null && device === null" -->
        <b-col
          v-else
          key="noDeviceNoSensorSelected"
          cols="12"
          sm="6"
          md="6"
          lg="4"
          xl="4"
          order-md="1"
          order-lg="1"
          order-xl="1"
          offset-lg="1"
          offset-xl="1"
        >
          <p class="info-subtitle">
            Collect and visualize attached sensors
          </p>
          <p class="info-description">
            Create actionable and meaningful data with rich semantic properties.
            <br />
            Displayed with
            <a :href="`${$store.state.repoUrl}/aloes-client`" target="_blank">aloes-client</a>
            &
            <a :href="`${$store.state.repoUrl}/sensor-snap`" target="_blank">sensor-snap</a>
            VueJS libraries.
          </p>
        </b-col>
      </transition>
    </b-row>
    <b-row align-v="center" align-h="center">
      <b-col cols="12" sm="6" lg="5" xl="5">
        <object-composition
          key="custom-device"
          :source="$store.state.virtualObject"
          :client-url="$store.state.clientUrl"
          :height="400"
          :width="500"
          @node-clicked="onNodeClicked"
        />
      </b-col>
      <b-col
        cols="12"
        sm="6"
        lg="4"
        xl="4"
        offset-lg="1"
        offset-xl="1"
        order-md="12"
        order-lg="12"
        order-xl="12"
      >
        <p class="info-subtitle">
          Compose custom device
        </p>
        <p class="info-description">
          Easily create new device on any Linux machine (
          <a :href="`${$store.state.repoUrl2}/node-red-device`" target="_blank">node-red-device</a>
          ) or on ESP8266 / ESP32 microcrontrollers (
          <a :href="`${$store.state.repoUrl2}/arduino-device-mqtt`" target="_blank"
            >arduino-device-mqtt</a
          >
          ).
        </p>
      </b-col>
    </b-row>
    <b-row align-v="center" align-h="center">
      <b-col cols="12" sm="6" lg="5" xl="5" order-sm="12" order-md="12" order-lg="12" order-xl="12">
        <svg
          :viewBox="`0 0 ${svgSettings.width} ${svgSettings.height}`"
          pointer-events="all"
          preserveAspectRatio="xMinYMin meet"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          class="info-layer"
        >
          <defs>
            <marker id="head" orient="auto" markerWidth="2" markerHeight="4" refX="0.1" refY="2">
              <path d="M0,0 V4 L2,2 Z" :fill="$store.state.style.palette.blue" />
            </marker>
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
          <g transform="translate(100,200)">
            <circle
              id="node-scanner-1"
              :fill="$store.state.style.palette.lightgreen"
              cx="50"
              cy="0"
              r="50"
              class="device-circle twin"
            />
            <image
              x="25"
              y="-25"
              height="50"
              width="50"
              v-bind="{ 'xlink:href': '/icons/aloes/scanner-white.png' }"
              class="sensor-icon"
              @click.prevent.stop="scenarioSelected = !scenarioSelected"
            />
          </g>
          <g transform="translate(200,200)">
            <path
              id="link-switch-output-1"
              marker-end="url(#head)"
              stroke-width="2"
              fill="none"
              opacity="0.4"
              :stroke="$store.state.style.palette.lightblue"
              d="M0,0 C30,-30 90,-75 115,-95"
            />
            <!-- d="M0,0 C35,-15 85,-100 115,-100" -->
          </g>
          <g transform="translate(320,90)">
            <circle id="node-switch-output-1" cx="50" cy="0" r="50" class="device-circle twin" />
            <image
              x="25"
              y="-25"
              height="50"
              width="50"
              v-bind="{ 'xlink:href': '/icons/aloes/switch-output-white.png' }"
              class="sensor-icon"
              @click.prevent.stop="scenarioSelected = !scenarioSelected"
            />
          </g>
          <g transform="translate(200,200)">
            <path
              id="link-timer-1"
              marker-end="url(#head)"
              stroke-width="2"
              fill="none"
              opacity="0.4"
              :stroke="$store.state.style.palette.lightblue"
              d="M0,0 C90,0 90,0 115,0"
            />
          </g>
          <g transform="translate(320,200)">
            <circle id="node-timer-1" cx="50" cy="0" r="50" class="device-circle twin" />
            <image
              x="25"
              y="-25"
              height="50"
              width="50"
              v-bind="{ 'xlink:href': '/icons/aloes/timer-white.png' }"
              class="sensor-icon"
              @click.prevent.stop="scenarioSelected = !scenarioSelected"
            />
          </g>
          <g transform="translate(200,200)">
            <path
              id="link-light-1"
              marker-end="url(#head)"
              stroke-width="2"
              fill="none"
              opacity="0.4"
              :stroke="$store.state.style.palette.lightblue"
              d="M0,0 C30,30 95,95 115,115"
            />
          </g>
          <g transform="translate(320,315)">
            <circle id="node-light-1" cx="50" cy="0" r="50" class="device-circle twin" />
            <image
              x="25"
              y="-25"
              height="50"
              width="50"
              v-bind="{ 'xlink:href': '/icons/aloes/light-white.png' }"
              class="sensor-icon"
              @click.prevent.stop="scenarioSelected = !scenarioSelected"
            />
          </g>
        </svg>
      </b-col>
      <transition name="fade" mode="out-in">
        <b-col
          v-if="!scenarioSelected"
          key="scenarioNotSelected"
          cols="12"
          sm="6"
          lg="4"
          xl="4"
          offset-lg="1"
          offset-xl="1"
        >
          <div>
            <p class="info-subtitle">
              Script devices stories
            </p>
            <p class="info-description">
              Use
              <a :href="`${$store.state.repoUrl2}/node-red-bridge`" target="_blank"
                >node-red-bridge</a
              >
              to create custom scenarios where you can set interaction rules inside your network.
            </p>
          </div>
        </b-col>
        <b-col v-else-if="scenarioSelected" key="scenarioSelected" cols="12" sm="6" lg="5" xl="5">
          <div class="info-video">
            <video ref="videoPlayer" muted autoplay loop>
              <source :src="$store.state.style.videos.scriptScenarioMp4" type="video/mp4" />
            </video>
          </div>
        </b-col>
      </transition>
    </b-row>
  </b-container>
</template>

<script type="text/javascript">
import { interpolate } from 'd3-interpolate';
import { select } from 'd3-selection';
// import { transition } from 'd3-transition';
import debounce from 'lodash.debounce';
import Collection from '@/mixins/collection';
import logger from '@/services/logger';

// const debounce = () => import('lodash.debounce');

export default {
  name: 'HomeContainer',

  components: {
    'device-card': () => import('@/components/Device/DeviceCard.vue'),
    'device-tree': () => import('@/components/Device/DeviceTree.vue'),
    'object-composition': () => import('@/components/VirtualObject/ObjectComposition.vue'),
    'sensor-snap': () => import('sensor-snap'),
  },

  mixins: [Collection],

  data() {
    return {
      deviceTreeLoaded: true,
      deviceTwinSelected: false,
      scenarioSelected: false,
      svgSettings: {
        width: 500,
        height: 400,
      },
      vueElem: false,
      device: null,
      sensor: null,
      showSensor: false,
      showDevice: false,
      gaugeTimer: null,
      mapTimer: null,
      timer: null,
      scenarioTimer: null,
      randomPics: [
        '/icons/aloes/dither.png',
        '/icons/aloes/camera.png',
        '/icons/aloes/electrons.png',
        '/icons/aloes/clock.png',
        '/icons/aloes/pattern.png',
        '/icons/aloes/arduino.png',
      ],
      randomSounds: ['/sounds/fire.mp3', '/sounds/wind.mp3'],
      testInterval: 1,
    };
  },

  computed: {
    colors() {
      return this.$store.state.style.palette;
    },
  },

  watch: {
    sensor: {
      handler(value, oldValue) {
        if (value && value !== null) {
          if (oldValue && oldValue.id === value.id) {
            return;
          }
          if (value.type === 3336) this.startMapTest();
          if (value.resource === 5700) this.startGaugeTest();
        }
      },
      immediate: true,
    },
  },

  created() {
    // this.debouncedUpdateSensor = debounce(this.updateSensorView, 100);
  },

  mounted() {
    this.debouncedUpdateSensor = debounce(this.updateSensorView, 100);
    this.deviceTwinSelected = false;
    this.sensor = null;
    this.device = null;
    this.vueElem = true;
    this.playScenario();
  },

  beforeDestroy() {
    this.sensor = null;
    this.device = null;
    this.deviceTwinSelected = false;
    this.stopScenario();
    this.stopGaugeTest();
    this.stopMapTest();
    this.stopTimerTest();
  },

  methods: {
    updateSensorView(sensor) {
      this.sensor = sensor;
      this.$refs.deviceTree.onNodeUpdated(sensor);
    },

    onUpdateSetting(...args) {
      logger.publish(2, 'demo-device', 'onUpdateSetting:req', args);
      if (!args || !args[0].id) return null;
      let sensor = args[0];
      sensor[args[1].toString()] = args[2];
      sensor.resource = args[1];
      sensor.value = args[2];
      this.debouncedUpdateSensor(sensor);
      return sensor;
    },

    async onUpdateSensor(...args) {
      if (!args || !args[0].id) return null;
      let sensor = args[0];
      logger.publish(2, 'demo-device', 'onUpdateSensor:req', {
        type: args[0].type,
        resource: args[1],
        value: args[2],
      });
      // TESTS
      if (args[0].type === 3349 && args[1] === 5911) {
        const buffer = await this.cameraTest(1);
        args[1] = 5910;
        args[2] = buffer;
      } else if (args[0].type === 3339 && args[1] === 5523) {
        const buffer = await this.audioTest(1);
        args[1] = 5522;
        args[2] = buffer;
      } else if (sensor.type === 3340) {
        if (args[1] === 5523) {
          if (args[2] === 'start') {
            this.startTimerTest(1000, sensor.resources['5521']);
          } else if (args[2] === 'restart') {
            this.startTimerTest(1000, sensor.resources['5538']);
          } else if (args[2] === 'stop') {
            this.stopTimerTest();
          } else if (args[2] === 'pause') {
            this.stopTimerTest();
          }
        } else if (args[1] === 5850) {
          // if (args[2] === true) {
          //   this.startTimerTest(1000, sensor.resources['5538']);
          // } else if (args[2] === false) {
          //   this.stopTimerTest();
          // }
        }
      }
      sensor = await this.updateSensor(args[0], args[1], args[2]);
      this.debouncedUpdateSensor(sensor);
      return sensor;
    },

    onDeleteSensor(sensor) {
      logger.publish(3, 'demo-device', 'onDeleteSensor:req', sensor);
      this.$refs.deviceTree.onNodeDeleted(sensor);
    },

    onNodeClicked(node) {
      logger.publish(5, 'demo-device', 'onNodeClicked:req', node.data);
      if (node.data && node.data.group === 1) {
        const device = { ...node.data };
        if (this.showDevice) {
          this.showSensor = false;
          this.showDevice = false;
          this.device = device;
        } else {
          this.showSensor = false;
          this.showDevice = true;
          this.device = device;
        }
      } else if (node.data && node.data.group === 2) {
        const sensor = { ...node.data };
        if (this.showSensor) {
          this.showSensor = false;
          this.showDevice = false;
          this.sensor = sensor;
        } else {
          this.showSensor = true;
          this.showDevice = false;
          this.sensor = sensor;
        }
      }
    },

    stopGaugeTest() {
      if (this.gaugeTimer && this.gaugeTimer !== null) {
        logger.publish(3, 'demo-device', 'stopGaugeTest', '');
        clearInterval(this.gaugeTimer);
      }
    },

    startGaugeTest(interval) {
      // if (
      //   !this.$refs[`sensorSnap-${this.sensor.id}`] ||
      //   this.$refs[`sensorSnap-${this.sensor.id}`].componentsType !== 'gauge'
      // ) {
      //   return;
      // }
      if (!this.sensor || this.sensor.resource !== 5700) return;
      interval = interval || this.testInterval * 1000;
      this.stopGaugeTest();
      logger.publish(3, 'demo-device', 'startGaugeTest', '');
      this.gaugeTimer = setInterval(() => {
        if (!this.sensor || this.sensor.resource !== 5700) {
          this.stopGaugeTest();
          return;
        }
        const resource = this.sensor.resource.toString();
        const sensor = JSON.parse(JSON.stringify(this.sensor));
        sensor.value = this.sensor.resources[resource] + Math.floor(Math.random() + 1);
        sensor.resources[resource] = sensor.value;
        // console.log('GAUGE UPDATE', sensor.value);
        this.updateSensorView(sensor);
      }, interval);
    },

    stopMapTest() {
      if (this.mapTimer && this.mapTimer !== null) {
        logger.publish(3, 'demo-device', 'stopMapTest', '');
        clearInterval(this.mapTimer);
      }
    },

    startMapTest(interval) {
      if (!this.sensor || this.sensor.type !== 3336) return;
      interval = interval || this.testInterval * 1000;
      this.stopMapTest();
      logger.publish(3, 'demo-device', 'startMapTest', '');
      this.mapTimer = setInterval(() => {
        if (!this.sensor || this.sensor.type !== 3336) {
          this.stopMapTest();
          return;
        }
        const sensor = JSON.parse(JSON.stringify(this.sensor));
        sensor.resources['5514'] = (
          Number(sensor.resources['5514']) + Math.floor(Math.random() + 1)
        ).toString();
        sensor.resources['5515'] = (
          Number(sensor.resources['5515']) + Math.floor(Math.random() + 1)
        ).toString();
        sensor.resources['5518'] = new Date().getTime();
        this.updateSensorView(sensor);
      }, interval * 3);
    },

    stopTimerTest() {
      if (this.timer && this.timer !== null) {
        logger.publish(3, 'demo-device', 'stopTimerTest', '');
        clearInterval(this.timer);
      }
    },

    startTimerTest(interval, timeLeft) {
      if (!this.sensor || this.sensor.type !== 3340) return null;
      interval = interval || this.testInterval * 1000;
      timeLeft = timeLeft || 35;
      this.stopTimerTest();
      logger.publish(3, 'demo-device', 'startTimerTest', '');
      // this.sensor.resources['5521'] = timeLeft;
      this.sensor.value = timeLeft;
      // this.sensor.resources['5538'] = timeLeft;
      this.sensor.resources['5850'] = 1;
      this.sensor.resources['5543'] = 0;
      this.sensor.resources['5526'] = 1;
      this.sensor.resources['5523'] = 'started';
      this.timer = setInterval(() => {
        if (!this.sensor || this.sensor.type !== 3340) {
          this.stopTimerTest();
          return;
        }
        const resource = '5538';
        const sensor = JSON.parse(JSON.stringify(this.sensor));
        sensor.resource = 5538;
        sensor.value = sensor.value - interval / 1000;
        // console.log('TIMER UPDATE', sensor.value);
        if (sensor.value <= 0) {
          sensor.value = 0;
          sensor.resources['5543'] = 1;
          sensor.resources['5523'] = 'stopped';
          this.stopTimerTest();
        }
        sensor.resources[resource] = sensor.value;
        this.updateSensorView(sensor);
      }, interval);
    },

    arrayBufferToBase64(buffer) {
      let binary = '';
      const bytes = [].slice.call(new Uint8Array(buffer));
      bytes.forEach((b) => (binary += String.fromCharCode(b)));
      return window.btoa(binary);
    },

    async audioTest(testNumber) {
      if (this.sensor.type !== 3339) return null;
      logger.publish(3, 'demo-device', 'startAudioTest', '');
      const randomSound = this.randomSounds[Math.floor(Math.random() * this.randomSounds.length)];
      return fetch(`${randomSound}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('HTTP error, status = ' + response.status);
          }
          return response.arrayBuffer();
        })
        .then((res) => {
          if (testNumber === 1) {
            return Buffer.from(res);
          } else if (testNumber === 2) {
            return this.arrayBufferToBase64(res);
          }
          return res;
        });
      // return this.$refs[`sensorSnap-${this.updatedSensor.id}`].sendCommand(
      //   'playSound',
      //   result,
      // );
    },

    async cameraTest(testNumber) {
      if (this.sensor.type !== 3349) return null;
      logger.publish(3, 'demo-device', 'startCameraTest', '');
      const randomPic = this.randomPics[Math.floor(Math.random() * this.randomPics.length)];
      return fetch(`${randomPic}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('HTTP error, status = ' + response.status);
          }
          return response.arrayBuffer();
        })
        .then((buffer) => {
          if (testNumber === 1) {
            return Buffer.from(buffer);
          } else if (testNumber === 2) {
            return this.arrayBufferToBase64(buffer);
          }
          return buffer;
        });
    },

    linkBlink(id, wait, dur) {
      select(`#link-${id}`)
        .transition()
        .delay(wait)
        .duration(dur)
        .styleTween('stroke', () => interpolate(this.colors.yellow, this.colors.lightblue))
        .styleTween('opacity', () => interpolate(1, 0.4));
    },

    nodeBlink(id, wait, dur) {
      select(`#node-${id}`)
        .transition()
        .delay(wait)
        .duration(dur)
        .styleTween('fill', () => interpolate(this.colors.yellow, this.colors.green));
    },

    playScenario() {
      const duration = 300;
      this.stopScenario();

      this.scenarioTimer = setInterval(() => {
        this.linkBlink('scanner-1', 0, duration);
        this.linkBlink('switch-output-1', 50, duration);
        this.nodeBlink('scanner-1', 0, duration);
        this.nodeBlink('switch-output-1', 50, duration);
        this.linkBlink('scanner-1', 1000, duration);
        this.linkBlink('light-1', 1050, duration);
        this.nodeBlink('scanner-1', 1000, duration);
        this.nodeBlink('light-1', 1050, duration);
        this.linkBlink('scanner-1', 2050, duration);
        this.linkBlink('timer-1', 2100, duration);
        this.nodeBlink('scanner-1', 2050, duration);
        this.nodeBlink('timer-1', 2100, duration);
      }, duration * 10);
    },

    stopScenario() {
      if (this.scenarioTimer && this.scenarioTimer !== null) {
        clearInterval(this.scenarioTimer);
      }
    },
  },
};
</script>

<style lang="scss">
@import '../../style/home-container.scss';
</style>
