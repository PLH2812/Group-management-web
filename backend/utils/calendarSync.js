const {google} = require('googleapis');
const { OAuth2 } = google.auth;
const jwt = require("jsonwebtoken");
const calendarConfig = require('../config/googleAPIConfig');

function configOAuth2(refresh_token){
  try {
    const oAuth2Client = new OAuth2(
      calendarConfig.CLIENT_ID,
      calendarConfig.CLIENT_SECRET
    )
    
    const refreshToken = jwt.verify(refresh_token, process.env.JWT_KEY);

    oAuth2Client.setCredentials({
        refresh_token: refreshToken
    })
    return oAuth2Client;
  } catch (error) {
    throw new Error(error);
  }
}



function addTaskToCalendar(oAuth2Client, task) {
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
          return 0;
        }
    )
}

module.exports = {configOAuth2 ,addTaskToCalendar}