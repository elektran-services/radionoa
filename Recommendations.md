Product Requirements Document (PRD)
Product Title:
Now On Air – FM Radio Scheduling Platform

1. Overview
A web-based platform for FM radio stations to manage and expose their daily broadcast schedules. The platform allows radio stations to register, log in, create and manage their shows (programs), On-Air Personalities (OAPs), and images. The core functionality includes displaying a dynamic “Now On Air” and “Up Next” API based on current time.

2. Goals
Provide an easy-to-use admin interface for radio scheduling.

Offer program visibility via “Now On Air” and “Up Next” APIs.

Allow OAPs and programs to be updated and categorized by day.

Offer simple CRUD operations for program management.

3. Target Users
FM Radio Station Admins / Program Managers

4. Key Features
A. User Management
Registration:
Station Name

Frequency

User Name

User Email

Password

Login:
User Email

Password

Logout:
Clear session/token securely.

B. Dashboard
Accessible after login.

Paginated table displaying:

Program Name

OAP Name

Duration

Days

Thumbnail (Program Image)

Action Button (Right side): View | Edit | Delete

Left-side Menu:

Add OAP

Add Program

Add Pictures

Program by Days

C. Picture Management
Upload Pictures

File uploader with name field (or auto-generate name).

Accepted formats: JPG, PNG, WebP.

Size limit (e.g., 2MB).

Stored in media library.

D. OAP Management
Add OAP

OAP Name

Name of Program (dropdown from existing programs)

Picture (dropdown from uploaded pictures)

E. Program Management
Add Program

Program Name

Duration (HH:MM)

Program Details (textarea)

Program Days (Checkbox for Mon–Sun)

F. Programs by Day
Display list of days (Mon–Sun)

On click: display list of programs scheduled for that day

5. APIs
A. Now On Air API
Returns the program currently airing:

json
Copy
Edit
{
  "program_name": "Morning Vibes",
  "oap_name": "DJ Flexy",
  "program_duration": "06:00 - 08:00",
  "program_image": "https://url.com/image.jpg"
}
B. Up Next API
Returns the next upcoming program:

json
Copy
Edit
{
  "next_program": "Gospel Hour",
  "next_oap": "Sarah Blaze",
  "next_duration": "08:00 - 10:00"
}
Note: APIs should auto-update based on current server time.

6. Non-Functional Requirements
Responsive UI for desktop and tablets

JWT or session-based authentication

Secure image upload with file validation

API rate limiting to prevent abuse

Logging of CRUD actions

Daily cron job or real-time scheduler to update “Now On Air” status

Hosted on a scalable VPS or cloud platform

7. Technology Stack (Suggestion)
Frontend: ReactJS / VueJS / TailwindCSS

Backend: Node.js / Django / Laravel

Database: PostgreSQL / MySQL

Storage: Local server or AWS S3 for images

Auth: JWT or OAuth2

8. Milestones
Milestone	Description	Duration
✅ UI Design & Wireframes	Mockups of registration, login, dashboard	1 week
✅ Auth System	Registration, login, JWT auth	1 week
✅ CRUD Modules	Programs, OAPs, Images, By Day	1.5 week
✅ API Development	Now On Air & Up Next APIs	1 week
✅ Testing & Deployment	QA, staging, production setup	1 week

9. Future Enhancements
Schedule conflict detection

Real-time live broadcast tracking

Mobile app version

Multi-user roles (e.g., Editor, Admin)

Export weekly schedule as PDF

Project Structure Overview
✅ Front-End
Tech Stack (Cursor/React-based)

React + TypeScript

TailwindCSS

React Router

Axios (for API calls)

shadcn/ui (for consistent UI components)

Zustand or Redux (optional for state management)

✅ Back-End
Suggested Stack

Node.js + Express (or NestJS)

PostgreSQL (or MongoDB if unstructured)

Prisma ORM or Sequelize

JWT-based Authentication

Multer (for image upload)

Day.js for time handling

Cron job or logic for “Now On Air” API

✅ Folder Separation

frontend/ (Cursor Project)
arduino
Copy
Edit
frontend/
│
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── routes/
│   ├── api/             ← Axios configs
│   ├── store/           ← State (if used)
│   ├── assets/          ← Uploaded thumbnails
│   └── App.tsx
├── tailwind.config.js
└── package.json

backend/ (API Project)
pgsql
Copy
Edit
backend/
│
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   └── index.js
├── uploads/             ← Image storage (or S3)
├── .env
└── package.json


API Routes Summary

Route	Method	Description
/api/auth/register	| POST | Register a station
/api/auth/login	| POST | Login
/api/programs	| GET/POST/PUT/DELETE	| CRUD for programs
/api/oaps	| GET/POST/PUT/DELETE	| CRUD for OAPs
/api/pictures	| POST	| Upload picture
/api/programs/day/:day	| GET	| Programs by day
/api/now-on-air	| GET	| Current live program
/api/up-next	| GET	| Next scheduled program