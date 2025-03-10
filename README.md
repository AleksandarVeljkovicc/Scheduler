# Scheduler

A reminder app where you can make a schedule with a subject, message, and date. The current date will be shown on the calendar with a light green color, and scheduled dates will be shown with a yellow/orange color. If the schedule is scheduled for today, that schedule will have in the bottom left corner the text "Today's obligation". The schedule can be added, updated, and deleted.

## Technologies

- JavaScript

- PHP Laravel 9 for making APIs

- SQLite database

## Run the app

In the VS Code terminal, run:

1. composer install --no-dev --optimize-autoloader

2. cd backend

3. php artisan serve

In the frontend, open index.html, if you are using a live server, disable auto-commit changes or the web page will reload over and over.

In the .env file, add the absolute path to the SQLite db. In my case, it's:

DB_DATABASE=C:/Users/PC/Desktop/Scheduler/backend/database/schedule_DB.sqlite

![Screenshot_1](https://github.com/user-attachments/assets/6f8ca02f-a4e2-42a8-b81d-fed45a38202a)
