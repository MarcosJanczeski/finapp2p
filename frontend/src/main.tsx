import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { FinanceProvider } from "./finance-context.tsx";
import { OverviewPage } from "./pages/Overview.tsx";
import { NewEntryPage } from "./pages/NewEntry.tsx";
import { JournalPage } from "./pages/Journal.tsx";
import { AccountsPage } from "./pages/Accounts.tsx";
import { BalancesPage } from "./pages/Balances.tsx";
import { RecurrencesPage } from "./pages/Recurrences.tsx";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        { index: true, element: <OverviewPage /> },
        { path: "new", element: <NewEntryPage /> },
        { path: "journal", element: <JournalPage /> },
        { path: "accounts", element: <AccountsPage /> },
        { path: "balances", element: <BalancesPage /> },
        { path: "recurrences", element: <RecurrencesPage /> },
      ],
    },
  ],
  { future: { v7_startTransition: true } as any },
);

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <FinanceProvider>
      <RouterProvider router={router} />
    </FinanceProvider>
  </StrictMode>,
);
