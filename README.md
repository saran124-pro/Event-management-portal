# 🎉 Event Management Portal

A beginner-level full-stack app for creating events and letting people RSVP —
built with Node.js, Express, and vanilla JavaScript. Data is stored in a
local JSON file, no database or login required.

## ✨ Features

- Create, edit, and delete events (title, description, date, location, capacity)
- RSVP to any event by entering your name
- Automatically tracks attendee count and remaining spots
- Prevents RSVPs once an event is full
- Clean glassmorphism-style UI with a blurred background

## 🛠️ Tech Stack

- Backend: Node.js, Express
- Frontend: HTML, CSS, vanilla JavaScript
- Storage: JSON file (data/events.json)

## 📁 Project Structure

event-management-portal/
├── server.js
├── package.json
├── data/
│   └── events.json
└── public/
    ├── index.html
    ├── style.css
    └── script.js


## 🚀 Getting Started

npm install
node server.js


Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 📡 API Reference

| Method | Endpoint                    | Description              | Body                                                             |
|--------|-------------------------------|----------------------------|---------------------------------------------------------------------|
| GET    | /api/events                  | List all events            | —                                                                     |
| GET    | /api/events/:id              | Get one event               | —                                                                     |
| POST   | /api/events                  | Create an event             | { "title", "description", "date", "location", "capacity" }        |
| PUT    | /api/events/:id              | Update an event             | { "title", "description", "date", "location", "capacity" }        |
| DELETE | /api/events/:id              | Delete an event             | —                                                                     |
| POST   | /api/events/:id/rsvp         | RSVP to an event            | { "name" }                                                         |
| DELETE | /api/events/:id/rsvp         | Cancel an RSVP               | { "name" }                                                         |

## 📄 License

Free to use and modify for personal or educational purposes.
