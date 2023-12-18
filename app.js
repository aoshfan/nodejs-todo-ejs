const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
// Set the view engine to ejs
app.set('view engine', 'ejs');
// app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

function fetchTodos(callback) {
    db.all("SELECT * FROM todos", [], (err, rows) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, rows);
    });
}

// Define a route to render the EJS template
app.get('/', (req, res) => {
    fetchTodos((err, todos) => {
        if (err) {
            // Handle error, maybe render an error page or send an error response
            res.status(500).send("Error fetching todos");
            return;
        }

        res.render('index', { todos: todos });
    });
});

app.get('/todos', (req, res) => {
    db.all("SELECT * FROM todos", [], (err, rows) => {
      if (err) {
        res.status(400).json({ "error": err.message });
        return;
      }
      res.json({
        "message": "success",
        "data": rows
      });
    });
});

app.get('/todo/update/:id', (req, res) => {
    const id = req.params.id;

    // Fetch the specific Todo item from the database
    db.get("SELECT * FROM todos WHERE id = ?", [id], (err, todo) => {
        if (err) {
            // Handle error (e.g., render an error page or send an error response)
            res.status(500).send("Error fetching todo");
            return;
        }

        // Render an update page and pass the Todo item to it
        res.render('update', { todo: todo });
    });
});


app.post('/todo', (req, res) => {
    const { task } = req.body;
    db.run(`INSERT INTO todos (task) VALUES (?)`, [task], function(err) {
      if (err) {
        res.status(400).json({ "error": err.message });
        return;
      }
    //   res.json({ "message": "success", "id": this.lastID });
    res.redirect('/');
    });
});

app.post('/todo/update/:id', (req, res) => {
    const id = req.params.id;
    const { task, status } = req.body;

    // Update the Todo item in the database
    db.run("UPDATE todos SET task = ?, status = ? WHERE id = ?", [task, status, id], (err) => {
        if (err) {
            // Handle error
            res.status(500).send("Error updating todo");
            return;
        }

        // Redirect back to the main Todo list page after updating
        res.redirect('/');
    });
});


app.post('/todo/complete/:id', (req, res) => {
    const id = req.params.id;

    // Example database query
    db.run(`UPDATE todos SET status = 'completed' WHERE id = ?`, [id], (err) => {
        if (err) {
            // Handle error
            res.status(500).send("Error completing todo");
            return;
        }

        res.redirect('/');
    });
});


app.post('/todo/delete/:id', (req, res) => {
    const  id  = req.params.id;
    console.log("Delete route called for ID:", id);
    db.run(`DELETE FROM todos WHERE id = ?`, id, function(err) {
      if (err) {
        res.status(400).json({ "error": err.message });
        return;
      }
    //   res.json({ "message": "deleted", changes: this.changes });
      res.redirect('/');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
