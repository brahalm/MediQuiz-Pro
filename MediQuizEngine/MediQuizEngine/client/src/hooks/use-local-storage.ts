import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}

export function useQuizStorage() {
  const [savedQuizzes, setSavedQuizzes, removeSavedQuizzes] = useLocalStorage<any[]>("mediquiz_saved_quizzes", []);

  const saveQuiz = (quiz: any) => {
    setSavedQuizzes((prev) => {
      const existing = prev.find((q) => q.id === quiz.id);
      if (existing) {
        return prev.map((q) => q.id === quiz.id ? quiz : q);
      }
      return [...prev, quiz];
    });
  };

  const deleteQuiz = (quizId: string) => {
    setSavedQuizzes((prev) => prev.filter((q) => q.id !== quizId));
  };

  const getQuiz = (quizId: string) => {
    return savedQuizzes.find((q) => q.id === quizId);
  };

  return {
    savedQuizzes,
    saveQuiz,
    deleteQuiz,
    getQuiz,
    clearAll: removeSavedQuizzes,
  };
}
