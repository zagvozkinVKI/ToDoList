const listsContainer = document.querySelector('[data-lists]')
const newListForm = document.querySelector('[data-new-list-form]')
const newListInput = document.querySelector('[data-new-list-input]')
const deleteListButton = document.querySelector('[data-delete-list-button]')
const listDisplayContainer = document.querySelector('[data-list-display-container]')
const listTitleElement = document.querySelector('[data-list-title]')
const listCountElement = document.querySelector('[data-list-count]')
const tasksContainer = document.querySelector('[data-tasks]')
const taskTemplate = document.getElementById('task-template')
const newTaskForm = document.querySelector('[data-new-task-form]')
const newTaskInput = document.querySelector('[data-new-task-input]')
const clearCompleteTasksButton = document.querySelector('[data-clear-complete-tasks-button]')								//Константы для взаимодействия с .html файлом
const closeListButton = document.querySelector('[data-close-list-button]')
const languageSelector = document.querySelector('[language-selector]')
const htmlNode = document.querySelector('html')
const taskListTitle = document.querySelector('.task-list-title')
const taskCountContainer = document.querySelector('.task-count-container')

const LANGUAGE_PACK_RU = [
  'Листы',
  'Новый лист',
  'Осталось',
  'задач',
  'Новая задача',
  'Очистить выполненное',
  'Удалить лист',
  'Закрыть лист',
  'Switch to',
  'English'
]
const LANGUAGE_PACK_EN = [
  'Lists',
  'New list',
  'Lost',
  'tasks',
  'New task',
  'Clear completed',
  'Remove list',
  'Close list',
  'Переключиться на',
  'Русский'
]

const LOCAL_STORAGE_LANG_KEY = 'language'
const LOCAL_STORAGE_LIST_KEY = 'task.lists'
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId'
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || []
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY)										

languageSelector.addEventListener('click', e => {
  const lang = htmlNode.getAttribute('lang') == 'ru' ? 'en' : 'ru'
  localStorage.setItem(LOCAL_STORAGE_LANG_KEY, lang)
  htmlNode.setAttribute('lang', lang)
  renderLanguage()
})

closeListButton.addEventListener('click', e => {
  selectedListId = null
  saveAndRender()
})

listsContainer.addEventListener('click', e => { //Выбор листа по клику
  if (e.target.tagName.toLowerCase() === 'li') {
    selectedListId = e.target.dataset.listId
    saveAndRender()
  }
})

tasksContainer.addEventListener('click', e => {  //Выбор задачи по клику
  if (e.target.tagName.toLowerCase() === 'input') {
    const selectedList = lists.find(list => list.id === selectedListId)
    const selectedTask = selectedList.tasks.find(task => task.id === e.target.id)
    selectedTask.complete = e.target.checked
    save()
    renderTaskCount(selectedList)
  }
})

clearCompleteTasksButton.addEventListener('click', e => {           //Удаление выполненных задач по кнопке
  const selectedList = lists.find(list => list.id === selectedListId)
  selectedList.tasks = selectedList.tasks.filter(task => !task.complete)
  saveAndRender()
})

deleteListButton.addEventListener('click', e => {                   //Удаление выбранного листа по кнопке
  lists = lists.filter(list => list.id !== selectedListId)
  selectedListId = null
  saveAndRender()
})

newListForm.addEventListener('submit', e => {   //Добавление нового листа по кнопке/клавише Enter
  e.preventDefault()
  const listName = newListInput.value
  if (listName == null || listName === '') return
  const list = createList(listName)
  newListInput.value = null
  lists.push(list)
  saveAndRender()
})

newTaskForm.addEventListener('submit', e => { //Добавление новой задачи по кнопке/клавише Enter
  e.preventDefault()
  const taskName = newTaskInput.value
  if (taskName == null || taskName === '') return
  const task = createTask(taskName)
  newTaskInput.value = null
  const selectedList = lists.find(list => list.id === selectedListId)
  selectedList.tasks.push(task)
  saveAndRender()
})

function createList(name) { 
  return { id: Date.now().toString(), name: name, tasks: [] }
}

function createTask(name) {
  return { id: Date.now().toString(), name: name, complete: false }
}


function deleteList() //Удаляет лист
{
  lists = lists.filter(list => list.id !== selectedListId)
  selectedListId = null
  saveAndRender()
}

function save() { //Сохраняет информацию о состоянии программы в json файл
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists))
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId)
}

function renderLanguage() {
  const lang_pack =
    htmlNode.getAttribute('lang') == 'ru' ?
    LANGUAGE_PACK_RU : LANGUAGE_PACK_EN;
  taskListTitle.innerText = lang_pack[0]
  newListInput.setAttribute('placeholder', lang_pack[1])
  taskCountContainer.querySelector(':first-child').innerText = lang_pack[2]
  taskCountContainer.querySelector(':last-child').innerText = lang_pack[3]
  newTaskInput.setAttribute('placeholder', lang_pack[4])
  clearCompleteTasksButton.innerText = lang_pack[5]
  deleteListButton.innerText = lang_pack[6]
  closeListButton.innerText = lang_pack[7]
  languageSelector.querySelector(':first-child').innerHTML = lang_pack[8]
  languageSelector.querySelector(':last-child').innerHTML = lang_pack[9]
}

function render() { //Отображает выбранный лист

  htmlNode.setAttribute('lang', localStorage.getItem(LOCAL_STORAGE_LANG_KEY))
  renderLanguage();

  clearElement(listsContainer)
  renderLists()

  const selectedList = lists.find(list => list.id === selectedListId)
  if (selectedListId == null || selectedListId == 'null') {
    listDisplayContainer.style.display = 'none'
    document.querySelector('body').style.overflow = ''
  } else {
    listDisplayContainer.style.display = ''
    document.querySelector('body').style.overflow = 'hidden'
    listTitleElement.innerText = selectedList.name
    renderTaskCount(selectedList)
    clearElement(tasksContainer)
    renderTasks(selectedList)
  }
}

function saveAndRender() {
    save()
    render()
}

function renderTasks(selectedList) { //Обновляет задачи
  selectedList.tasks.forEach(task => {
    const taskElement = document.importNode(taskTemplate.content, true)
    const checkbox = taskElement.querySelector('input')
    checkbox.id = task.id
    checkbox.checked = task.complete
    const label = taskElement.querySelector('label')
    label.htmlFor = task.id
    label.append(task.name)
    tasksContainer.appendChild(taskElement)
  })
}

function renderTaskCount(selectedList) { //Обновляет счётчик задач
  const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length
  const taskString = incompleteTaskCount === 1 ? "task" : "tasks"
  listCountElement.innerText = incompleteTaskCount
}

function renderLists() {  //Обновляет листы
  lists.forEach(list => {
    const listElement = document.createElement('li')
    listElement.dataset.listId = list.id
    listElement.classList.add("list-name")
    listElement.innerText = list.name
    if (list.id === selectedListId) {
      listElement.classList.add('active-list')
    }
    listsContainer.appendChild(listElement)
  })
}

function clearElement(element) { //Вызывается другими функциями для удаления элементов из списков
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}
