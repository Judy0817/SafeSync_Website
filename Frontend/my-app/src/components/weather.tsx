import Header from './header'
import Box2 from './Box2'
import Box6 from './Box6'
import Box7 from './Box7'
import Box8 from './Box8'
import Box9 from './Box9'
import Box5 from './Box5'
import Box10 from './Box10'
import Box11 from './Box11'

const Weather = () => {


  return (
    <div className='App'>
      <Header />
      <main>
      <div className='dashboard'>
      <h1 className='heading_home'>Weather Impact Analysis</h1>
      <h3 className='sub_heading_home'>Welcome to Your Dashboard</h3>
      
       <div className="dash1">
       <div className="dashboard-box4">
          <Box5 />
        </div>

        <div className="dashboard-box2">
          <Box9 />
        </div>

        <div className="dashboard-box2">
          <Box10 />
        </div>

        <div className="dashboard-box2">
          <Box11 />
        </div>

       </div>

        
      </div>

       
      </main>
      
    </div>
  )
}

export default Weather