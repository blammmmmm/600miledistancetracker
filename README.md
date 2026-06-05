# 600 Mile Bike Ride Overlay

Manual OBS browser overlay for tracking miles completed and miles left during a 600 mile bike ride stream.

## Files

- `overlay.html` — add this to OBS as the Browser Source.
- `controller.html` — open this on a phone/laptop to update miles and status.
- `firebase-config.js` — paste your Firebase config here.

## Firebase Setup

1. Create a Firebase project.
2. Add a Web App in Project Settings.
3. Copy the Firebase config into `firebase-config.js`.
4. Go to Realtime Database and create a database.
5. For quick setup, use test mode rules while live-testing:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

For a private production setup, lock this down after the event.

## Deploy

Upload these files to GitHub and connect the repo to Firebase Hosting, or deploy from local terminal with Firebase CLI.

## OBS Settings

Browser Source URL: your deployed `overlay.html` URL.

Recommended size:

- Width: 1920
- Height: 1080
- Custom CSS: leave blank

The overlay has a transparent background and sits near the bottom of the screen.

## Controller Use

Open `controller.html`.

- Enter exact miles completed or use quick buttons.
- Miles left auto-calculates from 600.
- Last updated only changes when mileage changes.
- Status changes do not reset the mileage update timer.
- Use Hide Overlay during sleeping/off-camera moments if needed.
