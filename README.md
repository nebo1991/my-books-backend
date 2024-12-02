# API Endpoints

## Authentication

| Method | Endpoint       | Description                                            | Authentication Required |
|--------|----------------|--------------------------------------------------------|--------------------------|
| POST   | `/signup`      | Register a new user                                    | No                       |
| POST   | `/login`       | Login user and return a JWT token                      | No                       |
| GET    | `/verify`      | Verify if the user is authenticated                    | Yes                      |
| GET    | `/user`        | Fetch authenticated user's details, including library | Yes                      |

## Books

| Method | Endpoint         | Description                            | Authentication Required |
|--------|------------------|----------------------------------------|--------------------------|
| GET    | `/books`         | Get a list of all books                | No                       |
| POST   | `/books`         | Add a new book                         | Yes                      |
| GET    | `/books/:id`     | Get details of a specific book by ID   | Yes                      |
| DELETE | `/books/:id`     | Delete a book (only by creator)        | Yes                      |

## Libraries

| Method | Endpoint                  | Description                                     | Authentication Required |
|--------|---------------------------|-------------------------------------------------|--------------------------|
| POST   | `/libraries`              | Create a new library                           | Yes                      |
| GET    | `/libraries`              | Get all libraries                              | Yes                      |
| GET    | `/libraries/:libraryId`   | Get a specific library by ID                   | Yes                      |
| PUT    | `/libraries/:id`          | Add a book to a library                        | Yes                      |
| PUT    | `/libraries/:id/remove-book` | Remove a book from a library                   | Yes                      |

## Notes

| Method | Endpoint   | Description                        | Authentication Required |
|--------|------------|------------------------------------|--------------------------|
| POST   | `/notes`   | Create a new note                  | Yes                      |
| GET    | `/notes`   | Get all notes created by the user  | Yes                      |
