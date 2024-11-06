import Header from './header'
import Box2 from './Box2'
import Box6 from './Box6'
import Box7 from './Box7'
import Box8 from './Box8'
import Box9 from './Box9'
import Box5 from './Box5'
import Box10 from './Box10'
import Box11 from './Box11'
import Box4 from './Box4'
import Box19 from './Box19'
import Box20 from './Box20'
import Box21 from './Box21'

const Severity_Distribution = () => {


  return (
    <div className='App'>
      <Header />
      <main>
      <div className='dashboard'>
      <h1 className='heading_home'>Severity Distribution</h1>
      <h3 className='sub_heading_home'>Welcome to Your Dashboard</h3>
      
       <div className="dash1">
       <div className="dashboard-box4">
          <Box4 />
        </div>

        <div className="dashboard-box2">
          <Box19 />
        </div>

        <div className="dashboard-box2">
          <Box20 />
        </div>

        <div className="dashboard-box2">
          <Box21 />
        </div>

       </div>

        
      </div>

       
      </main>
      
    </div>
  )
}

export default Severity_Distribution
