require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('request-body', req => JSON.stringify(req.body))

const app = express()

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] :response-time ms :request-body'))
app.use(cors())
app.use(express.static('dist'))

app.get('/api/persons', (request, response) => {
  Person
    .find({})
    .then(people => {
      response.json(people)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  const promise = Person
    .findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }      
    })
    .catch(error => {
      next(error)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => {
      next(error)
    })
})

app.get('/info', (request, response) => {
  const date = new Date()
  
  Person
    .find({})
    .then(people => {
      const info = `
        <p>Phonebook has info for ${people.length} people</p>
        <p>${date}</p>
      `
      response.send(info)
    })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person
    .save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  const person = {
    name: name,
    number: number
  }

  Person
    .findByIdAndUpdate(
      request.params.id, 
      person, 
      { new: true, runValidators: true, context: 'query' }
    )
    .then(updatedPerson => {
      if (!updatedPerson) {
        return response.status(404).end()
      }

      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})