import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { appStore } from "./app/store";
import { Toaster } from "@/components/ui/sonner";
import { useLoadUserQuery } from "./features/api/authApi";
import LoadingSpinner from "./components/LoadingSpinner";

// Below custom component is used as parent component for <App> component which used for to show loding symbol while rendiring UI component.
const Custom = ({ children }) => {
  const { isLoading } = useLoadUserQuery();
  return <>{isLoading ? <LoadingSpinner/> : <>{children}</>}</>;
};

// Below we use createRoot function from 'react-dom/client' library.In this function we select element of id 'root' which is define in index.html and then render App component on UI.
createRoot(document.getElementById("root")).render(
  // We use <StrictMode> and <Provider> to wrap our App component.
  // <StrictMode> is used to help detect potential problems in an application. it runs additional checks and warnings in development mode.it  show warnings in console if any potential problems are found.prolems like using deprecated APIs, unexpected side effects, etc.
  // <Provider> is used to provide the Redux store to the React components.reduxstore is a centralized state management system for React applications. It allows you to manage the state of your application in a predictable way.
  // <Custom> is a wrapper component that shows a loading spinner while the user data is being loaded.
  // <Toaster> is used to show notifications in the application.
  // The <App> component is the main application component that will be rendered.
  <StrictMode>
    <Provider store={appStore}>
      <Custom>
        <App />
        <Toaster />
      </Custom>
    </Provider>
  </StrictMode>
);



// What is <StrictMode> in React?
// <StrictMode> is a React component that helps detect potential problems in an application by enabling additional checks and warnings in development mode. It does not affect the production perfomance .It runs some functions twice in development mode (to catch issues).

// What is <Provider> in React?
// we provide store to react components using <Provider> tag.<Provider> tag make relationship between react and redux
// in this project our store name is  appStore which is pass in <Provider> tag
