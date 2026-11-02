# Swanton Wrestling Club App | Version 3 Prototype

A mobile-friendly Progressive Web App using the Swanton Wrestling Club logo and purple, black, gray and white branding. The app is written in HTML, CSS and vanilla JavaScript. **No paid app builder is required.**

## What's new in Version 3

* **Coach / Parent preview selector** in the upper navigation. Coaches can add/edit records; the Parent preview reads published updates and sees one linked *sample* wrestler. **This is only a visual preview, not a secure login**. Do not use this selector to control real children's data.
* **Wrestler grade** limits to Pre-K, Kindergarten and grades 1 to 6. **Birthday** drives an automatically calculated age; **weight in pounds** is stored as a roster field. Enter fictional data only until authentication and protected storage are implemented.
* **Recurring practices and events**: In Add Event, enable **Repeat weekly**, choose a start date and an end date (maximum two years). Weekly occurrences appear on the calendar, in event lists, and in Apple/Google `.ics` exports. Editing or deleting a recurring event changes the whole series. Individual occurrence overrides and cancelled dates are not implemented.
* **Coach-scheduled announcements**: choose a publishing date and local time. Parent preview excludes future messages. Posts become visible when someone opens or refreshes the app after their scheduled time. **Posts are not pushed or emailed automatically**. Server-side scheduling is necessary for reliable delivery.
* **Default location for new events**: `Swanton Wrestling Club, 206 Cherry Street, Swanton, OH 43558`. The default can be changed in Coach Settings. For other venues, override it on the event form.
* **Club Facebook link** in both desktop and phone headers, configured in Coach Settings; initial URL `https://www.facebook.com/swantonohiowrestlingclub`.
* Preserves Version 2 features: month calendar, Google Calendar add-event links, one-time Apple/Google `.ics` calendar downloads, Google Forms/Sheets/Drive shareable links, CSV import from Google Sheets, manual tournament directory, demo roster/stats/attendance, browser-local document uploads and JSON backups.

## Open and test

### On a computer

* Download `Swanton_Wrestling_App_v3_Demo.html` and open it in a browser. This is a single-file preview, with embedded images and styles.
* The separate `Swanton_Wrestling_App_v3_Website.zip` is the full source to host as a website.

### On an iPhone

A downloaded local HTML file often previews as a document instead of behaving like a website. For reliable testing on phones, **host the website files at an HTTPS URL first**. For example, extract the ZIP and deploy its app folder (containing `index.html`, `app.js`, `styles.css`, `assets`, and other files) through a static site host such as Netlify. Once deployed, open that HTTPS address in Safari and select **Share > Add to Home Screen**. App hosting is **not** performed by the chat itself.

## How to test features

1. Use the selector at the top to choose **Coach**. This does **not** authenticate anyone.
2. Select **Events > Add event**. Enter `Grey Team Practice`, choose its first practice date, check **Repeat weekly**, and select the **Repeat until** date.
3. Open a recurring event to add that specific practice to Google Calendar or download an `.ics` for Apple Calendar. Use **Download calendar** to export all occurrences.
4. Select **Team > Add wrestler**. Choose a grade up to sixth, add a fictional birthday and weight.
5. Select **Updates > New update** and set the publish time in the future. Check the **Parent** preview: future posts should be hidden.
6. Go to **More > Coach Settings** and adjust the Facebook link or default address.
7. In **More**, add shareable Google Forms, Sheets or Drive links, or download a CSV template to import a calendar from Google Sheets.

## Current limitations

* **Data stays in each browser only.** This is *not* shared across parents and coaches, and clearing browser storage can delete it. Files saved through the Documents feature are browser-local and aren't included in the JSON backup.
* **No real email/password or Google login; no actual per-wrestler access controls.** The Parent/Coach selector is a demonstration, not a security boundary.
* **No background publication, emailed posts, automatic push notifications, live shared calendar subscription, direct private Drive sync, or live Google Forms response import.** Calendar links and `.ics` files are one-time copies; edits don't automatically reach a parent's personal calendar.
* **Tournament listings remain manually entered.** The app doesn't scrape live tournament websites or calculate mileage automatically.
* **Do not deploy to real families or enter real children's personal information until a secure backend and role-based authorization are in place.** DOB and weight can be sensitive child data. Consult appropriate privacy/security requirements before launch.

## Production login path

See `AUTHENTICATION_PLAN.md` for the recommended parent invitation and coach approval flow, Firebase authentication, server-enforced permission model, and phased deployment steps.
