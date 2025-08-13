import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Layout
import Layout from "@/components/pages/Layout";

// Pages
import Dashboard from "@/components/pages/Dashboard";
import Questionnaires from "@/components/pages/Questionnaires";
import Profiles from "@/components/pages/Profiles";
import Chatbot from "@/components/pages/Chatbot";
import Clients from "@/components/pages/Clients";
import Credits from "@/components/pages/Credits";

const App = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="questionnaires" element={<Questionnaires />} />
            <Route path="profiles" element={<Profiles />} />
            <Route path="chatbot" element={<Chatbot />} />
            <Route path="clients" element={<Clients />} />
            <Route path="credits" element={<Credits />} />
          </Route>
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </BrowserRouter>
  );
};

export default App;