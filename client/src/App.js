import React, { useEffect, useState } from 'react'
import './style.css'

let taskList = []
let doneTasks = []
let showDone = false

function App () {
  const [state, setState] = useState([])

  useEffect(() => {
    fetch('/todos', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => {
        doneTasks = data.todos.reverse().filter(task => task.done)
        taskList = data.todos.reverse().filter(task => !task.done)
        setState([...taskList])
      })
  }, [])

  const takeInputValue = event => {
    if (event.key === 'Enter') {
      if (event.target.value.trim()) {
        const taskObject = {
          id: Date.now(),
          title: '',
          notes: '',
          dueDate: '',
          priority: '',
          showHide: false,
          done: false,
          borderColor: ''
        }
        taskObject.title = event.target.value
        taskList.push(taskObject)
        event.target.value = ''
        setState([...taskList])
        fetch('/todo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskObject)
        })
          .then(res => res.json())
          .then(data => console.log(data))
      }
    }
  }

  const checkbox = (event, index, id) => {
    taskList[index].done = event.target.checked
    updateDB(id, 'done', taskList[index].done)
    if (taskList[index].done) {
      doneTasks.push(taskList[index])
      if (!showDone) taskList.splice(index, 1)
    } else {
      doneTasks = doneTasks.filter(task => task.done)
    }
    setState([...taskList])
  }

  const updateTitle = (event, index, id) => {
    taskList[index].title = event.target.value
    setState([...taskList])
    updateDB(id, 'title', event.target.value)
  }

  const showhideDetails = (event, index) => {
    taskList[index].showHide = !taskList[index].showHide
    setState([...taskList])
  }

  const updateNotes = (event, index, id) => {
    taskList[index].notes = event.target.value
    setState([...taskList])
    updateDB(id, 'notes', event.target.value)
  }

  const updateDate = (event, index, id) => {
    taskList[index].dueDate = event.target.value
    setState([...taskList])
    updateDB(id, 'dueDate', event.target.value)
  }

  const updatePriority = (event, index, id) => {
    taskList[index].priority = event.target.value
    priorityBorder(event.target.value, index, id)
    setState([...taskList])
    updateDB(id, 'priority', event.target.value)
  }

  const priorityBorder = (value, index, id) => {
    const borderType = 'solid 5px '
    const borderColorMapping = {
      0: 'white',
      1: 'blue',
      2: 'orange',
      3: 'rgb(210, 0, 50)'
    }
    taskList[index].borderColor = borderType + borderColorMapping[value]
    updateDB(id, 'borderColor', borderType + borderColorMapping[value])
  }

  const deleteTask = (index, id) => {
    if (taskList[index].done) {
      doneTasks = taskList.filter(task => {
        if (task.id !== id && task.done) return task
      })
    }
    taskList.splice(index, 1)
    deleteFromDB(id)
    setState([...taskList])
  }

  const clearAllTasks = () => {
    taskList = []
    doneTasks = []
    setState([...taskList])
    deleteFromDB('')
  }

  const clearDoneTasks = () => {
    taskList = taskList.filter(task => !task.done)
    doneTasks.forEach(task => deleteFromDB(task.id))
    doneTasks = []
    setState([...taskList])
  }

  const showDoneTasks = event => {
    if (!showDone) {
      taskList = taskList.concat(doneTasks)
      setState([...taskList])
    } else {
      taskList = taskList.filter(task => !task.done)
      setState([...taskList])
    }
    showDone = !showDone
  }

  return (
    <div className='container'>
      <div className='tasks'>
        {state.map((task, index) => (
          <div
            key={index}
            className='task'
            style={{ borderLeft: task.borderColor }}
          >
            <input
              type='checkbox'
              onChange={e => checkbox(e, index, task.id)}
              checked={task.done}
            />
            <input
              type='text'
              className={'title ' + (task.done ? 'done' : '')}
              value={task.title}
              onChange={e => updateTitle(e, index, task.id)}
            />
            <span className='date'>
              {task.dueDate !== ''
                ? new Date(task.dueDate).toLocaleDateString()
                : ''}
            </span>
            <button
              className='Details'
              onClick={e => showhideDetails(e, index)}
            >
              {task.showHide ? '\u25B2' : '\u25BC'}
            </button>

            <div
              className='innerContent'
              style={{ display: task.showHide ? 'inline-block' : 'none' }}
            >
              <div className='notesdiv'>
                <textarea
                  className='notes'
                  onChange={e => updateNotes(e, index, task.id)}
                  value={task.notes}
                ></textarea>
              </div>

              <div className='date-priority'>
                DueDate:
                <input
                  type='date'
                  className='duedate'
                  onChange={e => updateDate(e, index, task.id)}
                  value={task.dueDate}
                />
                <br />
                <br />
                Priority:
                <select
                  className='priority'
                  value={task.priority}
                  onChange={e => updatePriority(e, index, task.id)}
                >
                  <option value='0'>None</option>
                  <option value='1'>Low</option>
                  <option value='2'>Medium</option>
                  <option value='3'>High</option>
                </select>
                <br />
                <br />
                <br />
                <button
                  className='deleteTask'
                  onClick={e => deleteTask(index, task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='inputvalue'>
        +
        <input
          type='text'
          className='inputVal'
          placeholder='New Task...'
          onKeyUp={takeInputValue}
        />
      </div>

      <div
        className='DoneTasksdiv'
        style={{ display: doneTasks.length ? 'inline-block' : 'none' }}
      >
        <button className='doneTasks' onClick={e => showDoneTasks(e)}>
          {showDone ? '\u{1F50D} Hide Done Tasks' : '\u{1F50D} Show Done Tasks'}
        </button>

        <button className='clearDoneTasks' onClick={clearDoneTasks}>
          Clear Done Tasks
        </button>
      </div>

      <button className='clearAllTasks' onClick={clearAllTasks}>
        Clear all Tasks
      </button>
    </div>
  )
}

const updateDB = (id, element, value) => {
  let jsonObject = {}
  jsonObject[element] = value
  fetch(`/todos/${element}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(jsonObject)
  })
    .then(res => res.json())
    .then(data => console.log(data))
}

const deleteFromDB = id => {
  fetch(`/todos/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
    .then(data => console.log(data))
}

export default App
