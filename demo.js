const prisma = require("./db/index.ts");

// const newUser = {
//   email: "test@user.com",
//   password: "testtest",
//   name: "testUser",
// };

const newBook = {
  title: "Sample Book",
  author: "John Doe",
  description: "A fascinating read",
  pages: 250,
  image: "https://example.com/book-image.jpg",
  createdById: 1,
};

const newLibrary = {
  name: "Sample Book",
  createdById: 1,
};

// prisma.user
//   .create({ data: newUser })
//   .then((user) => {
//     console.log("Success! New user added");
//     console.log(user);
//   })
//   .catch((error) => {
//     console.log("Something went wrong");
//     console.log(error);
//   });

prisma.book
  .create({
    data: newBook,
  })
  .then((book) => {
    console.log("Success! New book added");
    console.log(book);
  })
  .catch((error) => {
    console.log("Something went wrong");
    console.log(error);
  });
