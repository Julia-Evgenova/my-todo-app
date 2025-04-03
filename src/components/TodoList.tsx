import React, { useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd';
import './TodoList.css';

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

const LOCAL_STORAGE_KEY = 'my-todo-list';

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Тема
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark' : '';
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  //  Загружаем данные
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleaned = parsed.map((item: any) => ({
          id: item.id,
          text: item.text,
          completed: typeof item.completed === 'boolean' ? item.completed : false
        }));
        setTodos(cleaned);
      } catch (e) {
        console.error('Ошибка при чтении localStorage:', e);
        setTodos([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const handleAdd = () => {
    if (input.trim() === '') return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: input.trim(),
      completed: false,
    };
    setTodos([...todos, newTodo]);
    setInput('');
  };

  const handleDelete = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleComplete = (id: string) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        const updated = { ...todo, completed: !todo.completed };
        return updated;
      }
      return todo;
    }));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(todos);
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);
    setTodos(reordered);
  };

  return (
    <div className="todo-container">
      <button onClick={toggleTheme} style={{ marginBottom: '1rem' }}>
        Переключить тему: {theme === 'dark' ? '🌙 Тёмная' : '☀️ Светлая'}
      </button>

      <h2 className="todo-header">Мой список дел</h2>

      <div className="todo-input-wrapper">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Введите дело..."
        />
        <button onClick={handleAdd}>Добавить</button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todo-list">
          {(provided) => (
            <ul className="todo-list" ref={provided.innerRef} {...provided.droppableProps}>
              {todos.map((todo, index) => (
                <Draggable key={todo.id} draggableId={todo.id} index={index}>
                  {(provided) => (
                    <li
                      className="todo-item"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <span
                        onClick={() => toggleComplete(todo.id)}
                        className={todo.completed ? 'completed' : ''}
                      >
                        {todo.text}
                      </span>
                      <button onClick={() => handleDelete(todo.id)}>Удалить</button>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default TodoList;
