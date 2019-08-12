<template lang="html">
  <div id="tables">
    <b-container fluid>
      <b-row>
        <b-col id="description" cols="12">
          <p>
            <a
              href="http://www.openmobilealliance.org/wp/OMNA/LwM2M/LwM2MRegistry.html"
              target="_blank"
            >
              OMA object & resource registry
            </a>
          </p>
        </b-col>
        <b-col cols="6">
          <b-dropdown id="ddown-split" split text="Table selector" class="m-2">
            <b-dropdown-item-button @click="dataPath('omaObjects')">
              Sensors Type
            </b-dropdown-item-button>
            <b-dropdown-divider />
            <b-dropdown-item-button @click="dataPath('omaResources')">
              Ressources Type
            </b-dropdown-item-button>
            <b-dropdown-divider />
            <b-dropdown-item-button @click="dataPath('omaViews')">
              Ressources Views
            </b-dropdown-item-button>
          </b-dropdown>
        </b-col>
        <b-col id="search" cols="6">
          <input
            type="text"
            id="search-box"
            placeholder="Search for description..."
            @keyup="searchFor()"
          />
          <fa-icon icon="search" size="lg" />
        </b-col>
      </b-row>
    </b-container>
    <div id="aloes-table"></div>
  </div>
</template>

<script>
import { omaObjects, omaResources, omaViews } from 'oma-json';
import { keys } from 'd3-collection';
import { hierarchy } from 'd3-hierarchy';
import { select } from 'd3-selection';
import { BDropdown } from 'bootstrap-vue';
import { BDropdownDivider } from 'bootstrap-vue';
import { BDropdownItemButton } from 'bootstrap-vue';

export default {
  name: 'IpsoTables',

  components: {
    'b-dropdown': BDropdown,
    'b-dropdown-divider': BDropdownDivider,
    'b-dropdown-item-button': BDropdownItemButton,
  },

  data() {
    return {
      pageTopic: 'getlarge' + this.$route.path,
      width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
      height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
      nodes: null,
      titles: null,
      sortAscending: false,
      rows: {},
      headers: {},
      selectedColumns: [],
      clientUrl: this.$store.state.clientUrl,
    };
  },

  mounted() {
    //  this.tableLoader(`${this.$store.state.clientUrl}${path}`, this.selectedColumns);
    this.tableLoader(omaObjects, this.selectedColumns);
    this.$on('update:table', source => {
      let graph;
      if (source === 'omaObjects') {
        graph = omaObjects;
      } else if (source === 'omaResources') {
        graph = omaResources;
      } else if (source === 'omaViews') {
        graph = omaViews;
      }
      if (!graph) return null;
      select('#ipso-table').remove();
      this.tableLoader(graph, this.selectedColumns);
    });
  },

  methods: {
    columnSelector(selection) {
      this.selectedColumns = selection;
    },

    dataPath(path) {
      this.$emit('update:table', path);
    },

    tableLoader(source) {
      const root = hierarchy(source);
      this.nodes = root.descendants();
      this.titles = keys(this.nodes[0].data[0]);
      //  console.log("tableLoader", this.titles);
      this.tabulate(this.nodes[0].data, this.titles);
      //self.tabulate(nodes[0].data.tables, ['name', 'description', 'ipsoId', 'ressources', 'colors', 'img']);
    },

    searchFor() {
      // Declare variables
      let td, i;
      const input = document.getElementById('search-box');
      const filter = input.value.toUpperCase();
      const table = document.getElementById('aloes-table');
      const tr = table.getElementsByTagName('tr');
      // Loop through all table rows, and hide those who don't match the search query
      for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName('td')[1];
        if (td) {
          if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = '';
          } else {
            tr[i].style.display = 'none';
          }
        }
      }
    },

    sortTables(d) {
      //     headers.attr("class", "header");
      if (this.sortAscending) {
        // var test = rows._groups[0].forEach(myFunction);
        // function myFunction(value, index, array) {
        //     if ( typeof(value) === Number ) {
        //}
        // }
        // var aKeys = Object.keys(test[0]).sort();
        //console.log(JSON.stringify(aKeys));
        // todo : create dynamic type detection
        if (d === 'name' || d === 'description' || d === 'resource') {
          this.rows.sort((a, b) => {
            const x = a[d].toLowerCase();
            const y = b[d].toLowerCase();
            if (x < y) return -1;
            if (x > y) return 1;
            return 0;
          });
        } else if (d === 'value') {
          this.rows.sort((a, b) => a[d] - b[d]);
        }
        this.sortAscending = false;
        this.className = 'aes';
      } else {
        if (d === 'name' || d === 'description' || d === 'resource') {
          this.rows.sort((a, b) => {
            const x = a[d].toLowerCase();
            const y = b[d].toLowerCase();
            if (x > y) return -1;
            if (x < y) return 1;
            return 0;
          });
        } else if (d === 'value') {
          this.rows.sort((a, b) => b[d] - a[d]);
        }
        this.sortAscending = true;
        this.className = 'des';
      }
    },

    tabulate(obj, titles) {
      this.sortAscending = true;
      const table = select('#aloes-table')
        .append('table')
        .attr('id', 'ipso-table');
      this.headers = table
        .append('thead')
        .append('tr')
        .selectAll('th')
        //.data(columns).enter()
        .data(titles)
        .enter()
        .append('th')
        .text(d => d)
        .attr('class', 'header')
        .on('click', this.sortTables);
      this.rows = table
        .append('tbody')
        .selectAll('tr')
        .data(obj)
        .enter()
        .append('tr');
      this.rows
        .selectAll('td')
        .data(row => {
          return titles.map(column => {
            //  return {column, value: row[column]};
            if (column === 'icons') {
              return { column, icons: row[column] };
            } else if (column === 'colors') {
              return { column, colors: row[column] };
            } else if (column === 'resources') {
              return {
                column,
                resources: JSON.stringify(row[column], null, ' '),
              };
            }
            return { column, value: row[column] };
          });
        })
        .enter()
        .append('td')
        .attr('data-th', d => d.column)
        .text(d => (d.resources ? d.resources.toString() : d.value))
        .append('div')
        .attr('class', 'cells')
        .style('background', d =>
          d.colors ? `linear-gradient(to right,${d.colors[0]},${d.colors[1]})` : 'transparent',
        )
        .style('opacity', d => (d.colors ? '0.7' : '1'))
        .append('img')
        .attr('class', 'icons')
        .attr('src', d => (d.icons ? d.icons[0] : null));
      //  .attr("src", (d) => d.icons.split(",") ? d.icons.split(",")[0] : "");

      return table;
    },
  },
};
</script>

<style lang="scss">
@import '../../style/ipso-tables.scss';
</style>
