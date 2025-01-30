import Header from './header'
import Box2 from './Box2'
import Box6 from './Box6'
import Box7 from './Box7'
import Box8 from './Box8'

const TotalAccident = () => {


  return (
    <div className='App'>
      <Header />
      <main>
      <div className='dashboard'>
      <h1 className='heading_home'>Total Accident Overview</h1>
      <h3 className='sub_heading_home'>Welcome to Your Dashboard</h3>
      
       <div className="dash1">
       <div className="dashboard-box1">
          <Box6 />
        </div>

        <div className="dashboard-box2">
          <Box2 />
        </div>

        <div className="dashboard-box2">
          <Box7 />
        </div>

        <div className="dashboard-box2">
          <Box8 />
        </div>

       </div>

        
      </div>

       
      </main>
      
    </div>
  )
}

export default TotalAccident