const express = require('express')
const app = express()
const cors = require('cors')
const port = 5000

const mongo = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'

let db

mongo.connect(
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  (err, client) => {
    if (err) {
      console.error(err)
      return
    }
    db = client.db('tododb')
    todos = db.collection('todocollection')
  }
)

app.use(cors())
app.use(express.json())
app.use(express.static('public/build/'))

// app.get("/", function (req, res) {
//   res.sendFile("public/build/index.html");
// });

//get all todos
app.get('/todos', async (req, res) => {
  todos.find().toArray((err, items) => {
    if (err) {
      console.error(err)
      res.status(500).json({ err: err })
      return
    }
    res.status(200).json({ todos: items })
  })
})

//create a todo
app.post('/todo', (req, res) => {
  todos.insertOne(
    {
      id: req.body.id,
      title: req.body.title,
      notes: req.body.notes,
      dueDate: req.body.dueDate,
      priority: req.body.priority,
      showHide: req.body.showHide,
      done: req.body.done,
      borderColor: req.body.borderColor
    },
    (err, result) => {
      if (err) {
        console.error(err)
        res.status(500).json({ err: err })
        return
      }
      res.status(200).json(result)
    }
  )
})

//delete todo`
app.delete('/todos/:id', (req, res) => {
  todos.deleteOne({ id: parseInt(req.params.id) }, (err, result) => {
    if (err) {
      console.error(err)
      res.status(500).json({ err: err })
      return
    }
    res.status(200).json(result)
  })
})

//delete all todos
app.delete('/todos/', (req, res) => {
  todos.deleteMany({}, (err, result) => {
    if (err) {
      console.error(err)
      res.status(500).json({ err: err })
      return
    }
    res.status(200).json(result)
  })
})

//update todo
function updateData (element) {
  app.patch(`/todos/${element}/:id`, (req, res) => {
    let jsonObject = {}
    jsonObject[element] = req.body[element]
    todos.updateOne(
      { id: parseInt(req.params.id) },
      {
        $set: jsonObject
      },
      (err, result) => {
        if (err) {
          console.error(err)
          res.status(500).json({ err: err })
          return
        }
        res.status(200).json(result)
      }
    )
  })
}

//update title
updateData('title')
//update notes
updateData('notes')
//update dueDate
updateData('dueDate')
//update priority
updateData('priority')
//update done
updateData('done')
//update borderColor
updateData('borderColor')

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
