// App.jsx

import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route } from "react-router-dom";

import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard/dashboard";
import Activities from "./scenes/activities/activities";

import Reports from "./scenes/reports/reports";
import SubmissionDetails from "./scenes/reports/submissionDetailsPage";
import AllSubmissions from "./scenes/reports/allSubmissionsPage";

import NewActivityForm from "./scenes/activities/newActivityForm"; // Make sure the path is correct
import ViewActivity from "./scenes/activities/viewActivity";

import Beneficiaries from "./scenes/beneficiaries/beneficiaries";
import NewBeneficiary from "./scenes/beneficiaries/newBeneficiaryPage";

import ManageBeneficiaryTypes from "./scenes/settings/manageBeneficiaryTypes";
import ViewTypes from "./scenes/settings/viewTypes";

import Archives from "./scenes/archives/archives";

import { BNS } from "./scenes/bns/bns";

import Calendar from "./scenes/calendar/calendar";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "./stores/authStore";

function App() {
  const [theme, colorMode] = useMode();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar />
          <main className="content">
            <Topbar />
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="activities" element={<Activities />} />
              <Route path="/activities/new" element={<NewActivityForm />} />
              <Route
                path="activities/view/:activityId"
                element={<ViewActivity />}
              />
              <Route path="beneficiaries" element={<Beneficiaries />} />

              <Route path="managetypes" element={<ManageBeneficiaryTypes />} />
              <Route path="viewtypes" element={<ViewTypes />} />

              <Route path="new-beneficiary" element={<NewBeneficiary />} />

              <Route path="bns" element={<BNS />} />
              {/* NPC SIDE */}
              <Route path="reports" element={<Reports />} />
              <Route
                path="bns-submission-page/:reportId"
                element={<SubmissionDetails />}
              />

              <Route
                path="allsubmissions/:reportId"
                element={<AllSubmissions />}
              />

              {/* BNS SIDE */}
              <Route path="archives" element={<Archives />} />

              <Route path="calendar" element={<Calendar />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
