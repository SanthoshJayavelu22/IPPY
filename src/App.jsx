import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import Layout from "@/routes/layout";

import LoginPage from "./routes/Pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";

import DashboardPage from "./routes/Pages/Dashboard";
import NewEntry from "./routes/Pages/NewEntry";
import Transaction from "./routes/Pages/Transaction";
import BillingDetails from "./routes/Pages/BillingDetails";
import ViewDetails from "./routes/Pages/ViewDetails"
import GetAllCustomers from "./routes/Pages/GetAllCustomers"
import axios from 'axios';
import React, { useEffect, useState } from 'react';

function App() {

useEffect(()=>{
    fetcher()
},[])


function fetcher() {
    axios.get('http://192.168.1.39:8080/').then((res)=>console.log(res)
    )
}








const router = createBrowserRouter([
    {
        path: "/",
        element: <LoginPage />, // default root is login
    },
    {
        element: <ProtectedRoute />, // all below require login
        children: [
            {
              
                element: <Layout />,
                children: [
                    { index: true, path:'/dashboard', element: <DashboardPage /> },
                    { path: "/new-entry", element: <NewEntry /> },
                    { path: "/transaction", element: <Transaction /> },
                           { path: "/billing-details", element: <BillingDetails /> },
                                   { path: "/billing-details", element: <BillingDetails /> },
                                           { path: "/view-details", element: <ViewDetails /> },
                                           { path: "/allcustomers", element: <GetAllCustomers /> },
                ],
            },
        ],
    },
]);


    return (
        <ThemeProvider storageKey="theme">
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;
