import { HashRouter, Route, Routes } from "react-router-dom";

import LayoutContainer from "../Containers/LayoutContainer";
import PageAddMachine from "../Pages/PageAddMachine";
import PageConfig from "../Pages/PageConfig";
import PageMain from "../Pages/PageMain";
import { LanguageProvider } from "../Providers/LanguageProvider";
import { MachineProvider } from "../Providers/MachineProvider";
import { ThemeProvider } from "../Providers/ThemeProvider";

import styles from "./App.module.css";

function App() {
  return (
    <MachineProvider>
      <LanguageProvider>
        <ThemeProvider>
          <section className={styles.page}>
            <HashRouter>
              <Routes>
                <Route path="/" element={<LayoutContainer />}>
                  <Route path="" element={<PageMain />} />
                  <Route path="add-machine" element={<PageAddMachine />} />
                  <Route path="settings" element={<PageConfig />} />
                </Route>
              </Routes>
            </HashRouter>
          </section>
        </ThemeProvider>
      </LanguageProvider>
    </MachineProvider>
  );
}

export default App;
