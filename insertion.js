require('dotenv').config();
const {
    MongoClient,
    ObjectId
} = require('mongodb');
const faker = require('faker');
const fs = require('fs');

const uri = process.env.MONGODB_URI;

// Create a new MongoClient instance
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});



// Define the name of the database and collection
const dbName = 'amazon_book_store';
const book_collection = 'books';
const user_collection = 'users';
const order_collection = 'orders';
const author_collection = 'authors';
const category_collection = 'categories';


// Number generated
const books_number = 10;
const users_number = 10;
const order_number = 10;
const author_number = 2;
const category_number = 5;



// Generate data for users
let users = [];
for (let i = 0; i < users_number; i++) {
    const user = {
        username: faker.name.firstName(),
        email: faker.internet.email(),
        address: {
            street: faker.address.streetName(),
            town: faker.address.city(),
            zip: faker.address.zipCode()
        },
        password: faker.internet.password()
    };
    users.push(user);
}

// Insert the generated data into the users collection and capture the user IDs
(async () => {
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(user_collection);
        const result = await collection.insertMany(users);
        console.log(`${result.insertedCount} users data inserted successfully!`);

        // Capture the user IDs
        users = users.map((user, index) => ({
            _id: result.insertedIds[index],
            username: user.username,
            email: user.email,
            address: user.address,
            password: user.password
        }));

    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
})();


// Generate data to populate the author_collection
let authors = [];
for (let i = 0; i < author_number; i++) {
    const author = {
        name: faker.name.findName(),
        books: [faker.lorem.words(), faker.lorem.words(), faker.lorem.words()],
        description: faker.lorem.paragraph(),
    };
    authors.push(author);
}

// Insert the generated data into the author_collection and capture the author IDs
(async () => {
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(author_collection);
        const result = await collection.insertMany(authors);
        console.log(`${result.insertedCount} authors data inserted successfully!`);

        // Capture the author IDs
        authors = authors.map((author, index) => ({
            _id: result.insertedIds[index],
            name: author.name,
            books: author.books,
            description: author.description
        }));

    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
})();



// Generate data to populate the category_collection
let categories = [];
for (let i = 0; i < category_number; i++) {
    const category = {
        name: faker.commerce.department(),
        subcategories: [faker.commerce.product(), faker.commerce.product(), faker.commerce.product()]
    };
    categories.push(category);
}

// Insert the generated data into the category_collection and capture the category IDs
(async () => {
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(category_collection);
        const result = await collection.insertMany(categories);
        console.log(`${result.insertedCount} categories data inserted successfully!`);

        // Capture the category IDs
        categories = categories.map((category, index) => ({
            _id: result.insertedIds[index],
            name: category.name,
            subcategories: category.subcategories
        }));

    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
})();





// Generate data to populate the book_collection
let books = [];
for (let i = 0; i < books_number; i++) {
    const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const subcategories = randomCategory.subcategories;
    const numSubcategories = Math.floor(Math.random() * subcategories.length) + 1; // generate a random number between 1 and the length of subcategories
    const randomSubcategories = subcategories.slice(0, numSubcategories);
    const book = {
        title: faker.lorem.words(),
        author: [{
            _id: randomAuthor._id,
            name: randomAuthor.name,
            description: randomAuthor.description
        }],
        category: [{
            _id: randomCategory._id,
            name: randomCategory.name
        }],
        sub_category: randomSubcategories,
        genres: [faker.lorem.word(), faker.lorem.word()],
        available_quantity: faker.datatype.number(100),
        price: parseFloat(faker.commerce.price()),
        isbn: faker.datatype.uuid(),
        page_count: faker.datatype.number(500),
        publication_date: faker.date.past().toISOString().substring(0, 10)
    };
    books.push(book);
}

// Insert the generated data into the book_collection and capture the book IDs
setTimeout(async function () {
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(book_collection);
        const result = await collection.insertMany(books);
        console.log(`${result.insertedCount} books data inserted successfully!`);

        // Capture the book IDs
        books = books.map((book, index) => ({
            _id: result.insertedIds[index],
            title: book.title,
            author: book.author,
            category: book.category,
            sub_category: book.sub_category,
            genres: book.genres,
            available_quantity: book.available_quantity,
            price: book.price,
            isbn: book.isbn,
            page_count: book.page_count,
            publication_date: book.publication_date
        }));

    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}, 3000);





setTimeout(function () {
    // Generate data for orders
    let orderData = '';
    const statusOptions = ["Completed", "Cancelled", "Pending"];
    for (let i = 0; i < order_number; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const numItems = faker.datatype.number({
            min: 1,
            max: 4
        });
        const ordered_items = [];
        for (let i = 0; i < numItems; i++) {
            const randomBook = books[Math.floor(Math.random() * books.length)];
            const ordered_item = {
                quantity: faker.datatype.number({
                    min: 1,
                    max: 10
                }),
                book_id: randomBook._id,
                price: randomBook.price
            };
            ordered_items.push(ordered_item);
        }
        const order = {
            ordered_items: ordered_items,
            date: faker.date.past().toISOString().substring(0, 10),
            status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
            user_id: randomUser._id
        };
        orderData += JSON.stringify(order) + '\n';
    }

    // Insert the generated data into the orders collection
    (async () => {
        try {
            const client = new MongoClient(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection(order_collection);
            await collection.insertMany(orderData.split('\n').filter(Boolean).map(JSON.parse));
            console.log('Orders data inserted successfully!');
        } catch (error) {
            console.error(error);
        } finally {
            // Close the client
            await client.close();
            process.exit();
        }
    })();
}, 6000);