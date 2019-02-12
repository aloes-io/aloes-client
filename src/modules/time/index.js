import moment from "moment";
import * as actions from "./actions";
import * as mutations from "./mutations";

export default {
  namespaced: true,
  state: {
    collectionName: "Time",
    resources: "Times",
    timePickerOptions: {
      locale: "fr",
      format: "HH:mm",
      useCurrent: false,
      stepping: 30,
      widgetPositioning: {
        horizontal: "auto",
        vertical: "bottom"
      }
    },
    datePickerOptions: {
      locale: "fr",
      format: "YYYY-MM-DD",
      // format: 'DD-MM-YYYY',
      useCurrent: false,
      maxDate: moment()
        .add(2, "y")
        .toDate(),
      widgetPositioning: {
        horizontal: "auto",
        vertical: "bottom"
      }
    },
    months: [
      {
        value: null,
        text: "mois",
        disabled: true
      },
      {
        value: "janvier",
        text: "janvier"
      },
      {
        value: "février",
        text: "février"
      },
      {
        value: "mars",
        text: "mars"
      },
      {
        value: "avril",
        text: "avril"
      },
      {
        value: "mai",
        text: "mai"
      },
      {
        value: "juin",
        text: "juin"
      },
      {
        value: "juillet",
        text: "juillet"
      },
      {
        value: "août",
        text: "août"
      },
      {
        value: "septembre",
        text: "septembre"
      },
      {
        value: "octobre",
        text: "octobre"
      },
      {
        value: "novembre",
        text: "novembre"
      },
      {
        value: "décembre",
        text: "décembre"
      }
    ],
    years: [{ text: "année", value: null, disabled: true }],
    durations: [
      {
        value: null,
        text: "durée",
        disabled: true
      },
      {
        value: "200h",
        text: "200 heures"
      },
      {
        value: "300h",
        text: "300 heures"
      },
      {
        value: "500h",
        text: "500 heures"
      },
      {
        value: "800h",
        text: "800 heures"
      },
      {
        value: "800+",
        text: "800 heures et +"
      }
    ],
    weekDays: [
      { text: "Jours", value: null, disabled: true },
      { text: "Lundi", value: 1 },
      { text: "Mardi", value: 2 },
      { text: "Mercredi", value: 3 },
      { text: "Jeudi", value: 4 },
      { text: "Vendredi", value: 5 },
      { text: "Samedi", value: 6 },
      { text: "Dimanche", value: 7 }
    ],
    monthsNumber: [
      { text: "Mois", value: null, disabled: true },
      { text: "Janvier", value: 1 },
      { text: "Février", value: 2 },
      { text: "Mars", value: 3 },
      { text: "Avril", value: 4 },
      { text: "Mai", value: 5 },
      { text: "Juin", value: 6 },
      { text: "Juillet", value: 7 },
      { text: "Août", value: 8 },
      { text: "Septembre", value: 9 },
      { text: "Octobre", value: 10 },
      { text: "Novembre", value: 11 },
      { text: "Décembre", value: 12 }
    ],
    frequencies: [
      { text: "Récurrence", value: 0 },
      { text: "Hebdomadaire", value: 1 },
      { text: "Mensuel", value: 2 }
    ]
  },
  mutations,
  actions
};
