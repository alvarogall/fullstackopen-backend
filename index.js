const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

morgan.token('request-body', req => JSON.stringify(req.body))

const app = express()

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request-body'))
app.use(cors())
app.use(express.static('dist'))

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  
  if(person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

app.get('/info', (request, response) => {
  const date = new Date()
  const info = `
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${date}</p>
  `
  response.send(info)
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  console.log(body)

  if (!body) {
    return response.status(400).json({ 
      error: 'body missing' 
    })
  }

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'name or number missing' 
    })
  }

  if (persons.some(person => person.name === body.name)) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const nextId = Math.floor(Math.random() * 1000)

  const person = {
    "id": nextId,
    ...body
  }

  persons = persons.concat(person)

  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})