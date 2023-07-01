const {google} = require('googleapis');
const { OAuth2 } = google.auth;
const jwt = require("jsonwebtoken");
const calendarConfig = require('../config/googleAPIConfig');

  function addTaskToCalendar(task, refresh_token) {
  
    const oAuth2Client = new OAuth2(
      calendarConfig.CLIENT_ID,
      calendarConfig.CLIENT_SECRET
    )

    oAuth2Client.setCredentials({
        refresh_token: refresh_token
    })

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })

    const eventStartTime = task.startDate;

    const eventEndTime = task.endDate;

    const event = {
        summary: task.name,
        description: task.description,
        colorId: 1,
        start: {
          dateTime: eventStartTime,
          timeZone: 'utc',
        },
        end: {
          dateTime: eventEndTime,
          timeZone: 'utc',
        }
      }

    return calendar.events.insert(
        { calendarId: 'primary', resource: event },
        err => {
          if (err) throw new Error(err);
          console.log("Thêm thành công!");
        }
    )
}

module.exports = {addTaskToCalendar}