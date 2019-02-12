import moment from "moment";

require("moment-recur");

const builder = {};

builder.createRecurences = async (appointment, intervalStart, intervalEnd) => {
  const exceptions = appointment.exceptions;
  const recurStartIsValid = moment(
    intervalStart.format("YYYY-MM-DD")
  ).isSameOrBefore(appointment.recurStart);
  const recurEndIsValid = moment(
    intervalEnd.format("YYYY-MM-DD")
  ).isSameOrAfter(appointment.recurEnd);

  const recurStart = recurStartIsValid
    ? appointment.recurStart
    : intervalStart.format("YYYY-MM-DD");
  const recurEnd = recurEndIsValid
    ? appointment.recurEnd
    : intervalEnd.format("YYYY-MM-DD");

  const recurrence = moment.recur(recurStart, recurEnd);
  if (appointment.repeat === 1 && appointment.dow) {
    recurrence
      .every(appointment.dow)
      .daysOfWeek()
      .except(moment(exceptions[0], "YYYY-MM-DD"))
      .except(moment(exceptions[1], "YYYY-MM-DD"))
      .except(moment(exceptions[2], "YYYY-MM-DD"))
      .except(moment(exceptions[3], "YYYY-MM-DD"))
      .except(moment(exceptions[4], "YYYY-MM-DD"))
      .except(moment(exceptions[5], "YYYY-MM-DD"))
      .except(moment(exceptions[6], "YYYY-MM-DD"))
      .except(moment(exceptions[7], "YYYY-MM-DD"))
      .except(moment(exceptions[8], "YYYY-MM-DD"))
      .except(moment(exceptions[9], "YYYY-MM-DD"))
      .except(moment(exceptions[10], "YYYY-MM-DD"));
  } else if (appointment.repeat === 2 && appointment.moy) {
    const startMonth = appointment.moy.find(
      month => month >= moment(appointment.recurStart).month()
    );
    const endMonth = appointment.moy.find(
      month => month <= moment(appointment.recurEnd).month()
    );
    if (startMonth || endMonth) {
      recurrence
        .every(moment(appointment.recurStart).day())
        .daysOfWeek()
        .every(moment(appointment.recurStart).monthWeekByDay())
        .weeksOfMonthByDay()
        .except(moment(exceptions[0], "YYYY-MM-DD"))
        .except(moment(exceptions[1], "YYYY-MM-DD"));
    } else {
      return {};
    }
  }
  // check if rules are set : dates.repeats();
  const nextDates = recurrence.all("L");
  // console.log("[BUILDER]", "appointmentToEvent:res", {
  //   recurrence: recurrence.save(),
  //   nextDates
  // });
  return nextDates;
};

builder.rawEventConstructor = (appointment, dates) => {
  let start, end, events;
  dates.forEach(date => {
    start = moment(
      `${moment(date, "DD/MM/YYYY").format("YYYY-MM-DD")} ${appointment.start}`
    ).format();
    end = moment(
      `${moment(date, "DD/MM/YYYY").format("YYYY-MM-DD")} ${appointment.end}`
    ).format();

    const event = {
      ...appointment,
      start,
      end
    };
    //  console.log("rawEventConstructor:res2", event);
    return event;
  });
  //  console.log("rawEventConstructor:res3", events);
  return events;
};

export default builder;
