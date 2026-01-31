import React, { createContext, useContext, useState } from 'react';

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
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [planType, setPlanType] = useState('standard');
  const [officialFormat, setOfficialFormat] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [generatedPlanner, setGeneratedPlanner] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [themes, setThemes] = useState([]);

  const value = {
    language,
    setLanguage,
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
