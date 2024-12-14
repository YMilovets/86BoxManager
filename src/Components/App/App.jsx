import { HashRouter, Route, Routes } from "react-router-dom";
import PageMain from "../../Pages/PageMain";
import PageAddMachine from "../../Pages/PageAddMachine";
import styles from "./App.module.css";

function App() {
  return (
    <section className={styles.page}>
      {!window.electronAPI && (
        <p role="alert">
          Функции недоступны, поскольку запущен макет приложения, а не исполняемый файл
        </p>
      )}
      <HashRouter>
        <Routes>
          <Route path="/" element={<PageMain />} />
          <Route path="/add-machine" element={<PageAddMachine />} />
        </Routes>
      </HashRouter>
    </section>
  );
}

export default App;
