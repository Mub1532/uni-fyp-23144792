# Mubashar Khan - 23144792 - University Final Project
### AI Powered Student Planning Website
#### This is one of the artefacts of my final year project

---

## Live Website
The website can be accessed at:  
https://uniproject.mubkhan.me

Note: To self host, please fill out example.env and rename to .env in order for the website to work, .env is the secrets which should not be shared

---

## Related Repositories
- [AI Training + Server](https://github.com/Mub1532/23144792-fyp-ai-training)

---

## About
A full-stack AI-powered student planning web application built as part of my final year project. The application is built using Next.js for both the frontend and backend, with MySQL as the database. Authentication uses JWE encrypted cookies via the `jose` library and bcrypt for password hashing. The backend connects to MySQL using Drizzle ORM (full migration in progress). The UI is built with Tailwind CSS & SCSS and uses TypeScript throughout the project.

---

## Running Locally
1. Install [Node.js](https://nodejs.org/)
2. Install [MySQL](https://dev.mysql.com/doc/mysql-installation-excerpt/5.7/en/), or you can also use a docker container
3. Set up the database by running the SQL script in MySQL:
```bash
   mysql -u  -p  < scripts/dbSetup.sql
```
3. Install dependencies (yarn preferred):
```bash
   yarn install
   # or
   npm install
```
3. Fill out `example.env` and rename it to `.env`
4. Start the dev server:
```bash
   yarn dev
   # or
   npm run dev
```

---

## Features
- **Dashboard** - Overview of your day, upcoming tasks, and AI-generated summaries
- **Calendar** - Full interactive calendar with drag-and-drop scheduling
- **Calendar** - Full interactive calendar with drag-and-drop scheduling
- **Schedule** - View and manage your timetable and planned sessions easily in the dashboard.
- **Rich Notes** - Create Notes with a rich live preview text editor
- **AI Planner** - Automatically plans and schedules tasks and calendar based on your preferences and natural language descriptions of what you want to to do.
- **Google Calendar Sync** - Sync your events with Google Calendar, soon will include more providers such as Outlook Calendar, iCloud

---

## Methods
- **Frontend & Backend** - Next.js (TypeScript)
- **Styling** - Tailwind CSS, SCSS
- **Database** - MySQL via Drizzle ORM
- **Auth** - JWE encrypted cookies (`jose`, A256GCM), bcrypt for hashing info such as email and password, Google OAuth for the integration with Google Calendar

---
