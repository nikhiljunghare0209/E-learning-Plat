import Navbar from '@/components/Navbar'
import React from 'react'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className='flex flex-col min-h-screen'>
        <Navbar/>
        <div className='flex-1 mt-16'>
          {/* <Outlet /> is used for nested routes. */}
          {/* <Outlet /> dynamically replaces itself with the matching child route component */}
          {/* mhanaje jar path: "/" ha asala tar <HeroSection />
            <Courses /> he don component UI load hoil ani path: "login" ha asala tar  <AuthenticatedUser>
            <Login /> he don component load hoil he child path chya base var component show karanyache kam <Outlet/> mule hote    */}
{/* Example:

Case A → URL: /
Parent <MainLayout /> renders.
<Navbar /> renders.
<Outlet /> is replaced by:

<>
  <HeroSection />
  <Courses />
</>

Case B → URL: /login
Parent <MainLayout /> renders.
<Navbar /> renders.
<Outlet /> is replaced by:

<AuthenticatedUser>
  <Login />
</AuthenticatedUser>*/}  
            <Outlet/>
        </div>
    </div>
  )
}

export default MainLayout