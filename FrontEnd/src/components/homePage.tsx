import React from 'react'
import Header from './header'
import Footer from './footer'
import Box1 from './Box1'
import Box2 from './Box2'
import Box4 from './Box4'
import Box3 from './Box3'
import Box5 from './Box5'

const HomePage = () => {
  return (
    <div className='App'>
      <Header />
      <main>
      <div className='dashboard'>
      <h1 className='heading_home'>US Road Accident Casualities Tracking Dashboard</h1>
      <h3 className='sub_heading_home'>Welcome to Your Dashboard</h3>

       <div className="dash1">
       <div className="dashboard-box1">
          <Box1 />
        </div>

        <div className="dashboard-box2">
          <Box2 />
        </div>

        <div className="dashboard-box3">
          <Box3 />
        </div>

        <div className="dashboard-box4">
          <Box4 />
        </div>

        <div className="dashboard-box5">
          <Box5 />
        </div>
       </div>

        
      </div>

       
      </main>
      
    </div>
  )
}

export default HomePage
