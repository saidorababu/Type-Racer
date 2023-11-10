import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./TypingArea.css";

function TypingArea({ words }) {
  const [input, setInput] = useState("");
  const [index, setIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus on the input field
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    // Start the timer when the first word is typed
    if (index > 0) {
      const interval = setInterval(() => {
        setTimer((timer) => timer + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [index]);

  useEffect(() => {
    // Check if all words are typed
    if (index === words.length) {
      setFinished(true);
      // Send the score to the backend
      axios
        .post("/api/scores", { score })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }, [index, words, score]);

  const handleChange = (e) => {
    // Handle the input change
    const value = e.target.value;
    setInput(value);
    // Check if the input matches the current word
    if (value === words[index]) {
      // Increment the index and the score
      setIndex((index) => index + 1);
      setScore((score) => score + 1);
      // Clear the input field
      setInput("");
    }
  };

  return (
    <div className="TypingArea">
      <div className="words">
        {words.map((word, i) => (
          <span
            key={i}
            className={
              i < index
                ? "correct"
                : i === index
                ? input === word
                  ? "correct"
                  : "current"
                : ""
            }
          >
            {word}
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={handleChange}
        ref={inputRef}
        disabled={finished}
      />
      <div className="stats">
        <p>Time: {timer} s</p>
        <p>Score: {score}</p>
        <p>WPM: {finished ? Math.round((score / timer) * 60) : 0}</p>
      </div>
    </div>
  );
}

export default TypingArea;