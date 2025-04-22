import React, { useState, useEffect } from 'react';

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const [savedStopwatches, setSavedStopwatches] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [stopwatchName, setStopwatchName] = useState('');

  // Mock API URL (using JSONPlaceholder)
  const API_URL = 'https://jsonplaceholder.typicode.com/posts';

  // Fetch saved stopwatches on component mount
  useEffect(() => {
    fetchStopwatches();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Format time for display
  const formatTime = (timeInMs) => {
    const minutes = Math.floor(timeInMs / 60000);
    const seconds = Math.floor((timeInMs % 60000) / 1000);
    const milliseconds = Math.floor((timeInMs % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  // CRUD Operations
  const fetchStopwatches = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      // We'll just use the first 5 for demonstration
      setSavedStopwatches(data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching stopwatches:', error);
    }
  };

  const createStopwatch = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          title: stopwatchName || `Stopwatch ${savedStopwatches.length + 1}`,
          body: JSON.stringify({
            time,
            laps,
            createdAt: new Date().toISOString()
          }),
          userId: 1,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      const newStopwatch = await response.json();
      setSavedStopwatches([...savedStopwatches, newStopwatch]);
      setStopwatchName('');
    } catch (error) {
      console.error('Error creating stopwatch:', error);
    }
  };

  const updateStopwatch = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          id,
          title: stopwatchName || `Updated Stopwatch ${id}`,
          body: JSON.stringify({
            time,
            laps,
            updatedAt: new Date().toISOString()
          }),
          userId: 1,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      const updatedStopwatch = await response.json();
      setSavedStopwatches(savedStopwatches.map(sw => 
        sw.id === id ? updatedStopwatch : sw
      ));
      setEditingId(null);
      setStopwatchName('');
    } catch (error) {
      console.error('Error updating stopwatch:', error);
    }
  };

  const deleteStopwatch = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      setSavedStopwatches(savedStopwatches.filter(sw => sw.id !== id));
    } catch (error) {
      console.error('Error deleting stopwatch:', error);
    }
  };

  // Stopwatch controls
  const startStopwatch = () => setIsRunning(true);
  const pauseStopwatch = () => setIsRunning(false);
  const resetStopwatch = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };
  const recordLap = () => {
    setLaps([...laps, time]);
  };

  return (
    <div className="stopwatch-container">
      <h1>Stopwatch</h1>
      <div className="stopwatch-display">
        {formatTime(time)}
      </div>
      <div className="stopwatch-controls">
        {!isRunning ? (
          <button onClick={startStopwatch}>Start</button>
        ) : (
          <button onClick={pauseStopwatch}>Pause</button>
        )}
        <button onClick={resetStopwatch}>Reset</button>
        <button onClick={recordLap} disabled={!isRunning}>Lap</button>
      </div>
      
      <div className="stopwatch-save">
        <input
          type="text"
          value={stopwatchName}
          onChange={(e) => setStopwatchName(e.target.value)}
          placeholder="Name your stopwatch"
        />
        {editingId ? (
          <button onClick={() => updateStopwatch(editingId)}>Update</button>
        ) : (
          <button onClick={createStopwatch}>Save</button>
        )}
      </div>
      
      {laps.length > 0 && (
        <div className="laps-section">
          <h3>Laps</h3>
          <ul>
            {laps.map((lap, index) => (
              <li key={index}>Lap {index + 1}: {formatTime(lap)}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="saved-stopwatches">
        <h2>Saved Stopwatches</h2>
        <ul>
          {savedStopwatches.map(stopwatch => (
            <li key={stopwatch.id}>
              <h4>{stopwatch.title}</h4>
              <p>ID: {stopwatch.id}</p>
              <button onClick={() => {
                setEditingId(stopwatch.id);
                setStopwatchName(stopwatch.title);
                // In a real app, you would load the time and laps from the stopwatch data
              }}>Edit</button>
              <button onClick={() => deleteStopwatch(stopwatch.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Stopwatch;