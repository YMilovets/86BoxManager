import { HashRouter, Outlet, Route, Routes } from "react-router-dom";

import PageAddMachine from "../../Pages/PageAddMachine";
import PageConfig from "../../Pages/PageConfig";
import PageMain from "../../Pages/PageMain";
import { LanguageProvider } from "../../Providers/LanguageProvider";
import { MachineProvider } from "../../Providers/MachineProvider";

import styles from "./App.module.css";

function App() {
  return (
    <MachineProvider>
      <LanguageProvider>
        <section className={styles.page}>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Outlet />}>
                <Route path="" element={<PageMain />} />
                <Route path="add-machine" element={<PageAddMachine />} />
                <Route path="settings" element={<PageConfig />} />
              </Route>
            </Routes>
          </HashRouter>
        </section>
      </LanguageProvider>
    </MachineProvider>
  );
}

export default App;
