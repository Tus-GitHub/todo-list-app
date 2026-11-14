import { useState } from 'react';
import Onboarding from './components/Onboarding.jsx';
import Home from './components/Home.jsx';

function hasStarted() {
  try {
    return localStorage.getItem('todo-list:onboarded') === 'true';
  } catch {
    return false;
  }
}

export default function App() {
  const [started, setStarted] = useState(hasStarted);

  function start() {
    try {
      localStorage.setItem('todo-list:onboarded', 'true');
    } catch {
      // Navigation still works when browser storage is unavailable.
    }
    setStarted(true);
  }

  if (!started) return <Onboarding onStart={start} />;

  return <Home />;
}
