import React, { createContext, useContext, useState, useEffect } from 'react';

const PlannerContext = createContext();

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within PlannerProvider');
  }
  return context;
};

export const PlannerProvider = ({ children }) => {
  const [language, setLanguage] = useState('es');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [planType, setPlanType] = useState('standard');
  const [officialFormat, setOfficialFormat] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [generatedPlanner, setGeneratedPlanner] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [themes, setThemes] = useState([]);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true';
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // Toggle dark mode and save to localStorage
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('darkMode', newMode.toString());
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newMode;
    });
  };

  const value = {
    language,
    setLanguage,
    darkMode,
    toggleDarkMode,
    selectedGrade,
    setSelectedGrade,
    selectedScenario,
    setSelectedScenario,
    selectedTheme,
    setSelectedTheme,
    planType,
    setPlanType,
    officialFormat,
    setOfficialFormat,
    selectedProject,
    setSelectedProject,
    generatedPlanner,
    setGeneratedPlanner,
    scenarios,
    setScenarios,
    themes,
    setThemes,
  };

  return (
    <PlannerContext.Provider value={value}>
      {children}
    </PlannerContext.Provider>
  );
};
