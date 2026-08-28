import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("expenseflow-theme") || "light";
  });

  useEffect(() => {

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem(
      "expenseflow-theme",
      theme
    );

  }, [theme]);


  function toggleTheme() {

    setTheme((currentTheme) => {

      return currentTheme === "light"
        ? "dark"
        : "light";

    });

  }


  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}


export function useTheme() {

  return useContext(ThemeContext);

}